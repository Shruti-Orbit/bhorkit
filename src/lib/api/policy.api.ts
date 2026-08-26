import { apiGet } from "@/src/lib/api/client";

/**
 * The policies are served by the API as a parsed block tree, not as HTML or
 * Markdown.
 *
 * That is deliberate: the storefront renders these blocks as text nodes, so
 * there is no path from stored content to executable markup even though the
 * content is editable from the admin panel.
 */

export type PolicyInline = { text: string; bold: boolean };

export type PolicyBlock =
  | { kind: "paragraph"; content: PolicyInline[] }
  | { kind: "bullets"; items: PolicyInline[][] }
  | { kind: "numbers"; items: PolicyInline[][] }
  | { kind: "table"; head: PolicyInline[][]; rows: PolicyInline[][][] };

export type PolicySubsection = {
  id: string;
  number: string | null;
  title: string;
  blocks: PolicyBlock[];
};

export type PolicySection = {
  /** Stable anchor — this is what the footer links to. */
  id: string;
  navLabel: string;
  title: string;
  intro: PolicyBlock[];
  subsections: PolicySubsection[];
};

export type Policies = {
  title: string;
  preamble: PolicyBlock[];
  sections: PolicySection[];
  lastUpdated: string;
  updatedAt: string;
};

export async function getPolicies(): Promise<Policies> {
  const response = await apiGet<Policies>("/policies");
  return response.data;
}
