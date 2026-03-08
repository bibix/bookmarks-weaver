import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Table as TableIcon, List as ListIcon, PlusCircle } from 'lucide-react';
import { DataSource } from '../utils/combinator';
import { Variable } from '../types';

interface VariablesSectionProps {
  dataSources: DataSource[];
  onDataSourcesChange: (sources: DataSource[]) => void;
  variables: Variable[];
}

const VariablesSection: React.FC<VariablesSectionProps> = ({ 
  dataSources, 
  onDataSourcesChange,
  variables 
}) => {
  const { t } = useTranslation();

  const handleUpdateRows = (id: string, text: string, colIndex: number) => {
    const lines = text.split('\n');
    const newSources = dataSources.map(s => {
      if (s.id === id) {
        // Find max lines across all columns (including the current update)
        // We need to check other textareas' current values or use source.rows
        // Let's just update the rows first
        const newRows = [...s.rows.map(row => [...row])];
        
        // Ensure we have enough rows
        while (newRows.length < lines.length) {
          newRows.push(new Array(s.variableIds.length).fill(''));
        }
        
        // Update the specific column
        lines.forEach((line, rowIndex) => {
          newRows[rowIndex][colIndex] = line;
        });

        // After update, some rows might be empty across all columns if we decreased lines in this column
        // But wait, the requirement says "Each column can be pasted separately", 
        // which usually implies they should stay in sync by index.
        // If I paste 10 lines into Col A and then 5 lines into Col B, 
        // Row 6-10 will have Col A value and empty Col B. This is correct.
        // If I then change Col A to 5 lines, rows 6-10 should probably be removed if they are empty in ALL columns.
        
        // For simplicity and following "automatic update", let's keep all rows that have at least one value
        const filteredRows = newRows.filter((row, rowIndex) => {
          if (rowIndex < lines.length) return true; // Keep rows updated by current paste
          return row.some(cell => cell.trim() !== ''); // Keep rows that have other data
        });

        return { ...s, rows: filteredRows };
      }
      return s;
    });
    onDataSourcesChange(newSources);
  };

  const removeSource = (id: string) => {
    onDataSourcesChange(dataSources.filter(s => s.id !== id));
  };

  const addList = () => {
    const newSource: DataSource = {
      id: `source_${Date.now()}`,
      variableIds: variables.length > 0 ? [variables[0].id] : [],
      rows: [['']]
    };
    onDataSourcesChange([...dataSources, newSource]);
  };

  const addTable = () => {
    const newSource: DataSource = {
      id: `source_${Date.now()}`,
      variableIds: variables.length >= 2 ? [variables[0].id, variables[1].id] : (variables.length > 0 ? [variables[0].id] : []),
      rows: [['', '']]
    };
    onDataSourcesChange([...dataSources, newSource]);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button 
          onClick={addList}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition border dark:border-gray-700"
        >
          <ListIcon className="w-4 h-4 text-teal-600" />
          {t('add_list', 'Add List')}
        </button>
        <button 
          onClick={addTable}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition border dark:border-gray-700"
        >
          <TableIcon className="w-4 h-4 text-teal-600" />
          {t('add_table', 'Add Table')}
        </button>
      </div>

      {variables.length === 0 && (
        <div className="p-8 border-2 border-dashed rounded-xl text-center text-gray-400 dark:border-gray-700">
          {t('no_variables_instruction', 'Select some text in the URL to create variables first.')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dataSources.map(source => {
          const isTable = source.variableIds.length > 1;
          
          return (
            <div key={source.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isTable ? <TableIcon className="w-4 h-4" /> : <ListIcon className="w-4 h-4" />}
                  <span className="font-semibold">
                    {source.variableIds.map(vid => variables.find(v => v.id === vid)?.name || vid).join(', ')}
                  </span>
                </div>
                <button 
                  onClick={() => removeSource(source.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                {source.variableIds.map((vid, colIndex) => (
                  <div key={vid} className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <select 
                        value={vid}
                        onChange={(e) => {
                          const newSources = dataSources.map(s => {
                            if (s.id === source.id) {
                              const newVids = [...s.variableIds];
                              newVids[colIndex] = e.target.value;
                              return { ...s, variableIds: newVids };
                            }
                            return s;
                          });
                          onDataSourcesChange(newSources);
                        }}
                        className="text-xs font-bold text-teal-600 bg-transparent outline-none"
                      >
                        {variables.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => {
                          const newSources = dataSources.map(s => {
                            if (s.id === source.id) {
                              const newVids = s.variableIds.filter((_, i) => i !== colIndex);
                              const newRows = s.rows.map(row => row.filter((_, i) => i !== colIndex));
                              return { ...s, variableIds: newVids, rows: newRows };
                            }
                            return s;
                          });
                          onDataSourcesChange(newSources);
                        }}
                        className="text-[10px] text-gray-400 hover:text-red-500"
                      >
                        Remove Col
                      </button>
                    </div>
                    <textarea
                      className="w-full p-3 border rounded-md dark:bg-gray-900 dark:border-gray-700 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                      rows={5}
                      value={source.rows.map(row => row[colIndex] || '').join('\n')}
                      onChange={(e) => handleUpdateRows(source.id, e.target.value, colIndex)}
                    />
                  </div>
                ))}
                <div className="flex flex-col justify-center">
                  <button 
                    onClick={() => {
                      if (variables.length === 0) return;
                      const newSources = dataSources.map(s => {
                        if (s.id === source.id) {
                          return { 
                            ...s, 
                            variableIds: [...s.variableIds, variables[0].id],
                            rows: s.rows.map(row => [...row, ''])
                          };
                        }
                        return s;
                      });
                      onDataSourcesChange(newSources);
                    }}
                    className="p-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md text-gray-400 hover:border-teal-500 hover:text-teal-500 transition"
                    title="Add column"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VariablesSection;
