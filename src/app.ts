import { LitElement, css } from "lit";
import { customElement, query } from "lit/decorators.js";

import { html } from "@sebgroup/green-core/scoping";

import "@sebgroup/green-core/components/index.js";
import "@sebgroup/green-core/components/dialog/index.js";
import "@sebgroup/green-core/components/rich-text/index.js";

import "./components/drop-layer";
import type { DropLayer } from "./components/drop-layer";

import "./components/palette";
import "./components/document-properties";
import "./components/ai-generate";
import "./components/import-export";

import { EdElementData } from "./editor-elements/ed-element";

import { SignalWatcher } from "@lit-labs/signals";
import { SignalObject } from "signal-utils/object";
import { effect } from "signal-utils/subtle/microtask-effect";
import { elementFactory } from "./editor-elements/factory";

export const edDocument = new SignalObject({
  mutationMeta: {
    storeHistory: false,
  },
  root: elementFactory({
    tag: "gds-flex",
    attributes: { padding: "m", gap: "m", "flex-direction": "column" },
    children: [],
  }),
});

@customElement("my-app")
export class MyApp extends SignalWatcher(LitElement) {
  @query("#renderTarget")
  private _renderTarget!: HTMLElement;

  @query("drop-layer")
  private _dropLayer!: DropLayer;

  #history: EdElementData[] = [edDocument.root.serialize()];

  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      effect(() => {
        this.#renderDocument();
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        this.#undo();
      }
    });
  }

  render() {
    return html`<gds-flex width="100%" height="100%">
        <gds-flex
          flex="0 0 300px"
          border="0 4xs 0 0"
          flex-direction="column"
          align-items="stretch"
          gap="m"
        >
          <document-properties></document-properties>
        </gds-flex>
        <gds-flex flex="0 1 100%" flex-direction="column">
          <div style="flex: 1 1 100%" id="renderTarget"></div>
          <ai-generate></ai-generate>
        </gds-flex>
        <gds-flex
          flex="0 0 300px"
          border="0 0 0 4xs"
          padding="m"
          flex-direction="column"
          gap="m"
        >
          <ed-palette></ed-palette>
          <import-export></import-export>
        </gds-flex>
      </gds-flex>
      <drop-layer></drop-layer>`;
  }

  #renderDocument() {
    this._renderTarget.innerHTML = "";
    this._renderTarget.appendChild(edDocument.root.render());

    this.updateComplete.then(() => {
      requestAnimationFrame(() => {
        if (!edDocument.root.hasPreviewElements()) {
          this._dropLayer.clear();
          this._dropLayer.buildFromElement(edDocument.root);
          if (edDocument.mutationMeta.storeHistory) {
            this.#history.push(edDocument.root.serialize());
            edDocument.mutationMeta.storeHistory = false;
          }
        }
      });
    });
  }

  #undo() {
    if (this.#history.length > 0) {
      this.#history.pop();
      edDocument.root = elementFactory(
        this.#history.pop() || edDocument.root.serialize(),
      );
      edDocument.mutationMeta.storeHistory = true;
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

    .tree-with-lines {
      --indent-guide-width: 1px;
    }
  `;
}
