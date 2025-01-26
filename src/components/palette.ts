import { html } from "@sebgroup/green-core/scoping";
import { LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { EdElementData } from "../ed-element";

@customElement("ed-palette")
export class Palette extends LitElement {
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
        tag: "h2",
      },
      children: [],
    },
    {
      name: "RichText",
      tag: "gds-rich-text",
      attributes: {},
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

  render() {
    return html`
      <gds-flex flex-direction="column" gap="m">
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
    `;
  }
}
