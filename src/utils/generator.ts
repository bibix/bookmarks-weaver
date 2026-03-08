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
      if (node.name !== 'Root') {
          html += `${space}<DT><H3>${node.name}</H3>\n`;
          html += `${space}<DL><p>\n`;
      }
      node.children.forEach(child => walk(child, node.name === 'Root' ? indent : indent + 1));
      if (node.name !== 'Root') {
          html += `${space}</DL><p>\n`;
      }
    } else {
      const tags = node.tags.join(',');
      const keywords = node.keywords.join(',');
      html += `${space}<DT><A HREF="${node.url}" TAGS="${tags}" KEYWORDS="${keywords}">${node.title}</A>\n`;
      if (node.description) {
        html += `${space}<DD>${node.description}\n`;
      }
    }
  }

  walk(root, 0);
  if (root.name !== 'Root') {
      html += `</DL><p>\n`;
  }
  return html;
}

export function resolveAll(blocks: any[], variables: Record<string, string[][]>): Folder {
    const root: Folder = { name: "Root", children: [] };
    
    // 1. Prepare data combinations
    const tableNames = Object.keys(variables);
    const tableData: any[][] = [];
    
    tableNames.forEach(name => {
        const rows = variables[name];
        if (rows.length < 2) return; // Only header
        const headers = rows[0];
        const rowsData = rows.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((h, i) => {
                obj[h] = row[i] || "";
            });
            // If only one column and it matches tableName, also allow direct access
            if (headers.length === 1 && headers[0] === name) {
                return row[0] || "";
            }
            return obj;
        });
        tableData.push(rowsData.map(val => ({ [name]: val })));
    });

    const now = new Date();
    const dateVars = {
        yyyy: String(now.getFullYear()),
        mm: String(now.getMonth() + 1).padStart(2, '0'),
        dd: String(now.getDate()).padStart(2, '0')
    };

    if (tableData.length === 0) {
        // Just resolve with empty data once
        const tree = resolveBlocks(blocks, { ...dateVars });
        mergeTrees(root, tree);
        return root;
    }

    // Cartesian product of tableData
    const combinations = cartesianProduct(tableData);

    combinations.forEach(combo => {
        const data = combo.reduce((acc, curr) => ({ ...acc, ...curr }), { ...dateVars });
        const tree = resolveBlocks(blocks, data);
        mergeTrees(root, tree);
    });

    return root;
}

function cartesianProduct(arrays: any[][]): any[][] {
    return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]]);
}

function resolveBlocks(blocks: any[], data: any): (Folder | Bookmark)[] {
    const results: (Folder | Bookmark)[] = [];

    blocks.forEach(block => {
        if (block.type === 'folder') {
            const nameTemplate = block.content.map((i: any) => i.text).join('');
            const resolvedName = resolveTemplate(nameTemplate, data);
            results.push({
                name: resolvedName,
                children: resolveBlocks(block.children || [], data)
            } as Folder);
        } else if (block.type === 'bookmark') {
            const props = block.props;
            results.push({
                title: resolveTemplate(props.title, data),
                url: resolveTemplate(props.url, data),
                description: resolveTemplate(props.description, data),
                tags: resolveTemplate(props.tags, data).split(',').map((s: string) => s.trim()).filter(Boolean),
                keywords: resolveTemplate(props.keywords, data).split(',').map((s: string) => s.trim()).filter(Boolean),
            } as Bookmark);
        } else if (block.type === 'paragraph' || block.type === 'comment') {
             // Handle children of paragraphs/comments if they have folders/bookmarks inside
             // In this project, they shouldn't but let's be safe
             if (block.children) {
                 results.push(...resolveBlocks(block.children, data));
             }
        }
    });

    return results;
}

function mergeTrees(target: Folder, source: (Folder | Bookmark)[]) {
    source.forEach(item => {
        if ('children' in item) {
            let existingFolder = target.children.find(c => 'children' in c && c.name === item.name) as Folder;
            if (existingFolder) {
                mergeTrees(existingFolder, item.children);
            } else {
                target.children.push(item);
            }
        } else {
            // Deduplicate bookmarks to handle sibling Cartesian product loops correctly
            const isDuplicate = target.children.some(c => 
                !('children' in c) && 
                c.title === item.title && 
                c.url === item.url && 
                c.description === item.description &&
                c.tags.join(',') === item.tags.join(',') &&
                c.keywords.join(',') === item.keywords.join(',')
            );
            if (!isDuplicate) {
                target.children.push(item);
            }
        }
    });
}
