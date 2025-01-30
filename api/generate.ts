import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
//import { schema } from "./schema.ts";

const openai = new OpenAI();

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const body = JSON.parse(request.body);
  console.log(body);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "system",
        content: `
          You are a an advanced AI layout generator capable of generating layouts defined as JSON. The JSON format follows the supplied schema. Assume the layout system follows the same logic as HTML/CSS, unless otherwise constrained by the schema.

          Here are some Design System guidelines to follow:
          - When using cards, wrap the inner content in a flex container. Don't add other children directly to the card.
          - Don't use cards with only a heading inside.
          - Forms should have at least one primary button. Reset buttons should be tertiary. Only use neutral variants unless otherwise specified.
          - Text should be wrapped in a text component, or a rich-text component if it contains Markdown.
          - Only capitalize the first letter of any text. This applies to headings, buttons and other components, including markdown.
          - If the user requests a box, they typically mean a card.

          Follow the above instructions, try your best to generate an optimal layout based on the users request.`,
      },
      {
        role: "user",
        content: body.message,
      },
    ],
    response_format: zodResponseFormat(schema, "green-schema"),
    store: true,
  });

  return response.status(200).json({ reply: completion.choices[0].message });
}

// Common token values
const tokenValues = z.enum([
  "4xs",
  "3xs",
  "2xs",
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "2xl",
]);

const colorValues = z.enum([
  "primary",
  "secondary",
  "tertiary",
  "positive",
  "negative",
  "notice",
  "warning",
  "information",
  "copper-01",
  "copper-02",
  "purple-01",
  "purple-02",
  "green-01",
  "green-02",
  "blue-01",
  "blue-02",
]);

const ButtonAttributes = z
  .object({
    rank: z.enum(["primary", "secondary", "tertiary"]),
    variant: z.enum(["neutral", "positive", "negative"]),
    size: z.enum(["xs", "small", "medium", "large"]),
  })
  .strict();

const FlexAttributes = z
  .object({
    gap: tokenValues,
    "flex-direction": z.enum(["row", "column"]),
  })
  .strict();

const GridAttributes = z
  .object({
    gap: tokenValues,
    columns: z.number().int(),
  })
  .strict();

const CardAttributes = z
  .object({
    variant: colorValues,
    border: z.enum(["", "4xs"]),
    shadow: tokenValues,
  })
  .describe(
    "Only secondary cards should use a border, unless otherwise specified.",
  )
  .strict();

const InputAttributesz = z
  .object({
    label: z.string(),
  })
  .strict();

const DividerAttributes = z
  .object({
    color: colorValues,
  })
  .strict();

const TextAttributes = z
  .object({
    tag: z.enum(["h1", "h2", "h3", "h4", "h5", "h6", "p"]),
  })
  .strict();

const RichTextAttributes = z
  .object({})
  .describe(
    "Attributes specific to rich-text components. Rich text accepts Markdown content in the text property.",
  )
  .strict();

const BadgeAttributes = z
  .object({
    variant: colorValues,
  })
  .strict();

const SegmentedControlAttributes = z
  .object({
    value: z.string(),
  })
  .strict();

const SegmentAtributes = z
  .object({
    value: z.string(),
  })
  .strict();

const Segment = z.lazy(() =>
  z.object({
    tag: z.literal("gds-segment"),
    text: z.string().nullable().optional(),
    attributes: SegmentAtributes,
  }),
);

const ValidComponents: z.ZodType<any> = z.lazy(() =>
  z.discriminatedUnion("tag", [
    z.object({
      tag: z.literal("gds-flex"),
      attributes: FlexAttributes,
      children: z.array(ValidComponents).optional(),
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-grid"),
      attributes: GridAttributes,
      children: z.array(ValidComponents).optional(),
    }),
    z.object({
      tag: z.literal("gds-card"),
      attributes: CardAttributes,
      children: z.array(ValidComponents).optional(),
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-button"),
      attributes: ButtonAttributes,
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-input"),
      attributes: InputAttributesz,
    }),
    z.object({
      tag: z.literal("gds-divider"),
      attributes: DividerAttributes,
    }),
    z.object({
      tag: z.literal("gds-text"),
      attributes: TextAttributes,
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-rich-text"),
      attributes: RichTextAttributes,
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-badge"),
      attributes: BadgeAttributes,
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-segmented-control"),
      attributes: SegmentedControlAttributes,
      children: z.array(Segment).optional(),
    }),
  ]),
);

const Schema = z.object({
  root: ValidComponents,
});

export const schema = Schema;
