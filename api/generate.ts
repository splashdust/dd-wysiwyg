import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { schema } from "./schema.mjs";

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

  return response.status(200).json({ reply: completion.choices[0].message });
}
