import type { VariableTable } from '../types'

interface VariablesSectionProps {
  variables: VariableTable[]
  onAddVariable: () => void
  onRemoveVariable: (tableId: string) => void
  onRenameVariable: (tableId: string, oldName: string, newName: string) => void
  onAddRow: (tableId: string) => void
  onAddColumn: (tableId: string) => void
  onRenameColumn: (
    tableId: string,
    tableName: string,
    columnId: string,
    oldName: string,
    newName: string,
  ) => void
  onUpdateColumnValues: (tableId: string, columnId: string, nextText: string) => void
}

const getRowCount = (table: VariableTable): number =>
  Math.max(1, table.columns.reduce((max, column) => Math.max(max, column.values.length), 0))

export const VariablesSection = ({
  variables,
  onAddVariable,
  onRemoveVariable,
  onRenameVariable,
  onAddRow,
  onAddColumn,
  onRenameColumn,
  onUpdateColumnValues,
}: VariablesSectionProps) => (
  <div className="space-y-4">
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="min-h-11 rounded-md bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        onClick={onAddVariable}
      >
        Add variable
      </button>
    </div>

    {variables.length === 0 ? (
      <p className="text-sm text-slate-700 dark:text-slate-300">No variables yet. Use the template to create them.</p>
    ) : null}

    <div className="space-y-3">
      {variables.map((table) => {
        const rowCount = getRowCount(table)

        return (
          <article
            key={table.id}
            className="rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950"
            style={{ backgroundColor: `${table.color}22` }}
          >
            <header className="mb-3 flex flex-wrap items-end gap-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-100" htmlFor={`variable-${table.id}`}>
                Variable name
              </label>
              <input
                id={`variable-${table.id}`}
                value={table.name}
                onChange={(event) => onRenameVariable(table.id, table.name, event.target.value)}
                className="min-h-11 rounded border border-slate-300 px-3 py-2 font-mono font-semibold dark:border-slate-600 dark:bg-slate-900"
              />
              <button
                type="button"
                className="min-h-11 rounded border border-rose-300 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300"
                onClick={() => onRemoveVariable(table.id)}
              >
                Remove
              </button>
            </header>

            <div className="grid gap-3 lg:grid-cols-2">
              {table.columns.map((column) => (
                <div key={column.id} className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300" htmlFor={`column-${column.id}`}>
                    Column name
                  </label>
                  <input
                    id={`column-${column.id}`}
                    value={column.name}
                    onChange={(event) =>
                      onRenameColumn(table.id, table.name, column.id, column.name, event.target.value)
                    }
                    className="min-h-11 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-900"
                  />

                  <label className="sr-only" htmlFor={`column-values-${column.id}`}>
                    Values for {column.name}
                  </label>
                  <textarea
                    id={`column-values-${column.id}`}
                    value={column.values.join('\n')}
                    onChange={(event) => onUpdateColumnValues(table.id, column.id, event.target.value)}
                    rows={Math.max(3, rowCount)}
                    className="w-full rounded border border-slate-300 p-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
              ))}
            </div>

            <footer className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                onClick={() => onAddRow(table.id)}
              >
                Add row
              </button>
              <button
                type="button"
                className="min-h-11 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                onClick={() => onAddColumn(table.id)}
              >
                Add column
              </button>
            </footer>
          </article>
        )
      })}
    </div>
  </div>
)
