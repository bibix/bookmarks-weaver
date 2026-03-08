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
        const newRows = [...s.rows];
        // For simplicity, we assume one textarea per column for tables too
        // or one textarea for the whole list
        lines.forEach((line, rowIndex) => {
          if (!newRows[rowIndex]) newRows[rowIndex] = new Array(s.variableIds.length).fill('');
          newRows[rowIndex][colIndex] = line;
        });
        // Remove extra rows if lines decreased
        if (newRows.length > lines.length) {
          newRows.splice(lines.length);
        }
        return { ...s, rows: newRows };
      }
      return s;
    });
    onDataSourcesChange(newSources);
  };

  const removeSource = (id: string) => {
    onDataSourcesChange(dataSources.filter(s => s.id !== id));
  };

  const addTable = () => {
    const newSource: DataSource = {
      id: `source_${Date.now()}`,
      variableIds: [], // User needs to select variables
      rows: [['']]
    };
    onDataSourcesChange([...dataSources, newSource]);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button 
          onClick={addTable}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition border dark:border-gray-700"
        >
          <TableIcon className="w-4 h-4" />
          {t('add_table')}
        </button>
      </div>

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
