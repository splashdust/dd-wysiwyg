import { LitElement, PropertyValues, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { html, getScopedTagName } from "@sebgroup/green-core/scoping";

import "@sebgroup/green-core/components/index.js";

import "./components/drop-layer/drop-layer";
import type { DropLayer } from "./components/drop-layer/drop-layer";
import { EdElement, EdFlexElement } from "./ed-element";

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
          <div
            draggable="true"
            @dragstart=${(e: DragEvent) =>
              e.dataTransfer?.setData(
                "application/json",
                JSON.stringify({
                  tag: "gds-flex",
                  attributes: {
                    padding: "m",
                    gap: "m",
                    "flex-direction": "row",
                  },
                }),
              )}
          >
            Flex
          </div>
          <div
            draggable="true"
            @dragstart=${(e: DragEvent) =>
              e.dataTransfer?.setData(
                "application/json",
                JSON.stringify({
                  tag: "gds-input",
                  attributes: {
                    label: "Label",
                  },
                }),
              )}
          >
            Input
          </div>
          <div
            draggable="true"
            @dragstart=${(e: DragEvent) =>
              e.dataTransfer?.setData(
                "application/json",
                JSON.stringify({
                  tag: "gds-button",
                  text: "Button",
                }),
              )}
          >
            Button
          </div>
          <div
            draggable="true"
            @dragstart=${(e: DragEvent) =>
              e.dataTransfer?.setData(
                "application/json",
                JSON.stringify({
                  tag: "gds-card",
                  attributes: {
                    padding: "m",
                  },
                }),
              )}
          >
            Card
          </div>
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
