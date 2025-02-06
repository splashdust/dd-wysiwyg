import { SignalArray } from "signal-utils/array";
import { SignalObject } from "signal-utils/object";
import { signal, computed, Signal } from "@lit-labs/signals";

import type { DropZone } from "../components/drop-layer";
import { html } from "@sebgroup/green-core/scoping";
import { dragElementData, edDocument, edSelection } from "../app";
import { elementFactory } from "./factory";
import * as _hyperscript from "hyperscript.org";

export interface EdElementData {
  tag: string;
  children: EdElementData[];
  attributes: Record<string, string>;
  text?: string;
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

  get highlighted() {
    return Signal.subtle.untrack(() => edSelection.get()?.deref() === this);
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
      el.classList.add("highlighted");
    }

    if (children) {
      children.forEach((child: any, idx: number) => {
        const childEl = child.render();
        el.appendChild(childEl);
      });
    }

    return el;
  }

  #previewElement?: HTMLElement;
  getOnPreview(index?: number) {
    return (e: DragEvent) => {
      const dragData = dragElementData.data;

      if(dragData) {
        const previewElement = elementFactory(dragData);
        this.#previewElement = previewElement.render();
      } else {
        this.#previewElement = document.createElement("div");
      }

      this.#previewElement.setAttribute("style", "opacity: 0.5;");

      this.hidePlaceholder();

      if (Number.isInteger(index)) {
        const insertBefore = this.children[index!];
        insertBefore?.renderedElement?.insertAdjacentElement(
          "beforebegin",
          this.#previewElement,
        );
      } else {
        this.renderedElement?.appendChild(this.#previewElement);
      }
    };
  }

  getOnDragLeave(index?: number) {
    return (e: DragEvent) => {
      this.showPlaceholder();
      this.#previewElement?.remove();
    };
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

  get placeholderText() {
    return `${this.tag} — empty`;
  }

  #placeholderTextNode?: Text;
  showPlaceholder() {
    if (this.children.length > 0 || !this.renderedElement) return;

    const el = this.renderedElement;

    el.setAttribute(
      "style",
      "border-radius: 8px;min-height: 40px;border: 1px dashed #ddd; color: #ccc; font-size: 12px;align-items: center; justify-content: center;",
    );

    if (!this.#placeholderTextNode) {
      this.#placeholderTextNode = document.createTextNode(this.placeholderText);
    } else {
      this.#placeholderTextNode.nodeValue = this.placeholderText;
    }
    el.appendChild(this.#placeholderTextNode);
  }

  hidePlaceholder() {
    if (!this.renderedElement) return;
    this.renderedElement.removeAttribute("style");
    this.#placeholderTextNode?.remove();
  }

  renderPropertyPanel() {
    return html`<gds-input label="Text content" value=${this.text} @input=${(
      e: any,
    ) => {
      this.text = e.target.value;
    }}></gds-input>
    <gds-input
    label="Id"
    value=${this.attributes["id"] || ""}
    @input=${(e: any) => {
      this.attributes = {
        ...this.attributes,
        id: e.target.value,
      };
    }}></gds-input>
    <gds-textarea
      label="Hyperscript"
      value=${this.attributes["_"] || ""}
      @input=${(e: any) => {
        this.attributes = {
          ...this.attributes,
          _: e.target.value,
        };
      }}
    ></gds-textarea>
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

  renderEditOverlay() {
    return html``;
  }
}
