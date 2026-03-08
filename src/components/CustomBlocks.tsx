import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import React, { useState, useEffect } from "react";
import { MessageSquare, Folder, Bookmark, AlertCircle, HelpCircle } from "lucide-react";
import { validateHandlebars, checkMissingVariables } from "../utils/handlebars";
import { appState } from "../store";

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
        <div className="flex items-center gap-3 p-2.5 text-muted-foreground italic border-l-4 border-primary/30 bg-muted/20 rounded-r-md my-1">
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
        <div className="flex items-center gap-2 py-2 group">
          <Folder size={20} className="text-primary fill-primary/10 shrink-0 group-hover:scale-110 transition-transform" />
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

function ValidatedInput({ 
    placeholder, 
    value, 
    onChange, 
    isTextArea = false, 
    className = "" 
}: { 
    placeholder: string, 
    value: string, 
    onChange: (val: string) => void,
    isTextArea?: boolean,
    className?: string
}) {
  const [vars, setVars] = useState(appState.variables);
  useEffect(() => {
    return appState.subscribe(() => setVars({ ...appState.variables }));
  }, []);

  const { isValid, error } = validateHandlebars(value);
  const missing = checkMissingVariables(value, vars);
  
  let borderColor = "border-border";
  let Icon = null;
  let title = "";

  if (!isValid) {
      borderColor = "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]";
      Icon = AlertCircle;
      title = `Invalid Handlebars: ${error}`;
  } else if (missing.length > 0) {
      borderColor = "border-orange-400 shadow-[0_0_0_1px_rgba(251,146,60,0.2)]";
      Icon = HelpCircle;
      title = `Missing variables: ${missing.join(', ')}`;
  }

  const Component = isTextArea ? 'textarea' : 'input';

  return (
    <div className="relative group/input">
      <Component
        placeholder={placeholder}
        className={`w-full p-2.5 border rounded-lg text-sm bg-background transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none ${borderColor} ${className}`}
        value={value}
        rows={isTextArea ? 2 : undefined}
        onChange={(e: any) => onChange(e.target.value)}
        title={title}
      />
      {Icon && (
          <div className="absolute right-3 top-3 pointer-events-none">
              <Icon size={14} className={!isValid ? "text-red-500" : "text-orange-400"} />
          </div>
      )}
    </div>
  );
}

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
        <div className="grid gap-4 p-5 border rounded-xl bg-card shadow-sm my-2 border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-primary">
                 <Bookmark size={18} className="fill-primary/10" />
                 <span>Bookmark</span>
              </div>
          </div>
          <div className="grid gap-3">
            <ValidatedInput
              placeholder="Title (Handlebars supported)"
              value={block.props.title}
              onChange={(v) => updateProp('title', v)}
            />
            <ValidatedInput
              placeholder="URL (Handlebars supported)"
              value={block.props.url}
              onChange={(v) => updateProp('url', v)}
              className="font-mono text-[13px]"
            />
            <ValidatedInput
              placeholder="Description (Handlebars supported)"
              isTextArea={true}
              value={block.props.description}
              onChange={(v) => updateProp('description', v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <ValidatedInput
                placeholder="Tags (comma separated)"
                value={block.props.tags}
                onChange={(v) => updateProp('tags', v)}
              />
              <ValidatedInput
                placeholder="Keywords (comma separated)"
                value={block.props.keywords}
                onChange={(v) => updateProp('keywords', v)}
              />
            </div>
          </div>
        </div>
      );
    },
  }
);
