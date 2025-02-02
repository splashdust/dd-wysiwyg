import { html } from "@sebgroup/green-core/scoping";
import { LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { edDocument } from "../app";
import { elementFactory } from "../editor-elements/factory";

import { GdsTextarea } from "@sebgroup/green-core/components";
import "@sebgroup/green-core/components/icon/icons/circle-x.js";
import "@sebgroup/green-core/components/icon/icons/circle-info.js";

@customElement("ai-generate")
export class AiGenerate extends LitElement {
  @state() private _loading = false;
  @state() private _showAI = false;
  @state() private _errorMessage = "";
  @state() private _systemMessage = "";

  @query("#generate")
  private _elGenerateTextarea!: GdsTextarea;

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
    return html`<gds-flex
        flex-direction="column"
        align-items="center"
        padding="m"
      >
        ${when(
          this._loading,
          () =>
            html`<sl-spinner
              style="font-size: 3rem; --indicator-color: #333; --track-color: #bbb;--track-width: 10px;"
            ></sl-spinner>`,
        )}
        ${when(
          this._errorMessage.length > 0,
          () =>
            html`<gds-card
              variant="negative"
              display="flex"
              border="4xs"
              padding="s"
              style="align-items:center;gap:.5rem"
              ><gds-icon-circle-x></gds-icon-circle-x> ${this
                ._errorMessage}</gds-card
            >`,
        )}
        ${when(
          !this._loading && this._systemMessage.length > 0,
          () =>
            html`<gds-card
              variant="notice"
              display="flex"
              border="4xs"
              padding="s"
              style="gap:.5rem;flex-direction:column"
              min-width="400px"
            >
              <gds-flex align-items="center" gap="xs">
                <gds-icon-circle-info></gds-icon-circle-info>
                <gds-text font-weight="medium" max-width="80ch"
                  >System message</gds-text
                >
              </gds-flex>
              ${this._systemMessage}
            </gds-card>`,
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
                id="generate"
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

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const message = formData.get("generate");
    const currentDocument = edDocument.root.get().serialize();
    form.reset();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ message, currentDocument }),
      });

      const responseJson = await response.json();

      this._loading = false;

      const json = JSON.parse(responseJson.reply.content);

      edDocument.root.set(elementFactory(json.root));
      this._systemMessage = json.systemMessage;
    } catch (e) {
      console.error(e);
      this._errorMessage =
        "Failed to generate layout, please try submitting your query again.";
      this._systemMessage = "";
      this._elGenerateTextarea.value = message as string;
      this._loading = false;
    }
  };
}
