"use client";
import { ForwardedRef, useState } from "react";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  codeBlockPlugin,
  CreateLink,
  InsertImage,
  InsertCodeBlock,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface DescriptionProps {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  markdown: string;
  onChange: (value: string) => void;
}

/**
 * Description component for rendering a markdown editor
 *
 * @component
 * @param {Object} props - The component props
 * @param {ForwardedRef<MDXEditorMethods> | null} props.editorRef - Ref for the MDXEditor
 * @param {string} props.markdown - Initial markdown content
 * @param {function} props.onChange - Callback function when content changes
 * @returns {JSX.Element} Rendered Description component
 */
const Description: React.FC<DescriptionProps> = ({ editorRef, ...props }) => {
  const [content, setContent] = useState(props.markdown || "");

  return (
    <div className="markdown-editor-container">
      <div className="editor-wrapper">
        <MDXEditor
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin(),
            codeBlockPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <CreateLink />
                  <InsertImage />
                  <InsertCodeBlock />
                </>
              ),
            }),
          ]}
          {...props}
          ref={editorRef}
          markdown={content}
          onChange={(value) => {
            setContent(value);
            if (props.onChange) props.onChange(value);
          }}
          className="custom-editor"
        />
      </div>
      <style>{`
        .markdown-editor-container {
          width: 100%;
          max-width: 1200px;
          height: 500px;
          margin: 0 auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .editor-wrapper {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .custom-editor {
          flex-grow: 1;
          overflow-y: auto;
          font-family: "Cascadia Code", sans-serif;
        }
        :global(.custom-editor) {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        :global(.custom-editor .toolbar) {
          background-color: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
          padding: 8px;
          flex-shrink: 0;
        }
        :global(.custom-editor .editor) {
          flex-grow: 1;
          overflow-y: auto;
          padding: 16px;
        }
        :global(.custom-editor .prose-lg) {
          font-size: 16px;
          font-family: "Cascadia Code", sans-serif;
        }
        :global(.custom-editor .toolbar button) {
          margin-right: 8px;
          padding: 4px 8px;
          background-color: #ffffff;
          border: 1px solid #d0d0d0;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        :global(.custom-editor .toolbar button:hover) {
          background-color: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default Description;
