import { LitElement, PropertyValues, css } from "lit";
import { customElement, query, state } from "lit/decorators.js";

import { html } from "@sebgroup/green-core/scoping";

import "@sebgroup/green-core/components/index.js";
import "@sebgroup/green-core/components/dialog/index.js";

import "./components/drop-layer/drop-layer";
import type { DropLayer } from "./components/drop-layer/drop-layer";
import { EdElementData, elementFactory } from "./ed-element";
import { MarkupGenerator } from "./markup-generator";
import { GdsTextarea } from "@sebgroup/green-core/components/index.js";

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
      max-width: 800px;
      margin: 0 auto;
    }
  `;

  @state()
  private _document = elementFactory({
    tag: "gds-flex",
    attributes: { padding: "m", gap: "m", "flex-direction": "column" },
    children: [],
  });

  @state()
  private _droppables: (EdElementData & { name: string })[] = [
    {
      name: "Flex row",
      tag: "gds-flex",
      attributes: {
        gap: "m",
        "flex-direction": "row",
      },
      children: [],
    },
    {
      name: "Flex column",
      tag: "gds-flex",
      attributes: {
        gap: "m",
        "flex-direction": "column",
      },
      children: [],
    },
    {
      name: "Input",
      tag: "gds-input",
      attributes: {
        label: "Label",
      },
      children: [],
    },
    {
      name: "Button",
      tag: "gds-button",
      attributes: {},
      text: "Button",
      children: [],
    },
    {
      name: "Card",
      tag: "gds-card",
      attributes: {
        padding: "m",
      },
      children: [],
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
      children: [],
    },
    {
      name: "Divider",
      tag: "gds-divider",
      attributes: {
        color: "primary",
      },
      children: [],
    },
    {
      name: "Image",
      tag: "gds-img",
      attributes: {
        src: "https://placehold.co/300x200",
      },
      children: [],
    },
    {
      name: "Segmented Control",
      tag: "gds-segmented-control",
      attributes: {},
      children: [
        {
          tag: "gds-segment",
          text: "Segment 1",
          attributes: {},
          children: [],
        },
        {
          tag: "gds-segment",
          text: "Segment 2",
          attributes: {},
          children: [],
        },
        {
          tag: "gds-segment",
          text: "Segment 3",
          attributes: {},
          children: [],
        },
      ],
    },
  ];

  @state() private _generatedMarkup = "";

  @query("#renderTarget")
  private _renderTarget!: HTMLElement;

  @query("drop-layer")
  private _dropLayer!: DropLayer;

  @query("#import-export")
  private _importExport!: GdsTextarea;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("tree-updated", () => this.requestUpdate());
    document.addEventListener("preview-tree-updated", () =>
      this.#renderPreviewDocument(),
    );
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
          <gds-dialog heading="Generated markup">
            <gds-textarea value=${this._generatedMarkup}></gds-textarea>
            <gds-button
              slot="trigger"
              @click=${() => {
                this._generatedMarkup = MarkupGenerator.toMarkup(
                  this._document,
                );
              }}
              >Generate HTML</gds-button
            >
          </gds-dialog>
          <gds-dialog
            heading="Import/export"
            @gds-close=${(e: CustomEvent) => {
              if (e.detail === "btn-ok") {
                this._document = elementFactory(
                  JSON.parse(this._importExport.value || "{}"),
                );
              }
            }}
          >
            <gds-textarea
              id="import-export"
              value=${JSON.stringify(this._document.serialize())}
            ></gds-textarea>
            <gds-button slot="trigger" @click=${() => {}}
              >Import/export</gds-button
            >
          </gds-dialog>
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

  #renderPreviewDocument() {
    this._renderTarget.innerHTML = "";
    this._renderTarget.appendChild(this._document.render());
  }
}
