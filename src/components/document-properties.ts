import { html } from "@sebgroup/green-core/scoping";
import { css, LitElement, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { SignalWatcher } from "@lit-labs/signals";
import { EdElement } from "../editor-elements/ed-element";
import { GdsTextarea } from "@sebgroup/green-core/components/textarea/index.js";
import { when } from "lit/directives/when.js";
import { edDocument, edSelection } from "../app";

import "@shoelace-style/shoelace/dist/components/tree/tree.js";
import "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js";
import "@shoelace-style/shoelace/dist/themes/light.css";

import "@sebgroup/green-core/components/icon/icons/trash-can.js";

@customElement("document-properties")
export class DocumentProperties extends SignalWatcher(LitElement) {
  get #selectedElement() {
    return edSelection.get()?.deref();
  }

  @query("#attributes")
  private _attributes!: GdsTextarea;

  render() {
    return html`
      <gds-flex flex-direction="column" align-items="stretch">
        <gds-text
          tag="h3"
          padding="s"
          font-size="heading-xs"
          font-weight="medium"
          >Document properties</gds-text
        >
        <gds-flex
          max-height="40vh"
          border="4xs 0"
          border-color="primary"
          style="overflow: auto"
          flex-direction="column"
          background="secondary"
        >
          <sl-tree class="tree-with-lines">
            ${this.#renderPropertyTree(edDocument.root.get())}
          </sl-tree>
        </gds-flex>
        <gds-flex padding="m" flex-direction="column" gap="m">
          ${when(
            this.#selectedElement !== undefined,
            () => html`
              <gds-card padding="s">
                Selected:
                <gds-badge>
                  <pre>&lt;${this.#selectedElement?.tag}&gt;</pre>
                </gds-badge>
              </gds-card>

              ${this.#selectedElement?.renderPropertyPanel()}

              <gds-divider color="primary"></gds-divider>

              <gds-button
                variant="negative"
                @click=${this.#deleteSelectedElement}
              >
                Delete element
                <gds-icon-trash-can slot="trail"></gds-icon-trash-can>
              </gds-button>
            `,
          )}
        </gds-flex>
      </gds-flex>
    `;
  }

  #updateSelectedElementAttributes = () => {
    if (!this.#selectedElement) return;
    try {
      const changedAttributes = JSON.parse(this._attributes.value || "{}");
      this.#selectedElement.attributes = changedAttributes;
    } catch (e) {
      // ignore
    }
  };

  #deleteSelectedElement = () => {
    if (!this.#selectedElement) return;
    const index = this.#selectedElement.parent?.children.indexOf(
      this.#selectedElement,
    );
    if (index !== undefined && index > -1) {
      this.#selectedElement.parent?.children.splice(index, 1);
      edSelection.set(undefined);
    }
  };

  #renderPropertyTree(el: EdElement): TemplateResult {
    return html`<sl-tree-item
      type="folder"
      .expanded=${el.children.length < 4 ? true : false}
      @click=${(e: Event) => {
        if (e.currentTarget !== e.target) return;
        edSelection.set(new WeakRef(el));
      }}
    >
      ${el.tag} ${el.children.map((child) => this.#renderPropertyTree(child))}
    </sl-tree-item>`;
  }

  static styles = css`
    .tree-with-lines {
      --indent-guide-width: 1px;
    }
    sl-tree-item::part(item--selected) {
      background-color: var(--sl-panel-border-color);
    }
  `;
}
