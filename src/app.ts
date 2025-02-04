import { LitElement, css } from "lit";
import { customElement, query } from "lit/decorators.js";

import { html } from "@sebgroup/green-core/scoping";

import "@sebgroup/green-core/components/index.js";
import "@sebgroup/green-core/components/dialog/index.js";
import "@sebgroup/green-core/components/rich-text/index.js";

import { registerTransitionalStyles } from "@sebgroup/green-core/transitional-styles";
registerTransitionalStyles();

import "./components/drop-layer";
import type { DropLayer } from "./components/drop-layer";

import "./components/palette";
import "./components/document-properties";
import "./components/ai-generate";
import "./components/import-export";
import "./components/toolbar";

import { EdElement, EdElementData } from "./editor-elements/ed-element";

import { Signal, signal, SignalWatcher } from "@lit-labs/signals";
import { SignalObject } from "signal-utils/object";
import { effect } from "signal-utils/subtle/microtask-effect";
import { elementFactory } from "./editor-elements/factory";

import { inject } from "@vercel/analytics";

inject();

// TODO: Consolidate these into a single class
export const edSelection: Signal.State<WeakRef<EdElement> | undefined> =
  signal(undefined);
export const edDocument = {
  stateMeta: {
    shouldAppendHistoryOnNextRender: true,
  },
  root: signal(
    elementFactory({
      tag: "gds-flex",
      attributes: { padding: "m", gap: "m", "flex-direction": "column" },
      children: [],
    }),
  ),
};

@customElement("my-app")
export class MyApp extends LitElement {
  @query("#renderTarget")
  private _renderTarget!: HTMLElement;

  @query("drop-layer")
  private _dropLayer!: DropLayer;

  #history: EdElementData[] = [edDocument.root.get().serialize()];
  #historyIndex = 0;

  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      // Effect on selection change
      effect(() => {
        const selectedElement = edSelection.get()?.deref()?.renderedElement;
        if (!selectedElement) return;
        const highlightedElements = Array.from(
          this.shadowRoot!.querySelectorAll(".highlighted"),
        );
        highlightedElements.forEach((el) => el.classList.remove("highlighted"));
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
    });
  }

  render() {
    return html`<gds-theme
      ><gds-flex width="100%" height="100%">
        <gds-flex
          flex="0 0 300px"
          border="0 4xs 0 0"
          border-color="primary"
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
          ></ed-toolbar>
          <div
            style="flex: 1 1 100%; padding: 8px; box-sizing: border-box;padding-bottom: 200px"
            id="renderTarget"
          ></div>
          <ai-generate
            style="position:fixed; inset:auto auto 0;width:calc(100vw - 600px)"
          ></ai-generate>
        </gds-flex>
        <gds-flex
          flex="0 0 300px"
          border="0 0 0 4xs"
          border-color="primary"
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
      <drop-layer></drop-layer>
    </gds-theme>`;
  }

  #renderDocument() {
    this._renderTarget.innerHTML = "";
    this._renderTarget.appendChild(edDocument.root.get().render());

    this.updateComplete.then(() => {
      requestAnimationFrame(() => {
        this._dropLayer.clear();
        this._dropLayer.buildFromElement(edDocument.root.get());
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
        this.#historyIndex + 1,
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
