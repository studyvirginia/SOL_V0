// scratch/chrono_parser.js

function parseChronological(text) {
  if (!text) return [];
  const timeline = [];
  let remaining = text;

  while (remaining.length > 0) {
    // We look for two patterns:
    // 1. ```json\n{ ... }\n```
    // 2. {\n "type": "Flashcards" ... }
    
    // Pattern 1: Code block
    const codeBlockMatch = /```(?:json)?\n([\s\S]*?)\n```/.exec(remaining);
    
    // Pattern 2: Raw brace
    let rawMatch = null;
    let searchIdx = 0;
    while (true) {
        const startIdx = remaining.indexOf('{', searchIdx);
        if (startIdx === -1) break;
        const snippet = remaining.slice(startIdx, startIdx + 60);
        if (snippet.includes('"type"') && (snippet.includes('"props"') || snippet.includes('"Flashcards"') || snippet.includes('"Actions"'))) {
            let openBraces = 0;
            let endIdx = -1;
            for (let i = startIdx; i < remaining.length; i++) {
                if (remaining[i] === '{') openBraces++;
                else if (remaining[i] === '}') {
                    openBraces--;
                    if (openBraces === 0) {
                        endIdx = i;
                        break;
                    }
                }
            }
            if (endIdx !== -1) {
                try {
                    const blockStr = remaining.slice(startIdx, endIdx + 1);
                    const obj = JSON.parse(blockStr);
                    if (obj && obj.type && obj.props && ['Flashcards', 'MCQ', 'Quiz', 'Actions', 'renderMessage'].includes(obj.type)) {
                        rawMatch = { index: startIdx, length: (endIdx + 1) - startIdx, obj };
                        break;
                    }
                } catch(e) {}
                searchIdx = endIdx + 1;
                continue;
            }
        }
        searchIdx = startIdx + 1;
    }

    // Which comes first?
    let firstMatch = null;
    let type = null;

    if (codeBlockMatch && rawMatch) {
       if (codeBlockMatch.index <= rawMatch.index) {
          firstMatch = codeBlockMatch;
          type = 'code';
       } else {
          firstMatch = rawMatch;
          type = 'raw';
       }
    } else if (codeBlockMatch) {
       firstMatch = codeBlockMatch;
       type = 'code';
    } else if (rawMatch) {
       firstMatch = rawMatch;
       type = 'raw';
    }

    if (!firstMatch) {
       // Nothing left
       if (remaining.trim()) timeline.push({ type: 'text', content: remaining });
       break;
    }

    // Push preceding text 
    const precedingText = remaining.slice(0, firstMatch.index);
    if (precedingText.trim()) timeline.push({ type: 'text', content: precedingText });

    if (type === 'code') {
       try {
           const obj = JSON.parse(firstMatch[1].trim());
           if (obj && obj.type && obj.props && ['Flashcards', 'MCQ', 'Quiz', 'Actions', 'renderMessage'].includes(obj.type)) {
               timeline.push({ type: 'tool', toolName: obj.type, args: obj.props });
           } else {
               // Non-component JSON is treated as text
               timeline.push({ type: 'text', content: firstMatch[0] });
           }
       } catch {
           timeline.push({ type: 'text', content: firstMatch[0] });
       }
       remaining = remaining.slice(firstMatch.index + firstMatch[0].length);
    } else if (type === 'raw') {
       timeline.push({ type: 'tool', toolName: firstMatch.obj.type, args: firstMatch.obj.props });
       remaining = remaining.slice(firstMatch.index + firstMatch.length);
    }
  }

  // Deduplicate consecutive text blocks
  const collapsed = [];
  for (const node of timeline) {
    if (node.type === 'text') {
        const last = collapsed[collapsed.length - 1];
        if (last && last.type === 'text') {
            last.content += '\n' + node.content;
        } else {
            collapsed.push(node);
        }
    } else {
        collapsed.push(node);
    }
  }
  
  return collapsed;
}

const text = `this is rendering as text and some of the text on the flashcards is not rendering katex:Okay! Let's create some flashcards focusing on limits and derivatives. These flashcards will help you review key concepts and definitions.

{ "type": "Flashcards", "props": { "cards": [ { "front": "Define a limit.", "back": "The value that a function approaches as the input approaches some value." } ] } }

What would you like to do next?

{ "type": "Actions", "props": { "actions": [ { "label": "Derivative Rules", "prompt": "Generate flashcards focusing on derivative rules." } ] } }`;

console.log(JSON.stringify(parseChronological(text), null, 2));
