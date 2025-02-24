import { LitElement, css } from "lit";
import { customElement, query, state } from "lit/decorators.js";

import { html } from "@sebgroup/green-core/scoping";

import "@sebgroup/green-core/components/index.js";
import "@sebgroup/green-core/components/dialog/index.js";
import "@sebgroup/green-core/components/rich-text/index.js";

import { registerTransitionalStyles } from "@sebgroup/green-core/transitional-styles";
registerTransitionalStyles();

import "./components/drop-layer";
import type { DropLayer } from "./components/drop-layer";

import "./components/edit-layer";
import type { EdEditLayer } from "./components/edit-layer";

import "./components/palette";
import "./components/document-properties";
import "./components/ai-generate";
import "./components/import-export";
import "./components/toolbar";

import { EdElement, EdElementData } from "./editor-elements/ed-element";

import { Signal, signal } from "@lit-labs/signals";
import { effect } from "signal-utils/subtle/microtask-effect";
import { elementFactory } from "./editor-elements/factory";

import { inject } from "@vercel/analytics";

inject();

import * as _hyperscript from "hyperscript.org";
_hyperscript.browserInit();

// TODO: Consolidate these into a single class
export const edSelection: Signal.State<WeakRef<EdElement> | undefined> =
  signal(undefined);

export const dragElementData: { data?: EdElementData } = {};

export const edDocument = {
  stateMeta: {
    shouldAppendHistoryOnNextRender: true,
  },
  root: signal(
    elementFactory({
      tag: "gds-flex",
      attributes: { padding: "m", gap: "m", "flex-direction": "column" },
      children: [],
    })
  ),
};

@customElement("my-app")
export class MyApp extends LitElement {
  @query("#renderTarget")
  private _renderTarget!: HTMLElement;

  @query("drop-layer")
  private _dropLayer!: DropLayer;

  @query("ed-edit-layer")
  private _editLayer!: EdEditLayer;

  @state()
  private _designVersion = "2023";

  #history: EdElementData[] = [edDocument.root.get().serialize()];
  #historyIndex = 0;

  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      // Effect on selection change
      effect(() => {
        const selectedElement = edSelection.get()?.deref()?.renderedElement;

        const highlightedElements = Array.from(
          this.shadowRoot!.querySelectorAll(".highlighted")
        );
        highlightedElements.forEach((el) => el.classList.remove("highlighted"));

        if (!selectedElement) return;
        selectedElement.classList.add("highlighted");
      });

      // Effect on document data change
      effect(() => {
        console.log("Document data changed");
        this.#renderDocument();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        this.#undo();
      }
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        this.#redo();
      }
      if (e.key === "Escape") {
        edSelection.set(undefined);
      }
    });
  }

  render() {
    return html`<gds-theme design-version="2023"
      ><gds-flex width="100%" height="100%">
        <gds-flex
          flex="0 0 300px"
          border-width="0 4xs 0 0"
          flex-direction="column"
          align-items="stretch"
          background="primary"
          gap="m"
        >
          <document-properties
            style="position:fixed;width:299px"
          ></document-properties>
        </gds-flex>
        <gds-flex flex="0 1 100%" flex-direction="column">
          <ed-toolbar
            @ed-undo=${this.#undo}
            @ed-redo=${this.#redo}
            @ed-design-version=${(e: CustomEvent) => {
              this._designVersion = e.detail.value;
            }}
            @ed-mode=${(e: CustomEvent) => {
              if (e.detail.value === "preview") {
                this._editLayer.isActive = false;
              } else {
                console.log("Edit mode");
                this._editLayer.isActive = true;
              }
            }}
          ></ed-toolbar>
          <gds-theme design-version=${this._designVersion}>
            <div
              style="flex: 1 1 100%; padding: 8px; box-sizing: border-box;padding-bottom: 200px"
              id="renderTarget"
            ></div>
          </gds-theme>
          <ai-generate
            style="position:fixed; inset:auto auto 0;width:calc(100vw - 600px)"
          ></ai-generate>
        </gds-flex>
        <gds-flex
          flex="0 0 300px"
          border-width="0 0 0 4xs"
          flex-direction="column"
          gap="m"
          background="primary"
        >
          <gds-flex position="fixed" height="100vh" flex-direction="column">
            <ed-palette></ed-palette>
            <gds-flex
              padding="m"
              flex-direction="column"
              gap="m"
              width="299px"
              style="z-index:999"
            >
              <import-export></import-export>
            </gds-flex>
          </gds-flex>
        </gds-flex>
      </gds-flex>
      <ed-edit-layer></ed-edit-layer>
      <drop-layer></drop-layer>
    </gds-theme>`;
  }

  #renderDocument() {
    this._renderTarget.innerHTML = "";
    this._renderTarget.appendChild(edDocument.root.get().render());
    _hyperscript.processNode(this._renderTarget);

    this.updateComplete.then(() => {
      requestAnimationFrame(() => {
        this._dropLayer.clear();
        this._dropLayer.buildFromElement(edDocument.root.get());

        this._editLayer.clear();
        this._editLayer.buildFromElement(edDocument.root.get());

        if (edDocument.stateMeta.shouldAppendHistoryOnNextRender) {
          this.#history = this.#history.slice(0, this.#historyIndex + 1);
          this.#history.push(edDocument.root.get().serialize());
          this.#historyIndex = this.#history.length - 1;
        }
        edDocument.stateMeta.shouldAppendHistoryOnNextRender = true;
      });
    });
  }

  #undo() {
    if (this.#history.length > 0) {
      this.#historyIndex = Math.max(0, this.#historyIndex - 1);
      edDocument.root.set(elementFactory(this.#history[this.#historyIndex]));
      edDocument.stateMeta.shouldAppendHistoryOnNextRender = false;
    }
  }

  #redo() {
    if (
      this.#history.length > 0 &&
      this.#historyIndex < this.#history.length - 1
    ) {
      this.#historyIndex = Math.min(
        this.#history.length - 1,
        this.#historyIndex + 1
      );
      edDocument.root.set(elementFactory(this.#history[this.#historyIndex]));
      edDocument.stateMeta.shouldAppendHistoryOnNextRender = false;
    }
  }

  static styles = css`
    :host {
      width: 100%;
      height: 100vh;
      flex: 1 1 100%;
    }

    #renderTarget {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }

    #renderTarget .highlighted {
      outline: 2px dotted rgba(128, 128, 128, 0.8);
      outline-offset: 2px;
    }

    .tree-with-lines {
      --indent-guide-width: 1px;
    }
  `;
}
