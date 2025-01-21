import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import OpenAI from "openai";

const app = new Hono();
const openai = new OpenAI();

// const schema = {
//   name: "dynamic_ui",
//   schema: {
//     type: "object",
//     properties: {
//       tag: {
//         type: "string",
//         description: "The type of the UI component.",
//       },
//       attributes: {
//         type: "object",
//         description: "Attributes specific to the UI component.",
//         properties: {
//           padding: {
//             type: "string",
//             description: "Padding value for the component.",
//           },
//           gap: {
//             type: "string",
//             description: "Gap value for children components.",
//           },
//           "flex-direction": {
//             type: "string",
//             description: "Direction of flex items.",
//           },
//           variant: {
//             type: "string",
//             description: "Variant style for card components.",
//           },
//           "border-color": {
//             type: "string",
//             description: "Border color for card components.",
//           },
//           shadow: {
//             type: "string",
//             description: "Shadow property for card components.",
//           },
//           label: {
//             type: "string",
//             description: "Label for input components.",
//           },
//           color: {
//             type: "string",
//             description: "Color property for divider components.",
//           },
//           rank: {
//             type: "string",
//             description: "Rank of the button.",
//           },
//         },
//         required: [],
//         additionalProperties: false,
//       },
//       children: {
//         type: "array",
//         description: "Nested UI components.",
//         items: {
//           $ref: "#",
//         },
//       },
//       text: {
//         type: "string",
//         description: "Text content of the component.",
//       },
//     },
//     required: ["tag", "attributes", "children", "text"],
//     additionalProperties: false,
//   },
//   strict: true,
// };

app.post("/api/generate", async (c) => {
  const body = await c.req.json();
  console.log(body);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a an advanced AI layout generator. Here is an example of a layout you can generate: {"tag":"gds-flex","attributes":{"padding":"m","gap":"m","flex-direction":"column"},"children":[{"tag":"gds-card","attributes":{"variant":"secondary","border-color":"secondary","padding":"m","shadow":"xl"},"children":[{"tag":"gds-flex","attributes":{"gap":"m","flex-direction":"column"},"children":[{"tag":"gds-text","attributes":{"padding":"m","tag":"h1","contentEditable":"true"},"text":"Form heading","children":[]},{"tag":"gds-divider","attributes":{"color":"primary"},"children":[]},{"tag":"gds-segmented-control","attributes":{},"children":[{"tag":"gds-segment","attributes":{},"text":"Segment 1","children":[]},{"tag":"gds-segment","attributes":{},"text":"Segment 2","children":[]},{"tag":"gds-segment","attributes":{},"text":"Segment 3","children":[]}]},{"tag":"gds-divider","attributes":{"color":"primary"},"children":[]},{"tag":"gds-flex","attributes":{"gap":"m","flex-direction":"row"},"children":[{"tag":"gds-input","attributes":{"label":"Label"},"children":[]}]},{"tag":"gds-flex","attributes":{"gap":"m","flex-direction":"row"},"children":[{"tag":"gds-input","attributes":{"label":"Label"},"children":[]},{"tag":"gds-input","attributes":{"label":"Label"},"children":[]}]},{"tag":"gds-input","attributes":{"label":"Label"},"children":[]},{"tag":"gds-divider","attributes":{"color":"primary"},"children":[]},{"tag":"gds-flex","attributes":{"gap":"m","flex-direction":"row"},"children":[{"tag":"gds-button","attributes":{},"text":"Button","children":[]},{"tag":"gds-button","attributes":{"rank":"secondary"},"text":"Button","children":[]}]}]}]}]}

        Reply only in JSON format, without template strings or any other code.`,
      },
      {
        role: "user",
        content: body.message,
      },
    ],
    store: true,
  });

  return c.json({ reply: completion.choices[0].message });
});

app.use("/*", serveStatic({ root: "dist/" }));

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`); // Listening on http://localhost:3000
});
