export interface ParsedUrl {
  scheme: string;
  domain: string;
  port: string;
  path: string;
  query: Record<string, string>;
  fragment: string;
}

export const parseTemplatedUrl = (template: string): ParsedUrl => {
  // Replace {{id}} with a temporary safe alphanumeric token
  // Using a prefix like "varPlaceholder_" to avoid collisions
  const placeholders: Record<string, string> = {};
  let tempString = template;
  
  const matches = template.matchAll(/\{\{([a-zA-Z0-9_-]+)\}\}/g);
  for (const match of matches) {
    const fullMatch = match[0];
    const id = match[1];
    const token = `token${Math.random().toString(36).substring(2, 8)}`;
    placeholders[token] = fullMatch;
    tempString = tempString.split(fullMatch).join(token);
  }

  const parsed = parseUrl(tempString);
  
  // Replace tokens back with original placeholders in each fragment
  const restore = (str: string) => {
    let result = str;
    Object.entries(placeholders).forEach(([token, original]) => {
      result = result.split(token).join(original);
    });
    return result;
  };

  return {
    scheme: restore(parsed.scheme),
    domain: restore(parsed.domain),
    port: restore(parsed.port),
    path: restore(parsed.path),
    query: Object.fromEntries(
      Object.entries(parsed.query).map(([k, v]) => [restore(k), restore(v)])
    ),
    fragment: restore(parsed.fragment),
  };
};

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
