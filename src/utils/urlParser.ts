export interface ParsedUrl {
  scheme: string;
  domain: string;
  port: string;
  path: string;
  query: Record<string, string>;
  fragment: string;
}

export const parseUrl = (urlString: string): ParsedUrl => {
  try {
    const url = new URL(urlString);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      scheme: url.protocol.replace(':', ''),
      domain: url.hostname,
      port: url.port,
      path: url.pathname,
      query,
      fragment: url.hash.replace('#', ''),
    };
  } catch (e) {
    // Return empty/default structure for invalid URLs
    return {
      scheme: 'https',
      domain: '',
      port: '',
      path: '/',
      query: {},
      fragment: '',
    };
  }
};

export const rebuildUrl = (parsed: ParsedUrl): string => {
  const { scheme, domain, port, path, query, fragment } = parsed;
  let url = `${scheme}://${domain}`;
  if (port) url += `:${port}`;
  url += path;
  
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    searchParams.append(key, value);
  });
  
  const search = searchParams.toString();
  if (search) url += `?${search}`;
  if (fragment) url += `#${fragment}`;
  
  return url;
};
