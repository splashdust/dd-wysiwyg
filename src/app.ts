import { LitElement, css } from "lit";
import { customElement, query } from "lit/decorators.js";

import { html } from "@sebgroup/green-core/scoping";

import "@sebgroup/green-core/components/index.js";
import "@sebgroup/green-core/components/dialog/index.js";

import "./components/drop-layer";
import type { DropLayer } from "./components/drop-layer";

import "./components/palette";
import "./components/document-properties";
import "./components/ai-generate";
import "./components/import-export";

import { elementFactory } from "./ed-element";

import { SignalWatcher } from "@lit-labs/signals";
import { SignalObject } from "signal-utils/object";
import { effect } from "signal-utils/subtle/microtask-effect";

export const edDocument = new SignalObject({
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

  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      effect(() => {
        this.#renderDocument();
      });
    });
  }

  render() {
    return html`<gds-flex width="100%" height="100%">
        <gds-flex
          flex="0 0 300px"
          border="0 4xs 0 0"
          padding="m"
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
      if (!edDocument.root.hasPreviewElements()) {
        this._dropLayer.clear();
        this._dropLayer.buildFromElement(edDocument.root);
      }
    });
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
