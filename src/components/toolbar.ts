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
      <!-- <gds-segmented-control size="small" style="width:300px" value="preview">
        <gds-segment value="preview">Preview</gds-segment>
        <gds-segment value="edit">Edit</gds-segment>
      </gds-segmented-control> -->
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
    </gds-flex>`;
  }
}
