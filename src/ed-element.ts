import type { DropZone } from "./components/drop-layer/drop-layer";

export interface EdElementData {
  tag: string;
  children: EdElementData[];
  attributes: Record<string, string>;
  text?: string;
}

export function elementFactory(data: Partial<EdElementData>): EdElement {
  switch (data.tag) {
    case "gds-flex":
      return new EdFlexElement(data);
    case "gds-card":
      return new EdCardElement(data);
    default:
      return new EdElement(data);
  }
}

export class EdElement implements EdElementData {
  tag: string;
  children: EdElement[];
  attributes: Record<string, string>;
  text?: string;
  renderedElement?: HTMLElement;
  parent?: EdElement;
  highlighted = false;

  constructor(data: Partial<EdElementData>) {
    this.tag = data.tag || "div";
    this.children = (data.children || []).map((c) => {
      const child = elementFactory(c);
      child.parent = this;
      return child;
    });
    this.attributes = data.attributes || {};
    this.text = data.text;
  }

  addChild(child: EdElement, index?: number) {
    child.parent = this;
    if (index !== undefined) {
      this.children.splice(index, 0, child);
    } else {
      this.children.push(child);
    }

    if (child.attributes["data-preview"] === "true") {
      document.dispatchEvent(new Event("preview-tree-updated"));
    } else {
      document.dispatchEvent(new Event("tree-updated"));
    }
  }

  protected getOnDrop(index?: number) {
    return (e: DragEvent) => {
      const dropData = JSON.parse(
        e.dataTransfer?.getData("application/json") || "{}",
      );

      if (!dropData.tag) return;

      const newElement = elementFactory(dropData);

      this.addChild(newElement, index);
    };
  }

  getDropZones(): DropZone[] {
    return [];
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

    if (this.highlighted) {
      el.style.outline = "1px dotted rgba(128,128,128,0.8)";
      el.style.outlineOffset = "2px";
    }

    if (children) {
      children.forEach((child: any, idx: number) => {
        const childEl = child.render();
        el.appendChild(childEl);
      });
    }

    return el;
  }

  serialize(): EdElementData {
    return {
      tag: this.tag,
      attributes: this.attributes,
      text: this.text,
      children: this.children.map((child) => child.serialize()),
    };
  }
}

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
      this.children = this.children.filter(
        (child) => !child.attributes["data-preview"],
      );
      document.dispatchEvent(new Event("preview-tree-updated"));
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
}

export class EdCardElement extends EdElement {
  constructor(data: Partial<EdElementData>) {
    super({ ...data, tag: "gds-card" });
  }

  getOnPreview() {
    return (e: DragEvent) => {
      const newElement = elementFactory({ tag: "div" });
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
      this.children = this.children.filter(
        (child) => !child.attributes["data-preview"],
      );
      document.dispatchEvent(new Event("preview-tree-updated"));
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
}
