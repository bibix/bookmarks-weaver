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
import { CommentBlock, FolderBlock, BookmarkBlock } from "./CustomBlocks";
import { MessageSquare, Folder, Bookmark as BookmarkIcon } from "lucide-react";
import { appState } from "../store";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    comment: CommentBlock,
    folder: FolderBlock,
    bookmark: BookmarkBlock,
  },
  inlineContentSpecs: {
    text: defaultInlineContentSpecs.text,
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
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
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
  });

  React.useEffect(() => {
    return appState.subscribe(() => {
      setTheme(appState.theme);
    });
  }, []);

  const getCustomSlashMenuItems = (
    editor: any
  ): DefaultReactSuggestionItem[] => [
    {
      title: "Comment",
      onItemClick: () => {
        insertOrUpdateBlock(editor, {
          type: "comment",
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
          type: "folder",
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

  React.useEffect(() => {
    if (editor) {
      const unsub = editor.onChange(() => {
        appState.setTemplate(editor.document);
      });
      return unsub;
    }
  }, [editor]);

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
