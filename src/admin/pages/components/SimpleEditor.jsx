import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const SimpleEditor = ({ value = "", onChange }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const isInternalChange = useRef(false);
  const lastValueRef = useRef(value);

  // Init Quill
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: {
          container: [
            [{ font: [] }, { size: [] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["image", "video"],
          ],
          handlers: {
            // Image handler
            image: function () {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              input.click();

              input.onchange = () => {
                const file = input.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () => {
                  const range = this.quill.getSelection();
                  this.quill.insertEmbed(range.index, "image", reader.result);
                  this.quill.setSelection(range.index + 1);
                };
                reader.readAsDataURL(file);
              };
            },
            // Video URL handler
            video: function () {
              const url = prompt("Paste YouTube/Vimeo video URL");
              if (!url) return;

              const range = this.quill.getSelection();
              this.quill.insertEmbed(range.index, "video", url);
              this.quill.setSelection(range.index + 1);
            },
          },
        },
      },
    });

    // Set initial value
    if (value) {
      quillRef.current.root.innerHTML = value;
      lastValueRef.current = value;
    }

    // Listen to user typing
    quillRef.current.on("text-change", () => {
      isInternalChange.current = true;
      const html = quillRef.current.root.innerHTML;
      lastValueRef.current = html;
      onChange?.(html);
      isInternalChange.current = false;
    });
  }, []);

  // External value updates (e.g., when opening the modal in edit mode)
  useEffect(() => {
    if (!quillRef.current) return;
    if (isInternalChange.current) return;

    if (value !== lastValueRef.current) {
      const selection = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value || "";

      if (selection) {
        quillRef.current.setSelection(selection.index, selection.length);
      }
      lastValueRef.current = value;
    }
  }, [value]);

  return <div ref={editorRef} />;
};

export default SimpleEditor;