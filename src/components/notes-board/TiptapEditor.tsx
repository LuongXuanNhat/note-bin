"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

interface TiptapEditorProps {
  contentHtml: string;
  onChange: (html: string) => void;
  textColor: string;
  onEditorReady?: (editor: Editor | null) => void;
}

const extensions = [
  StarterKit.configure({
    heading: false,
  }),
  Underline,
];

export default function TiptapEditor({
  contentHtml,
  onChange,
  textColor,
  onEditorReady,
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: contentHtml,
    editorProps: {
      attributes: {
        class:
          "flex-1 outline-none text-sm px-3 py-1.5 min-h-[60px] overflow-y-auto focus:outline-none prose prose-sm max-w-none",
        style: `color: ${textColor}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Sync external contentHtml updates (e.g., when JSON pretty format is triggered)
  useEffect(() => {
    if (editor && contentHtml !== editor.getHTML()) {
      const currentHtml = editor.getHTML();
      editor.commands.setContent(contentHtml, { emitUpdate: false });
    }
  }, [contentHtml, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <EditorContent
        editor={editor}
        className="flex flex-1 flex-col overflow-y-auto"
      />
    </div>
  );
}
