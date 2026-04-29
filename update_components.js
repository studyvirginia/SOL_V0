const fs = require('fs');

const importQA = "import { QuickActions } from '../QuickActions';\n";

function addImportAndRender(file, isFinishedVar) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('QuickActions')) {
    content = content.replace(/(import .*?;?\n)+/, match => match + importQA);
  }
  
  // replace the prop signature to include the new props
  if (file.includes('QuizRunner.js')) {
    content = content.replace(/({ title, questions = \[\], mode = 'practice', onAction })/, "({ title, questions = [], mode = 'practice', actions, onSwitch, onSend, currentSubMode, onAction })");
  } else if (file.includes('FlashcardDeck.js')) {
    content = content.replace(/({ cards = \[\], onAction })/, "({ cards = [], actions, onSwitch, onSend, currentSubMode, onAction })");
  } else if (file.includes('AdaptiveMCQ.js')) {
    content = content.replace(/({ question, options = \[\], answer, explanation, mode = 'practice', onAction })/, "({ question, options = [], answer, explanation, mode = 'practice', actions, onSwitch, onSend, currentSubMode, onAction })");
  }

  // render QuickActions
  if (file.includes('QuizRunner.js')) {
    content = content.replace(/(<\/div>\n\s*)(<\/div>\n\s*)$/, `$1  {isReviewing && actions && <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6"><QuickActions actions={actions} onSwitch={onSwitch} onSend={onSend} currentSubMode={currentSubMode} /></div>}\n$2`);
  } else if (file.includes('FlashcardDeck.js')) {
    content = content.replace(/(<\/div>\n\s*)(<\/div>\n\s*)$/, `$1  {showRecap && actions && <div className="mt-8 border-t border-indigo-400/20 pt-6"><QuickActions actions={actions} onSwitch={onSwitch} onSend={onSend} currentSubMode={currentSubMode} /></div>}\n$2`);
  } else if (file.includes('AdaptiveMCQ.js')) {
    content = content.replace(/(<\/div>\n\s*)$/, `  {isAnswered && actions && <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6 flex justify-center"><QuickActions actions={actions} onSwitch={onSwitch} onSend={onSend} currentSubMode={currentSubMode} /></div>}\n$1`);
  }

  fs.writeFileSync(file, content);
}

addImportAndRender('frontend/components/learning/QuizRunner.js');
addImportAndRender('frontend/components/learning/FlashcardDeck.js');
addImportAndRender('frontend/components/learning/AdaptiveMCQ.js');
