import React, { useMemo } from 'react';
import { 
  BlockNoteSchema, 
  insertOrUpdateBlock,
  defaultInlineContentSpecs,
  defaultBlockSpecs
} from "@blocknote/core";
import { 
  useCreateBlockNote,
  DefaultReactSuggestionItem,
  SuggestionMenuController
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { CommentInline, FolderInline, BookmarkBlock } from "./CustomBlocks";
import { MessageSquare, Folder, Bookmark as BookmarkIcon } from "lucide-react";
import { appState } from "../store";
import { HandlebarsHighlighter } from "../utils/handlebarsExtension";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    bookmark: BookmarkBlock,
  },
  inlineContentSpecs: {
    text: defaultInlineContentSpecs.text,
    link: defaultInlineContentSpecs.link,
    comment: CommentInline,
    folder: FolderInline,
  },
  styleSpecs: {}, 
});

const filterItems = (items: DefaultReactSuggestionItem[], query: string) => 
  items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    (item.aliases && item.aliases.some(alias => alias.toLowerCase().includes(query.toLowerCase())))
  );

export function TemplateEditor() {
  const [theme, setTheme] = React.useState(appState.theme);
  const lastUpdateRef = React.useRef<string>("");
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: "paragraph",
        content: [
          {
            type: "comment",
            content: [
              {
                type: "text",
                text: "Welcome to Bookmarks Weaver! Start by adding a Folder or Bookmark using the '/' menu.",
                styles: {},
              },
            ],
          },
        ],
      },
    ],
    _tiptapOptions: {
        extensions: [HandlebarsHighlighter],
    },
  });

  React.useEffect(() => {
    if (!editor) return;

    // Initialize appState with editor content if empty (avoid wiping during boot)
    if (appState.template.length === 0) {
      const docString = JSON.stringify(editor.document);
      lastUpdateRef.current = docString;
      appState.setTemplate(editor.document);
    }

    const unsubChange = editor.onChange(() => {
      const docString = JSON.stringify(editor.document);
      if (docString !== lastUpdateRef.current) {
        lastUpdateRef.current = docString;
        appState.setTemplate(editor.document);
      }
    });

    const unsubStore = appState.subscribe(() => {
      setTheme(appState.theme);
      
      const templateString = JSON.stringify(appState.template);
      
      // Update editor content if it differs from appState (e.g., after external change like renaming)
      if (templateString !== lastUpdateRef.current && appState.template.length > 0) {
        const tiptap = (editor as any)._tiptapEditor;
        // Safety check for Tiptap view to avoid "isDestroyed" or "undefined" errors
        if (tiptap && tiptap.view && !tiptap.view.isDestroyed) {
          try {
            lastUpdateRef.current = templateString;
            editor.replaceBlocks(editor.document, appState.template);
          } catch (e) {
            console.error("Failed to replace blocks:", e);
          }
        }
      }

      // Force refresh decorations when variables change
      const tiptap = (editor as any)._tiptapEditor;
      if (tiptap && tiptap.view && !tiptap.view.isDestroyed) {
        tiptap.view.dispatch(tiptap.state.tr.setMeta("forceUpdateHandlebars", true));
      }
    });

    return () => {
      unsubChange();
      unsubStore();
    };
  }, [editor]);

  const getCustomSlashMenuItems = (
    editor: any
  ): DefaultReactSuggestionItem[] => [
    {
      title: "Comment",
      onItemClick: () => {
        insertOrUpdateBlock(editor, {
          type: "paragraph",
          content: [{ type: "comment", content: "" }]
        });
      },
      aliases: ["comment", "note"],
      group: "Bookmarks Weaver",
      icon: <MessageSquare size={18} />,
    },
    {
      title: "Folder",
      onItemClick: () => {
        insertOrUpdateBlock(editor, {
          type: "bulletListItem",
          content: [{ type: "folder", content: "" }]
        });
      },
      aliases: ["folder", "group"],
      group: "Bookmarks Weaver",
      icon: <Folder size={18} />,
    },
    {
      title: "Bookmark",
      onItemClick: () => {
        insertOrUpdateBlock(editor, {
          type: "bookmark",
        });
      },
      aliases: ["bookmark", "link"],
      group: "Bookmarks Weaver",
      icon: <BookmarkIcon size={18} />,
    },
  ];


  return (
    <div className="w-full">
      <BlockNoteView 
        editor={editor} 
        theme={theme}
        sideMenu={false}
        formattingToolbar={false}
        emojiPicker={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => 
            filterItems(getCustomSlashMenuItems(editor), query)
          }
        />
      </BlockNoteView>
    </div>
  );
}
