import { MODE_MAP, getSubModeLabel } from '../lib/modeMap';

export const QuickActions = ({ actions, onSwitch, onSend, currentSubMode }) => {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full max-w-[700px]">
      {actions.map((act, i) => {
        const isObject = typeof act === "object" && act !== null;
        if (isObject) {
          return (
            <button
              key={i}
              onClick={() => {
                if (act.targetMode) {
                  onSwitch(act.targetMode, true);
                } else {
                  onSend(act.prompt);
                }
              }}
              className="group flex items-center gap-2 rounded-lg px-3 py-1.5 text-[0.7rem] font-bold transition-all shadow-sm ring-1 ring-inset active:scale-95 bg-indigo-600 text-white ring-indigo-500 hover:bg-indigo-700 hover:shadow-md dark:bg-indigo-700 dark:ring-indigo-600 dark:hover:bg-indigo-600"
            >
              {act.label}
            </button>
          );
        }

        const isPillar = MODE_MAP[act];
        const label = isPillar ? `Next: ${isPillar.label}` : getSubModeLabel(act);
        const subModeId = isPillar ? isPillar.subModes[0].id : act;
        const isRecommended = !isPillar;

        return (
          <button
            key={act}
            onClick={() => {
              if (isPillar) {
                // Return to AI to ask for specific submode choice
                onSend(`Switch to ${isPillar.label} mode. Show me my options.`);
              } else {
                onSwitch(subModeId, true);
              }
            }}
            className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-[0.7rem] font-bold transition-all shadow-sm ring-1 ring-inset active:scale-95 ${
              isRecommended 
                ? "bg-blue-600 text-white ring-blue-500 hover:bg-blue-700 hover:shadow-md" 
                : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
            }`}
          >
            {label} {isRecommended && "★"}
          </button>
        );
      })}
    </div>
  );
};
