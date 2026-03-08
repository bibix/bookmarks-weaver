// Removed zustand import to avoid extra dependency

interface Variable {
  tableName: string;
  columnName?: string;
}

export const appState = {
  fileName: "bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html",
  setFileName: (name: string) => {
    appState.fileName = name;
    appState.notify();
  },
  variables: {} as Record<string, string[][]>,
  detectedVariables: [] as Variable[],
  template: [] as any[], // BlockNote blocks
  theme: "light" as "light" | "dark",
  setTheme: (theme: "light" | "dark") => {
    appState.theme = theme;
    appState.notify();
  },
  setTemplate: (blocks: any[]) => {
    appState.template = blocks;
    const vars = extractAllVariables(blocks);
    appState.detectedVariables = vars;
    
    // Sync variables data
    const newVariables = { ...appState.variables };
    vars.forEach(v => {
      if (!newVariables[v.tableName]) {
        // Initialize new table with headers
        if (v.columnName) {
            newVariables[v.tableName] = [[v.columnName], [""]];
        } else {
            newVariables[v.tableName] = [[v.tableName], [""]];
        }
      } else {
        // Ensure column exists in headers
        const headers = newVariables[v.tableName][0];
        const colName = v.columnName || v.tableName;
        if (!headers.includes(colName)) {
            headers.push(colName);
            // Add empty cell to all data rows
            for (let i = 1; i < newVariables[v.tableName].length; i++) {
                newVariables[v.tableName][i].push("");
            }
        }
      }
    });
    appState.variables = newVariables;
    appState.notify();
  },
  setVariableData: (tableName: string, rows: string[][]) => {
    appState.variables[tableName] = rows;
    appState.notify();
  },
  listeners: [] as (() => void)[],
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  notify() {
    this.listeners.forEach(l => l());
  }
};

function extractAllVariables(blocks: any[]): Variable[] {
  const variables: Variable[] = [];
  
  function traverse(obj: any) {
    if (typeof obj === 'string') {
      const regex = /{{[#\/]?\s*([a-zA-Z0-9._]+)\s*}}/g;
      let match;
      while ((match = regex.exec(obj)) !== null) {
        const full = match[1];
        if (full.startsWith('/') || full.startsWith('#')) continue;
        const parts = full.split('.');
        const tableName = parts[0];
        const builtIns = ["yyyy", "mm", "dd"];
        if (builtIns.includes(tableName)) continue;

        if (parts.length === 1) {
          variables.push({ tableName });
        } else if (parts.length === 2) {
          variables.push({ tableName, columnName: parts[1] });
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(traverse);
    }
  }

  traverse(blocks);
  
  return variables.filter((v, index, self) =>
    index === self.findIndex((t) => t.tableName === v.tableName && t.columnName === v.columnName)
  );
}
