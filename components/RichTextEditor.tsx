"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>",
    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          "min-h-[350px] rounded-b-xl bg-slate-950 p-5 text-slate-200 outline-none",
      },
    },
  });

  if (!editor) {
    return (
      <div className="rounded-xl border border-slate-700 p-5 text-slate-400">
        Loading editor...
      </div>
    );
  }

  const normalButton =
    "rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800";

  const activeButton =
    "rounded-md border border-orange-500 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-400";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <div className="flex flex-wrap gap-2 border-b border-slate-700 bg-slate-900 p-3">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          className={
            editor.isActive("bold")
              ? activeButton
              : normalButton
          }
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          className={
            editor.isActive("italic")
              ? activeButton
              : normalButton
          }
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 1 })
              .run()
          }
          className={
            editor.isActive("heading", { level: 1 })
              ? activeButton
              : normalButton
          }
        >
          H1
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
          className={
            editor.isActive("heading", { level: 2 })
              ? activeButton
              : normalButton
          }
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          className={
            editor.isActive("bulletList")
              ? activeButton
              : normalButton
          }
        >
          Bullet List
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          className={
            editor.isActive("orderedList")
              ? activeButton
              : normalButton
          }
        >
          Numbered List
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          className={
            editor.isActive("blockquote")
              ? activeButton
              : normalButton
          }
        >
          Quote
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleCodeBlock().run()
          }
          className={
            editor.isActive("codeBlock")
              ? activeButton
              : normalButton
          }
        >
          Code
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().undo().run()
          }
          className={normalButton}
        >
          Undo
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().redo().run()
          }
          className={normalButton}
        >
          Redo
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}