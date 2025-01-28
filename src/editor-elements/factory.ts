import { EdButtonElement } from "./button";
import { EdCardElement } from "./card";
import { EdElement, EdElementData } from "./ed-element";
import { EdFlexElement } from "./flex";
import { EdRichTextElement } from "./rich-text";

export function elementFactory(data: Partial<EdElementData>): EdElement {
  switch (data.tag) {
    case "gds-flex":
      return new EdFlexElement(data);
    case "gds-card":
      return new EdCardElement(data);
    case "gds-button":
      return new EdButtonElement(data);
    case "gds-rich-text":
      return new EdRichTextElement(data);
    default:
      return new EdElement(data);
  }
}
