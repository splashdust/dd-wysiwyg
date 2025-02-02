import { GdsTextarea } from "@sebgroup/green-core/components/textarea/index.js";
import { html } from "@sebgroup/green-core/scoping";
import { LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { MarkupGenerator } from "../markup-generator";
import { edDocument } from "../app";
import { elementFactory } from "../editor-elements/factory";

@customElement("import-export")
export class ImportExport extends LitElement {
  @state() private _generatedMarkup = "";
  @state() private _serializedJson = "";

  @query("#import-export")
  private _importExport!: GdsTextarea;

  render() {
    return html`<gds-flex flex-direction="column" gap="m">
      <gds-dialog heading="Generated markup">
        <gds-textarea value=${this._generatedMarkup}></gds-textarea>
        <gds-button
          slot="trigger"
          @click=${() => {
            this._generatedMarkup = MarkupGenerator.toMarkup(
              edDocument.root.get(),
            );
          }}
          >Export HTML</gds-button
        >
      </gds-dialog>
      <gds-dialog
        heading="Import/export"
        @gds-close=${(e: CustomEvent) => {
          if (e.detail === "btn-ok") {
            edDocument.root.set(
              elementFactory(JSON.parse(this._importExport.value || "{}")),
            );
          }
        }}
      >
        <gds-textarea
          id="import-export"
          value=${this._serializedJson}
        ></gds-textarea>
        <gds-button
          slot="trigger"
          @click=${() => {
            this._serializedJson = JSON.stringify(
              edDocument.root.get().serialize(),
            );
          }}
          >Import/export JSON</gds-button
        >
      </gds-dialog>
    </gds-flex>`;
  }
}
