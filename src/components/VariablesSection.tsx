import React, { useEffect, useState, useMemo } from 'react';
import { appState } from '../store';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteSchema, defaultBlockSpecs, defaultInlineContentSpecs } from "@blocknote/core";
import "@blocknote/mantine/style.css";

const tableSchema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    table: defaultBlockSpecs.table,
  },
  inlineContentSpecs: {
    text: defaultInlineContentSpecs.text,
    link: defaultInlineContentSpecs.link,
  },
  styleSpecs: {},
});

function VariableTable({ tableName }: { tableName: string }) {
  const [theme, setTheme] = useState(appState.theme);
  
  const initialData = useMemo(() => {
    const data = appState.variables[tableName] || [[tableName], [""]];
    return {
      type: "table" as const,
      content: {
        type: "tableContent" as const,
        rows: data.map(row => ({
          cells: row.map(cell => [{ type: "text" as const, text: cell, styles: {} }])
        }))
      }
    };
  }, [tableName]);

  const editor = useCreateBlockNote({
    schema: tableSchema,
    initialContent: [initialData],
  });

  useEffect(() => {
    return appState.subscribe(() => {
      setTheme(appState.theme);
    });
  }, []);

  useEffect(() => {
    if (editor) {
      const unsub = editor.onChange(() => {
        const tableBlock = editor.document.find(b => b.type === 'table');
        if (tableBlock && tableBlock.content && typeof tableBlock.content === 'object' && 'rows' in tableBlock.content) {
          const rows = tableBlock.content.rows.map(row => 
            row.cells.map(cell => 
              cell.map(inline => inline.type === 'text' ? (inline as any).text : '').join('')
            )
          );
          // Only update if different to avoid loops
          const currentData = appState.variables[tableName];
          if (JSON.stringify(currentData) !== JSON.stringify(rows)) {
             appState.setVariableData(tableName, rows);
          }
        }
      });
      return unsub;
    }
  }, [editor, tableName]);
  
  return (
    <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
      <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
        <h3 className="font-bold text-primary flex items-center gap-2">
          <span className="bg-primary/10 px-2 py-0.5 rounded text-xs">Table</span>
          {tableName}
        </h3>
      </div>
      <div className="p-2">
        <BlockNoteView 
          editor={editor} 
          theme={theme}
          sideMenu={false}
          formattingToolbar={false}
          emojiPicker={false}
        />
      </div>
    </div>
  );
}

export function VariablesSection() {
  const [detectedVars, setDetectedVars] = useState(appState.detectedVariables);

  useEffect(() => {
    return appState.subscribe(() => {
      setDetectedVars(appState.detectedVariables);
    });
  }, []);

  const tableNames = Array.from(new Set(detectedVars.map(v => v.tableName)));

  return (
    <div className="grid gap-8">
      {tableNames.map(name => (
        <VariableTable key={name} tableName={name} />
      ))}
      {tableNames.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
           <p className="text-muted-foreground font-medium">No variables detected in template yet.</p>
           <p className="text-sm text-muted-foreground/70 mt-1">Add variables like {"{{ name }}"} or {"{{ table.column }}"} to your template.</p>
        </div>
      )}
    </div>
  );
}
