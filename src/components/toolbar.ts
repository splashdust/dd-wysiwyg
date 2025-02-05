import { html } from "@sebgroup/green-core/scoping";
import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import "@sebgroup/green-core/components/icon/icons/arrow-rotate-clockwise.js";
import "@sebgroup/green-core/components/icon/icons/arrow-rotate-counter-clockwise.js";

@customElement("ed-toolbar")
export class EdToolbar extends LitElement {
  render() {
    return html`<gds-flex
      gap="m"
      padding="m"
      border="0 0 4xs 0"
      border-color="primary"
      background="primary"
      height="75px"
      align-items="center"
    >
      <gds-button
        rank="secondary"
        @click=${() =>
          this.dispatchEvent(new CustomEvent("ed-undo", { bubbles: true }))}
      >
        <gds-icon-arrow-rotate-counter-clockwise
          slot="lead"
        ></gds-icon-arrow-rotate-counter-clockwise>
        Undo
      </gds-button>
      <gds-button
        rank="secondary"
        @click=${() =>
          this.dispatchEvent(new CustomEvent("ed-redo", { bubbles: true }))}
      >
        <gds-icon-arrow-rotate-clockwise
          slot="lead"
        ></gds-icon-arrow-rotate-clockwise>
        Redo
      </gds-button>
      <gds-segmented-control size="small" value="edit" @change=${(e: Event) => {
        this.dispatchEvent(
          new CustomEvent("ed-mode", { bubbles: true, detail: { value: (e.target as any).value } })
        );
      }}>
        <gds-segment value="edit">Edit</gds-segment>
        <gds-segment value="preview">Preview</gds-segment>
      </gds-segmented-control>
      <gds-dropdown
        label="Design version"
        hide-label
        size="small"
        value="2023"
        @change=${(e: Event) => 
          this.dispatchEvent(
            new CustomEvent("ed-design-version",
              { bubbles: true, detail: { value: (e.target as any).value } }
            )
          )
        }>
        <gds-option value="2023">2023</gds-option>
        <gds-option value="2016">2016</gds-option>
      </gds-dropdown>
    </gds-flex>`;
  }
}
