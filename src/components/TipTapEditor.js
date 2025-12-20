"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import { useEffect } from "react";

export default function TiptapEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // Placeholder.configure({
      //   placeholder: "Start writing...",
      // }),
    ],
    content: value,
    immediatelyRender: false, // REQUIRED for Next.js
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const editorContent = editor.getHTML();

    // Prevent infinite update loop
    if (value !== editorContent) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const btn = (isActive) =>
    `p-2 rounded hover:bg-zinc-800 ${isActive ? "bg-zinc-800 text-white" : "text-zinc-400"
    }`;

  return (
    <div className="max-w-4xl mx-auto bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
        <button type="button" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-4 h-4 text-zinc-400" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-4 h-4 text-zinc-400" />
        </button>

        <div className="w-px h-5 bg-zinc-700 mx-2" />

        <button
          type="button"
          className={btn(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          className={btn(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          className={btn(editor.isActive("strike"))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <button
          type="button"
          className={btn(editor.isActive("code"))}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-700 mx-2" />

        <button
          type="button"
          className={btn(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          className={btn(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none px-6 py-5 min-h-[300px] innerTextEditor focus:outline-none"
      />
    </div>
  );
}
