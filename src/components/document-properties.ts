import { html } from "@sebgroup/green-core/scoping";
import { LitElement, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { SignalWatcher } from "@lit-labs/signals";
import { EdElement } from "../ed-element";
import { GdsTextarea } from "@sebgroup/green-core/components/textarea/index.js";

import "@shoelace-style/shoelace/dist/components/tree/tree.js";
import "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { when } from "lit/directives/when.js";
import { edDocument } from "../app";

@customElement("document-properties")
export class DocumentProperties extends SignalWatcher(LitElement) {
  @state()
  private _selectedElement: EdElement | null = null;

  @query("#attributes")
  private _attributes!: GdsTextarea;

  render() {
    return html`
      <gds-flex
        padding="m"
        flex-direction="column"
        align-items="stretch"
        gap="m"
      >
        <gds-text tag="h3">Document properties</gds-text>
        <gds-divider></gds-divider>
        <sl-tree class="tree-with-lines">
          ${this.#renderPropertyTree(edDocument.root)}
        </sl-tree>
        <gds-divider></gds-divider>
        ${when(
          this._selectedElement !== null,
          () => html`
              Selected: ${this._selectedElement?.tag}
                <gds-input label="Text content" value=${this._selectedElement?.text} @input=${(
                  e: any,
                ) => {
                  this._selectedElement!.text = e.target.value;
                  this.requestUpdate();
                }}></gds-input>
                <gds-textarea
                    label="Attributes"
                    id="attributes"
                    value=${JSON.stringify(this._selectedElement?.attributes)}
                /></gds-textarea>
              <gds-button
                @click=${() => {
                  if (!this._selectedElement) return;
                  const changedAttributes = JSON.parse(
                    this._attributes.value || "{}",
                  );
                  this._selectedElement.attributes = changedAttributes;
                  this.requestUpdate();
                }}
                >Update element</gds-button>

                <gds-button variant="negative" @click=${(e: Event) => {
                  if (!this._selectedElement) return;
                  const index = this._selectedElement.parent?.children.indexOf(
                    this._selectedElement,
                  );
                  if (index !== undefined && index > -1) {
                    this._selectedElement.parent?.children.splice(index, 1);
                    this._selectedElement = null;
                  }
                  this.requestUpdate();
                }}>Delete</gds-button>
            `,
        )}
      </gds-flex>
    `;
  }

  #renderPropertyTree(el: EdElement): TemplateResult {
    return html`<sl-tree-item
      type="folder"
      .expanded=${el.children.length < 4 ? true : false}
      @click=${(e: Event) => {
        if (e.currentTarget !== e.target) return;
        if (this._selectedElement) {
          this._selectedElement.highlighted = false;
        }
        this._selectedElement = el;
        el.highlighted = true;
      }}
    >
      ${el.tag} ${el.children.map((child) => this.#renderPropertyTree(child))}
    </sl-tree-item>`;
  }
}
