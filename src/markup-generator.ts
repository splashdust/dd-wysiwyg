import { EdElementData } from "./ed-element";

export class MarkupGenerator {
  static toMarkup(document: EdElementData): string {
    let output = "";
    output += `<${document.tag}`;
    for (const [key, value] of Object.entries(document.attributes)) {
      output += ` ${key}="${value}"`;
    }
    output += ">";
    if (document.text) {
      output += document.text;
    }
    for (const child of document.children) {
      output += MarkupGenerator.toMarkup(child);
    }
    output += `</${document.tag}>`;
    return output;
  }
}
