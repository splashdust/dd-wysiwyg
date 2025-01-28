import { html } from "@sebgroup/green-core/scoping";
import { edDocument } from "../app";
import { EdElement, EdElementData } from "./ed-element";
import { marked } from "marked";

export class EdRichTextElement extends EdElement {
  constructor(data: Partial<EdElementData>) {
    super({ ...data, tag: "gds-rich-text" });
  }

  render() {
    const el = super.render();
    if (this.text) {
      requestAnimationFrame(
        () => (el.innerHTML = marked.parse(this.text as string) as string),
      );
    }
    return el;
  }

  renderPropertyPanel() {
    return html`
        <gds-textarea
            label="Content (Markdown)"
            value=${this.text}
            @input=${(e: InputEvent) => {
              this.text = (e.target as any)?.value || "";
              edDocument.mutationMeta.storeHistory = true;
            }}
        /></gds-textarea>`;
  }
}
