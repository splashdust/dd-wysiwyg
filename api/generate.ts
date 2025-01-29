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

// Allowed tag names
const allowedTags = z.enum([
  "gds-flex",
  "gds-grid",
  "gds-button",
  "gds-card",
  "gds-input",
  "gds-divider",
  "gds-text",
  "gds-rich-text",
  "gds-badge",
  "gds-segmented-control",
  "gds-segment",
]);

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
]);

const ButtonAtributes = z
  .object({
    rank: z.enum(["primary", "secondary", "tertiary"]),
    variant: z.enum(["neutral", "positive", "negative"]),
  })
  .strict();

const FlexAtributes = z
  .object({
    gap: tokenValues,
    "flex-direction": z.enum(["row", "column"]),
  })
  .strict();

const GridAtributes = z
  .object({
    gap: tokenValues,
    columns: z.number().int(),
  })
  .strict();

const CardAtributes = z
  .object({
    variant: colorValues,
    border: z.enum(["", "4xs"]),
    shadow: tokenValues,
  })
  .describe(
    "Only secondary cards should use a border, unless otherwise specified.",
  )
  .strict();

const InputAtributesz = z
  .object({
    label: z.string(),
  })
  .strict();

const DividerAtributes = z
  .object({
    color: colorValues,
  })
  .strict();

const TextAtributes = z
  .object({
    tag: z.enum(["h1", "h2", "h3", "h4", "h5", "h6", "p"]),
  })
  .strict();

const RichTextAtributes = z
  .object({})
  .describe(
    "Attributes specific to rich-text components. Rich text accepts Markdown content in the text property.",
  )
  .strict();

const BadgeAtributes = z
  .object({
    variant: colorValues,
  })
  .strict();

const SegmentedControlAtributes = z
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
      attributes: FlexAtributes,
      children: z.array(ValidComponents).optional(),
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-grid"),
      attributes: GridAtributes,
      children: z.array(ValidComponents).optional(),
    }),
    z.object({
      tag: z.literal("gds-card"),
      attributes: CardAtributes,
      children: z.array(ValidComponents).optional(),
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-button"),
      attributes: ButtonAtributes,
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-input"),
      attributes: InputAtributesz,
    }),
    z.object({
      tag: z.literal("gds-divider"),
      attributes: DividerAtributes,
    }),
    z.object({
      tag: z.literal("gds-text"),
      attributes: TextAtributes,
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-rich-text"),
      attributes: RichTextAtributes,
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-badge"),
      attributes: BadgeAtributes,
      text: z.string().nullable().optional(),
    }),
    z.object({
      tag: z.literal("gds-segmented-control"),
      attributes: SegmentedControlAtributes,
      children: z.array(Segment).optional(),
    }),
  ]),
);

const Schema = z.object({
  root: ValidComponents,
});

export const schema = Schema;
