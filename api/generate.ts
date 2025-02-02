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
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: `
          You are a an advanced AI layout generator capable of generating layouts defined as JSON, using SEB's Green Design System. The JSON format follows the supplied schema.
          Assume the layout system follows the same logic as HTML/CSS, unless otherwise constrained by the schema.

          Here are some Design System guidelines to follow:
          - When using cards, wrap the inner content in a flex container. Don't add other children directly to the card.
          - Don't use cards with only a heading inside.
          - Forms should have at least one primary button. Reset buttons should be tertiary. Only use neutral variants unless otherwise specified.
          - Text should be wrapped in a text component, or a rich-text component if it contains Markdown.
          - If the user requests a box, they typically mean a card.
          - If you are asked to put a long description for an input field, put it in the extended-supporting-text slot.
          - When asked to add images, use placeholder images from placehold.co, for example https://placehold.co/600x400?text=Placeholder

          Other instructions:
          - Avoid modifying the current document outside of the user's request.
          - If the user asks a question which is not translatable to a layout, you can respond in the systemMessage field and leave the document as is.

          Here is the current state of the document:
          ${JSON.stringify(body.currentDocument)}

          Please follow the instructions and generate an optimal layout based on the users request.

          Do not add any extra whitespace or characters to the JSON output.
          `,
      },
      {
        role: "user",
        content: body.message,
      },
    ],
    response_format: zodResponseFormat(schema, "green-schema"),
    store: true,
  });

  console.log(completion.choices[0].message);

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
    size: z
      .enum(["xs", "small", "medium", "large"])
      .describe("Use medium by default"),
  })
  .strict();

const FlexAttributes = z
  .object({
    gap: tokenValues,
    "flex-direction": z.enum(["row", "column"]),
    "align-items": z
      .enum(["flex-start", "center", "flex-end", "stretch"])
      .describe("'stretch' is default"),
    "justify-content": z.enum([
      "flex-start",
      "center",
      "flex-end",
      "space-between",
      "space-around",
    ]),
    flex: z.string().nullable(),
    width: z.string().describe("Default to 100%"),
  })
  .strict();

const GridAttributes = z
  .object({
    gap: tokenValues,
    columns: z.number().int(),
    flex: z.string().nullable(),
  })
  .strict();

const CardAttributes = z
  .object({
    variant: colorValues,
    border: z
      .enum(["4xs"])
      .nullable()
      .describe("Only use with secondary cards by default"),
    shadow: tokenValues,
    flex: z.string().nullable(),
    width: z
      .string()
      .nullable()
      .describe("Width should only be set if requested. Can use any CSS units"),
  })
  .strict();

const InputAttributes = z
  .object({
    label: z.string(),
    size: z.enum(["small", "large"]).describe("Large is the default size."),
    clearable: z.boolean(),
    type: z.enum(["text", "password", "email", "number"]),
    required: z.boolean(),
    "supporting-text": z.string(),
  })
  .describe(
    "Supporting text can be used if a fields needs additional clarification, but is not mandatory. This text is displayed below the label.",
  )
  .strict();

const ValidInputChildren = z.lazy(() =>
  z.discriminatedUnion("tag", [
    z
      .object({
        tag: z.literal("span"),
        text: z.string(),
        attributes: z
          .object({
            slot: z.enum(["extended-supporting-text"]),
          })
          .strict(),
      })
      .describe(
        "Extended supporting text is a slot that can be used to display a 'more information' fold-out box, in addition to the supporting text.",
      ),
  ]),
);

const DividerAttributes = z
  .object({
    color: colorValues.describe("Default to primary"),
  })
  .strict();

const TextAttributes = z
  .object({
    tag: z.enum(["h1", "h2", "h3", "h4", "h5", "h6", "p"]),
    "text-align": z.enum(["left", "center", "right"]).nullable(),
  })
  .strict();

const RichTextAttributes = z.object({}).strict();

const BadgeAttributes = z
  .object({
    variant: colorValues.describe("Primary by default"),
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

const ImgAttributes = z
  .object({
    src: z.string(),
    alt: z.string(),
  })
  .strict();

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
      attributes: InputAttributes,
      children: z.array(ValidInputChildren).optional(),
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
    z
      .object({
        tag: z.literal("gds-rich-text"),
        attributes: RichTextAttributes,
        text: z.string().nullable().optional(),
      })
      .describe("Rich text accepts Markdown content in the text property."),
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
    z.object({
      tag: z.literal("gds-img"),
      attributes: ImgAttributes,
    }),
  ]),
);

const Schema = z.object({
  systemMessage: z
    .string()
    .describe(
      "A message you can add back to the user, explaining the system's reasoning.",
    ),
  root: ValidComponents,
});

export const schema = Schema;
