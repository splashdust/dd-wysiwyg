import { SignalArray } from "signal-utils/array";
import { SignalObject } from "signal-utils/object";
import { signal, computed, Signal } from "@lit-labs/signals";

import { marked } from "marked";

import type { DropZone } from "./components/drop-layer";
import { html } from "@sebgroup/green-core/scoping";

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
    case "gds-button":
      return new EdButtonElement(data);
    case "gds-rich-text":
      return new EdRichTextElement(data);
    default:
      return new EdElement(data);
  }
}

export class EdElement implements EdElementData {
  #tag = signal<string>("");
  get tag() {
    return this.#tag.get();
  }
  set tag(value: string) {
    this.#tag.set(value);
  }

  #children = signal(new SignalArray<EdElement>([]));
  get children() {
    return this.#children.get();
  }
  set children(value: SignalArray<EdElement>) {
    this.#children.set(value);
  }

  #attributes = signal(new SignalObject<Record<string, string>>({}));
  get attributes() {
    return this.#attributes.get();
  }
  set attributes(value: Record<string, string>) {
    this.#attributes.set(value);
  }

  #text = signal<string | undefined>(undefined);
  get text() {
    return this.#text.get();
  }
  set text(value: string | undefined) {
    this.#text.set(value);
  }

  #highlighted = signal(false);
  get highlighted() {
    return this.#highlighted.get();
  }
  set highlighted(value: boolean) {
    this.#highlighted.set(value);
  }

  renderedElement?: HTMLElement;
  parent?: EdElement;

  constructor(data: Partial<EdElementData>) {
    this.tag = data.tag || "div";
    this.children = SignalArray.from(
      (data.children || []).map((c) => {
        const child = elementFactory(c);
        child.parent = this;
        return child;
      }),
    );
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

  hasPreviewElements(): Boolean {
    return this.children.some(
      (child) => child.attributes["data-preview"] || child.hasPreviewElements(),
    );
  }

  serialize(): EdElementData {
    return {
      tag: this.tag,
      attributes: this.attributes,
      text: this.text,
      children: this.children.map((child) => child.serialize()),
    };
  }

  renderPropertyPanel() {
    return html`<gds-input label="Text content" value=${this.text} @input=${(
      e: any,
    ) => {
      this.text = e.target.value;
    }}></gds-input>
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
          } catch (e) {
            // ignore
          }
        }}
    /></gds-textarea>`;
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
}

export class EdButtonElement extends EdElement {
  constructor(data: Partial<EdElementData>) {
    super({ ...data, tag: "gds-button" });
  }

  renderPropertyPanel() {
    return html` <gds-dropdown
        size="small"
        label="Rank"
        value=${this.attributes["rank"] || "primary"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            rank: e.target.value,
          };
        }}
      >
        <gds-option value="primary">Primary</gds-option>
        <gds-option value="secondary">Secondary</gds-option>
        <gds-option value="tertiary">Tertiary</gds-option>
      </gds-dropdown>
      <gds-dropdown
        size="small"
        label="Variant"
        value=${this.attributes["variant"] || "neutral"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            variant: e.target.value,
          };
        }}
      >
        <gds-option value="neutral">Neutral</gds-option>
        <gds-option value="positive">Positive</gds-option>
        <gds-option value="negative">Negative</gds-option>
      </gds-dropdown>`;
  }
}

export class EdRichTextElement extends EdElement {
  constructor(data: Partial<EdElementData>) {
    super({ ...data, tag: "gds-rich-text" });
  }

  render() {
    const el = super.render();
    if (this.text) {
      requestAnimationFrame(
        () => (el.innerHTML = marked.parse(this.text as string) as string),
      );
    }
    return el;
  }

  renderPropertyPanel() {
    return html`
        <gds-textarea
            label="Content (Markdown)"
            value=${this.text}
            @input=${(e: InputEvent) => {
              this.text = (e.target as any)?.value || "";
            }}
        /></gds-textarea>`;
  }
}
