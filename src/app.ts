import { LitElement, PropertyValues, css } from "lit";
import { customElement, query, state } from "lit/decorators.js";

import { html } from "@sebgroup/green-core/scoping";

import "@sebgroup/green-core/components/index.js";

import "./components/drop-layer/drop-layer";
import type { DropLayer } from "./components/drop-layer/drop-layer";
import { EdElementData, EdFlexElement } from "./ed-element";

@customElement("my-app")
export class MyApp extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100vh;
      flex: 1 1 100%;
    }

    #renderTarget {
      width: 100%;
    }
  `;

  @state()
  private _document = new EdFlexElement({
    padding: "m",
    gap: "m",
    "flex-direction": "column",
  });

  @state()
  private _droppables: Omit<EdElementData & { name: string }, "children">[] = [
    {
      name: "Flex H",
      tag: "gds-flex",
      attributes: {
        padding: "m",
        gap: "m",
        "flex-direction": "row",
      },
    },
    {
      name: "Flex V",
      tag: "gds-flex",
      attributes: {
        padding: "m",
        gap: "m",
        "flex-direction": "column",
      },
    },
    {
      name: "Input",
      tag: "gds-input",
      attributes: {
        label: "Label",
      },
    },
    {
      name: "Button",
      tag: "gds-button",
      attributes: {},
      text: "Button",
    },
    {
      name: "Card",
      tag: "gds-card",
      attributes: {
        padding: "m",
      },
    },
    {
      name: "Text",
      tag: "gds-text",
      text: "Heading",
      attributes: {
        padding: "m",
        tag: "h2",
        contentEditable: "true",
      },
    },
  ];

  @query("#renderTarget")
  private _renderTarget!: HTMLElement;

  @query("drop-layer")
  private _dropLayer!: DropLayer;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("tree-updated", () => this.requestUpdate());
  }

  render() {
    return html`<gds-flex width="100%" height="100%">
        <gds-flex flex="0 1 100%">
          <div id="renderTarget"></div>
        </gds-flex>
        <gds-flex
          flex="0 0 300px"
          border="0 0 0 4xs"
          padding="m"
          flex-direction="column"
          gap="m"
        >
          ${this._droppables.map(
            (droppable) =>
              html`<gds-card
                draggable="true"
                @dragstart=${(e: DragEvent) =>
                  e.dataTransfer?.setData(
                    "application/json",
                    JSON.stringify(droppable),
                  )}
              >
                ${droppable.name}
              </gds-card>`,
          )}
        </gds-flex>
      </gds-flex>
      <drop-layer></drop-layer>`;
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    this.#renderDocument();
  }

  #renderDocument() {
    this._renderTarget.innerHTML = "";
    this._renderTarget.appendChild(this._document.render());
    this.updateComplete.then(() => {
      console.log(JSON.stringify(this._document.serialize()));
      this._dropLayer.clear();
      this._dropLayer.buildFromElement(this._document);
    });
  }
}
