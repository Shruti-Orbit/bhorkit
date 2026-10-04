"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import {
  createProduct, getProduct, listCategories, listIngredients, updateProduct,
  type AdminCategory, type AdminIngredient, type AdminProduct,
} from "@/src/lib/api/admin.api";
import {
  AdvancedContentForm, EMPTY_ADVANCED, type AdvancedContent,
} from "@/src/components/admin/product/AdvancedContentForm";
import {
  ImageField, ImageGalleryField, usePendingUploads,
} from "@/src/components/admin/product/ImageUploader";
import type { ProductImage, ShopCategorySlug } from "@/src/data/products";
import { ApiClientError } from "@/src/lib/api/client";

const AVAILABILITY = ["available", "preorder", "unavailable"];
const PURCHASE_STATES = ["READY_STOCK", "PRE_ORDER", "COMING_SOON"];

/** Mirrors MAX_PRODUCT_IMAGES in the backend product model. */
const MAX_GALLERY_IMAGES = 24;

/**
 * Every field the backend requires, with defaults good enough to create a
 * valid product. The richer marketing content — highlights, kit contents,
 * story, packaging, FAQs, delivery, reviews — is edited through
 * AdvancedContentForm, as ordinary labelled inputs rather than JSON.
 */
/** Fills in whatever a product is missing, so every field has something to bind to. */
function toAdvanced(product: Partial<AdminProduct>): AdvancedContent {
  return {
    highlights: product.highlights ?? [],
    contents: (product.contents ?? []).map((line) => ({
      ingredientId: (line as { ingredientId?: string }).ingredientId ?? "",
      quantity: line.quantity ?? "",
      name: line.name,
      unit: line.unit,
    })),
    contentGroups: (product.contentGroups ?? []).map((group) => ({
      id: group.id,
      label: group.label,
      title: group.title,
      items: (group.items ?? []).map((item) => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity ?? "",
      })),
    })),
    howToUse: product.howToUse ?? [],
    story: { ...EMPTY_ADVANCED.story, ...(product.story ?? {}) },
    packaging: { ...EMPTY_ADVANCED.packaging, ...(product.packaging ?? {}) },
    faqs: product.faqs ?? [],
    reviews: (product.reviews ?? []).map((review) => ({
      customerName: review.customerName ?? "",
      rating: review.rating ?? 5,
      date: review.date ?? "",
      verified: review.verified ?? false,
      content: review.content ?? "",
    })),
    delivery: { ...EMPTY_ADVANCED.delivery, ...(product.delivery ?? {}) },
    preorder: { ...EMPTY_ADVANCED.preorder, ...(product.preorder ?? {}) },
  };
}

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
    price: "", image: "", imageAlt: "", imagePublicId: "" as string | undefined, href: "",
    availability: "available", purchaseState: "READY_STOCK",
    shopCategory: "regular-pooja" as ShopCategorySlug, sortOrder: 0, readyStock: true,
  });
  const [images, setImages] = useState<ProductImage[]>([]);
  // Assets uploaded in this sitting that no product references yet. Shared by
  // every image slot on the form, and emptied once a save makes them real.
  const pendingUploads = usePendingUploads();
  const [advanced, setAdvanced] = useState<AdvancedContent>(EMPTY_ADVANCED);
  const [ingredients, setIngredients] = useState<AdminIngredient[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const load = useCallback(() => {
    if (isNew) {
      setAdvanced(EMPTY_ADVANCED);
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

  // The ingredient picker needs the inventory. Failing to load it leaves the
  // picker empty with an explanation rather than breaking the whole form.
  useEffect(() => {
    let active = true;
    listIngredients()
      .then((loaded) => { if (active) setIngredients(loaded.ingredients); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    listCategories()
      .then((loaded) => {
        if (!active) return;
        setCategories(loaded);
        // A new product starts in the first category that actually exists.
        if (isNew && loaded.length > 0) {
          setCore((current) =>
            loaded.some((category) => category.slug === current.shopCategory)
              ? current
              : { ...current, shopCategory: loaded[0].slug },
          );
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [isNew]);

  function hydrate(product: AdminProduct) {
    setCore({
      id: product.id, sku: product.sku, slug: product.slug, name: product.name,
      subtitle: product.subtitle, description: product.description, price: product.price,
      image: product.image, imageAlt: product.imageAlt, imagePublicId: product.imagePublicId, href: product.href,
      availability: product.availability, purchaseState: product.purchaseState,
      shopCategory: product.shopCategory, sortOrder: product.sortOrder,
      readyStock: product.stock?.readyStock ?? true,
    });
    setImages(product.images ?? []);
    setAdvanced(toAdvanced(product));
  }

  function field<K extends keyof typeof core>(key: K, value: (typeof core)[K]) {
    setCore((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    const body: Record<string, unknown> = {
      ...advanced,
      // Only complete lines are sent. A half-filled row is someone mid-edit,
      // not an instruction to save an ingredient with no amount.
      contents: advanced.contents
        .filter((line) => line.ingredientId && line.quantity.trim())
        .map((line) => ({ ingredientId: line.ingredientId, quantity: line.quantity.trim() })),
      // Same rule for the day-wise breakdown: complete lines only, and a day
      // with nothing in it is not saved at all.
      contentGroups: advanced.contentGroups
        .map((group) => ({
          id: group.id,
          label: group.label.trim(),
          title: group.title.trim() || group.label.trim(),
          items: group.items
            .filter((item) => item.ingredientId)
            .map((item) => ({
              ingredientId: item.ingredientId,
              ...(item.quantity.trim() ? { quantity: item.quantity.trim() } : {}),
            })),
        }))
        .filter((group) => group.label && group.items.length > 0),
      sku: core.sku.trim(),
      slug: core.slug.trim(),
      name: core.name.trim(),
      subtitle: core.subtitle.trim(),
      description: core.description.trim(),
      price: core.price.trim(),
      image: core.image.trim(),
      imageAlt: core.imageAlt.trim(),
      // Travels with the URL: it is the only handle the API can use to free the
      // asset when this image is later replaced or removed.
      ...(core.imagePublicId ? { imagePublicId: core.imagePublicId } : {}),
      // Kept consistent with the slug so the storefront link never dangles.
      href: core.href.trim() || `/products/${core.slug.trim()}`,
      availability: core.availability,
      purchaseState: core.purchaseState,
      shopCategory: core.shopCategory,
      sortOrder: Number(core.sortOrder) || 0,
      stock: { readyStock: core.readyStock },
      images: images
        .filter((image) => image.src.trim())
        .map((image) => ({
          src: image.src,
          alt: image.alt.trim() || core.imageAlt.trim() || core.name.trim(),
          ...(image.publicId ? { publicId: image.publicId } : {}),
        })),
    };
    // The id is immutable: orders reference it, so it's set once at creation.
    if (isNew) body.id = core.id.trim() || core.slug.trim();

    setSaving(true);
    try {
      if (isNew) {
        const created = await createProduct(body);
        // Saved, so every uploaded asset is now referenced by a product and is
        // no longer something to clean up if the admin removes it.
        pendingUploads.clear();
        setToast({ message: "Product created.", tone: "success" });
        router.replace(`/admin/products/${encodeURIComponent(created.id)}`);
      } else {
        const updated = await updateProduct(productId, body);
        pendingUploads.clear();
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

  const canSave = core.name.trim() && core.sku.trim() && core.slug.trim() && core.price.trim() && core.shopCategory;

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
              {/* A list of the real categories, not free text. Typing a
                  category by hand is how every Navratri kit once ended up
                  filed under "Ganesh Puja". */}
              <Field label="Shop category">
                <select
                  value={core.shopCategory}
                  onChange={(e) => field("shopCategory", e.target.value as ShopCategorySlug)}
                  className={inputClass}
                >
                  {core.shopCategory && !categories.some((category) => category.slug === core.shopCategory) ? (
                    <option value={core.shopCategory}>{core.shopCategory} (no such category)</option>
                  ) : null}
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}{category.isActive ? "" : " (hidden)"}
                    </option>
                  ))}
                </select>
              </Field>
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

          {/* Images are uploaded, not typed. A path pointing at a file in the
              frontend repo meant adding a product needed a developer and a
              deploy, and a typo produced a broken image with nothing to catch
              it. Both the URL and the Cloudinary publicId are held here and sent
              on save — the id is what lets the API free the asset when the image
              is later replaced or removed. */}
          <Card className="p-4">
            <h2 className="mb-3 text-bhor-small font-bhor-bold text-bhor-text">Images</h2>
            <div className="space-y-4">
              <ImageField
                label="Main image"
                hint="Shown on the shop listing, the cart and the order confirmation."
                value={{ src: core.image, publicId: core.imagePublicId }}
                slug={core.slug}
                pending={pendingUploads}
                onChange={(next) =>
                  setCore((current) => ({ ...current, image: next.src, imagePublicId: next.publicId }))
                }
              />
              <Field label="Main image alt">
                <input value={core.imageAlt} onChange={(e) => field("imageAlt", e.target.value)} className={inputClass} />
              </Field>
              <div className="border-t border-bhor-border pt-4">
                <ImageGalleryField
                  value={images}
                  slug={core.slug}
                  pending={pendingUploads}
                  max={MAX_GALLERY_IMAGES}
                  onChange={setImages}
                />
              </div>
            </div>
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
              Ingredients, highlights, story, packaging, FAQs, delivery and reviews.
            </p>
            {showAdvanced ? (
              <div className="mt-4">
                <AdvancedContentForm
                  value={advanced}
                  onChange={setAdvanced}
                  ingredients={ingredients}
                  slug={core.slug}
                  pendingUploads={pendingUploads}
                />
              </div>
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
