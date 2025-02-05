import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { EdElement } from '../editor-elements/ed-element';
import { edSelection } from '../app';

export interface EdElementOverlay {
    edElement: EdElement;
    elementRef: HTMLElement;
    layout: TemplateResult;
}

@customElement('ed-edit-layer')
export class EdEditLayer extends LitElement {
    @property({ type: Array })
    overlays: EdElementOverlay[] = [];

    @property({type: Boolean })
    isActive = true;

    #draggedElement?: {
        el: EdElement,
        currentParent: EdElement,
        index: number,
    };

    connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener('resize', () => this.requestUpdate());
    }

    clear() {
        this.overlays = [];
    }

    add(overlay: EdElementOverlay) {
        this.overlays = [...this.overlays, overlay];
    }

    buildFromElement(element: EdElement) {
        if (!element.renderedElement)
            return;

        this.add({
            edElement: element,
            elementRef: element.renderedElement,
            layout: element.renderEditOverlay(),
        });

        for (const child of element.children) {
            this.buildFromElement(child);
        }
    }

    render() {
        return html`
            ${this.overlays.map(
                (overlay) => html`
                    <div
                        class="overlay ${this.isActive ? 'active' : ''}"
                        @click=${() => {
                            edSelection.set(new WeakRef(overlay.edElement));
                        }}
                        draggable="true"
                        @dragstart=${(e: DragEvent) => {
                            const el = overlay.edElement;
                            const index = el.parent?.children.indexOf(el);
                            if (index !== undefined && index > -1) {
                                el.parent?.children.splice(index, 1);
                                edSelection.set(undefined);
                                this.#draggedElement = {
                                    el,
                                    currentParent: el.parent!,
                                    index,
                                };
                            }
                            e.dataTransfer?.setData(
                                "application/json",
                                JSON.stringify(el.serialize()),
                            );
                        }}
                        @dragend=${(e: DragEvent) => {
                            if (this.#draggedElement && e.dataTransfer?.dropEffect === "none") {
                                this.#draggedElement.currentParent.addChild(
                                    this.#draggedElement.el,
                                    this.#draggedElement.index,
                                );
                                this.#draggedElement = undefined;
                            }
                        }}
                        style="
                            top: ${overlay.elementRef.getBoundingClientRect().top}px;
                            left: ${overlay.elementRef.getBoundingClientRect().left}px;
                            width: ${overlay.elementRef.getBoundingClientRect().width}px;
                            height: ${overlay.elementRef.getBoundingClientRect().height}px;
                        "
                    >
                        <div class="tag-name">&lt;${overlay.elementRef.tagName.toLowerCase()}&gt;</div>
                        ${overlay.layout}
                    </div>
                `
            )}
        `;
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
        
        .overlay {
            display: none;
            position: absolute;
            box-sizing: border-box;
            pointer-events: all;
        }

        .overlay.active {
            display: block;
        }

        .overlay:hover {
            background: rgba(0, 192, 255, 0.1);
            border: 1px dashed rgba(0, 192, 255, 0.5);
        }

        .tag-name {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            background: rgba(0, 128, 192, 1);
            color: white;
            padding: 3px 5px;
            font-size: 10px;
        }

        .overlay:hover .tag-name {
            display: block;
            user-select: none;
        }
        .overlay:hover .tag-name:hover {
            display: none;
        }
    `;
}