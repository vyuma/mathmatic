import React, { useState, useCallback, useRef, useEffect } from "react";
import type { EditorState } from "../types";
import { MathEditor } from "./MathEditor";
import { useTouchDevice } from "../hooks/useTouchDevice";
import {
  getMathExpressionAtPosition,
  insertMathExpression,
  replaceMathExpression,
} from "../utils/mathUtils";
import "./MarkdownEditor.css";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  onCursorPositionChange?: (position: number) => void;
  placeholder?: string;
}

interface MathInputState {
  isActive: boolean;
  position: { x: number; y: number };
  insertPosition: number;
  isInline: boolean;
  currentLatex: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = React.memo(({
  content,
  onChange,
  onCursorPositionChange,
  placeholder = "Start writing your markdown note...",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { deviceInfo } = useTouchDevice();
  const [editorState, setEditorState] = useState<EditorState>({
    content,
    cursorPosition: 0,
    selectedText: "",
    isEditing: false,
    mathEditMode: false,
  });

  const [mathInputState, setMathInputState] = useState<MathInputState>({
    isActive: false,
    position: { x: 0, y: 0 },
    insertPosition: 0,
    isInline: true,
    currentLatex: "",
  });

  // Update editor state when content prop changes
  useEffect(() => {
    setEditorState((prev) => ({
      ...prev,
      content,
    }));
  }, [content]);

  // Handle text change
  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = event.target.value;
      const cursorPosition = event.target.selectionStart;

      setEditorState((prev) => ({
        ...prev,
        content: newContent,
        cursorPosition,
        isEditing: true,
      }));

      onChange(newContent);
      onCursorPositionChange?.(cursorPosition);
    },
    [onChange, onCursorPositionChange]
  );

  // Handle selection change
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      const selectedText = content.substring(selectionStart, selectionEnd);

      setEditorState((prev) => ({
        ...prev,
        cursorPosition: selectionStart,
        selectedText,
      }));

      onCursorPositionChange?.(selectionStart);
    }
  }, [content, onCursorPositionChange]);

  // Math input mode functions
  const startMathInput = useCallback(
    (isInline: boolean = true, existingLatex: string = "") => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      const cursorPosition = textarea.selectionStart;

      // Check if cursor is inside an existing math expression
      const existingMath = getMathExpressionAtPosition(content, cursorPosition);

      // Calculate approximate cursor position for math editor placement
      const lineHeight = 20; // Approximate line height
      const charWidth = 8; // Approximate character width
      const lines = content.substring(0, cursorPosition).split("\n");
      const currentLine = lines.length - 1;
      const currentColumn = lines[lines.length - 1].length;

      const x = rect.left + currentColumn * charWidth;
      const y = rect.top + currentLine * lineHeight + lineHeight;

      setMathInputState({
        isActive: true,
        position: { x, y },
        insertPosition: existingMath ? existingMath.start : cursorPosition,
        isInline: existingMath ? existingMath.isInline : isInline,
        currentLatex: existingMath ? existingMath.latex : existingLatex,
      });

      setEditorState((prev) => ({
        ...prev,
        mathEditMode: true,
      }));
    },
    [content]
  );

  // Handle double-click to edit math expressions
  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement>) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const existingMath = getMathExpressionAtPosition(content, cursorPosition);

      if (existingMath) {
        event.preventDefault();
        startMathInput(existingMath.isInline, existingMath.latex);
      }
    },
    [content, startMathInput]
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      isEditing: true,
    }));
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      isEditing: false,
    }));
  }, []);

  // Toolbar actions
  const insertText = useCallback(
    (before: string, after: string = "") => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);

      const newText = before + selectedText + after;
      const newContent =
        content.substring(0, start) + newText + content.substring(end);

      onChange(newContent);

      // Set cursor position after insertion
      setTimeout(() => {
        if (textarea) {
          const newCursorPos = selectedText
            ? start + before.length + selectedText.length + after.length
            : start + before.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }
      }, 0);
    },
    [content, onChange]
  );

  const insertBold = useCallback(() => insertText("**", "**"), [insertText]);
  const insertItalic = useCallback(() => insertText("*", "*"), [insertText]);
  const insertCode = useCallback(() => insertText("`", "`"), [insertText]);
  const insertCodeBlock = useCallback(
    () => insertText("\n```\n", "\n```\n"),
    [insertText]
  );
  const insertHeading = useCallback(() => insertText("# "), [insertText]);
  const insertList = useCallback(() => insertText("- "), [insertText]);
  const insertNumberedList = useCallback(() => insertText("1. "), [insertText]);

  const insertMath = useCallback(() => startMathInput(true), [startMathInput]);
  const insertMathBlock = useCallback(
    () => startMathInput(false),
    [startMathInput]
  );

  // Handle math editor completion
  const handleMathComplete = useCallback(
    (latex: string) => {
      if (!textareaRef.current) return;

      const { insertPosition, isInline } = mathInputState;

      // Check if we're editing an existing math expression
      const existingMath = getMathExpressionAtPosition(content, insertPosition);

      let newContent: string;
      let newCursorPos: number;

      if (existingMath) {
        // Replace existing math expression
        newContent = replaceMathExpression(content, existingMath, latex);
        const mathDelimiter = existingMath.isInline ? "$" : "$$";
        const mathText = existingMath.isInline
          ? `${mathDelimiter}${latex}${mathDelimiter}`
          : `${mathDelimiter}\n${latex}\n${mathDelimiter}`;
        newCursorPos = existingMath.start + mathText.length;
      } else {
        // Insert new math expression
        const result = insertMathExpression(
          content,
          insertPosition,
          latex,
          isInline
        );
        newContent = result.content;
        newCursorPos = result.newCursorPosition;
      }

      onChange(newContent);

      // Close math input mode
      setMathInputState((prev) => ({ ...prev, isActive: false }));
      setEditorState((prev) => ({ ...prev, mathEditMode: false }));

      // Focus back to textarea and set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 100);
    },
    [mathInputState, content, onChange]
  );

  // Handle math editor cancellation
  const handleMathCancel = useCallback(() => {
    setMathInputState((prev) => ({ ...prev, isActive: false }));
    setEditorState((prev) => ({ ...prev, mathEditMode: false }));

    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  // Handle math editor value change
  const handleMathChange = useCallback((latex: string) => {
    setMathInputState((prev) => ({ ...prev, currentLatex: latex }));
  }, []);

  // Detect math input triggers in text
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Trigger math input with Ctrl+M or Cmd+M
      if ((event.ctrlKey || event.metaKey) && event.key === "m") {
        event.preventDefault();
        startMathInput(true);
        return;
      }

      // Trigger math block with Ctrl+Shift+M or Cmd+Shift+M
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "M"
      ) {
        event.preventDefault();
        startMathInput(false);
        return;
      }

      // Auto-trigger math input when typing $ symbols
      if (event.key === "$" && !mathInputState.isActive) {
        const textarea = event.currentTarget;
        const cursorPos = textarea.selectionStart;
        const textBefore = content.substring(0, cursorPos);
        const textAfter = content.substring(cursorPos);

        // Check if this is the start of a math block ($$)
        if (textAfter.startsWith("$") || textBefore.endsWith("$")) {
          event.preventDefault();
          startMathInput(false);
          return;
        }

        // Check if this would create an inline math delimiter
        const lastChar = textBefore.slice(-1);
        if (lastChar !== "$" && !textAfter.startsWith("$")) {
          // This might be the start of inline math, but let's not auto-trigger
          // to avoid interfering with normal $ usage
        }
      }
    },
    [content, mathInputState.isActive, startMathInput]
  );

  return (
    <div
      className={`markdown-editor ${
        mathInputState.isActive ? "math-mode" : ""
      } ${deviceInfo.isTouch ? "touch-optimized" : ""} ${
        deviceInfo.isMobile ? "mobile-optimized" : ""
      }`}
    >
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-button"
            onClick={insertBold}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={insertItalic}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={insertCode}
            title="Inline Code"
          >
            {"</>"}
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-button"
            onClick={insertHeading}
            title="Heading"
          >
            H1
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={insertList}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={insertNumberedList}
            title="Numbered List"
          >
            1.
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-button"
            onClick={insertMath}
            title="Inline Math (Ctrl+M)"
          >
            $x$
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={insertMathBlock}
            title="Math Block (Ctrl+Shift+M)"
          >
            $$
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={insertCodeBlock}
            title="Code Block"
          >
            {"{}"}
          </button>
        </div>
      </div>

      <div className="editor-container">
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={editorState.content}
          onChange={handleTextChange}
          onSelect={handleSelectionChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onDoubleClick={handleDoubleClick}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Math Editor Overlay */}
        {mathInputState.isActive && (
          <div
            className="math-editor-overlay"
            style={{
              position: "fixed",
              left: mathInputState.position.x,
              top: mathInputState.position.y,
              zIndex: 1000,
              maxWidth: "400px",
              minWidth: "300px",
            }}
          >
            <MathEditor
              value={mathInputState.currentLatex}
              onChange={handleMathChange}
              onComplete={() => handleMathComplete(mathInputState.currentLatex)}
              onCancel={handleMathCancel}
              isVisible={true}
            />
          </div>
        )}
      </div>

      <div className="editor-status">
        <span className="status-item">
          Lines: {editorState.content.split("\n").length}
        </span>
        <span className="status-item">
          Characters: {editorState.content.length}
        </span>
        <span className="status-item">
          Cursor: {editorState.cursorPosition}
        </span>
        {editorState.isEditing && (
          <span className="status-item editing">Editing...</span>
        )}
      </div>
    </div>
  );
});
