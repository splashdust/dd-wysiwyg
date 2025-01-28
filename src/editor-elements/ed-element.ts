import { SignalArray } from "signal-utils/array";
import { SignalObject } from "signal-utils/object";
import { signal, computed, Signal } from "@lit-labs/signals";

import type { DropZone } from "../components/drop-layer";
import { html } from "@sebgroup/green-core/scoping";
import { edDocument } from "../app";
import { elementFactory } from "./factory";

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

    if (!(child.attributes["data-preview"] === "true")) {
      edDocument.mutationMeta.storeHistory = true;
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
      edDocument.mutationMeta.storeHistory = true;
    }}></gds-input>
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
