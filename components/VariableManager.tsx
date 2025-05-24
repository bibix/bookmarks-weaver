'use client';

import React, { useState, useEffect } from 'react';

interface Variable {
  id: string;
  name: string;
  value: string;
  type: string;
  values: string[];
  isTable: boolean;
}

interface VariableManagerProps {
  onVariablesChange: (variables: Variable[]) => void;
}

export default function VariableManager({ onVariablesChange }: VariableManagerProps) {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [activeVariable, setActiveVariable] = useState<string | null>(null);

  // Update parent component when variables change
  useEffect(() => {
    onVariablesChange(variables);
  }, [variables, onVariablesChange]);

  // Add a new variable
  const addVariable = (name: string, value: string, type: string) => {
    const id = `var-${Date.now()}`;
    const newVariable: Variable = {
      id,
      name,
      value,
      type,
      values: [value],
      isTable: false
    };

    setVariables(prev => [...prev, newVariable]);
    setActiveVariable(id);
  };

  // Update variable name
  const updateVariableName = (id: string, name: string) => {
    setVariables(prev =>
      prev.map(v => v.id === id ? { ...v, name } : v)
    );
  };

  // Add a value to a variable
  const addValueToVariable = (id: string, value: string) => {
    setVariables(prev =>
      prev.map(v => {
        if (v.id === id) {
          return { ...v, values: [...v.values, value] };
        }
        return v;
      })
    );
  };

  // Remove a value from a variable
  const removeValueFromVariable = (id: string, index: number) => {
    setVariables(prev =>
      prev.map(v => {
        if (v.id === id) {
          const newValues = [...v.values];
          newValues.splice(index, 1);
          return { ...v, values: newValues };
        }
        return v;
      })
    );
  };

  // Toggle between list and table mode
  const toggleVariableMode = (id: string) => {
    setVariables(prev =>
      prev.map(v => {
        if (v.id === id) {
          return { ...v, isTable: !v.isTable };
        }
        return v;
      })
    );
  };

  // Remove a variable
  const removeVariable = (id: string) => {
    setVariables(prev => prev.filter(v => v.id !== id));
    if (activeVariable === id) {
      setActiveVariable(null);
    }
  };

  // Handle pasting values
  const handlePaste = (id: string, e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const lines = pastedText.split(/\r?\n/).filter(line => line.trim());

    setVariables(prev =>
      prev.map(v => {
        if (v.id === id) {
          return { ...v, values: [...v.values, ...lines] };
        }
        return v;
      })
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          Variables
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {variables.length} variable{variables.length !== 1 ? 's' : ''} defined
        </div>
      </div>

      {variables.length === 0 ? (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-soft text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">No variables yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Click on any part of the parsed URL to create a variable.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {variables.map(variable => (
            <div
              key={variable.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:shadow-soft-xl"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: getColorForType(variable.type) }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zm0 3a1 1 0 011-1h12a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={variable.name}
                        onChange={(e) => updateVariableName(variable.id, e.target.value)}
                        className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        aria-label={`Variable name for ${variable.type}`}
                      />
                      <span
                        className="variable-pill text-sm"
                        style={{ backgroundColor: getColorForType(variable.type) }}
                      >
                        {variable.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {variable.values.length} value{variable.values.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVariableMode(variable.id)}
                    className="px-3 py-2 bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-800 transition-colors duration-200 flex items-center gap-1"
                    aria-label={`Switch to ${variable.isTable ? 'list' : 'table'} mode`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      {variable.isTable ? (
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                      )}
                    </svg>
                    {variable.isTable ? 'List Mode' : 'Table Mode'}
                  </button>
                  <button
                    onClick={() => removeVariable(variable.id)}
                    className="p-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                    aria-label={`Remove variable ${variable.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Values</h3>
                  <button
                    onClick={() => addValueToVariable(variable.id, '')}
                    className="px-3 py-2 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200 flex items-center gap-1"
                    aria-label={`Add value to ${variable.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Value
                  </button>
                </div>

                <div
                  className="space-y-3"
                  onPaste={(e) => handlePaste(variable.id, e)}
                >
                  {variable.values.length === 0 ? (
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
                      No values yet. Add a value or paste multiple values.
                    </div>
                  ) : variable.isTable ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="space-y-2">
                        <div className="font-medium text-gray-700 dark:text-gray-300">Column 1</div>
                        <textarea
                          value={variable.values.join('\n')}
                          onChange={(e) => {
                            const newValues = e.target.value.split('\n');
                            setVariables(prev =>
                              prev.map(v => v.id === variable.id ? { ...v, values: newValues } : v)
                            );
                          }}
                          className="w-full p-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                          placeholder="Enter values (one per line)"
                          aria-label={`Values for ${variable.name} column 1`}
                          rows={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium text-gray-700 dark:text-gray-300">Column 2</div>
                        <textarea
                          className="w-full p-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                          placeholder="Enter values (one per line)"
                          aria-label={`Values for ${variable.name} column 2`}
                          rows={5}
                        />
                      </div>
                    </div>
                  ) : (
                    variable.values.map((value, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group">
                        <div className="text-gray-400 dark:text-gray-500 text-sm w-8 text-center">
                          {index + 1}
                        </div>
                        <textarea
                          value={value}
                          onChange={(e) => {
                            const newValues = [...variable.values];
                            newValues[index] = e.target.value;
                            setVariables(prev =>
                              prev.map(v => v.id === variable.id ? { ...v, values: newValues } : v)
                            );
                          }}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                          placeholder="Enter value"
                          aria-label={`Value ${index + 1} for ${variable.name}`}
                          rows={3}
                        />
                        <button
                          onClick={() => removeValueFromVariable(variable.id, index)}
                          className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-lg transition-colors duration-200"
                          aria-label={`Remove value ${index + 1} from ${variable.name}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  <p>Tip: You can paste multiple values at once</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to get color based on variable type
function getColorForType(type: string): string {
  const colorMap: Record<string, string> = {
    'scheme': '#3b82f6', // blue-500
    'domain': '#10b981', // green-500
    'port': '#f59e0b',   // yellow-500
    'path': '#8b5cf6',   // purple-500
    'query-key': '#ef4444',   // red-500
    'query-value': '#ef4444', // red-500
    'fragment': '#f97316'  // orange-500
  };

  return colorMap[type] || '#6b7280'; // gray-500 as default
}
