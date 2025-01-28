import { SignalArray } from "signal-utils/array";
import { EdElement, EdElementData } from "./ed-element";
import { DropZone } from "../components/drop-layer";
import { elementFactory } from "./factory";

export class EdCardElement extends EdElement {
  constructor(data: Partial<EdElementData>) {
    super({ ...data, tag: "gds-card" });
  }

  getOnPreview() {
    return (e: DragEvent) => {
      const newElement = elementFactory({ tag: "gds-input" });
      newElement.attributes = {
        style: "opacity: 0.5; padding: 8px; border: 1px dashed #000;",
        "data-preview": "true",
      };
      newElement.text = "Preview";
      this.addChild(newElement);
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

    // Give the flex some height if it has no children
    if (this.children.length === 0) {
      el.setAttribute("border-radius", "xs");
      el.setAttribute(
        "style",
        "display:flex;border: 1px dashed #ddd; color: #ccc; font-size: 12px;align-items: center; justify-content: center;",
      );
      el.innerText = `gds-card — empty`;
    }

    return el;
  }
}
