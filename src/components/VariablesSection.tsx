import React, { useEffect, useState, useMemo } from 'react';
import { appState } from '../store';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteSchema, defaultBlockSpecs, defaultInlineContentSpecs } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { Edit2, Check, X } from "lucide-react";

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(tableName);
  const color = appState.variableColors[tableName];
  
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
          const rows = (tableBlock.content as any).rows.map((row: any) => 
            row.cells.map((cell: any) => 
              cell.map((inline: any) => inline.type === 'text' ? inline.text : '').join('')
            )
          );
          
          // Check if headers changed (renamed column)
          const currentData = appState.variables[tableName];
          if (currentData) {
              const oldHeaders = currentData[0];
              const newHeaders = rows[0];
              newHeaders.forEach((newH: string, i: number) => {
                  const oldH = oldHeaders[i];
                  if (oldH && newH && oldH !== newH) {
                      appState.renameColumn(tableName, oldH, newH);
                  }
              });
          }

          // Update data if different
          if (JSON.stringify(currentData) !== JSON.stringify(rows)) {
             appState.setVariableData(tableName, rows);
          }
        }
      });
      return unsub;
    }
  }, [editor, tableName]);

  const handleRename = () => {
    if (newName && newName !== tableName) {
        appState.renameVariable(tableName, newName);
    }
    setIsEditingName(false);
  };
  
  return (
    <div 
        className="border-2 rounded-xl overflow-hidden shadow-md transition-all"
        style={{ borderColor: color?.border, backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white' }}
    >
      <div 
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ backgroundColor: color?.bg, color: color?.text }}
      >
        <div className="flex items-center gap-3">
          <span className="bg-white/40 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-black/5">Table</span>
          {isEditingName ? (
            <div className="flex items-center gap-2">
                <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/80 text-sm px-2 py-1 rounded border-none focus:ring-2 focus:ring-primary outline-none text-black"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
                <button onClick={handleRename} className="p-1 hover:bg-black/10 rounded"><Check className="w-4 h-4"/></button>
                <button onClick={() => {setIsEditingName(false); setNewName(tableName);}} className="p-1 hover:bg-black/10 rounded"><X className="w-4 h-4"/></button>
            </div>
          ) : (
            <h3 className="font-bold flex items-center gap-2 text-lg">
              {tableName}
              <button onClick={() => setIsEditingName(true)} className="p-1 hover:bg-black/10 rounded opacity-60 hover:opacity-100 transition-opacity">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </h3>
          )}
        </div>
      </div>
      <div className="p-4 variable-table-container">
        <style>{`
            .variable-table-container [data-content-type="table"] table th,
            .variable-table-container [data-content-type="table"] tr:first-child td {
                background-color: ${color?.bg}88 !important;
                font-weight: bold !important;
                font-family: monospace !important;
            }
        `}</style>
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
