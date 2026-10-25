// scratch/test_extractor.js
const fs = require('fs');

function extractComponentsFromText(text) {
  if (!text || typeof text !== 'string') return { syntheticParts: [], cleanedText: text || '' };

  const syntheticParts = [];
  let cleanedText = text;

  // Match ```json ... ``` code blocks
  const codeBlockRE = /```(?:json)?\n([\s\S]*?)\n```/g;
  let match;
  while ((match = codeBlockRE.exec(text)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;

    const patchLines = raw.split('\n').filter(l => l.trim().startsWith('{"op":'));
    if (patchLines.length > 0) {
      cleanedText = cleanedText.replace(match[0], '');
      continue;
    }

    try {
      const obj = JSON.parse(raw);
      if (obj && obj.type && obj.props) {
        const toolName = obj.type;
        if (['Flashcards', 'MCQ', 'Quiz', 'Actions', 'renderMessage'].includes(toolName)) {
          syntheticParts.push({ type: 'tool-call', toolName, args: obj.props });
        }
      }
      if (obj && Array.isArray(obj.cards)) {
        syntheticParts.push({ type: 'tool-call', toolName: 'Flashcards', args: { cards: obj.cards } });
      }
      if (obj && obj.question && Array.isArray(obj.options)) {
        syntheticParts.push({ type: 'tool-call', toolName: 'MCQ', args: obj });
      }
      cleanedText = cleanedText.replace(match[0], '');
    } catch (e) {
        console.error("Codeblock JSON err:", e);
    }
  }

  // Fallback 1: Raw JSON objects dropped directly in the text without code blocks
  let searchIdx = 0;
  while (true) {
    const startIdx = text.indexOf('{', searchIdx);
    if (startIdx === -1) break;
    
    const snippet = text.slice(startIdx, startIdx + 60);
    if (snippet.includes('"type"') && (snippet.includes('"props"') || snippet.includes('"Flashcards"') || snippet.includes('"Actions"'))) {
      let openBraces = 0;
      let endIdx = -1;
      for (let i = startIdx; i < text.length; i++) {
        if (text[i] === '{') openBraces++;
        else if (text[i] === '}') {
          openBraces--;
          if (openBraces === 0) {
            endIdx = i;
            break;
          }
        }
      }
      
      if (endIdx !== -1) {
        try {
          const rawBlock = text.slice(startIdx, endIdx + 1);
          console.log("Found raw block candidate:", rawBlock.substring(0, 50));
          const obj = JSON.parse(rawBlock);
          if (obj && obj.type && obj.props) {
            const toolName = obj.type;
            if (['Flashcards', 'MCQ', 'Quiz', 'Actions', 'renderMessage'].includes(toolName)) {
              if (!syntheticParts.some(p => p.toolName === toolName && JSON.stringify(p.args) === JSON.stringify(obj.props))) {
                syntheticParts.push({ type: 'tool-call', toolName, args: obj.props });
              }
            }
          }
          cleanedText = cleanedText.replace(rawBlock, '');
        } catch (e) { 
           console.error("JSON Error parsing block string:", text.slice(startIdx, endIdx + 1));
           console.error(e.message); 
        }
        searchIdx = endIdx + 1;
        continue;
      }
    }
    searchIdx = startIdx + 1;
  }

  if (syntheticParts.length === 0) {
    const inlinePatches = text.split('\n').filter(l => l.trim().startsWith('{"op":'));
    if (inlinePatches.length > 0) {
      cleanedText = cleanedText.split('\n').filter(l => !l.trim().startsWith('{"op":')).join('\n');
    }
  }

  return { syntheticParts, cleanedText: cleanedText.trim() };
}

const input = `this is rendering as text and some of the text on the flashcards is not rendering katex are we also having all the generative ui:Okay! Let's create some flashcards focusing on limits and derivatives. These flashcards will help you review key concepts and definitions.

{ "type": "Flashcards", "props": { "cards": [ { "front": "Define a limit.", "back": "The value that a function approaches as the input (or index) approaches some value." } ] } }

What would you like to do next?

{ "type": "Actions", "props": { "actions": [ { "label": "Derivative Rules", "prompt": "Generate flashcards focusing on derivative rules." } ] } }`;

const res = extractComponentsFromText(input);
console.log("PARSED PARTS:");
console.dir(res.syntheticParts, {depth: null});
console.log("CLEANED TEXT:");
console.log(res.cleanedText);
