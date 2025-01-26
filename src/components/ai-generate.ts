import { html } from "@sebgroup/green-core/scoping";
import { LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { edDocument } from "../app";
import { elementFactory } from "../ed-element";

@customElement("ai-generate")
export class AiGenerate extends LitElement {
  @state() private _loading = false;
  @state() private _showAI = false;

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      // if command slash
      // toggle ai
      if (e.metaKey && e.key === "/") {
        this._showAI = !this._showAI;
      }
    });
  }

  render() {
    return html` ${when(
      this._loading,
      () =>
        html`<sl-spinner
          style="margin-left:auto; margin-right:auto; margin-bottom: 1rem; font-size: 3rem; --indicator-color: #333; --track-color: #bbb;--track-width: 10px;"
        ></sl-spinner>`,
    )}
    ${when(
      this._showAI,
      () =>
        html`<gds-flex flex="0 1 100px" border="4xs 0 0 0" padding="m">
          <form
            style="width: 100%"
            @submit=${async (e: SubmitEvent) => {
              e.preventDefault();
              this._loading = true;
              const form = new FormData(e.target as HTMLFormElement);
              const response = await fetch("/api/generate", {
                method: "POST",
                body: JSON.stringify({ message: form.get("generate") }),
              });
              const responseJson = await response.json();
              this._loading = false;
              try {
                const json = JSON.parse(responseJson.reply.content);
                edDocument.root = elementFactory(json);
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <gds-textarea
              label="Generate"
              name="generate"
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  (e.target as any).form.requestSubmit();
                }
              }}
            ></gds-textarea>
          </form>
        </gds-flex>`,
    )}`;
  }
}
