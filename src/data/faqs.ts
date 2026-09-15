import { WHATSAPP_HREF } from "@/src/components/layout/SocialLinks";
import { seoConfig } from "@/src/lib/seo/config";

/**
 * The FAQ page's questions and answers.
 *
 * Copy only, held here rather than inline in the page so the wording is one
 * list to read and edit, and so the page and its FAQPage structured data are
 * generated from the same source — a question answered one way on screen and
 * another way to Google is the failure mode this avoids.
 *
 * Answers are a small block tree, not a string of markup. Nothing here is ever
 * interpreted as HTML: every value becomes a text node or an anchor with a
 * href from this file, the same guarantee the policy content carries (see
 * src/components/policies/PolicyBlocks.tsx).
 */

export type FaqInline = {
  text: string;
  /** Renders the text as a link. Contact details are reachable, not just readable. */
  href?: string;
};

export type FaqBlock =
  | { kind: "paragraph"; content: FaqInline[] }
  /** Short standalone lines — the contact details — set tighter than paragraphs. */
  | { kind: "lines"; items: FaqInline[][] };

export type FaqItem = {
  /** Stable anchor, so a single question can be linked to directly. */
  id: string;
  question: string;
  answer: FaqBlock[];
};

/** Shorthand for the common case: one paragraph of plain text. */
function p(text: string): FaqBlock[] {
  return [{ kind: "paragraph", content: [{ text }] }];
}

export const faqs: FaqItem[] = [
  {
    id: "what-is-bhorkit",
    question: "What is BhorKit?",
    answer: p(
      "BhorKit is a puja essentials brand that brings carefully selected puja materials together in convenient, thoughtfully curated kits, making puja preparation simple and hassle-free.",
    ),
  },
  {
    id: "what-does-bhorkit-offer",
    question: "What does BhorKit offer?",
    answer: p(
      "BhorKit offers ready-to-use puja kits containing essential materials needed for different puja occasions and celebrations.",
    ),
  },
  {
    id: "only-for-ganesh-puja",
    question: "Is BhorKit only for Ganesh Puja?",
    answer: p(
      "No. BhorKit is not limited to Ganesh Puja. Our kits are designed for different puja occasions and celebrations.",
    ),
  },
  {
    id: "what-is-included",
    question: "What is included in a BhorKit?",
    answer: p(
      "Each BhorKit contains a curated collection of essential puja materials. The exact contents depend on the particular kit and are clearly mentioned on its product page.",
    ),
  },
  {
    id: "why-a-kit-instead-of-separate-items",
    question: "Why should I choose BhorKit instead of buying puja items separately?",
    answer: p(
      "BhorKit brings essential puja materials together in one convenient kit, helping you avoid multiple shopping trips, long checklists, and the hassle of finding small items individually.",
    ),
  },
  {
    id: "where-available",
    question: "Where is BhorKit currently available?",
    answer: p(
      "BhorKit is currently available for customers in Patna, Bihar, with doorstep delivery within our current service area.",
    ),
  },
  {
    id: "buy-puja-kit-in-patna-online",
    question: "Can I buy a Puja Kit in Patna online?",
    answer: p(
      "Yes. You can buy a Puja Kit in Patna online through BhorKit. Select the kit suitable for your puja occasion and place your order directly through our website.",
    ),
  },
  {
    id: "buy-puja-kit-online-in-patna",
    question: "Can I buy a Puja Kit online in Patna?",
    answer: p(
      "Yes. BhorKit makes it convenient to buy a Puja Kit online in Patna, bringing commonly required puja essentials together in one place.",
    ),
  },
  {
    id: "puja-kit-delivery-in-patna",
    question: "Does BhorKit provide Puja Kit delivery in Patna?",
    answer: p(
      "Yes. BhorKit provides convenient Puja Kit delivery in Patna within our current service area. Delivery availability is confirmed during the ordering process.",
    ),
  },
  {
    id: "where-to-buy-puja-samagri-in-patna",
    question: "Where can I buy Puja Samagri in Patna?",
    answer: p(
      "You can buy Puja Samagri in Patna through BhorKit. Our curated kits bring commonly required puja materials together, making preparation easier.",
    ),
  },
  {
    id: "buy-puja-samagri-online-in-patna",
    question: "Can I buy Puja Samagri online in Patna?",
    answer: p(
      "Yes. You can buy Puja Samagri online in Patna through BhorKit and have your selected puja essentials conveniently delivered to your doorstep.",
    ),
  },
  {
    id: "puja-essentials-in-patna",
    question: "What Puja Essentials are available in Patna?",
    answer: p(
      "BhorKit offers curated Puja Essentials in Patna depending on the occasion and kit. The exact contents of each kit are listed on its respective product page.",
    ),
  },
  {
    id: "order-puja-essentials-online-in-patna",
    question: "Can I order Puja Essentials online in Patna?",
    answer: p(
      "Yes. You can order Puja Essentials online in Patna through the BhorKit website and choose a kit designed for your particular puja occasion.",
    ),
  },
  {
    id: "where-to-buy-puja-items-in-patna",
    question: "Where can I buy Puja Items in Patna?",
    answer: p(
      "BhorKit provides a convenient online destination for Puja Items in Patna, helping you find essential materials without having to shop from multiple places.",
    ),
  },
  {
    id: "buy-puja-items-online-in-patna",
    question: "Can I buy Puja Items online in Patna?",
    answer: p(
      "Yes. You can buy Puja Items online in Patna through BhorKit and order the essentials required for your puja preparation.",
    ),
  },
  {
    id: "complete-puja-kit-in-patna",
    question: "Does BhorKit offer a Complete Puja Kit in Patna?",
    answer: p(
      "Yes. BhorKit offers curated Complete Puja Kits in Patna, designed to bring together the essential materials required for specific puja occasions.",
    ),
  },
  {
    id: "complete-pooja-samagri-online",
    question: "Can I buy complete Pooja Samagri online?",
    answer: p(
      "Yes. You can buy complete Pooja Samagri online through BhorKit. Each kit is curated according to the requirements of the particular puja occasion.",
    ),
  },
  {
    id: "hindu-puja-kits-in-patna",
    question: "Does BhorKit offer Hindu Puja Kits in Patna?",
    answer: p(
      "Yes. BhorKit offers curated kits containing traditional puja materials and essentials used for Hindu puja rituals, depending on the specific occasion.",
    ),
  },
  {
    id: "order-puja-products-online-in-patna",
    question: "Can I order Puja Products online in Patna?",
    answer: p(
      "Yes. You can explore and order Puja Products online in Patna through the BhorKit website, including curated puja kits and essential ritual materials.",
    ),
  },
  {
    id: "why-pre-orders",
    question: "Why does BhorKit offer pre-orders?",
    answer: p(
      "Pre-orders allow BhorKit to plan, prepare, and pack your puja kit closer to the occasion while ensuring that the required essentials are ready for your celebration.",
    ),
  },
  {
    id: "pre-order-delivery-time",
    question: "When will my pre-ordered BhorKit be delivered?",
    answer: p(
      "Your kit will be prepared according to the relevant puja schedule and delivered within the applicable delivery timeline shown during the ordering process.",
    ),
  },
  {
    id: "how-to-place-an-order",
    question: "How do I place an order on BhorKit?",
    answer: p(
      "Select the puja kit you want, add it to your cart, and complete the checkout process with your delivery and payment details.",
    ),
  },
  {
    id: "payment-methods",
    question: "What payment methods are available?",
    answer: p(
      "Available payment methods are displayed during checkout and may vary depending on your order and current payment options.",
    ),
  },
  {
    id: "track-my-order",
    question: "How can I track my BhorKit order?",
    answer: p(
      "Once your order is processed and shipped, you will receive the relevant order or delivery information through the contact details provided during checkout.",
    ),
  },
  {
    id: "kit-for-any-puja",
    question: "Can I order a BhorKit for any puja?",
    answer: p(
      "You can choose a BhorKit designed for the particular puja occasion you are preparing for. Each product page provides details about what that specific kit contains.",
    ),
  },
  {
    id: "ready-to-use",
    question: "Are the items in the kit ready to use?",
    answer: p(
      "The kits contain carefully prepared puja essentials. Items that require preparation or specific use will follow the instructions or information provided with the respective kit.",
    ),
  },
  {
    id: "customise-a-kit",
    question: "Can I add or remove individual items from a BhorKit?",
    answer: [
      {
        kind: "paragraph",
        content: [
          {
            text: "Yes. Customization is available for BhorKit kits. If you want to add, remove, or modify specific items, please contact us before placing your order. You can reach us through WhatsApp, Instagram DM, or email, and our team will help you with the customization based on your requirements.",
          },
        ],
      },
      {
        kind: "lines",
        items: [
          [
            { text: "📱 WhatsApp: " },
            { text: "9296914463", href: WHATSAPP_HREF },
          ],
          [
            { text: "📧 Email: " },
            { text: "bhorkit@gmail.com", href: "mailto:bhorkit@gmail.com" },
          ],
          [
            { text: "📸 Instagram: DM us at " },
            { text: "@bhor.kit", href: seoConfig.socialLinks.instagram },
          ],
        ],
      },
    ],
  },
  {
    id: "already-have-items",
    question: "What if I already have some puja items at home?",
    answer: p(
      "That's completely fine. You can use the items from your BhorKit along with any additional items you already have according to your family's puja traditions and requirements.",
    ),
  },
  {
    id: "first-time-puja",
    question: "Is BhorKit suitable for first-time puja preparation?",
    answer: p(
      "Yes. BhorKit is designed to make the preparation process more organized and convenient, making it useful for both experienced and first-time puja organizers.",
    ),
  },
  {
    id: "buy-as-a-gift",
    question: "Can I buy BhorKit as a gift?",
    answer: p(
      "Yes. A thoughtfully curated puja kit can also be a meaningful and practical gift for family and friends.",
    ),
  },
  {
    id: "damaged-or-incorrect",
    question: "What if I receive a damaged or incorrect item?",
    answer: p(
      "If there is an issue with your order, contact BhorKit with your order details and supporting photographs as soon as possible so the issue can be reviewed and resolved according to the applicable policy.",
    ),
  },
  {
    id: "why-simplify-puja-prep",
    question: "Why does BhorKit focus on making puja preparation easier?",
    answer: p(
      "Puja is about devotion and togetherness, but preparing for it can involve searching for many small items. BhorKit aims to simplify that preparation by bringing essential puja materials together in one convenient kit.",
    ),
  },
];

/**
 * The statement the page closes on. It sits outside the question list because
 * it answers nothing — it is the idea the list has been circling.
 */
export const faqClosing = {
  statement: "Puja preparation should feel meaningful, not stressful.",
  supporting:
    "BhorKit is built around this simple idea — making traditional puja preparation more convenient, organized, and thoughtful.",
};

/**
 * An answer flattened to plain text, for the FAQPage structured data.
 *
 * Google wants the answer as one string; deriving it from the same blocks the
 * page renders is what keeps the two from drifting apart.
 */
export function faqAnswerText(answer: FaqBlock[]) {
  return answer
    .map((block) =>
      block.kind === "lines"
        ? block.items
          .map((line) => line.map((part) => part.text).join(""))
          .join(" ")
        : block.content.map((part) => part.text).join(""),
    )
    .join(" ");
}
