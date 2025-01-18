import Quill from "quill"; // Import Quill.js
import "quill/dist/quill.snow.css"; // Import Quill.js theme
import React, { useEffect, useRef } from "react";

const QuillEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);  // Ref for the editor container div
  const quillInstance = useRef(null);  // Store Quill instance to prevent duplicates

  useEffect(() => {
    if (!quillInstance.current) {
      // Initialize Quill editor
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write your job description...",
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],  // Clear formatting
          ],
        },
      });

      // Listen for text changes and update parent form value
      quillInstance.current.on("text-change", () => {
        const htmlContent = quillInstance.current.root.innerHTML;
        onChange(htmlContent);
      });
    }

    // Set initial content
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      quillInstance.current.root.innerHTML = value || "";
    }
  }, [value, onChange]);

  return (
    <div
      ref={editorRef}
      className="border p-2 rounded"
      style={{
        minHeight: "150px",
        maxHeight: "250px",  // Prevents growing too large
        overflowY: "auto",  // Scroll when content exceeds max height
      }}
    ></div>
  );
};

export default QuillEditor;
