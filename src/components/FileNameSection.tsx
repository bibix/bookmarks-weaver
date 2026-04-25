interface FileNameSectionProps {
  label: string
  helperText: string
  value: string
  onChange: (nextValue: string) => void
}

export const FileNameSection = ({ label, helperText, value, onChange }: FileNameSectionProps) => (
  <div className="space-y-2">
    <label htmlFor="output-filename" className="block text-sm font-medium text-slate-800 dark:text-slate-100">
      {label}
    </label>
    <p id="output-filename-help" className="text-sm text-slate-700 dark:text-slate-300">
      {helperText}
    </p>
    <input
      id="output-filename"
      aria-describedby="output-filename-help"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
      placeholder="bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html"
    />
  </div>
)
