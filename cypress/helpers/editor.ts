import { Plugin } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { Decoration, DecorationSet } from "prosemirror-view";
import { embedWrapperTestId } from "../../src/mounters/react/EmbedWrapper";
import { getNestedViewTestId } from "../../src/mounters/react/NestedEditorView";
import { docToHtml } from "../../src/prosemirrorSetup";

export const selectDataCy = (id: string) => `[data-cy=${id}]`;

export const getElementType = (element: JQuery) => {
  if (element.prop("tagName") === "P") {
    return "paragraph";
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it's not always truthy.
  if (element.find(selectDataCy(embedWrapperTestId))[0]) {
    return "embed";
  }
  return "unknown";
};

export const addEmbed = () => cy.get("#embed").click();

export const typeIntoProsemirror = (content: string) =>
  cy.get(`.ProseMirror`).type(content);

export const getEmbedField = (fieldName: string) =>
  cy.get(`div${selectDataCy(getNestedViewTestId(fieldName))} .ProseMirror`);

export const getEmbedMenu = (fieldName: string) =>
  cy.get(
    `div${selectDataCy(getNestedViewTestId(fieldName))} .ProseMirror-menubar`
  );

export const getEmbedMenuButton = (fieldName: string, buttonTitle: string) =>
  cy.get(
    `div${selectDataCy(
      getNestedViewTestId(fieldName)
    )} .ProseMirror-menubar [title="${buttonTitle}"]`
  );

// If we don't focus the nested RTE we're typing into before type() is called,
// Cypress tends to type into the parent RTE instead.
export const typeIntoEmbedField = (fieldName: string, content: string) =>
  getEmbedField(fieldName).focus().type(content);

export const getArrayOfBlockElementTypes = () => {
  // eslint-disable-next-line prefer-const -- it is used.
  let elementTypes = [] as string[];
  return new Cypress.Promise((resolve) => {
    cy.get("#editor > .ProseMirror-menubar-wrapper > .ProseMirror")
      .children()
      .each(($el) => elementTypes.push(getElementType($el)))
      .then(() => resolve(elementTypes));
  });
};

export const assertDocHtml = (expectedHtml: string) =>
  cy.window().then((win) => {
    const actualHtml = docToHtml(
      ((win as unknown) as { view: EditorView }).view.state.doc
    );
    expect(expectedHtml).to.equal(actualHtml);
  });

export const addTestDecorationPlugin = new Plugin({
  props: {
    decorations: (state) => {
      const decorateThisPhrase = "deco";
      const ranges = [] as Array<[number, number]>;
      state.doc.descendants((node, offset) => {
        if (node.isLeaf && node.textContent) {
          const indexOfDeco = node.textContent.indexOf(decorateThisPhrase);
          if (indexOfDeco !== -1) {
            ranges.push([
              indexOfDeco + offset,
              indexOfDeco + offset + decorateThisPhrase.length,
            ]);
          }
        }
      });

      return DecorationSet.create(
        state.doc,
        ranges.map(([from, to]) =>
          Decoration.inline(from, to, { class: "TestDecoration" })
        )
      );
    },
  },
});