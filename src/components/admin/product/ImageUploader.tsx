"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import {
  MAX_FILES_PER_UPLOAD,
  deleteAddonImage,
  deleteCustomizationImage,
  deleteProductImage,
  uploadAddonImage,
  uploadCustomizationImage,
  uploadProductImages,
  type UploadedProductImage,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";
import type { ProductImage } from "@/src/data/products";

/**
 * Image upload for the product form.
 *
 * Images used to be paths an admin typed in, pointing at files a developer had
 * committed to this project's public/ tree. They are now uploaded to Cloudinary
 * through the API — the browser posts the file to our own server, which holds the
 * Cloudinary secret and signs the upload, so no credential is ever in this bundle.
 *
 * Uploading happens on selection rather than on save, for two reasons: the admin
 * sees the photo, and any rejection, straight away instead of after filling in
 * fourteen other fields; and replacing one image does not mean re-posting the
 * whole product. What the form holds afterwards is a URL and a publicId, and the
 * product save is an ordinary JSON PATCH like it always was.
 */

/** Mirrors CLOUDINARY_MAX_IMAGE_BYTES on the server. */
const MAX_BYTES = 5 * 1024 * 1024;

const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ACCEPT_ATTR = ACCEPTED_MIME.join(",");

function megabytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(Number.isInteger(mb) ? 0 : 1)}MB`;
}

/**
 * Checks a file before it is sent.
 *
 * Purely to save the admin a round trip — the server validates independently, by
 * sniffing the actual bytes rather than trusting the type the browser reports, so
 * this being bypassable does not matter.
 */
function localRejection(file: File): string | null {
  if (file.size === 0) return `"${file.name}" is empty.`;
  if (file.size > MAX_BYTES) {
    return `"${file.name}" is ${megabytes(file.size)}. The limit is ${megabytes(MAX_BYTES)} — please compress it and try again.`;
  }
  // Some browsers report an empty type for an unknown extension; let those
  // through and let the server's content check decide.
  if (file.type && !ACCEPTED_MIME.includes(file.type)) {
    return `"${file.name}" is not a JPEG, PNG, WebP or AVIF image.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Unsaved-upload tracking
// ---------------------------------------------------------------------------

export type PendingUploads = {
  track: (publicId: string) => void;
  /** True while this asset exists in Cloudinary but on no saved product. */
  isPending: (publicId: string | undefined) => boolean;
  forget: (publicId: string) => void;
  /** Called once a save succeeds: everything tracked is now referenced. */
  clear: () => void;
};

/**
 * Remembers which assets were uploaded but not yet saved onto a product.
 *
 * This is the difference between the two ways an image can be removed, and they
 * are not the same operation:
 *
 * - Already saved on the product — just drop it from the form. The API compares
 *   the product's stored images against the ones being saved and deletes the
 *   difference, so saving is what frees it. Deleting it here instead would strand
 *   the product on a dead URL for as long as the admin leaves the form unsaved.
 *
 * - Uploaded a moment ago and not saved anywhere — nothing will ever reconcile
 *   it, because no product has ever referenced it. This is the case that needs an
 *   explicit delete, and without it every reconsidered photo would sit in
 *   Cloudinary forever.
 *
 * A ref rather than state: nothing renders from it, and a re-render on every
 * upload would be noise.
 */
export function usePendingUploads(): PendingUploads {
  const pending = useRef(new Set<string>());

  return {
    track: useCallback((publicId: string) => {
      pending.current.add(publicId);
    }, []),
    isPending: useCallback((publicId: string | undefined) => {
      return Boolean(publicId && pending.current.has(publicId));
    }, []),
    forget: useCallback((publicId: string) => {
      pending.current.delete(publicId);
    }, []),
    clear: useCallback(() => {
      pending.current.clear();
    }, []),
  };
}

// ---------------------------------------------------------------------------
// Which endpoints a slot talks to
// ---------------------------------------------------------------------------

/**
 * The two calls an image slot makes.
 *
 * Injected rather than hardcoded because product photos and customization item
 * photos are the same interaction against different endpoints and different
 * Cloudinary folders. Duplicating the component for the second caller would mean
 * the size limit, the error handling and the unsaved-upload cleanup all existing
 * twice, one edit away from differing.
 */
export type ImageSlotApi = {
  upload: (file: File) => Promise<{ src: string; publicId: string }>;
  discard: (publicId: string) => Promise<unknown>;
};

/** Product photos, filed under the product's slug. */
export function productImageApi(slug?: string): ImageSlotApi {
  return {
    upload: async (file) => {
      const [uploaded] = await uploadProductImages([file], slug);
      if (!uploaded) throw new Error("no asset returned");
      return uploaded;
    },
    discard: (publicId) => deleteProductImage(publicId),
  };
}

/** Customize Order item photos. Not filed per item — see the service for why. */
export const customizationImageApi: ImageSlotApi = {
  upload: (file) => uploadCustomizationImage(file),
  discard: (publicId) => deleteCustomizationImage(publicId),
};

/** Puja Add-on photos. Their own Cloudinary folder, and their own delete guard. */
export const addonImageApi: ImageSlotApi = {
  upload: (file) => uploadAddonImage(file),
  discard: (publicId) => deleteAddonImage(publicId),
};

/**
 * Drops an asset nothing will ever reference.
 *
 * Best-effort on purpose: the admin's intent was "remove this from the form",
 * which has already happened locally. A failed cleanup leaves a file in
 * Cloudinary and is logged; blocking the edit on it would be a worse trade.
 */
async function discardUnsaved(publicId: string, pending: PendingUploads, api: ImageSlotApi) {
  if (!pending.isPending(publicId)) return;
  pending.forget(publicId);
  try {
    await api.discard(publicId);
  } catch (error) {
    console.warn("Could not delete an unsaved upload from Cloudinary", publicId, error);
  }
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function errorMessage(error: unknown) {
  return error instanceof ApiClientError ? error.message : "Couldn't upload that image. Please try again.";
}

/**
 * A preview that works for both kinds of src a product can hold.
 *
 * Cloudinary URLs and root-relative public/ paths both go through next/image.
 * Anything else — an absolute URL on a host next.config.ts does not allow —
 * would make the optimizer respond 400 and render as a broken image, so it is
 * shown as plain text instead. That only happens on legacy data; nothing the
 * uploader writes takes that shape.
 */
function Preview({ src, alt }: { src: string; alt: string }) {
  const renderable = src.startsWith("/") || src.includes("res.cloudinary.com");

  if (!renderable) {
    return (
      <span className="block break-all px-2 text-center text-bhor-caption text-bhor-text-muted">{src}</span>
    );
  }

  return <Image src={src} alt={alt} fill sizes="160px" className="object-cover" />;
}

function UploadButton({
  label,
  busy,
  multiple,
  onFiles,
}: {
  label: string;
  busy: boolean;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-bhor-sm border border-bhor-primary px-3 text-bhor-caption font-bhor-bold uppercase text-bhor-primary disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Upload className="h-3.5 w-3.5" aria-hidden />}
        {busy ? "Uploading…" : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple={multiple}
        // Cleared after every pick so choosing the same file twice in a row
        // still fires a change event.
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length > 0) onFiles(files);
        }}
        className="hidden"
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Single image
// ---------------------------------------------------------------------------

export type SingleImageValue = { src: string; publicId?: string };

/**
 * One image slot — a product's main, story or packaging photo, or a
 * customization item's photo.
 *
 * Replacing is upload-then-swap: the new asset is in place before the old
 * reference is dropped, so a failed upload leaves the existing photo exactly
 * where it was rather than emptying the slot.
 */
export function ImageField({
  label,
  hint,
  value,
  slug,
  pending,
  api,
  compact = false,
  onChange,
}: {
  label: string;
  hint?: string;
  value: SingleImageValue;
  /** Products only: which folder the upload is filed under. */
  slug?: string;
  pending: PendingUploads;
  /** Which endpoints this slot talks to. Defaults to product images. */
  api?: ImageSlotApi;
  /** Drops the label and tightens the layout, for use inside a table row. */
  compact?: boolean;
  onChange: (next: SingleImageValue) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Rebuilt when the slug changes so a product renamed mid-edit files its next
  // upload under the new folder.
  const slotApi = useMemo(() => api ?? productImageApi(slug), [api, slug]);

  async function upload(files: File[]) {
    const file = files[0];
    if (!file) return;

    const rejection = localRejection(file);
    if (rejection) {
      setError(rejection);
      return;
    }

    setError("");
    setBusy(true);
    const replaced = value.publicId;
    try {
      const uploaded = await slotApi.upload(file);

      pending.track(uploaded.publicId);
      onChange({ src: uploaded.src, publicId: uploaded.publicId });

      // Only once the replacement is in the form. If the one being replaced was
      // itself never saved, it is now unreachable and goes.
      if (replaced) void discardUnsaved(replaced, pending, slotApi);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    const removed = value.publicId;
    onChange({ src: "", publicId: undefined });
    setError("");
    if (removed) void discardUnsaved(removed, pending, slotApi);
  }

  return (
    <div>
      {compact ? null : (
        <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">{label}</span>
      )}
      <div className={`flex items-start gap-3 ${compact ? "" : "mt-1.5"}`}>
        <div
          className={`relative shrink-0 overflow-hidden rounded-bhor-sm border border-bhor-border bg-bhor-cream ${
            compact ? "h-14 w-14" : "h-20 w-20"
          }`}
        >
          {value.src ? (
            <Preview src={value.src} alt="" />
          ) : (
            <span className="flex h-full items-center justify-center text-bhor-text-muted">
              <ImagePlus className="h-5 w-5" aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <UploadButton label={value.src ? "Replace" : "Upload"} busy={busy} onFiles={upload} />
            {value.src ? (
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-bhor-sm border border-bhor-border px-3 text-bhor-caption font-bhor-bold uppercase text-bhor-error disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
              </button>
            ) : null}
          </div>
          {hint && !error ? <p className="mt-1.5 text-bhor-caption text-bhor-text-muted">{hint}</p> : null}
          {error ? (
            <p role="alert" className="mt-1.5 text-bhor-caption text-bhor-error">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

/**
 * The product gallery — as many images as the product needs.
 *
 * Several can be picked at once, and each keeps its own alt text. The first is
 * the slide the product page opens on, which is why the position is labelled.
 */
export function ImageGalleryField({
  value,
  slug,
  pending,
  max,
  onChange,
}: {
  value: ProductImage[];
  slug?: string;
  pending: PendingUploads;
  max: number;
  onChange: (next: ProductImage[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  // The gallery is product-only — customization items carry a single photo — so
  // this slot always talks to the product endpoints.
  const galleryApi = useMemo(() => productImageApi(slug), [slug]);

  const remaining = Math.max(0, max - value.length);

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      if (remaining === 0) {
        setError(`This product already has the maximum of ${max} gallery images.`);
        return;
      }

      // Trimmed rather than refused: uploading the first nine of ten is more
      // useful than rejecting the batch, and the message says what happened.
      const overflow = files.length - Math.min(files.length, remaining, MAX_FILES_PER_UPLOAD);
      const batch = files.slice(0, Math.min(remaining, MAX_FILES_PER_UPLOAD));

      const rejection = batch.map(localRejection).find(Boolean);
      if (rejection) {
        setError(rejection);
        return;
      }

      setError("");
      setBusy(true);
      try {
        const uploaded = await uploadProductImages(batch, slug);
        for (const asset of uploaded) pending.track(asset.publicId);
        onChange([
          ...value,
          ...uploaded.map((asset: UploadedProductImage) => ({ src: asset.src, alt: "", publicId: asset.publicId })),
        ]);
        if (overflow > 0) {
          setError(
            `Uploaded ${batch.length}. ${overflow} file${overflow === 1 ? "" : "s"} skipped — the limit is ${MAX_FILES_PER_UPLOAD} per upload and ${max} per product.`,
          );
        }
      } catch (caught) {
        setError(errorMessage(caught));
      } finally {
        setBusy(false);
      }
    },
    [max, onChange, pending, remaining, slug, value],
  );

  function removeAt(index: number) {
    const removed = value[index]?.publicId;
    onChange(value.filter((_, i) => i !== index));
    setError("");
    if (removed) void discardUnsaved(removed, pending, galleryApi);
  }

  function setAlt(index: number, alt: string) {
    onChange(value.map((row, i) => (i === index ? { ...row, alt } : row)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
          Gallery ({value.length}/{max})
        </span>
        <UploadButton label="Add images" busy={busy} multiple onFiles={upload} />
      </div>

      {/* A drop target as well as a button: dragging a folder of product shots
          straight in is how anyone with a photo directory expects this to work. */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const files = Array.from(event.dataTransfer.files ?? []).filter((file) => file.type.startsWith("image/"));
          if (files.length > 0) void upload(files);
        }}
        className={`mt-2 rounded-bhor-sm border border-dashed px-3 py-4 text-center text-bhor-caption transition-colors ${
          dragging ? "border-bhor-primary bg-bhor-primary-soft text-bhor-primary" : "border-bhor-border text-bhor-text-muted"
        }`}
      >
        {busy ? "Uploading…" : `Drop images here — JPEG, PNG, WebP or AVIF, up to ${megabytes(MAX_BYTES)} each`}
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-bhor-caption text-bhor-error">
          {error}
        </p>
      ) : null}

      {value.length === 0 ? (
        <p className="mt-2 text-bhor-caption text-bhor-text-muted">
          No gallery images yet. The first one you add is the slide the product page opens on.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {value.map((image, index) => (
            // Keyed by position, not by publicId. One asset can legitimately
            // occupy two gallery rows — the same photo used as both the opening
            // slide and a later one — and those rows are still separate entries
            // with their own alt text. Keying on the asset makes React see two
            // children with the same key and drop one. Position is the only
            // thing unique per row, and it is safe here because every field is
            // controlled from `value`: rows are appended and removed, never
            // reordered, so a shifted index still renders the right content.
            <li
              key={index}
              className="flex items-start gap-3 rounded-bhor-sm border border-bhor-border p-2"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-bhor-sm bg-bhor-cream">
                <Preview src={image.src} alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
                  {index === 0 ? "Image 1 — opens first" : `Image ${index + 1}`}
                </span>
                <input
                  value={image.alt}
                  onChange={(event) => setAlt(index, event.target.value)}
                  placeholder="Describe the image for screen readers and SEO"
                  className={
                    "mt-1 min-h-9 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary"
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove image ${index + 1}`}
                className="mt-4 rounded-bhor-sm p-2 text-bhor-error"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
