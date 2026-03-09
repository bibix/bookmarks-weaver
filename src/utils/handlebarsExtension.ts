import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import Handlebars from "handlebars";
import { appState } from "../store";

export const HandlebarsHighlighter = Extension.create({
  name: "handlebarsHighlighter",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("handlebarsHighlighter"),
        state: {
          init(_, { doc }) {
            return findHandlebars(doc);
          },
          apply(tr, oldState) {
            return (tr.docChanged || tr.getMeta("forceUpdateHandlebars")) ? findHandlebars(tr.doc) : oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function findHandlebars(doc: any) {
  const decorations: Decoration[] = [];
  const regex = /{{[#\/]?\s*([a-zA-Z0-9._]+)\s*}}/g;
  
  // We need to know which variables are defined
  const definedVariables = appState.variables;
  const builtIns = ["yyyy", "mm", "dd"];

  doc.descendants((node: any, pos: any) => {
    if (node.isText) {
      const text = node.text;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const start = pos + match.index;
        const end = start + match[0].length;
        const raw = match[1];
        
        if (raw.startsWith('/') || raw.startsWith('#')) continue;

        let isValid = true;
        try {
          Handlebars.precompile(match[0]);
        } catch (e) {
          isValid = false;
        }

        let isMissing = false;
        if (isValid) {
            const parts = raw.split('.');
            const tableName = parts[0];
            const columnName = parts[1];
            
            if (!builtIns.includes(tableName)) {
                if (!definedVariables[tableName]) {
                    isMissing = true;
                } else if (columnName) {
                    const headers = definedVariables[tableName][0];
                    if (!headers.includes(columnName)) {
                        isMissing = true;
                    }
                }
            }
        }

        if (!isValid) {
          decorations.push(Decoration.inline(start, end, { class: "hb-invalid" }));
        } else if (isMissing) {
          decorations.push(Decoration.inline(start, end, { class: "hb-missing" }));
        } else {
            const parts = raw.split('.');
            const tableName = parts[0];
            const colName = parts[1];
            const color = appState.getColumnColor(tableName, colName);
            if (color) {
                decorations.push(Decoration.inline(start, end, { 
                    class: "variable-tag",
                    style: `background-color: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border};` 
                }));
            }
        }
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}
