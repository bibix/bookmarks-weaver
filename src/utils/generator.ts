import Handlebars from 'handlebars';

export interface Bookmark {
  title: string;
  url: string;
  description: string;
  tags: string[];
  keywords: string[];
}

export interface Folder {
  name: string;
  children: (Folder | Bookmark)[];
}

export function resolveTemplate(template: string, data: any): string {
  try {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  } catch (e) {
    return template;
  }
}

export function generateNetscapeBookmarks(root: Folder): string {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and rewritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  function walk(node: Folder | Bookmark, indent: number) {
    const space = "    ".repeat(indent);
    if ('children' in node) {
      html += `${space}<DT><H3>${node.name}</H3>\n`;
      html += `${space}<DL><p>\n`;
      node.children.forEach(child => walk(child, indent + 1));
      html += `${space}</DL><p>\n`;
    } else {
      const tags = node.tags.join(',');
      html += `${space}<DT><A HREF="${node.url}" TAGS="${tags}">${node.title}</A>\n`;
      if (node.description) {
        html += `${space}<DD>${node.description}\n`;
      }
    }
  }

  root.children.forEach(child => walk(child, 1));
  html += `</DL><p>\n`;
  return html;
}

export function resolveAll(blocks: any[], variables: Record<string, any[]>): Folder {
    const root: Folder = { name: "Root", children: [] };
    // Simplified resolution for Cartesian product would go here
    return root;
}
