export type ReplacementMap = Record<string, string>;

export interface DataSource {
  id: string;
  variableIds: string[]; // For list, one ID. For table, multiple IDs.
  rows: string[][];
}

export const generateCombinations = (
  template: string,
  sources: DataSource[]
): string[] => {
  if (sources.length === 0) return [template];

  // Get sets of replacement maps from each source
  const mapsPerSource: ReplacementMap[][] = sources.map(source => {
    return source.rows.map(row => {
      const map: ReplacementMap = {};
      source.variableIds.forEach((varId, colIndex) => {
        map[varId] = row[colIndex] || '';
      });
      return map;
    });
  });

  // Cartesian product of maps
  const cartesian = (sets: ReplacementMap[][]): ReplacementMap[] => {
    return sets.reduce((a, b) => {
      return a.flatMap(d => b.map(e => ({ ...d, ...e })));
    }, [{}]);
  };

  const combinedMaps = cartesian(mapsPerSource);

  // Apply each map to the template
  return combinedMaps.map(map => {
    let result = template;
    Object.entries(map).forEach(([varId, value]) => {
      // Use a special placeholder format for variables in the template
      // e.g., {{VAR_ID}}
      const placeholder = `{{${varId}}}`;
      // Replace all occurrences
      result = result.split(placeholder).join(value);
    });
    return result;
  });
};
