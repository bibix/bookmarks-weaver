import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import React from "react";
import { MessageSquare, Folder, Bookmark } from "lucide-react";

export const CommentBlock = createReactBlockSpec(
  {
    type: "comment",
    propSchema: {
      ...defaultProps,
    },
    content: "inline",
  },
  {
    render: ({ contentRef }) => {
      return (
        <div className="flex items-center gap-3 p-2.5 text-muted-foreground italic border-l-4 border-primary/30 bg-muted/20 rounded-r-md">
          <MessageSquare size={16} className="shrink-0" />
          <div 
            ref={contentRef} 
            className="outline-none w-full min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
            data-placeholder="Your comment here..."
          />
        </div>
      );
    },
  }
);

export const FolderBlock = createReactBlockSpec(
  {
    type: "folder",
    propSchema: {
      ...defaultProps,
    },
    content: "inline",
  },
  {
    render: ({ contentRef }) => {
      return (
        <div className="flex items-center gap-2 py-1">
          <Folder size={20} className="text-primary fill-primary/10 shrink-0" />
          <div 
            ref={contentRef} 
            className="font-bold text-lg text-foreground tracking-tight outline-none w-full min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
            data-placeholder="Folder name (Handlebars supported)"
          />
        </div>
      );
    },
  }
);

export const BookmarkBlock = createReactBlockSpec(
  {
    type: "bookmark",
    propSchema: {
      ...defaultProps,
      title: { default: "" },
      url: { default: "" },
      description: { default: "" },
      tags: { default: "" },
      keywords: { default: "" },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const updateProp = (key: string, value: string) => {
        editor.updateBlock(block, {
          props: { ...block.props, [key]: value },
        });
      };

      return (
        <div className="grid gap-3 p-4 border rounded-md bg-muted/30 shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
             <Bookmark size={18} className="text-primary" />
             <span>Bookmark</span>
          </div>
          <div className="grid gap-2">
            <input
              placeholder="Title (Handlebars supported)"
              className="p-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm"
              value={block.props.title}
              onChange={(e) => updateProp('title', e.target.value)}
            />
            <input
              placeholder="URL (Handlebars supported)"
              className="p-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm"
              value={block.props.url}
              onChange={(e) => updateProp('url', e.target.value)}
            />
            <textarea
              placeholder="Description (Handlebars supported)"
              className="p-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm"
              rows={2}
              value={block.props.description}
              onChange={(e) => updateProp('description', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Tags (comma separated)"
                className="p-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm"
                value={block.props.tags}
                onChange={(e) => updateProp('tags', e.target.value)}
              />
              <input
                placeholder="Keywords (comma separated)"
                className="p-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm"
                value={block.props.keywords}
                onChange={(e) => updateProp('keywords', e.target.value)}
              />
            </div>
          </div>
        </div>
      );
    },
  }
);
