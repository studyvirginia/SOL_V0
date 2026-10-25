import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// ── Colour palettes ───────────────────────────────────────────────────────────
const ROUGH_COLORS = {
  yellow:  'rgba(251, 191, 36, 0.45)',
  amber:   'rgba(245, 158, 11, 0.45)',
  green:   'rgba(34, 197, 94, 0.4)',
  teal:    'rgba(20, 184, 166, 0.45)',
  blue:    'rgba(59, 130, 246, 0.5)',
  indigo:  'rgba(99, 102, 241, 0.45)',
  purple:  'rgba(168, 85, 247, 0.4)',
  rose:    'rgba(244, 63, 94, 0.45)',
  red:     'rgba(239, 68, 68, 0.5)',
  gray:    'rgba(107, 114, 128, 0.4)',
};

// Default ink colour per RoughNotation type
const DEFAULT_ROUGH_COLOR = {
  highlight:        ROUGH_COLORS.yellow,
  circle:           ROUGH_COLORS.rose,
  underline:        ROUGH_COLORS.blue,
  box:              ROUGH_COLORS.teal,
  'strike-through': ROUGH_COLORS.gray,
  'crossed-off':    ROUGH_COLORS.red,
  bracket:          ROUGH_COLORS.indigo,
};

// Map from chunk `type` string → RoughNotation `type` prop
// (RoughNotation uses "strike-through" and "crossed-off" natively)
const ROUGH_TYPE_MAP = {
  'rough-highlight':      'highlight',
  'rough-circle':         'circle',
  'rough-underline':      'underline',
  'rough-box':            'box',
  'rough-strike-through': 'strike-through',
  'rough-crossed-off':    'crossed-off',
  'rough-bracket':        'bracket',
};

const TEXT_COLOR_CLASSES = {
  blue:    'text-blue-600 dark:text-blue-400',
  indigo:  'text-indigo-600 dark:text-indigo-400',
  purple:  'text-purple-600 dark:text-purple-400',
  rose:    'text-rose-600 dark:text-rose-400',
  red:     'text-red-600 dark:text-red-400',
  amber:   'text-amber-600 dark:text-amber-400',
  green:   'text-emerald-600 dark:text-emerald-400',
  teal:    'text-teal-600 dark:text-teal-400',
  gray:    'text-gray-500 dark:text-gray-400',
  muted:   'text-gray-400 dark:text-gray-500',
};

// Shared markdown config for inline math inside chunks — strips wrapping <p>
const inlineMarkdownProps = {
  remarkPlugins: [remarkGfm, [remarkMath, { singleDollarTextMath: true }]],
  rehypePlugins: [rehypeRaw, [rehypeKatex, { strict: false, throwOnError: false }]],
  components: {
    p: ({ children }) => <span>{children}</span>,
  },
};

/**
 * Renders a single formatting chunk from the renderFormatting tool.
 * Safety guard: skips any chunk that is missing text or type.
 */
function Chunk({ chunk }) {
  if (!chunk?.text || !chunk?.type) return null;

  const { text, type, color, roughColor } = chunk;

  // ── RoughNotation types ───────────────────────────────────────────────────
  const roughNotationType = ROUGH_TYPE_MAP[type];
  if (roughNotationType) {
    const inkColor =
      (roughColor && ROUGH_COLORS[roughColor])
        ? ROUGH_COLORS[roughColor]
        : DEFAULT_ROUGH_COLOR[roughNotationType] || ROUGH_COLORS.yellow;

    return (
      <RoughNotation
        type={roughNotationType}
        show={true}
        color={inkColor}
        animationDuration={roughNotationType === 'circle' ? 800 : 600}
        strokeWidth={roughNotationType === 'bracket' ? 2 : 1.5}
        padding={roughNotationType === 'highlight' ? 2 : 4}
      >
        <span>{text}</span>
      </RoughNotation>
    );
  }

  // ── Math: inline ─────────────────────────────────────────────────────────
  if (type === 'math-inline') {
    const cleanText = text.trim().replace(/^(\$)+|(\$)+$/g, '');
    return (
      <ReactMarkdown {...inlineMarkdownProps}>{`$${cleanText}$`}</ReactMarkdown>
    );
  }

  // ── Math: display block ───────────────────────────────────────────────────
  if (type === 'math-display') {
    const cleanText = text.trim().replace(/^(\$)+|(\$)+$/g, '');
    return (
      <div className="my-4 flex justify-center overflow-x-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
          rehypePlugins={[rehypeRaw, [rehypeKatex, { strict: false, throwOnError: false }]]}
          components={{ p: ({ children }) => <span>{children}</span> }}
        >
          {`$$${cleanText}$$`}
        </ReactMarkdown>
      </div>
    );
  }

  // ── Blur / active-recall spoiler ─────────────────────────────────────────
  if (type === 'blur') {
    return (
      <span
        className="blur-sm hover:blur-none transition-all duration-300 cursor-pointer select-none hover:select-text"
        title="Click to reveal"
      >
        {text}
      </span>
    );
  }

  // ── Coloured text label ──────────────────────────────────────────────────
  if (type === 'color') {
    const cls = (color && TEXT_COLOR_CLASSES[color]) || 'text-blue-600 dark:text-blue-400';
    return <span className={`${cls} font-medium`}>{text}</span>;
  }

  // ── Basic typography ─────────────────────────────────────────────────────
  if (type === 'bold') {
    return <strong className="font-semibold text-gray-900 dark:text-gray-100">{text}</strong>;
  }
  if (type === 'italic') {
    return <em className="italic text-gray-600 dark:text-gray-400">{text}</em>;
  }
  if (type === 'code-inline') {
    return (
      <code className="text-pink-600 dark:text-pink-400 bg-pink-50/80 dark:bg-pink-900/30 px-1.5 py-0.5 rounded text-[0.88em] font-mono font-medium">
        {text}
      </code>
    );
  }

  // ── Standard / fallback — renders as full markdown ───────────────────────
  // type === 'standard' falls through here
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
      rehypePlugins={[rehypeRaw, [rehypeKatex, { strict: false, throwOnError: false }]]}
      components={{
        p: ({ children, ...props }) => (
          <p className="mb-4 last:mb-0 leading-[1.85] text-gray-700 dark:text-gray-300 text-[1.02rem]" {...props}>
            {children}
          </p>
        ),
        strong: ({ children, ...props }) => (
          <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>{children}</strong>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

/**
 * FormattedMessage — renders the output of the `renderFormatting` AI tool.
 *
 * Receives a `chunks` array from the Zod-validated tool invocation and maps
 * each chunk to the appropriate visual element:
 *   - RoughNotation digital ink (highlight, circle, underline, box,
 *     strike-through, crossed-off, bracket)
 *   - KaTeX math (inline and display block)
 *   - Blur/spoiler reveal
 *   - Coloured text labels
 *   - Bold, italic, code-inline typography
 *   - Standard ReactMarkdown fallback
 */
export default function FormattedMessage({ chunks = [] }) {
  if (!Array.isArray(chunks) || chunks.length === 0) return null;

  return (
    <div className="max-w-none break-words font-sans text-[1rem] text-gray-800 dark:text-gray-200 leading-[1.85]">
      <RoughNotationGroup show={true}>
        {chunks.map((chunk, i) => (
          <Chunk key={i} chunk={chunk} />
        ))}
      </RoughNotationGroup>
    </div>
  );
}
