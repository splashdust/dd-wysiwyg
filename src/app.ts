import { LitElement, PropertyValues, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { html, getScopedTagName } from "@sebgroup/green-core/scoping";

import "@sebgroup/green-core/components/index.js";

import "./components/drop-layer/drop-layer";
import type { DropLayer, DropZone } from "./components/drop-layer/drop-layer";

export class EdElement {
  tag: string;
  children: EdElement[] = [];
  attributes: Record<string, string>;
  text?: string;
  renderedElement?: HTMLElement;

  constructor(tag: string, attributes?: Record<string, string>) {
    this.tag = tag;
    this.attributes = attributes || {};
  }

  addChild(child: EdElement, idx?: number) {
    if (idx !== undefined) {
      this.children.splice(idx, 0, child);
    } else {
      this.children.push(child);
    }
    document.dispatchEvent(new Event("tree-updated"));
  }

  protected getOnDrop(idx?: number) {
    return (e: DragEvent) => {
      const dropData = JSON.parse(
        e.dataTransfer?.getData("application/json") || "{}",
      );

      if (!dropData.tag) return;

      const newElement = new EdElement(dropData.tag);
      newElement.attributes = dropData.attributes || {};
      newElement.text = dropData.text;
      this.addChild(newElement, idx);
    };
  }

  getDropZones() {
    const dropZones: DropZone[] = [];
    const flexDirection = this.attributes["flex-direction"] || "row";

    if (this.tag === "gds-flex") {
      dropZones.push({
        anchorElement: this.renderedElement as HTMLElement,
        anchorPosition: flexDirection == "row" ? "left" : "top",
        onDrop: this.getOnDrop(0),
      });

      this.children.forEach((child, idx) => {
        dropZones.push({
          anchorElement: child.renderedElement as HTMLElement,
          anchorPosition: flexDirection === "row" ? "right" : "bottom",
          onDrop: this.getOnDrop(idx + 1),
        });
      });
    }

    if (this.tag === "gds-card") {
      dropZones.push({
        anchorElement: this.renderedElement as HTMLElement,
        anchorPosition: "top",
        onDrop: this.getOnDrop(),
      });
    }

    return dropZones;
  }

  render() {
    const { tag, children, text, attributes } = this;
    this.renderedElement = document.createElement(tag);
    const el = this.renderedElement;

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        el.setAttribute(key, value);
      });
    }

    if (text) {
      el.textContent = text;
    }

    if (children) {
      children.forEach((child: any, idx: number) => {
        const childEl = child.render();
        el.appendChild(childEl);
      });
    }

    return el;
  }
}

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
  private _document = new EdElement("gds-flex", {
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
      this._dropLayer.clear();
      this._dropLayer.buildFromElement(this._document);
    });
  }
}
