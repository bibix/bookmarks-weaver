import { useMemo } from 'react'

import { parseUrl } from '../lib/urlParser'

interface UrlParserSectionProps {
  value: string
  onChange: (nextValue: string) => void
}

const Pill = ({ className, label }: { className: string; label: string }) => (
  <span className={`rounded px-2 py-1 text-sm font-medium ${className}`}>{label}</span>
)

export const UrlParserSection = ({ value, onChange }: UrlParserSectionProps) => {
  const parsedUrl = useMemo(() => parseUrl(value), [value])

  return (
    <div className="space-y-3">
      <label htmlFor="url-parser-input" className="block text-sm font-medium text-slate-800 dark:text-slate-100">
        URL input
      </label>
      <input
        id="url-parser-input"
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-gray-300 p-3 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        placeholder="https://example.com:3000/folder?tag=dev&env=prod#section"
      />

      <div className="flex flex-wrap gap-2" role="status" aria-live="polite">
        {parsedUrl ? (
          <>
            <Pill className="bg-blue-300 text-blue-900" label={`scheme: ${parsedUrl.scheme}`} />
            <Pill className="bg-green-200 text-green-900" label={`domain: ${parsedUrl.domain}`} />
            {parsedUrl.port ? <Pill className="bg-purple-200 text-purple-900" label={`port: ${parsedUrl.port}`} /> : null}
            <Pill className="bg-orange-200 text-orange-900" label={`path: ${parsedUrl.path}`} />
            {parsedUrl.queryEntries.map((entry) => (
              <span key={`${entry.key}-${entry.value}`} className="rounded bg-gray-100 px-2 py-1 text-gray-800">
                query key: {entry.key}
              </span>
            ))}
            {parsedUrl.queryEntries.map((entry) => (
              <span
                key={`${entry.key}-${entry.value}-value`}
                className="rounded bg-gray-100 px-2 py-1 text-gray-800"
              >
                query value: {entry.value}
              </span>
            ))}
            {parsedUrl.fragment ? (
              <Pill className="bg-blue-200 text-blue-800" label={`fragment: ${parsedUrl.fragment}`} />
            ) : null}
          </>
        ) : (
          <p className="text-sm text-rose-700 dark:text-rose-300">Paste a valid URL to see parsed components.</p>
        )}
      </div>
    </div>
  )
}
