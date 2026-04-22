# Project Task Manifest: SOL_V0 Feature Alignment

This task list is derived strictly from `feauture-set.txt`. All development is verified against this list to ensure adherence to the project's atomic goals.

## 🏗️ Phase 1: Infrastructure & Stability
- [x] **Stabilize Chat Streaming API** (Ref: Line 46)
    - [x] [MODIFY] `api/chat.js`: Resolve `transform is not a function` error.
    - [x] [MODIFY] `api/chat.js`: Ensure 500 initialization errors are resolved.
    - [x] [TEST]: Successful "Hello" response from AI.
- [x] **Finalize Authentication & RLS** (Ref: Lines 11-15)
    - [x] [VERIFY]: Supabase login / AuthOverlay logic.
    - [x] [TEST]: Ensure user ID is correctly propagated to all background services.

## 🧠 Phase 2: Intelligence & Memory
- [x] **Critic-Agent Validation Stage** (Ref: Lines 132-134)
    - [x] [MODIFY] `api/chat.js`: Re-integrate secondary "Solver" pass for MCQs.
    - [x] [MODIFY] `lib/criticAgentService.js`: Hardened comparison logic.
    - [x] [TEST]: Trigger MCQ -> Verify `(Critic Verified)` tag appears.
- [x] **Cognitive Memory (LangChain/Vector DB)** (Ref: Lines 28-31)
    - [x] [MODIFY] `lib/sessionMemoryService.js`: Inject semantic memory matched from Supabase.
    - [x] [MODIFY] `api/chat.js`: Ensure session summaries are successfully embedded and stored.
    - [x] [TEST]: Start new session -> Verify AI recalls context from previous session.
- [x] **State Object Workflow for Graphs** (Ref: Line 2)
    - [x] [MODIFY] `lib/sessionMemoryService.js`: Ensure `visualState` (summary of last graph) is injected.
    - [x] [TEST]: "Draw a circle" -> "Move it 5 units right" (Verify continuation).

## ♿ Phase 3: Accessibility & Design
- [x] **Inclusive Design Implementation** (Ref: Lines 39-42)
    - [x] [MODIFY] `globals.css`: Lexend font utility for Dyslexia Mode.
    - [x] [MODIFY] `index.js`: Focus Mode (Zen UI) logic to hide sidebars.
    - [x] [TEST]: Toggle Dyslexia mode -> Verify font change.
    - [x] [TEST]: Toggle Focus mode -> Verify sidebar disappears.
- [x] **Generative UI & Formatting** (Ref: Lines 21, 46)
    - [x] [MODIFY] `components/ChatWindow.js`: Ensure KaTeX, Matplotlib, and TikZ render correctly.
    - [x] [TEST]: Ask for a math equation -> Verify KaTeX rendering.

## ✅ Completed
- [x] Comparison with main branch (Diff established).
- [x] Removal of unauthorized Socratic persona.
- [x] Stabilization Plan created and approved.

## 🚀 Phase 6: Generative UI Content Expansion & Tuning
- `[x]` **Adaptive Loops & Standards Tracking**
    - `[x]` [MODIFY] `AdaptiveMCQ.js`: Add automatic `onNextRequested` loop.
    - `[x]` [MODIFY] `AdaptiveMCQ.js`: Add info standardCode tooltip.
    - `[x]` [MODIFY] `FlashcardDeck.js`: Add "Keep Learning/Next Batch" trigger at the end.
    - `[x]` [MODIFY] `FlashcardDeck.js`: Display standard alignment format natively.
- `[x]` **Generative Math & Quick Actions UI**
    - `[x]` [MODIFY] `AdaptiveMCQ.js` & `FlashcardDeck.js`: Wrap generative strings in `<ReactMarkdown>` with `rehypeKatex`.
    - `[x]` [MODIFY] `ChatWindow.js`: Rewrite `<QuickActions>` to fire actual messages silently.
- `[x]` **Backend Tuning & Long-Form Stitching**
    - `[x]` [MODIFY] `ChatWindow.js`: Hook into `useChat` `onFinish` to detect `length` cutoffs and auto-trigger a "continue" message.
    - `[x]` [MODIFY] `matplotlib-generate.js`: Remove `fewShot` examples for complete zero-shot Matplotlib code generation.
    - `[x]` [MODIFY] `sessionMemoryService.js`: Bolster rules for graph usage, Rough Notation `[h]` `[c]`, Notes, and Adaptive limits.
