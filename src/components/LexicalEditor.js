"use client";

import { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
// import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { $generateHtmlFromNodes } from "@lexical/html";

const theme = {
  paragraph: "mb-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  list: {
    ul: "list-disc pl-6",
    ol: "list-decimal pl-6",
    listitem: "my-1",
  },
  link: "text-blue-500 underline",
};

function onError(error) {
  console.error(error);
}

export default function LexicalEditor({
  value,
  onChange,
  placeholder = "Enter message",
  disabled = false,
}) {
  const [initialHtml] = useState(value);

  const initialConfig = {
    namespace: "EmailEditor",
    theme,
    onError,
    editorState: null, // controlled init
    editable: !disabled,
    nodes: [],
  };

  function MyOnChangePlugin({ onChange: parentOnChange }) {
    const handleChange = (editorState, editor) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor);
        parentOnChange(html);
      });
    };

    return <OnChangePlugin onChange={handleChange} />;
  }

  useEffect(() => {
    // If you want to sync external value updates (templates, edit mode)
    // you can implement editor.update logic here
  }, [value]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative w-full rounded-md bg-gray-800 border border-gray-700 overflow-hidden">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="px-3 py-2 min-h-[120px] text-sm text-gray-100 focus:outline-none caret-blue-500"
              aria-placeholder={placeholder}
            />
          }
          placeholder={
            <div className="absolute top-2 left-3 pointer-events-none text-gray-500 text-sm">
              {placeholder}
            </div>
          }
        //   ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        {/* <ListPlugin /> */}
        {/* <LinkPlugin /> */}
        <AutoFocusPlugin />
        <MyOnChangePlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
}
