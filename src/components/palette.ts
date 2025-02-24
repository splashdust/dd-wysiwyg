import { html } from "@sebgroup/green-core/scoping";
import { LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { EdElementData } from "../editor-elements/ed-element";

import "@sebgroup/green-core/components/icon/icons/bars-three.js";
import "@sebgroup/green-core/components/icon/icons/text-edit.js";
import "@sebgroup/green-core/components/icon/icons/images.js";
import { dragElementData } from "../app";

type Droppable = {
  name: string;
  elementData: EdElementData;
  template: TemplateResult;
};

@customElement("ed-palette")
export class Palette extends LitElement {
  @state()
  private _droppables: Droppable[] = [
    {
      name: "Flex row",
      elementData: {
        tag: "gds-flex",
        attributes: {
          gap: "m",
          "flex-direction": "row",
        },
        children: [],
      },
      template: html`<gds-icon-bars-three
        style="line-height: 1.75rem; transform: rotate(90deg)"
      ></gds-icon-bars-three>`,
    },
    {
      name: "Flex column",
      elementData: {
        tag: "gds-flex",
        attributes: {
          gap: "m",
          "flex-direction": "column",
        },
        children: [],
      },
      template: html`<gds-icon-bars-three
        style="line-height: 1.75rem;"
      ></gds-icon-bars-three>`,
    },
    {
      name: "Input",
      elementData: {
        tag: "gds-input",
        attributes: {
          label: "Label",
        },
        children: [],
      },
      template: html`<gds-input
        style="zoom:0.5"
        label="Input field"
        size="small"
      ></gds-input>`,
    },
    {
      name: "Textarea",
      elementData: {
        tag: "gds-textarea",
        attributes: {
          label: "Label",
        },
        children: [],
      },
      template: html`<gds-textarea
        style="zoom:0.5"
        label="Textarea"
        size="small"
      ></gds-textarea>`,
    },
    {
      name: "Button",
      elementData: {
        text: "Button",
        tag: "gds-button",
        attributes: {},
        children: [],
      },
      template: html`<gds-button size="xs">Button</gds-button>`,
    },
    {
      name: "Card",
      elementData: {
        tag: "gds-card",
        attributes: {
          padding: "m",
        },
        children: [],
      },
      template: html`<gds-card padding="xs">Card</gds-card>`,
    },
    {
      name: "Text",
      elementData: {
        tag: "gds-text",
        text: "Heading",
        attributes: {
          tag: "h2",
        },
        children: [],
      },
      template: html`Text`,
    },
    {
      name: "RichText",
      elementData: {
        tag: "gds-rich-text",
        attributes: {},
        children: [],
      },
      template: html`<gds-icon-text-edit
        style="line-height: 1.75rem;"
      ></gds-icon-text-edit>`,
    },
    {
      name: "Divider",
      elementData: {
        tag: "gds-divider",
        attributes: {
          color: "primary",
        },
        children: [],
      },
      template: html`<gds-flex flex-direction="column" width="100%" padding="m">
        <gds-divider color="primary"></gds-divider>
      </gds-flex>`,
    },
    {
      name: "Image",
      elementData: {
        tag: "gds-img",
        attributes: {
          src: "https://placehold.co/300x200",
        },
        children: [],
      },
      template: html`<gds-icon-images
        style="line-height: 1.75rem;"
      ></gds-icon-images>`,
    },
    {
      name: "Segmented Control",
      elementData: {
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
      template: html`<gds-flex style="zoom:0.5" flex-direction="column">
        <gds-segmented-control>
          <gds-segment>Seg 1</gds-segment>
          <gds-segment selected>Seg 2</gds-segment>
          <gds-segment>Seg 3</gds-segment>
        </gds-segmented-control>
      </gds-flex>`,
    },
  ];

  render() {
    return html`
      <gds-flex flex-direction="column">
        <gds-flex height="74px" flex-direction="column">
          <gds-text
            tag="h3"
            padding="s s 0 s"
            font-size="heading-xs"
            font-weight="medium"
            >Palette</gds-text
          >
          <gds-text padding="0 s m s" font-size="detail-xs" font-weight="medium"
            >Drag and drop elements to the canvas</gds-text
          >
        </gds-flex>
        <gds-grid
          columns="2"
          gap="m"
          padding="m"
          box-sizing="border-box"
          border-width="4xs 0 4xs 0"
          border-style="solid"
          border-color="primary"
        >
          ${this._droppables.map(
            (droppable) =>
              html`<gds-card
                style="aspect-ratio: 3/2"
                padding="0"
                gap="0"
                variant="secondary"
                max-width="125px"
                border-radius="xs"
                font-size="body-xs"
                border-color="primary"
                box-sizing="border-box"
                draggable="true"
                cursor="grab"
                @dragstart=${(e: DragEvent) => {
                  dragElementData.data = droppable.elementData;
                  e.dataTransfer?.setData(
                    "application/json",
                    JSON.stringify(droppable.elementData)
                  );
                }}
              >
                <gds-text
                  font-size="detail-xs"
                  padding="3xs"
                  font-weight="medium"
                  background="primary"
                  border="0 0 4xs"
                  border-color="primary"
                  border-radius="xs xs 0 0"
                  text-align="center"
                  box-sizing="border-box"
                  >${droppable.name}</gds-text
                >
                <gds-flex
                  font-size="detail-xs"
                  padding="xs"
                  box-sizing="border-box"
                  align-items="center"
                  justify-content="center"
                  flex-direction="column"
                  pointer-events="none"
                  >${droppable.template}</gds-flex
                >
              </gds-card>`
          )}
        </gds-grid>
      </gds-flex>
    `;
  }
}
