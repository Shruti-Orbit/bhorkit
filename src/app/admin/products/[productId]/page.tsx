"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  Card, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import { createProduct, getProduct, updateProduct, type AdminProduct } from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";

const COLLECTIONS = ["ganesh-chaturthi", "navratri-upcoming", "regular-pooja"];
const AVAILABILITY = ["available", "preorder", "unavailable"];
const PURCHASE_STATES = ["READY_STOCK", "PRE_ORDER", "COMING_SOON"];

type ImageRow = { src: string; alt: string };

/**
 * Every field the backend requires, with defaults good enough to create a
 * valid product. The catalogue document also carries rich marketing content
 * (highlights, contents, story, packaging, FAQs, reviews); those are edited
 * through the Advanced panel rather than eight bespoke sub-forms, which would
 * bury the fields staff actually change day to day.
 */
const ADVANCED_KEYS = ["highlights", "contents", "howToUse", "story", "packaging", "faqs", "reviews", "delivery", "preorder", "badge"] as const;

const ADVANCED_DEFAULTS: Record<string, unknown> = {
  highlights: [],
  contents: [],
  howToUse: [],
  story: { eyebrow: "", title: "", description: "", image: "", imageAlt: "" },
  packaging: { title: "", points: [], image: "", imageAlt: "" },
  faqs: [],
  reviews: [],
  delivery: { location: "Patna", description: "", availablePincodes: [], twoHourEligiblePincodes: [], supportsTwoHourDelivery: false },
};

export default function AdminProductFormPage() {
  const raw = useParams<{ productId: string }>().productId;
  const productId = decodeURIComponent(raw);
  const isNew = productId === "new";
  const router = useRouter();

  const [state, setState] = useState<"loading" | "ready" | "error">(isNew ? "ready" : "loading");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });
  const [saving, setSaving] = useState(false);

  const [core, setCore] = useState({
    id: "", sku: "", slug: "", name: "", subtitle: "", description: "",
    price: "", category: "", image: "", imageAlt: "", href: "",
    availability: "available", purchaseState: "READY_STOCK",
    catalogCollection: "regular-pooja", sortOrder: 0, readyStock: true,
  });
  const [images, setImages] = useState<ImageRow[]>([]);
  const [advanced, setAdvanced] = useState("{}");
  const [advancedError, setAdvancedError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const load = useCallback(() => {
    if (isNew) {
      setAdvanced(JSON.stringify(ADVANCED_DEFAULTS, null, 2));
      setState("ready");
      return;
    }
    setState("loading");
    getProduct(productId)
      .then((product) => {
        hydrate(product);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [isNew, productId]);

  // Deferred a tick rather than called straight from the effect body: `load`
  // flips state to "loading" immediately, which counts as a synchronous
  // setState in an effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  function hydrate(product: AdminProduct) {
    setCore({
      id: product.id, sku: product.sku, slug: product.slug, name: product.name,
      subtitle: product.subtitle, description: product.description, price: product.price,
      category: product.category, image: product.image, imageAlt: product.imageAlt, href: product.href,
      availability: product.availability, purchaseState: product.purchaseState,
      catalogCollection: product.catalogCollection, sortOrder: product.sortOrder,
      readyStock: product.stock?.readyStock ?? true,
    });
    setImages(product.images ?? []);
    const rest: Record<string, unknown> = {};
    for (const key of ADVANCED_KEYS) {
      const value = (product as unknown as Record<string, unknown>)[key];
      if (value !== undefined) rest[key] = value;
    }
    setAdvanced(JSON.stringify(rest, null, 2));
  }

  function field<K extends keyof typeof core>(key: K, value: (typeof core)[K]) {
    setCore((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    let parsedAdvanced: Record<string, unknown>;
    try {
      parsedAdvanced = JSON.parse(advanced || "{}") as Record<string, unknown>;
      setAdvancedError("");
    } catch {
      setAdvancedError("Advanced content isn't valid JSON.");
      setShowAdvanced(true);
      return;
    }

    const body: Record<string, unknown> = {
      ...parsedAdvanced,
      sku: core.sku.trim(),
      slug: core.slug.trim(),
      name: core.name.trim(),
      subtitle: core.subtitle.trim(),
      description: core.description.trim(),
      price: core.price.trim(),
      category: core.category.trim(),
      image: core.image.trim(),
      imageAlt: core.imageAlt.trim(),
      // Kept consistent with the slug so the storefront link never dangles.
      href: core.href.trim() || `/products/${core.slug.trim()}`,
      availability: core.availability,
      purchaseState: core.purchaseState,
      catalogCollection: core.catalogCollection,
      sortOrder: Number(core.sortOrder) || 0,
      stock: { readyStock: core.readyStock },
      images: images.filter((image) => image.src.trim()),
    };
    // The id is immutable: orders reference it, so it's set once at creation.
    if (isNew) body.id = core.id.trim() || core.slug.trim();

    setSaving(true);
    try {
      if (isNew) {
        const created = await createProduct(body);
        setToast({ message: "Product created.", tone: "success" });
        router.replace(`/admin/products/${encodeURIComponent(created.id)}`);
      } else {
        const updated = await updateProduct(productId, body);
        hydrate(updated);
        setToast({ message: "Product saved.", tone: "success" });
      }
    } catch (error) {
      setToast({
        message: error instanceof ApiClientError ? error.message : "Couldn't save the product.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (state === "loading") return <LoadingState label="Loading product…" />;
  if (state === "error") return <ErrorState message="Couldn't load this product." onRetry={load} />;

  const canSave = core.name.trim() && core.sku.trim() && core.slug.trim() && core.price.trim() && core.category.trim();

  return (
    <div>
      <PageHeader
        title={isNew ? "New product" : core.name || "Edit product"}
        description={isNew ? "Add a product to the catalogue." : `SKU ${core.sku}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/products" className="min-h-10 rounded-bhor-sm border border-bhor-border px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-text">
              Back
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={saving || !canSave}
              className="min-h-10 rounded-bhor-sm bg-bhor-primary px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
            </button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card className="p-4">
            <h2 className="mb-3 text-bhor-small font-bhor-bold text-bhor-text">Basics</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name"><input value={core.name} onChange={(e) => field("name", e.target.value)} className={inputClass} /></Field>
              <Field label="SKU"><input value={core.sku} onChange={(e) => field("sku", e.target.value)} className={inputClass} /></Field>
              <Field label="Slug"><input value={core.slug} onChange={(e) => field("slug", e.target.value)} className={inputClass} /></Field>
              {isNew ? (
                <Field label="Product id (defaults to slug)">
                  <input value={core.id} onChange={(e) => field("id", e.target.value)} className={inputClass} />
                </Field>
              ) : (
                <Field label="Product id (fixed)">
                  <input value={core.id} readOnly className={`${inputClass} opacity-60`} />
                </Field>
              )}
              <Field label="Category"><input value={core.category} onChange={(e) => field("category", e.target.value)} className={inputClass} /></Field>
              <Field label="Price (e.g. ₹699)"><input value={core.price} onChange={(e) => field("price", e.target.value)} className={inputClass} /></Field>
              <Field label="Subtitle"><input value={core.subtitle} onChange={(e) => field("subtitle", e.target.value)} className={inputClass} /></Field>
              <Field label="Storefront link"><input value={core.href} onChange={(e) => field("href", e.target.value)} placeholder={`/products/${core.slug}`} className={inputClass} /></Field>
            </div>
            <div className="mt-3">
              <Field label="Description">
                <textarea value={core.description} onChange={(e) => field("description", e.target.value)} rows={4} className={`${inputClass} min-h-24 py-2`} />
              </Field>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-bhor-small font-bhor-bold text-bhor-text">Images</h2>
              <button
                type="button"
                onClick={() => setImages((rows) => [...rows, { src: "", alt: "" }])}
                className="inline-flex min-h-9 items-center gap-1 rounded-bhor-sm border border-bhor-primary px-3 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add image
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Main image path"><input value={core.image} onChange={(e) => field("image", e.target.value)} placeholder="/images/slider/slider-1.png" className={inputClass} /></Field>
              <Field label="Main image alt"><input value={core.imageAlt} onChange={(e) => field("imageAlt", e.target.value)} className={inputClass} /></Field>
            </div>
            {images.length === 0 ? (
              <p className="mt-3 text-bhor-caption text-bhor-text-muted">No gallery images yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {images.map((image, index) => (
                  <li key={index} className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[180px] flex-1">
                      <Field label={`Image ${index + 1} path`}>
                        <input
                          value={image.src}
                          onChange={(e) => setImages((rows) => rows.map((row, i) => (i === index ? { ...row, src: e.target.value } : row)))}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                    <div className="min-w-[160px] flex-1">
                      <Field label="Alt text">
                        <input
                          value={image.alt}
                          onChange={(e) => setImages((rows) => rows.map((row, i) => (i === index ? { ...row, alt: e.target.value } : row)))}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImages((rows) => rows.filter((_, i) => i !== index))}
                      aria-label={`Remove image ${index + 1}`}
                      className="mb-1 rounded-bhor-sm p-2 text-bhor-error"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <button
              type="button"
              onClick={() => setShowAdvanced((open) => !open)}
              className="text-bhor-small font-bhor-bold text-bhor-text"
            >
              {showAdvanced ? "▾" : "▸"} Advanced content
            </button>
            <p className="mt-1 text-bhor-caption text-bhor-text-muted">
              Highlights, kit contents, story, packaging, FAQs, delivery and reviews, as JSON.
            </p>
            {showAdvanced ? (
              <>
                <textarea
                  value={advanced}
                  onChange={(e) => { setAdvanced(e.target.value); setAdvancedError(""); }}
                  rows={16}
                  spellCheck={false}
                  className={`${inputClass} mt-3 min-h-64 py-2 font-mono text-bhor-caption`}
                />
                {advancedError ? <p className="mt-1 text-bhor-caption text-bhor-error">{advancedError}</p> : null}
              </>
            ) : null}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-4">
            <h2 className="mb-3 text-bhor-small font-bhor-bold text-bhor-text">Availability</h2>
            <div className="space-y-3">
              <Field label="Availability">
                <select value={core.availability} onChange={(e) => field("availability", e.target.value)} className={inputClass}>
                  {AVAILABILITY.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </Field>
              <Field label="Purchase state">
                <select value={core.purchaseState} onChange={(e) => field("purchaseState", e.target.value)} className={inputClass}>
                  {PURCHASE_STATES.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </Field>
              <Field label="Collection">
                <select value={core.catalogCollection} onChange={(e) => field("catalogCollection", e.target.value)} className={inputClass}>
                  {COLLECTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </Field>
              <Field label="Sort order">
                <input type="number" value={core.sortOrder} onChange={(e) => field("sortOrder", Number(e.target.value))} className={inputClass} />
              </Field>
              <label className="flex items-center gap-2 pt-1 text-bhor-small text-bhor-text">
                <input
                  type="checkbox"
                  checked={core.readyStock}
                  onChange={(e) => field("readyStock", e.target.checked)}
                  className="h-4 w-4 accent-bhor-primary"
                />
                In ready stock
              </label>
              <p className="text-bhor-caption text-bhor-text-muted">
                Setting availability to <strong>unavailable</strong> hides the product from the shop while
                keeping it on past orders.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Toast message={toast.message} tone={toast.tone} onDone={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}
