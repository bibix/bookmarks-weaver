export type VariableType = 'list' | 'table';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  values: string[][]; // For list, it's [[row1], [row2], ...]. For table, it's [[c1r1, c2r1], [c1r2, c2r2], ...].
}

export interface AppState {
  rawUrl: string;
  variables: Variable[];
  // Other potential state like current theme, etc.
}
