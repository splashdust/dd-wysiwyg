import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { EdElement } from "../../app";

type AnchorPosition = "top" | "bottom" | "left" | "right";

export type DropZone = {
  anchorElement: HTMLElement;
  anchorPosition: AnchorPosition;
  onDrop: (data: any) => void;
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
    document.addEventListener("dragend", () =>
      requestAnimationFrame(() => (this.isActive = false)),
    );
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
          class="drop-zone"
          @dragenter=${(e: DragEvent) => e.preventDefault()}
          @dragover=${(e: DragEvent) => e.preventDefault()}
          @drop=${(e: DragEvent) => {
            e.preventDefault();
            if (e.currentTarget !== e.target) return;
            dz.onDrop(e);
          }}
          style="${this.#positionFromAnchor(
            dz.anchorElement,
            dz.anchorPosition,
          )}"
        ></div>
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
    }
    :host([isActive]) {
      pointer-events: all;
    }

    .drop-zone {
      position: absolute;
      width: 32px;
      height: 32px;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 255, 0.5);
      border: 1px dashed rgba(255, 255, 255, 0.8);
      border-radius: 32px;
      pointer-events: all
  `;
}
