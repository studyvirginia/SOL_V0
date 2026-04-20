import { defineRegistry, useBoundProp } from "@json-render/react";
import { solCatalog } from "../lib/renderCatalog";
import FlashcardDeck from "./learning/FlashcardDeck";
import AdaptiveMCQ from "./learning/AdaptiveMCQ";
import QuizRunner from "./learning/QuizRunner";
import { QuickActions } from "./QuickActions";
import { useChatContext } from "../context/ChatContext";

/**
 * Component Registry for SOL Study Assistant
 * 
 * Maps catalog component names to their actual React implementations.
 * Uses a wrapper for components that need additional props or event emitters.
 */
export const { registry, handlers } = defineRegistry(solCatalog, {
  components: {
    // 1. Flashcards
    Flashcards: ({ props, emit }) => (
      <FlashcardDeck cards={props.cards} onAction={(type, data) => emit(type, data)} />
    ),

    // 2. MCQ
    MCQ: ({ props, emit }) => {
      const { onSwitch, onSend } = useChatContext();
      return <AdaptiveMCQ {...props} onAction={(type, data) => emit(type, data)} onSwitch={onSwitch} onSend={onSend} />;
    },

    // 3. Quiz
    Quiz: ({ props, emit }) => {
      const { onSwitch, onSend } = useChatContext();
      return <QuizRunner {...props} onAction={(type, data) => emit(type, data)} onSwitch={onSwitch} onSend={onSend} />;
    },

    // 4. Actions
    Actions: ({ props, ...rest }) => {
      const { onSwitch, onSend } = useChatContext();
      return (
        <QuickActions 
          actions={props.actions} 
          onSwitch={onSwitch || rest.onSwitch} 
          onSend={onSend || rest.onSend} 
          currentSubMode={rest.currentSubMode} 
        />
      );
    },

    // 5. Graph
    // Placeholder for now, will integrate the dynamic logic soon.
    Graph: ({ props }) => (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        Graph Component: {props.type}
      </div>
    )
  }
});
