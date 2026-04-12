export const MODE_MAP = {
  diagnostic: { label: "Diagnostic", subModes: [{ id: "diagnostic", label: "Diagnostic Quiz" }] },
  review: { label: "Review", subModes: [{ id: "notes", label: "Guided Notes" }, { id: "study-guide", label: "Study Guide" }, { id: "flashcards", label: "Flashcards" }] },
  mastery: { label: "Mastery", subModes: [
    { id: "mnemonics", label: "Mnemonics & Patterns" }, 
    { id: "tips", label: "Tips, Tricks, Shortcuts" }, 
    { id: "analogies", label: "Analogies & Connections" }, 
    { id: "questions", label: "Questions" }
  ] },
  practice: { label: "Practice", subModes: [
    { id: "practice", label: "Adaptive Learning" }, 
    { id: "quiz", label: "Full Practice Test" }
  ] },
  progress: { label: "Progress", subModes: [{ id: "progress", label: "Learning Stats" }] },
};

export function getModeKeyFromSubMode(subModeId) {
  return Object.entries(MODE_MAP).find(([, mode]) => mode.subModes.some((sub) => sub.id === subModeId))?.[0] || "review";
}

export function getSubModeLabel(subModeId) {
  for (const mode of Object.values(MODE_MAP)) {
    const found = mode.subModes.find((sub) => sub.id === subModeId);
    if (found) return found.label;
  }
  return subModeId;
}
