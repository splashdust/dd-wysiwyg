import { SignalArray } from "signal-utils/array";
import { EdElement, EdElementData } from "./ed-element";
import { DropZone } from "../components/drop-layer";
import { elementFactory } from "./factory";
import { html } from "@sebgroup/green-core/scoping";

export class EdCardElement extends EdElement {
  constructor(data: Partial<EdElementData>) {
    super({ ...data, tag: "gds-card" });
  }

  getDropZones() {
    const dropZones: DropZone[] = [];

    if (!this.renderedElement) return dropZones;

    dropZones.push({
      anchorElement: this.renderedElement,
      anchorPosition: "bottom",
      onDrop: this.getOnDrop(),
      onDragEnter: this.getOnPreview(),
      onDragLeave: this.getOnDragLeave(),
    });

    return dropZones;
  }

  render() {
    const el = super.render();
    this.showPlaceholder();
    return el;
  }

  renderPropertyPanel() {
    return html`
      <gds-dropdown
        size="small"
        label="Variant"
        value=${this.attributes["variant"] || "default"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            variant: e.target.value,
          };
        }}
      >
        <gds-option value="primary">Primary</gds-option>
        <gds-option value="secondary">Secondary</gds-option>
        <gds-option value="tertiary">Tertiary</gds-option>
        <gds-option value="positive">Positive</gds-option>
        <gds-option value="negative">Negative</gds-option>
        <gds-option value="notice">Notice</gds-option>
        <gds-option value="warning">Warning</gds-option>
        <gds-option value="information">Information</gds-option>
        <gds-option value="copper-01">Copper 1</gds-option>
        <gds-option value="copper-02">Copper 2</gds-option>
        <gds-option value="purple-01">Purple 1</gds-option>
        <gds-option value="purple-02">Purple 2</gds-option>
        <gds-option value="green-01">Green 1</gds-option>
        <gds-option value="green-02">Green 2</gds-option>
        <gds-option value="blue-01">Blue 1</gds-option>
        <gds-option value="blue-02">Blue 2</gds-option>
      </gds-dropdown>
      <gds-dropdown
        size="small"
        label="Border"
        value=${this.attributes["border"] || "default"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            border: e.target.value,
          };
        }}
      >
        <gds-option value="0">Off</gds-option>
        <gds-option value="4xs">On</gds-option>
      </gds-dropdown>
      ${super.renderPropertyPanel()}
    `;
  }
}
