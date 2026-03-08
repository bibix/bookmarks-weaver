// Removed zustand import to avoid extra dependency

interface Variable {
  tableName: string;
  columnName?: string;
}

const COLORS = [
  { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' }, // Blue
  { bg: '#dcfce7', text: '#166534', border: '#22c55e' }, // Green
  { bg: '#ffedd5', text: '#9a3412', border: '#f97316' }, // Orange
  { bg: '#f3e8ff', text: '#6b21a8', border: '#a855f7' }, // Violet
  { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }, // Red
  { bg: '#fef9c3', text: '#854d0e', border: '#eab308' }, // Yellow
  { bg: '#ecfeff', text: '#155e75', border: '#06b6d4' }, // Cyan
  { bg: '#fdf2f8', text: '#9d174d', border: '#ec4899' }, // Pink
];

export const appState = {
  fileName: "bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html",
  setFileName: (name: string) => {
    appState.fileName = name;
    appState.notify();
  },
  variables: {} as Record<string, string[][]>,
  variableColors: {} as Record<string, typeof COLORS[0]>,
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
    const newColors = { ...appState.variableColors };
    
    vars.forEach(v => {
      if (!newVariables[v.tableName]) {
        // Assign color
        const usedColors = Object.values(newColors);
        const nextColor = COLORS.find(c => !usedColors.includes(c)) || COLORS[usedColors.length % COLORS.length];
        newColors[v.tableName] = nextColor;

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
    appState.variableColors = newColors;
    appState.notify();
  },
  setVariableData: (tableName: string, rows: string[][]) => {
    appState.variables[tableName] = rows;
    appState.notify();
  },
  renameVariable: (oldName: string, newName: string) => {
    if (oldName === newName || !newName) return;
    
    // 1. Update variables data
    const data = appState.variables[oldName];
    if (data) {
        delete appState.variables[oldName];
        appState.variables[newName] = data;
        
        // If it was a single column table and column name matched table name, rename column too
        const headers = appState.variables[newName][0];
        if (headers.length === 1 && headers[0] === oldName) {
            headers[0] = newName;
        }
    }
    
    // 2. Update colors
    const color = appState.variableColors[oldName];
    if (color) {
        delete appState.variableColors[oldName];
        appState.variableColors[newName] = color;
    }
    
    // 3. Update template
    const newTemplate = JSON.parse(JSON.stringify(appState.template));
    updateTemplateVariables(newTemplate, oldName, newName);
    appState.template = newTemplate;
    
    // 4. Update detected variables
    appState.detectedVariables = extractAllVariables(newTemplate);
    
    appState.notify();
  },
  renameColumn: (tableName: string, oldColName: string, newColName: string) => {
    if (oldColName === newColName || !newColName) return;
    
    const data = appState.variables[tableName];
    if (data) {
        const headers = data[0];
        const index = headers.indexOf(oldColName);
        if (index !== -1) {
            headers[index] = newColName;
            
            // Update template
            const newTemplate = JSON.parse(JSON.stringify(appState.template));
            updateTemplateVariables(newTemplate, tableName, tableName, oldColName, newColName);
            appState.template = newTemplate;
            appState.detectedVariables = extractAllVariables(newTemplate);
        }
    }
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

function updateTemplateVariables(blocks: any[], oldTableName: string, newTableName: string, oldColName?: string, newColName?: string) {
    function traverse(obj: any, parent: any, key: any) {
        if (typeof obj === 'string') {
            const regex = /{{([#\/]?)\s*([a-zA-Z0-9._]+)\s*}}/g;
            let changed = false;
            const newStr = obj.replace(regex, (match, prefix, full) => {
                if (full.startsWith('/') || full.startsWith('#')) return match;
                const parts = full.split('.');
                const tableName = parts[0];
                const colName = parts[1];
                
                if (tableName === oldTableName) {
                    if (oldColName) {
                        if (colName === oldColName) {
                            changed = true;
                            return `{{${prefix} ${newTableName}.${newColName} }}`;
                        }
                    } else {
                        changed = true;
                        if (parts.length === 1) {
                            return `{{${prefix} ${newTableName} }}`;
                        } else {
                            return `{{${prefix} ${newTableName}.${colName} }}`;
                        }
                    }
                }
                return match;
            });
            if (changed) {
                parent[key] = newStr;
            }
        } else if (Array.isArray(obj)) {
            obj.forEach((v, i) => traverse(v, obj, i));
        } else if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(k => traverse(obj[k], obj, k));
        }
    }
    traverse(blocks, null, null);
}
