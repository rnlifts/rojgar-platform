import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css"; // Default Draft.js styles
import React, { useState } from "react";

const DraftEditor = ({ value, onChange }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // Handle text styling commands (bold, italic, etc.)
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      onChange(newState.getCurrentContent().getPlainText());
      return "handled";
    }
    return "not-handled";
  };

  return (
    <div className="border p-4 rounded">
      <Editor
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        onChange={(newState) => {
          setEditorState(newState);
          onChange(newState.getCurrentContent().getPlainText());  // Output plain text
        }}
        placeholder="Write your job description..."
      />
    </div>
  );
};

export default DraftEditor;
