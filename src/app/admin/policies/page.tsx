"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Card, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import {
  getPolicies, updatePolicyMeta, updatePolicySection,
  type AdminPolicies, type AdminPolicySection,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";

const META_KEY = "__meta";

type Draft = { title: string; body: string; lastUpdated?: string };

/** Renders a picked date the way the policies page shows it, e.g. "26 August 2026". */
function formatPickedDate(iso: string) {
  if (!iso) return "";
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * A stored value that is still an unfilled placeholder — "[Date]" as the
 * drafted policies shipped — counts as not set. The storefront hides the line
 * in that case, so the editor says so rather than showing it as a real value.
 */
function isUnsetDate(value: string) {
  return value.trim() === "" || /^\[[^\]]*\]$/.test(value.trim());
}

/**
 * Editor for the customer-facing legal policies.
 *
 * Each policy is saved on its own, which is how the API works too: a save
 * writes only that section, so two people editing different policies cannot
 * overwrite each other.
 *
 * The body is Markdown — the same small subset the storefront renders (### for
 * a numbered sub-heading, `-` for bullets, `**bold**`). It is stored as text
 * and rendered as text nodes, never as HTML, so nothing typed here can execute
 * in a customer's browser.
 */
export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<AdminPolicies | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [openKey, setOpenKey] = useState<string>(META_KEY);
  const [draft, setDraft] = useState<Record<string, Draft>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });

  const load = useCallback(() => {
    setState("loading");
    getPolicies()
      .then((result) => {
        setPolicies(result);
        setDraft({
          [META_KEY]: {
            title: result.title,
            body: result.preambleMarkdown,
            lastUpdated: result.lastUpdated,
          },
          ...Object.fromEntries(
            result.sections.map((s) => [s.slug, { title: s.title, body: s.bodyMarkdown }]),
          ),
        });
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  // Deferred a tick rather than called straight from the effect body: `load`
  // flips state to "loading" immediately, which counts as a synchronous
  // setState in an effect (react-hooks/set-state-in-effect).
  useEffect(() => { queueMicrotask(load); }, [load]);

  function edit(key: string, patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, [key]: { ...current[key]!, ...patch } }));
  }

  function isDirty(key: string, original: Draft) {
    const current = draft[key];
    if (!current) return false;
    return (
      current.title !== original.title ||
      current.body !== original.body ||
      (current.lastUpdated ?? "") !== (original.lastUpdated ?? "")
    );
  }

  async function save(key: string) {
    const current = draft[key];
    if (!current) return;
    setSavingKey(key);
    try {
      const updated = key === META_KEY
        ? await updatePolicyMeta({
            title: current.title,
            preambleMarkdown: current.body,
            lastUpdated: current.lastUpdated ?? "",
          })
        : await updatePolicySection(key, { title: current.title, bodyMarkdown: current.body });
      setPolicies(updated);
      setToast({ message: "Saved. The change is live on the website.", tone: "success" });
    } catch (error) {
      setToast({
        message: error instanceof ApiClientError ? error.message : "Couldn't save that.",
        tone: "error",
      });
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Policies"
        description="The legal pages customers see. Saving publishes immediately — there is no separate publish step."
        action={
          <Link
            href="/policies"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-bhor-sm border border-bhor-border px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-text"
          >
            View page
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      {state === "loading" ? (
        <LoadingState label="Loading policies…" />
      ) : state === "error" || !policies ? (
        <ErrorState message="Couldn't load the policies." onRetry={load} />
      ) : (
        <div className="space-y-4">
          <Editor
            heading="Page heading and introduction"
            hint="Shown above the five policies."
            titleLabel="Page heading"
            bodyLabel="Introduction"
            open={openKey === META_KEY}
            onToggle={() => setOpenKey(openKey === META_KEY ? "" : META_KEY)}
            value={draft[META_KEY] ?? { title: "", body: "" }}
            onChange={(patch) => edit(META_KEY, patch)}
            dirty={isDirty(META_KEY, {
              title: policies.title,
              body: policies.preambleMarkdown,
              lastUpdated: policies.lastUpdated,
            })}
            showLastUpdated
            saving={savingKey === META_KEY}
            onSave={() => void save(META_KEY)}
            updatedAt={policies.updatedAt}
            updatedBy={policies.updatedBy}
          />

          {policies.sections.map((section: AdminPolicySection) => (
            <Editor
              key={section.slug}
              heading={section.navLabel}
              hint={`Anchor: /policies#${section.slug}`}
              titleLabel="Heading"
              bodyLabel="Policy content (Markdown)"
              open={openKey === section.slug}
              onToggle={() => setOpenKey(openKey === section.slug ? "" : section.slug)}
              value={draft[section.slug] ?? { title: "", body: "" }}
              onChange={(patch) => edit(section.slug, patch)}
              dirty={isDirty(section.slug, { title: section.title, body: section.bodyMarkdown })}
              saving={savingKey === section.slug}
              onSave={() => void save(section.slug)}
              updatedAt={section.updatedAt}
              updatedBy={section.updatedBy}
            />
          ))}
        </div>
      )}

      <Toast message={toast.message} tone={toast.tone} onDone={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}

type EditorProps = {
  heading: string;
  hint: string;
  titleLabel: string;
  bodyLabel: string;
  open: boolean;
  onToggle: () => void;
  value: Draft;
  onChange: (patch: Partial<Draft>) => void;
  /** Only the page-level editor carries the "Last updated" line. */
  showLastUpdated?: boolean;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  updatedAt: string;
  updatedBy: string | null;
};

function Editor({
  heading, hint, titleLabel, bodyLabel, open, onToggle,
  value, onChange, showLastUpdated = false, dirty, saving, onSave, updatedAt, updatedBy,
}: EditorProps) {
  return (
    <Card className="p-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <span className="min-w-0">
          <span className="block text-bhor-small font-bhor-semibold text-bhor-text">{heading}</span>
          <span className="mt-0.5 block truncate text-bhor-caption text-bhor-text-muted">{hint}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {dirty ? (
            <span className="rounded-bhor-sm bg-bhor-primary-soft px-2 py-0.5 text-bhor-caption font-bhor-bold uppercase text-bhor-primary">
              Unsaved
            </span>
          ) : null}
          <span className="text-bhor-caption font-bhor-bold uppercase text-bhor-primary">
            {open ? "Close" : "Edit"}
          </span>
        </span>
      </button>

      {open ? (
        <div className="mt-4 space-y-3">
          <Field label={titleLabel}>
            <input
              value={value.title}
              onChange={(event) => onChange({ title: event.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label={bodyLabel}>
            <textarea
              value={value.body}
              onChange={(event) => onChange({ body: event.target.value })}
              rows={18}
              spellCheck
              className={`${inputClass} min-h-64 py-2 font-mono text-bhor-caption leading-bhor-body`}
            />
          </Field>

          {showLastUpdated ? (
            <Field label="Last updated (shown at the foot of the policies page)">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  onChange={(event) => onChange({ lastUpdated: formatPickedDate(event.target.value) })}
                  className={`${inputClass} w-auto`}
                  aria-label="Pick the last updated date"
                />
                <input
                  value={value.lastUpdated ?? ""}
                  onChange={(event) => onChange({ lastUpdated: event.target.value })}
                  placeholder="e.g. 26 August 2026"
                  className={`${inputClass} min-w-[200px] flex-1`}
                  aria-label="Last updated text"
                />
              </div>
              <p className="mt-1 text-bhor-caption text-bhor-text-muted">
                {isUnsetDate(value.lastUpdated ?? "")
                  ? "Not set — the line is hidden from customers until you set a date."
                  : "Pick a date to fill this in, or type it yourself. Leave it empty to hide the line."}
              </p>
            </Field>
          ) : null}

          <p className="text-bhor-caption text-bhor-text-muted">
            Use <code>### 1.1 Heading</code> for a numbered sub-heading, <code>-</code> for bullets,
            <code> 1.</code> for numbered lists and <code>**bold**</code> for emphasis. Sub-heading
            numbers become anchors, so <code>### 1.3</code> can be linked as
            <code> /policies#s-1-3</code>.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={!dirty || saving}
              className="min-h-10 rounded-bhor-sm bg-bhor-primary px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save & publish"}
            </button>
            <span className="text-bhor-caption text-bhor-text-muted">
              Last edited {new Date(updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              {updatedBy ? " by an admin" : ""}
            </span>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
