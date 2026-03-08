// Removed zustand import to avoid extra dependency

interface Variable {
  tableName: string;
  columnName?: string;
}

interface AppState {
  fileName: string;
  setFileName: (name: string) => void;
  variables: Record<string, string[][]>; // tableName -> rows (header is first row)
  setVariables: (vars: Record<string, string[][]>) => void;
  detectedVariables: Variable[];
  setDetectedVariables: (vars: Variable[]) => void;
}

// Simple store using standard React context or a lightweight lib
// Since I can't install new libs easily (I can but let's keep it simple), 
// I'll just use a simple event emitter or React context.
// Actually, I'll use a simple global object for now since it's a small app.

export const appState = {
  fileName: "bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html",
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
    // Extract variables and update detectedVariables
    const text = JSON.stringify(blocks); // Simplified extraction
    // Actually, I should traverse blocks
    const vars = extractAllVariables(blocks);
    appState.detectedVariables = vars;
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
  const text = JSON.stringify(blocks);
  const regex = /{{[#\/]?\s*([a-zA-Z0-9._]+)\s*}}/g;
  const variables: Variable[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
      const parts = match[1].split('.');
      if (parts[0].startsWith('/') || parts[0].startsWith('#')) continue;
      variables.push({ tableName: parts[0], columnName: parts[1] });
  }
  return variables.filter((v, index, self) =>
    index === self.findIndex((t) => t.tableName === v.tableName && t.columnName === v.columnName)
  );
}
