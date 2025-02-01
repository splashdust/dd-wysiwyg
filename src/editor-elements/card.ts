import { SignalArray } from "signal-utils/array";
import { EdElement, EdElementData } from "./ed-element";
import { DropZone } from "../components/drop-layer";
import { elementFactory } from "./factory";

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
}
