import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EdElement } from "../ed-element";

import "@sebgroup/green-core/components/icon/icons/plus-small.js";

type AnchorPosition = "top" | "bottom" | "left" | "right";

export type DropZone = {
  anchorElement: HTMLElement;
  anchorPosition: AnchorPosition;
  onDrop: (data: any) => void;
  onDragEnter?: (data: any) => void;
  onDragLeave?: (data: any) => void;
};

@customElement("drop-layer")
export class DropLayer extends LitElement {
  private _dropZones: DropZone[] = [];

  @property({ type: Boolean, reflect: true })
  isActive = false;

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("dragstart", () =>
      requestAnimationFrame(() => (this.isActive = true)),
    );
    document.addEventListener("dragend", () => {
      requestAnimationFrame(() => (this.isActive = false));
      document.dispatchEvent(new Event("tree-updated"));
    });
  }

  #addDropZone(dz: DropZone) {
    this._dropZones.push(dz);
  }

  buildFromElement(element: EdElement) {
    for (const dz of element.getDropZones()) {
      this.#addDropZone(dz);
    }
    for (const child of element.children) {
      this.buildFromElement(child);
    }
    this.requestUpdate();
  }

  clear() {
    this._dropZones = [];
  }

  render() {
    return html` ${this._dropZones.map(
      (dz) => html`
        <div
          class="drop-zone ${dz.anchorPosition}"
          @dragenter=${(e: DragEvent) => {
            console.log(e.dataTransfer?.getData("application/json"));
            requestAnimationFrame(() => dz.onDragEnter?.(e));
            (e.target as HTMLElement)?.classList.add("drag-hover");
          }}
          @dragover=${(e: DragEvent) => {
            e.preventDefault();
          }}
          @dragleave=${(e: DragEvent) => {
            dz.onDragLeave?.(e);
            (e.target as HTMLElement)?.classList.remove("drag-hover");
          }}
          @drop=${(e: DragEvent) => {
            e.preventDefault();
            (e.target as HTMLElement)?.classList.remove("drag-hover");
            dz.onDragLeave?.(e);
            dz.onDrop(e);
          }}
          style="${this.#positionFromAnchor(
            dz.anchorElement,
            dz.anchorPosition,
          )}"
        >
          <gds-icon-plus-small></gds-icon-plus-small>
        </div>
      `,
    )}`;
  }

  #positionFromAnchor(
    anchorElement: HTMLElement,
    anchorPosition: AnchorPosition,
  ) {
    const rect = anchorElement.getBoundingClientRect();
    const { top, left, width, height } = rect;
    const style: Record<string, string> = {};
    switch (anchorPosition) {
      case "top":
        style.top = `${top}px`;
        style.left = `${left + width / 2}px`;
        break;
      case "bottom":
        style.top = `${top + height}px`;
        style.left = `${left + width / 2}px`;
        break;
      case "left":
        style.top = `${top + height / 2}px`;
        style.left = `${left}px`;
        break;
      case "right":
        style.top = `${top + height / 2}px`;
        style.left = `${left + width}px`;
        break;
    }
    return `top: ${style.top}; left: ${style.left};`;
  }

  static styles = css`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }

    :host([isActive]) {
      pointer-events: all;
      opacity: 1;
    }

    .drop-zone {
      dislpay: flex;
      align-items: center;
      justify-content: center;
      line-height: 32px;
      position: absolute;
      width: 32px;
      height: 32px;
      background-color: rgba(128, 128, 128, 0.5);
      border: 3px dashed rgba(64, 64, 64, 0.8);
      border-radius: 32px;
      pointer-events: all;
      transition:
        width 0.2s,
        height 0.2s,
        line-height 0.2s,
        box-shadow 0.2s;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
    }

    .drop-zone.drag-hover {
      width: 48px;
      height: 48px;
      line-height: 48px;
      box-shadow: 0 0 16px rgba(0, 0, 0, 0.5);
    }

    .drop-zone > * {
      pointer-events: none;
    }

    .drop-zone.top {
      transform: translate(-50%, -50%);
    }

    .drop-zone.bottom {
      transform: translate(-50%, -50%);
    }

    .drop-zone.left {
      transform: translate(-50%, -50%);
    }

    .drop-zone.right {
      transform: translate(-50%, -50%);
    }
  `;
}
