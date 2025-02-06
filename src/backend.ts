import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import OpenAI from "openai";

const app = new Hono();
const openai = new OpenAI();

const schema = {
  name: "dynamic_ui",
  schema: {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Dynamic UI Schema",
    type: "object",
    properties: {
      tag: {
        type: "string",
        description: "The type of the UI component.",
      },
      attributes: {
        type: "object",
        description: "Attributes specific to the UI component.",
      },
      children: {
        type: "array",
        description: "Nested UI components.",
        items: { $ref: "#" },
      },
      text: {
        type: ["string", "null"],
        description: "Text content of the component.",
      },
    },
    required: ["tag", "children", "text"],
    additionalProperties: false,
    dependencies: {
      tag: {
        oneOf: [
          {
            properties: {
              tag: { const: "gds-flex" },
              attributes: { $ref: "#/definitions/flexAttributes" },
            },
          },
          {
            properties: {
              tag: { const: "gds-grid" },
              attributes: { $ref: "#/definitions/gridAttributes" },
            },
          },
          {
            properties: {
              tag: { const: "gds-button" },
              attributes: { $ref: "#/definitions/buttonAttributes" },
            },
          },
          {
            properties: {
              tag: { const: "gds-card" },
              attributes: { $ref: "#/definitions/cardAttributes" },
            },
          },
          {
            properties: {
              tag: { const: "gds-input" },
              attributes: { $ref: "#/definitions/inputAttributes" },
            },
          },
          {
            properties: {
              tag: { const: "gds-divider" },
              attributes: { $ref: "#/definitions/dividerAttributes" },
            },
          },
          {
            properties: {
              tag: { const: "gds-text" },
              attributes: { $ref: "#/definitions/textAttributes" },
            },
          },
          {
            properties: {
              tag: { const: "gds-rich-text" },
              attributes: { $ref: "#/definitions/richTextAttributes" },
            },
          },
          {
            properties: {
              tag: { const: "gds-badge" },
              attributes: { $ref: "#/definitions/badgeAttributes" },
            },
          },
          {
            properties: {
              tag: { const: "gds-segmented-control" },
              attributes: { $ref: "#/definitions/segmentedControlAttributes" },
              children: {
                type: "array",
                description:
                  "gds-segmented-control can only have gds-segment children.",
                items: {
                  type: "object",
                  properties: {
                    tag: {
                      type: "string",
                      enum: ["gds-segment"],
                    },
                  },
                  required: ["tag"],
                  additionalProperties: true,
                },
              },
            },
          },
          {
            properties: {
              tag: { const: "gds-segment" },
              attributes: { $ref: "#/definitions/segmentAttributes" },
            },
          },
        ],
      },
    },
    definitions: {
      tokenValues: {
        type: "string",
        enum: [
          "4xs",
          "3xs",
          "2xs",
          "xs",
          "s",
          "m",
          "l",
          "xl",
          "2xl",
          "3xl",
          "4xl",
          "5xl",
          "6xl",
          "null",
        ],
        description: "Allowed token values for spacing and sizing.",
      },
      colorValues: {
        type: "string",
        enum: [
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
          "null",
        ],
        description: "Allowed token values for colors.",
      },
      buttonRanks: {
        type: "string",
        enum: ["primary", "secondary", "tertiary"],
        description: "Allowed ranks values for buttons.",
      },
      buttonVariants: {
        type: "string",
        enum: ["neutral", "positive", "negative", "null"],
        description: "Allowed ranks values for buttons.",
      },
      commonAttributes: {
        type: "object",
        description: "Attributes common to all UI components.",
        properties: {},
        additionalProperties: false,
      },
      flexAttributes: {
        type: "object",
        description: "Attributes common to flex containers.",
        properties: {
          padding: {
            $ref: "#/definitions/tokenValues",
          },
          margin: {
            $ref: "#/definitions/tokenValues",
          },
          gap: {
            $ref: "#/definitions/tokenValues",
          },
          "flex-direction": {
            enum: ["row", "column"],
            description: "Direction of flex items.",
          },
        },
        required: ["padding", "margin", "gap", "flex-direction"],
        additionalProperties: false,
      },
      gridAttributes: {
        type: "object",
        description: "Attributes common to flex containers.",
        properties: {
          padding: {
            $ref: "#/definitions/tokenValues",
          },
          margin: {
            $ref: "#/definitions/tokenValues",
          },
          gap: {
            $ref: "#/definitions/tokenValues",
          },
          columns: {
            type: "integer",
            description: "Number of columns in the grid.",
          },
        },
        required: ["padding", "margin", "gap", "columns"],
        additionalProperties: false,
      },
      buttonAttributes: {
        type: "object",
        description: "Attributes specific to button components.",
        properties: {
          rank: {
            $ref: "#/definitions/buttonRanks",
          },
          variant: {
            $ref: "#/definitions/buttonVariants",
          },
        },
        required: ["rank", "variant"],
        additionalProperties: false,
      },
      cardAttributes: {
        type: "object",
        description: "Attributes specific to card components.",
        properties: {
          variant: {
            $ref: "#/definitions/colorValues",
          },
          "border-color": {
            $ref: "#/definitions/colorValues",
          },
          shadow: {
            $ref: "#/definitions/tokenValues",
          },
        },
        required: ["variant", "border-color", "shadow"],
        additionalProperties: false,
      },
      inputAttributes: {
        type: "object",
        description: "Attributes specific to input components.",
        properties: {
          label: { type: "string", description: "Label for input components." },
        },
        required: ["label"],
        additionalProperties: false,
      },
      dividerAttributes: {
        type: "object",
        description: "Attributes specific to divider components.",
        properties: {
          color: {
            $ref: "#/definitions/colorValues",
          },
        },
        required: ["color"],
        additionalProperties: false,
      },
      textAttributes: {
        type: "object",
        description: "Attributes specific to text components.",
        properties: {
          tag: {
            enum: ["h1", "h2", "h3", "h4", "h5", "h6", "p"],
            description: "Create a heading or paragraph.",
          },
        },
        required: ["tag"],
        additionalProperties: false,
      },
      richTextAttributes: {
        type: "object",
        description:
          "Attributes specific to rich-text components. Rich text accepts Markdown content in the text property.",
        properties: {},
        required: [],
        additionalProperties: false,
      },
      badgeAttributes: {
        type: "object",
        description: "Attributes specific to text components.",
        properties: {
          variant: {
            $ref: "#/definitions/colorValues",
          },
        },
        required: ["variant"],
        additionalProperties: false,
      },
      segmentedControlAttributes: {
        type: "object",
        description: "Attributes specific to segmented control components.",
        properties: {
          value: {
            type: ["string", "null"],
            description: "The value of the selected segment.",
          },
        },
        required: ["value"],
        additionalProperties: false,
      },
      segmentAttributes: {
        type: "object",
        description: "Attributes specific to text components.",
        properties: {
          value: {
            type: "string",
            description: "The value of the segment.",
          },
        },
        required: ["value"],
        additionalProperties: false,
      },
    },
  },
  strict: true,
};

app.post("/api/generate", async (c) => {
  const body = await c.req.json();
  console.log(body);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: `You are a an advanced AI layout generator. Layouts are defined in a JSON format defined by the supplied schema. Assume layouts follows the same logic as HTML/CSS, unless otherwise constrained by the schema. When using cards, prefer to wrap the inner content in a flex container. Generate an optimal layout based on the user input.`,
      },
      {
        role: "user",
        content: body.message,
      },
    ],
    response_format: { type: "json_schema", json_schema: schema },
    store: true,
  });

  return c.json({ reply: completion.choices[0].message });
});

app.use("/*", serveStatic({ root: "dist/" }));

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`); // Listening on http://localhost:3000
});
