import { defineRegistry, useBoundProp } from "@json-render/react";
import { solCatalog } from "../lib/renderCatalog";
import FlashcardDeck from "./learning/FlashcardDeck";
import AdaptiveMCQ from "./learning/AdaptiveMCQ";
import QuizRunner from "./learning/QuizRunner";
import { QuickActions } from "./QuickActions";

/**
 * Component Registry for SOL Study Assistant
 * 
 * Maps catalog component names to their actual React implementations.
 * Uses a wrapper for components that need additional props or event emitters.
 */
export const { registry, handlers } = defineRegistry(solCatalog, {
  components: {
    // 1. Flashcards
    Flashcards: ({ props }) => (
      <FlashcardDeck cards={props.cards} />
    ),

    // 2. MCQ
    MCQ: ({ props }) => (
      <AdaptiveMCQ {...props} />
    ),

    // 3. Quiz
    Quiz: ({ props }) => (
      <QuizRunner {...props} />
    ),

    // 4. Actions
    // These need access to ChatWindow's callbacks.
    // In json-render, we can pass these via standard React props if the Renderer is wrapped,
    // or use the 'emit' system. For now, we'll assume they'll be passed as extra props.
    Actions: ({ props, ...rest }) => (
      <QuickActions 
        actions={props.actions} 
        onSwitch={rest.onSwitch} 
        onSend={rest.onSend} 
        currentSubMode={rest.currentSubMode} 
      />
    ),

    // 5. Graph
    // Placeholder for now, will integrate the dynamic logic soon.
    Graph: ({ props }) => (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        Graph Component: {props.type}
      </div>
    )
  }
});
