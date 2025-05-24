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
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-xl font-bold mb-4">Variables</h2>

      {variables.length === 0 ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p>No variables yet. Click on any part of the parsed URL to create a variable.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {variables.map(variable => (
            <div
              key={variable.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={variable.name}
                    onChange={(e) => updateVariableName(variable.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md"
                    aria-label={`Variable name for ${variable.type}`}
                  />
                  <span
                    className="variable-pill"
                    style={{ backgroundColor: getColorForType(variable.type) }}
                  >
                    {variable.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVariableMode(variable.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    aria-label={`Switch to ${variable.isTable ? 'list' : 'table'} mode`}
                  >
                    {variable.isTable ? 'Switch to List' : 'Switch to Table'}
                  </button>
                  <button
                    onClick={() => removeVariable(variable.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    aria-label={`Remove variable ${variable.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">Values:</h3>
                  <button
                    onClick={() => addValueToVariable(variable.id, '')}
                    className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    aria-label={`Add value to ${variable.name}`}
                  >
                    Add Value
                  </button>
                </div>

                <div
                  className="pl-4 space-y-2"
                  onPaste={(e) => handlePaste(variable.id, e)}
                >
                  {variable.values.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const newValues = [...variable.values];
                          newValues[index] = e.target.value;
                          setVariables(prev =>
                            prev.map(v => v.id === variable.id ? { ...v, values: newValues } : v)
                          );
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                        placeholder="Enter value"
                        aria-label={`Value ${index + 1} for ${variable.name}`}
                      />
                      <button
                        onClick={() => removeValueFromVariable(variable.id, index)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        aria-label={`Remove value ${index + 1} from ${variable.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
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
