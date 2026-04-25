export interface ParsedUrl {
  scheme: string
  domain: string
  port: string
  path: string
  queryEntries: Array<{ key: string; value: string }>
  fragment: string
}

export const parseUrl = (value: string): ParsedUrl | null => {
  try {
    const parsed = new URL(value)

    return {
      scheme: parsed.protocol.replace(':', ''),
      domain: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      queryEntries: Array.from(parsed.searchParams.entries()).map(([key, paramValue]) => ({
        key,
        value: paramValue,
      })),
      fragment: parsed.hash.replace('#', ''),
    }
  } catch {
    return null
  }
}
