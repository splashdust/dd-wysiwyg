import { html } from "@sebgroup/green-core/scoping";
import { edDocument } from "../app";
import { EdElement, EdElementData } from "./ed-element";

export class EdButtonElement extends EdElement {
  constructor(data: Partial<EdElementData>) {
    super({ ...data, tag: "gds-button" });
  }

  renderPropertyPanel() {
    return html`
        <gds-input
            label="Text content"
            value=${this.text}
            @input=${(e: any) => {
              this.text = e.target.value;
            }}
        /></gds-input>
        <gds-dropdown
        size="small"
        label="Rank"
        value=${this.attributes["rank"] || "primary"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            rank: e.target.value,
          };
        }}
      >
        <gds-option value="primary">Primary</gds-option>
        <gds-option value="secondary">Secondary</gds-option>
        <gds-option value="tertiary">Tertiary</gds-option>
      </gds-dropdown>
      <gds-dropdown
        size="small"
        label="Variant"
        value=${this.attributes["variant"] || "neutral"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            variant: e.target.value,
          };
        }}
      >
        <gds-option value="neutral">Neutral</gds-option>
        <gds-option value="positive">Positive</gds-option>
        <gds-option value="negative">Negative</gds-option>
      </gds-dropdown>
      <gds-dropdown
        size="small"
        label="Size"
        value=${this.attributes["size"] || "medium"}
        @input=${(e: any) => {
          this.attributes = {
            ...this.attributes,
            size: e.target.value,
          };
        }}
      >
        <gds-option value="xs">Extra small</gds-option>
        <gds-option value="small">Small</gds-option>
        <gds-option value="medium">Medium</gds-option>
        <gds-option value="large">Large</gds-option>
      </gds-dropdown>
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
        ></gds-textarea>`;
  }
}
