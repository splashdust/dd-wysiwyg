import { html } from "@sebgroup/green-core/scoping";
import { EdElement, EdElementData } from "./ed-element";
import { SignalArray } from "signal-utils/array";
import { DropZone } from "../components/drop-layer";
import { edDocument } from "../app";
import { elementFactory } from "./factory";

export class EdFlexElement extends EdElement {
  constructor(data: Partial<EdElementData>) {
    super({ ...data, tag: "gds-flex" });
  }

  getOnPreview(index?: number) {
    return (e: DragEvent) => {
      const newElement = elementFactory({ tag: "div" });
      newElement.attributes = {
        style: "opacity: 0.5; padding: 8px; border: 1px dashed #000",
        "data-preview": "true",
      };
      newElement.text = "Preview";
      this.addChild(newElement, index);
    };
  }

  getOnDragLeave(index?: number) {
    return (e: DragEvent) => {
      console.log("drag leave");
      // remove all preview elements
      this.children = SignalArray.from(
        this.children.filter((child) => !child.attributes["data-preview"]),
      );
    };
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
          edDocument.mutationMeta.storeHistory = true;
        }}>
        <gds-option value="row">Row</gds-option>
        <gds-option value="column">Column</gds-option>
    </gds-dropdown>
    <gds-textarea
        label="Attributes"
        id="attributes"
        value=${JSON.stringify(this.attributes)}
        @input=${(e: InputEvent) => {
          try {
            this.attributes = JSON.parse((e.target as any)?.value || "{}");
            edDocument.mutationMeta.storeHistory = true;
          } catch (e) {
            // ignore
          }
        }}
    /></gds-textarea>`;
  }
}
