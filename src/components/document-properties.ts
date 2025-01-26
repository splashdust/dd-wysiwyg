import { html } from "@sebgroup/green-core/scoping";
import { LitElement, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { SignalWatcher } from "@lit-labs/signals";
import { EdElement } from "../ed-element";
import { GdsTextarea } from "@sebgroup/green-core/components/textarea/index.js";
import { when } from "lit/directives/when.js";
import { edDocument } from "../app";

import "@shoelace-style/shoelace/dist/components/tree/tree.js";
import "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js";
import "@shoelace-style/shoelace/dist/themes/light.css";

import "@sebgroup/green-core/components/icon/icons/trash-can.js";

@customElement("document-properties")
export class DocumentProperties extends SignalWatcher(LitElement) {
  @state()
  private _selectedElement: EdElement | null = null;

  @query("#attributes")
  private _attributes!: GdsTextarea;

  render() {
    return html`
      <gds-flex flex-direction="column" align-items="stretch" gap="m">
        <gds-text tag="h3" padding="s">Document properties</gds-text>
        <gds-divider></gds-divider>
        <div style="max-height: 40vh; overflow: auto">
          <sl-tree class="tree-with-lines">
            ${this.#renderPropertyTree(edDocument.root)}
          </sl-tree>
        </div>
        <gds-divider></gds-divider>
        <gds-flex padding="0 m" flex-direction="column" gap="m">
          ${when(
            this._selectedElement !== null,
            () => html`
              <gds-card padding="s">
                Selected:
                <gds-badge>
                  <pre>&lt;${this._selectedElement?.tag}&gt;</pre>
                </gds-badge>
              </gds-card>

              ${this._selectedElement?.renderPropertyPanel()}

              <gds-divider color="primary"></gds-divider>

              <gds-card variant="negative">
                <gds-flex flex-direction="column">
                  <gds-button
                    variant="negative"
                    @click=${this.#deleteSelectedElement}
                  >
                    Delete element
                    <gds-icon-trash-can slot="trail"></gds-icon-trash-can>
                  </gds-button>
                </gds-flex>
              </gds-card>
            `,
          )}
        </gds-flex>
      </gds-flex>
    `;
  }

  #updateSelectedElementAttributes = () => {
    if (!this._selectedElement) return;
    try {
      const changedAttributes = JSON.parse(this._attributes.value || "{}");
      this._selectedElement.attributes = changedAttributes;
    } catch (e) {
      // ignore
    }
  };

  #deleteSelectedElement = () => {
    if (!this._selectedElement) return;
    const index = this._selectedElement.parent?.children.indexOf(
      this._selectedElement,
    );
    if (index !== undefined && index > -1) {
      this._selectedElement.parent?.children.splice(index, 1);
      this._selectedElement = null;
    }
  };

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
