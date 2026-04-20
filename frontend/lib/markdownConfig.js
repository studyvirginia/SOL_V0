import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

/**
 * Unified Remark plugins for SOL Study Assistant.
 * Includes GFM (tables, strikethrough) and Math (LaTeX).
 */
export const commonRemarkPlugins = [
  remarkGfm,
  [remarkMath, { singleDollarTextMath: true }]
];

/**
 * Unified Rehype plugins for SOL Study Assistant.
 * Includes KaTeX (styling) and Raw (HTML support).
 */
export const commonRehypePlugins = [
  rehypeRaw,
  [rehypeKatex, { 
    strict: false, 
    throwOnError: false, 
    errorColor: "#cc0000" 
  }]
];

/**
 * Standard props for ReactMarkdown components.
 * Usage: <ReactMarkdown {...markdownProps}>{content}</ReactMarkdown>
 */
export const markdownProps = {
  remarkPlugins: commonRemarkPlugins,
  rehypePlugins: commonRehypePlugins,
};
