"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Field, inputClass } from "@/src/components/admin/ui";
import type { AdminIngredient } from "@/src/lib/api/admin.api";

/**
 * Everything a product carries beyond its name and price, as ordinary form
 * fields.
 *
 * This replaces a JSON textarea. The shape is identical to what the API
 * expects — the difference is that an admin now fills in labelled boxes and
 * presses "Add" instead of balancing brackets, and a typo produces a wrong
 * word rather than an unsaveable product.
 *
 * Kit contents are the one section that is not free text: an ingredient is
 * chosen from the inventory and only the amount is typed, so the name and unit
 * come from there and cannot drift.
 */

export type ContentLine = { ingredientId: string; quantity: string; name?: string; unit?: string };

export type AdvancedContent = {
  highlights: { title: string; description: string }[];
  contents: ContentLine[];
  howToUse: { title: string; description: string }[];
  story: { eyebrow: string; title: string; description: string; image: string; imageAlt: string };
  packaging: { title: string; points: string[]; image: string; imageAlt: string };
  faqs: { question: string; answer: string }[];
  reviews: { customerName: string; rating: number; date: string; verified: boolean; content: string }[];
  delivery: {
    location: string;
    description: string;
    availablePincodes: string[];
    twoHourEligiblePincodes: string[];
    supportsTwoHourDelivery: boolean;
  };
  preorder: { title: string; description: string; expectedDelivery: string };
};

export const EMPTY_ADVANCED: AdvancedContent = {
  highlights: [],
  contents: [],
  howToUse: [],
  story: { eyebrow: "", title: "", description: "", image: "", imageAlt: "" },
  packaging: { title: "", points: [], image: "", imageAlt: "" },
  faqs: [],
  reviews: [],
  delivery: {
    location: "Patna",
    description: "",
    availablePincodes: [],
    twoHourEligiblePincodes: [],
    supportsTwoHourDelivery: false,
  },
  preorder: { title: "", description: "", expectedDelivery: "" },
};

/** A collapsible block, so the form is a list of topics rather than a wall. */
function Section({
  title, hint, count, children, defaultOpen = false,
}: {
  title: string;
  hint?: string;
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="text-sm font-semibold text-slate-900">
            {title}
            {count !== undefined ? <span className="ml-2 font-normal text-slate-500">({count})</span> : null}
          </span>
          {hint ? <span className="mt-0.5 block text-xs text-slate-500">{hint}</span> : null}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? <div className="border-t border-slate-200 p-4">{children}</div> : null}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-700"
    >
      <Plus className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-700"
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </button>
  );
}

/** A list of plain strings — packaging points, pincodes. */
function StringList({
  items, placeholder, addLabel, onChange,
}: {
  items: string[];
  placeholder: string;
  addLabel: string;
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={value}
            onChange={(event) => onChange(items.map((item, i) => (i === index ? event.target.value : item)))}
            placeholder={placeholder}
            className={inputClass}
          />
          <RemoveButton label={`Remove ${placeholder}`} onClick={() => onChange(items.filter((_, i) => i !== index))} />
        </div>
      ))}
      <AddButton label={addLabel} onClick={() => onChange([...items, ""])} />
    </div>
  );
}

export function AdvancedContentForm({
  value,
  onChange,
  ingredients,
}: {
  value: AdvancedContent;
  onChange: (next: AdvancedContent) => void;
  ingredients: AdminIngredient[];
}) {
  const set = <K extends keyof AdvancedContent>(key: K, next: AdvancedContent[K]) =>
    onChange({ ...value, [key]: next });

  const unitFor = (ingredientId: string) =>
    ingredients.find((item) => item.id === ingredientId)?.unit ?? "";

  // An ingredient already in the kit is not offered again, so the same thing
  // cannot be added twice.
  const chosen = new Set(value.contents.map((line) => line.ingredientId));

  return (
    <div className="space-y-3">
      <Section
        title="Ingredients / Kit contents"
        hint="Pick from the Inventory and say how much goes in. The unit comes from the inventory."
        count={value.contents.length}
        defaultOpen
      >
        {ingredients.length === 0 ? (
          <p className="text-sm text-slate-600">
            Nothing in the inventory yet — add ingredients under Inventory first.
          </p>
        ) : (
          <div className="space-y-3">
            {value.contents.map((line, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-end">
                <Field label="Ingredient">
                  <select
                    value={line.ingredientId}
                    onChange={(event) =>
                      set("contents", value.contents.map((item, i) =>
                        i === index ? { ...item, ingredientId: event.target.value } : item))
                    }
                    className={inputClass}
                  >
                    <option value="">Choose an ingredient…</option>
                    {ingredients
                      .filter((item) => item.id === line.ingredientId || !chosen.has(item.id))
                      .map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                  </select>
                </Field>
                <Field label={`Amount${unitFor(line.ingredientId) ? ` (${unitFor(line.ingredientId)})` : ""}`}>
                  <input
                    value={line.quantity}
                    onChange={(event) =>
                      set("contents", value.contents.map((item, i) =>
                        i === index ? { ...item, quantity: event.target.value } : item))
                    }
                    placeholder="5"
                    className={inputClass}
                  />
                </Field>
                <RemoveButton
                  label="Remove ingredient"
                  onClick={() => set("contents", value.contents.filter((_, i) => i !== index))}
                />
              </div>
            ))}
            <AddButton
              label="Add ingredient"
              onClick={() => set("contents", [...value.contents, { ingredientId: "", quantity: "" }])}
            />
          </div>
        )}
      </Section>

      <Section title="Highlights" hint="Short selling points shown on the product page." count={value.highlights.length}>
        <div className="space-y-3">
          {value.highlights.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-end">
              <Field label="Title">
                <input
                  value={item.title}
                  onChange={(event) => set("highlights", value.highlights.map((h, i) => i === index ? { ...h, title: event.target.value } : h))}
                  className={inputClass}
                />
              </Field>
              <Field label="Description">
                <input
                  value={item.description}
                  onChange={(event) => set("highlights", value.highlights.map((h, i) => i === index ? { ...h, description: event.target.value } : h))}
                  className={inputClass}
                />
              </Field>
              <RemoveButton label="Remove highlight" onClick={() => set("highlights", value.highlights.filter((_, i) => i !== index))} />
            </div>
          ))}
          <AddButton label="Add highlight" onClick={() => set("highlights", [...value.highlights, { title: "", description: "" }])} />
        </div>
      </Section>

      <Section title="How to use" hint="Step-by-step guidance." count={value.howToUse.length}>
        <div className="space-y-3">
          {value.howToUse.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-end">
              <Field label="Step title">
                <input
                  value={item.title}
                  onChange={(event) => set("howToUse", value.howToUse.map((h, i) => i === index ? { ...h, title: event.target.value } : h))}
                  className={inputClass}
                />
              </Field>
              <Field label="Description">
                <input
                  value={item.description}
                  onChange={(event) => set("howToUse", value.howToUse.map((h, i) => i === index ? { ...h, description: event.target.value } : h))}
                  className={inputClass}
                />
              </Field>
              <RemoveButton label="Remove step" onClick={() => set("howToUse", value.howToUse.filter((_, i) => i !== index))} />
            </div>
          ))}
          <AddButton label="Add step" onClick={() => set("howToUse", [...value.howToUse, { title: "", description: "" }])} />
        </div>
      </Section>

      <Section title="Story" hint="The narrative block on the product page.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Eyebrow"><input value={value.story.eyebrow} onChange={(e) => set("story", { ...value.story, eyebrow: e.target.value })} className={inputClass} /></Field>
          <Field label="Title"><input value={value.story.title} onChange={(e) => set("story", { ...value.story, title: e.target.value })} className={inputClass} /></Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea rows={3} value={value.story.description} onChange={(e) => set("story", { ...value.story, description: e.target.value })} className={`${inputClass} resize-y`} />
            </Field>
          </div>
          <Field label="Image URL"><input value={value.story.image} onChange={(e) => set("story", { ...value.story, image: e.target.value })} className={inputClass} /></Field>
          <Field label="Image description"><input value={value.story.imageAlt} onChange={(e) => set("story", { ...value.story, imageAlt: e.target.value })} className={inputClass} /></Field>
        </div>
      </Section>

      <Section title="Packaging" hint="How the kit arrives." count={value.packaging.points.length}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title"><input value={value.packaging.title} onChange={(e) => set("packaging", { ...value.packaging, title: e.target.value })} className={inputClass} /></Field>
          <Field label="Image URL"><input value={value.packaging.image} onChange={(e) => set("packaging", { ...value.packaging, image: e.target.value })} className={inputClass} /></Field>
          <Field label="Image description"><input value={value.packaging.imageAlt} onChange={(e) => set("packaging", { ...value.packaging, imageAlt: e.target.value })} className={inputClass} /></Field>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Packaging points</p>
            <StringList
              items={value.packaging.points}
              placeholder="Wrapped in recyclable paper"
              addLabel="Add point"
              onChange={(points) => set("packaging", { ...value.packaging, points })}
            />
          </div>
        </div>
      </Section>

      <Section title="FAQs" hint="Questions customers ask about this product." count={value.faqs.length}>
        <div className="space-y-3">
          {value.faqs.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-end">
              <Field label="Question">
                <input value={item.question} onChange={(e) => set("faqs", value.faqs.map((f, i) => i === index ? { ...f, question: e.target.value } : f))} className={inputClass} />
              </Field>
              <Field label="Answer">
                <input value={item.answer} onChange={(e) => set("faqs", value.faqs.map((f, i) => i === index ? { ...f, answer: e.target.value } : f))} className={inputClass} />
              </Field>
              <RemoveButton label="Remove FAQ" onClick={() => set("faqs", value.faqs.filter((_, i) => i !== index))} />
            </div>
          ))}
          <AddButton label="Add FAQ" onClick={() => set("faqs", [...value.faqs, { question: "", answer: "" }])} />
        </div>
      </Section>

      <Section title="Reviews" hint="Shown on the product page." count={value.reviews.length}>
        <div className="space-y-4">
          {value.reviews.map((item, index) => {
            const edit = (patch: Partial<AdvancedContent["reviews"][number]>) =>
              set("reviews", value.reviews.map((r, i) => (i === index ? { ...r, ...patch } : r)));
            return (
              <div key={index} className="rounded-lg border border-slate-200 p-3">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_110px_150px_auto] sm:items-end">
                  <Field label="Customer name"><input value={item.customerName} onChange={(e) => edit({ customerName: e.target.value })} className={inputClass} /></Field>
                  <Field label="Rating">
                    <select value={String(item.rating)} onChange={(e) => edit({ rating: Number(e.target.value) })} className={inputClass}>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n === 1 ? "" : "s"}</option>)}
                    </select>
                  </Field>
                  <Field label="Date"><input value={item.date} onChange={(e) => edit({ date: e.target.value })} placeholder="12 Aug 2026" className={inputClass} /></Field>
                  <RemoveButton label="Remove review" onClick={() => set("reviews", value.reviews.filter((_, i) => i !== index))} />
                </div>
                <div className="mt-3">
                  <Field label="Review">
                    <textarea rows={2} value={item.content} onChange={(e) => edit({ content: e.target.value })} className={`${inputClass} resize-y`} />
                  </Field>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={item.verified} onChange={(e) => edit({ verified: e.target.checked })} className="h-4 w-4 accent-rose-700" />
                  Verified purchase
                </label>
              </div>
            );
          })}
          <AddButton
            label="Add review"
            onClick={() => set("reviews", [...value.reviews, { customerName: "", rating: 5, date: "", verified: true, content: "" }])}
          />
        </div>
      </Section>

      <Section title="Delivery" hint="What the product page says about getting it to the customer.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Location"><input value={value.delivery.location} onChange={(e) => set("delivery", { ...value.delivery, location: e.target.value })} className={inputClass} /></Field>
          <Field label="Description"><input value={value.delivery.description} onChange={(e) => set("delivery", { ...value.delivery, description: e.target.value })} className={inputClass} /></Field>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Deliverable pincodes</p>
            <StringList items={value.delivery.availablePincodes} placeholder="800001" addLabel="Add pincode" onChange={(availablePincodes) => set("delivery", { ...value.delivery, availablePincodes })} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">2-hour delivery pincodes</p>
            <StringList items={value.delivery.twoHourEligiblePincodes} placeholder="800001" addLabel="Add pincode" onChange={(twoHourEligiblePincodes) => set("delivery", { ...value.delivery, twoHourEligiblePincodes })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input type="checkbox" checked={value.delivery.supportsTwoHourDelivery} onChange={(e) => set("delivery", { ...value.delivery, supportsTwoHourDelivery: e.target.checked })} className="h-4 w-4 accent-rose-700" />
            Offers 2-hour delivery
          </label>
        </div>
      </Section>

      <Section title="Pre-order details" hint="Only shown for products taking pre-orders.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title"><input value={value.preorder.title} onChange={(e) => set("preorder", { ...value.preorder, title: e.target.value })} className={inputClass} /></Field>
          <Field label="Expected delivery"><input value={value.preorder.expectedDelivery} onChange={(e) => set("preorder", { ...value.preorder, expectedDelivery: e.target.value })} placeholder="Before Ganesh Chaturthi" className={inputClass} /></Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea rows={2} value={value.preorder.description} onChange={(e) => set("preorder", { ...value.preorder, description: e.target.value })} className={`${inputClass} resize-y`} />
            </Field>
          </div>
        </div>
      </Section>
    </div>
  );
}
