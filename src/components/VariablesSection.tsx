import React, { useEffect, useState } from 'react';
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
  },
  styleSpecs: {},
});

export function VariableTable({ tableName }: { tableName: string }) {
  const [theme, setTheme] = useState(appState.theme);
  const editor = useCreateBlockNote({
    schema: tableSchema,
    initialContent: [
      {
        type: "table",
        content: [],
      },
    ],
  });

  useEffect(() => {
    return appState.subscribe(() => {
      setTheme(appState.theme);
    });
  }, []);
  
  return (
    <div className="border rounded-md p-2 bg-card">
      <h3 className="font-semibold mb-2">{tableName}</h3>
      <BlockNoteView 
        editor={editor} 
        theme={theme}
        sideMenu={false}
        formattingToolbar={false}
        emojiPicker={false}
      />
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
    <div className="grid gap-6">
      {tableNames.map(name => (
        <VariableTable key={name} tableName={name} />
      ))}
      {tableNames.length === 0 && (
        <p className="text-muted-foreground italic">No variables detected in template yet.</p>
      )}
    </div>
  );
}
