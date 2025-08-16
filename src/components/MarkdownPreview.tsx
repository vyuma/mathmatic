import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Components } from "react-markdown";
import { useMathError } from "../contexts/ErrorContext";
import { MathRenderError } from "../utils/errors";
import "./MarkdownPreview.css";

interface MarkdownPreviewProps {
  content: string;
  debounceMs?: number;
  onMathClick?: (latex: string, position: DOMRect, isInline: boolean) => void;
}

// Custom components for react-markdown
const components: Components = {
  // Custom heading component with anchor links
  h1: ({ children, ...props }) => (
    <h1 className="preview-heading preview-h1" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="preview-heading preview-h2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="preview-heading preview-h3" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="preview-heading preview-h4" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="preview-heading preview-h5" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="preview-heading preview-h6" {...props}>
      {children}
    </h6>
  ),

  // Custom paragraph component
  p: ({ children, ...props }) => (
    <p className="preview-paragraph" {...props}>
      {children}
    </p>
  ),

  // Custom list components
  ul: ({ children, ...props }) => (
    <ul className="preview-list preview-ul" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="preview-list preview-ol" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="preview-list-item" {...props}>
      {children}
    </li>
  ),

  // Custom code components
  code: ({ className, children, ...props }) => {
    const isInline = !className?.includes("language-");

    if (isInline) {
      return (
        <code className="preview-code-inline" {...props}>
          {children}
        </code>
      );
    }

    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    return (
      <div className="preview-code-block">
        {language && (
          <div className="code-block-header">
            <span className="code-language">{language}</span>
          </div>
        )}
        <pre className="preview-pre">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  },

  // Custom blockquote component
  blockquote: ({ children, ...props }) => (
    <blockquote className="preview-blockquote" {...props}>
      {children}
    </blockquote>
  ),

  // Custom table components
  table: ({ children, ...props }) => (
    <div className="preview-table-wrapper">
      <table className="preview-table" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="preview-table-header" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="preview-table-cell" {...props}>
      {children}
    </td>
  ),

  // Custom link component
  a: ({ children, href, ...props }) => (
    <a
      className="preview-link"
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  // Custom image component
  img: ({ src, alt, ...props }) => (
    <img
      className="preview-image"
      src={src}
      alt={alt}
      loading="lazy"
      {...props}
    />
  ),

  // Custom horizontal rule
  hr: (props) => <hr className="preview-hr" {...props} />,

  // Custom strong and emphasis
  strong: ({ children, ...props }) => (
    <strong className="preview-strong" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="preview-em" {...props}>
      {children}
    </em>
  ),
};

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = React.memo(
  ({ content, debounceMs = 300, onMathClick }) => {
    const [debouncedContent, setDebouncedContent] = useState(content);
    const [isUpdating, setIsUpdating] = useState(false);
  

    // Error handling
    const { handleMathError } = useMathError();

    // Debounce content updates
    useEffect(() => {
      if (content === debouncedContent) return;

      setIsUpdating(true);
      const timer = setTimeout(() => {
        setDebouncedContent(content);
        setIsUpdating(false);
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [content, debouncedContent, debounceMs]);

    // Custom rehype plugin to handle KaTeX errors
    const rehypeKatexWithErrorHandling = useMemo(() => {
      return [
        rehypeKatex,
        {
          errorColor: "#cc0000",
          throwOnError: false,
          output: "html",
          trust: false,
          strict: false,
          macros: {},
        },
      ] as const;
    }, []);

    // Memoize markdown options for performance
    const markdownOptions = useMemo(
      () => ({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatexWithErrorHandling],
        components,
      }),
      [rehypeKatexWithErrorHandling]
    );

    // Handle math click events
    const handleMathClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!onMathClick) return;

      const target = event.target as HTMLElement;
      const mathElement = target.closest(".katex");

      if (mathElement) {
        // Extract LaTeX from the math element
        const annotation = mathElement.querySelector(
          'annotation[encoding="application/x-tex"]'
        );
        if (annotation) {
          const latex = annotation.textContent || "";
          const rect = mathElement.getBoundingClientRect();

          // Determine if it's inline or block math
          const isInline = !mathElement.classList.contains("katex-display");

          event.preventDefault();
          event.stopPropagation();
          onMathClick(latex, rect, isInline);
        }
      }
    };

    return (
      <div className="markdown-preview">
        <div className="preview-header">
          <h2 className="preview-title">Preview</h2>
          {isUpdating && (
            <div className="preview-status">
              <span className="status-indicator">Updating...</span>
            </div>
          )}
        </div>

        <div className="preview-content" onClick={handleMathClick}>
          {debouncedContent.trim() ? (
            <ReactMarkdown {...markdownOptions}>
              {debouncedContent}
            </ReactMarkdown>
          ) : (
            <div className="preview-empty">
              <p>Start typing to see your markdown preview...</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);
