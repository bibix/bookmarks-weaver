import Handlebars from 'handlebars';

export interface HandlebarsVariable {
  tableName: string;
  columnName?: string;
  raw: string;
}

export const extractVariables = (template: string): HandlebarsVariable[] => {
  const regex = /{{[#\/]?\s*([a-zA-Z0-9._]+)\s*}}/g;
  const variables: HandlebarsVariable[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const raw = match[1];
    if (raw.startsWith('/') || raw.startsWith('#')) continue;
    
    const parts = raw.split('.');
    if (parts.length === 1) {
      variables.push({ tableName: parts[0], raw });
    } else if (parts.length === 2) {
      variables.push({ tableName: parts[0], columnName: parts[1], raw });
    }
  }

  // Remove duplicates
  return variables.filter((v, index, self) =>
    index === self.findIndex((t) => t.tableName === v.tableName && t.columnName === v.columnName)
  );
};

export const validateHandlebars = (template: string): { isValid: boolean; error?: string } => {
  try {
    Handlebars.precompile(template);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.message };
  }
};
