import type { Node } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { nodes, schema } from "prosemirror-schema-basic";
import type { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { ProseMirrorFieldView } from "./ProseMirrorFieldView";

export class TextFieldView extends ProseMirrorFieldView {
  public static propName = "text" as const;

  constructor(
    // The node that this FieldView is responsible for rendering.
    node: Node,
    // The outer editor instance. Updated from within this class when the inner state changes.
    outerView: EditorView,
    // Returns the current position of the parent FieldView in the document.
    getPos: () => number,
    // The offset of this node relative to its parent FieldView.
    offset: number,
    // The initial decorations for the FieldView.
    decorations: DecorationSet | Decoration[]
  ) {
    const textSchema = new Schema({
      nodes: {
        doc: nodes.doc,
        paragraph: nodes.paragraph,
        text: nodes.text,
      },
    });
    super(
      node,
      outerView,
      getPos,
      offset,
      textSchema,
      decorations,
      TextFieldView.propName
    );
  }
}
