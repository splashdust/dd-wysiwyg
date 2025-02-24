import { html } from "@sebgroup/green-core/scoping";
import { EdElement, EdElementData } from "./ed-element";
import { SignalArray } from "signal-utils/array";
import { DropZone } from "../components/drop-layer";
import { edDocument } from "../app";
import { elementFactory } from "./factory";

export class EdFlexElement extends EdElement {
  constructor(data: Partial<EdElementData>) {
    super({ tag: "gds-flex", ...data });
  }

  getDropZones() {
    const dropZones: DropZone[] = [];
    const flexDirection = this.attributes["flex-direction"] || "row";

    if (!this.renderedElement) return dropZones;

    dropZones.push({
      anchorElement: this.renderedElement,
      anchorPosition: flexDirection == "row" ? "left" : "top",
      onDrop: this.getOnDrop(0),
      onDragEnter: this.getOnPreview(0),
      onDragLeave: this.getOnDragLeave(0),
    });

    dropZones.push({
      anchorElement: this.renderedElement,
      anchorPosition: flexDirection == "row" ? "right" : "bottom",
      onDrop: this.getOnDrop(),
      onDragEnter: this.getOnPreview(),
      onDragLeave: this.getOnDragLeave(),
    });

    this.children.forEach((child, idx) => {
      if (idx === this.children.length - 1 || !child.renderedElement) {
        return;
      }
      dropZones.push({
        anchorElement: child.renderedElement,
        anchorPosition: flexDirection === "row" ? "right" : "bottom",
        onDrop: this.getOnDrop(idx + 1),
        onDragEnter: this.getOnPreview(idx + 1),
        onDragLeave: this.getOnDragLeave(idx + 1),
      });
    });

    return dropZones;
  }

  get placeholderText() {
    return `gds-flex — ${this.attributes["flex-direction"] || "row"} — empty`;
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
        label="Flex direction"
        value=${this.attributes["flex-direction"] || "row"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            "flex-direction": e.target.value,
          };
        }}>
        <gds-option value="row">Row</gds-option>
        <gds-option value="column">Column</gds-option>
    </gds-dropdown>
    <gds-dropdown
        size="small"
        label="Justify content"
        value=${this.attributes["justify-content"] || "flex-start"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            "justify-content": e.target.value,
          };
        }}>
        <gds-option value="flex-start">Start</gds-option>
        <gds-option value="flex-end">End</gds-option>
        <gds-option value="center">Center</gds-option>
        <gds-option value="space-between">Space between</gds-option>
        <gds-option value="space-around">Space around</gds-option>
        <gds-option value="space-evenly">Space evenly</gds-option>
    </gds-dropdown>
    <gds-dropdown
        size="small"
        label="Gap"
        combobox
        value=${this.attributes["gap"] || "m"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            gap: e.target.value,
          };
        }}>
        <gds-option value="xs">xs</gds-option>
        <gds-option value="s">s</gds-option>
        <gds-option value="m">m</gds-option>
        <gds-option value="l">l</gds-option>
        <gds-option value="xl">xl</gds-option>
    </gds-dropdown>
    <gds-textarea
        label="Attributes"
        id="attributes"
        value=${JSON.stringify(this.attributes)}
        @input=${(e: InputEvent) => {
          try {
            this.attributes = JSON.parse((e.target as any)?.value || "{}");
          } catch (e) {
            // ignore
          }
        }}
    /></gds-textarea>`;
  }
}
