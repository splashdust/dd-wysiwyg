import type { DropZone } from "./components/drop-layer/drop-layer";

export interface EdElementData {
  tag: string;
  children: EdElementData[];
  attributes: Record<string, string>;
  text?: string;
}

function elementFactory(tag: string): EdElement {
  switch (tag) {
    case "gds-flex":
      return new EdFlexElement();
    case "gds-card":
      return new EdCardElement();
    default:
      return new EdElement(tag);
  }
}

export class EdElement implements EdElementData {
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

      const newElement = elementFactory(dropData.tag);
      newElement.attributes = dropData.attributes || {};
      newElement.text = dropData.text;
      this.addChild(newElement, idx);
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
  constructor(attributes?: Record<string, string>) {
    super("gds-flex", attributes);
  }

  getDropZones() {
    const dropZones: DropZone[] = [];
    const flexDirection = this.attributes["flex-direction"] || "row";

    if (!this.renderedElement) return dropZones;

    dropZones.push({
      anchorElement: this.renderedElement,
      anchorPosition: flexDirection == "row" ? "left" : "top",
      onDrop: this.getOnDrop(0),
    });

    dropZones.push({
      anchorElement: this.renderedElement,
      anchorPosition: flexDirection == "row" ? "right" : "bottom",
      onDrop: this.getOnDrop(),
    });

    this.children.forEach((child, idx) => {
      if (idx === this.children.length - 1 || !child.renderedElement) {
        return;
      }
      dropZones.push({
        anchorElement: child.renderedElement,
        anchorPosition: flexDirection === "row" ? "right" : "bottom",
        onDrop: this.getOnDrop(idx + 1),
      });
    });

    return dropZones;
  }
}

export class EdCardElement extends EdElement {
  constructor(attributes?: Record<string, string>) {
    super("gds-card", attributes);
  }

  getDropZones() {
    const dropZones: DropZone[] = [];

    if (!this.renderedElement) return dropZones;

    dropZones.push({
      anchorElement: this.renderedElement,
      anchorPosition: "bottom",
      onDrop: this.getOnDrop(),
    });

    return dropZones;
  }
}
