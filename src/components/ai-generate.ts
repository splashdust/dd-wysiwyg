import { html } from "@sebgroup/green-core/scoping";
import { LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { edDocument } from "../app";
import { elementFactory } from "../editor-elements/factory";

@customElement("ai-generate")
export class AiGenerate extends LitElement {
  @state() private _loading = false;
  @state() private _showAI = false;

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      // if command slash
      // toggle ai
      if (e.metaKey && e.key === ".") {
        e.preventDefault();
        this._showAI = !this._showAI;
      }
    });
  }

  render() {
    return html`<gds-flex>
        ${when(
          this._loading,
          () =>
            html`<sl-spinner
              style="margin-left:auto; margin-right:auto; margin-bottom: 1rem; font-size: 3rem; --indicator-color: #333; --track-color: #bbb;--track-width: 10px;"
            ></sl-spinner>`,
        )}
      </gds-flex>
      ${when(
        this._showAI,
        () =>
          html`<gds-flex
            flex="0 1 100px"
            border="4xs 0 0 0"
            border-color="primary"
            padding="m"
            background="primary"
          >
            <form style="width: 100%" @submit=${this.#submit}>
              <gds-textarea
                label="Generate"
                supporting-text="Be clear and concise and describe the desired outcome"
                name="generate"
                @keydown=${this.#handleKeyDown}
              >
                <span slot="extended-supporting-text">
                  For example:<br />
                  "Create a login page consisting of two cards next to each
                  other. The card on the left contains instructions, and the one
                  on the right the form."
                </span>
              </gds-textarea>
            </form>
          </gds-flex>`,
      )}`;
  }

  #handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.target as any).form.requestSubmit();
    }
  };

  #submit = async (e: SubmitEvent) => {
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
      edDocument.root = elementFactory(json.root);
    } catch (e) {
      console.error(e);
    }
  };
}
