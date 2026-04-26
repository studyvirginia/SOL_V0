import { MODE_MAP, getSubModeLabel } from '../lib/modeMap';
import { Button } from "./ui/button";

export const QuickActions = ({ actions, onSwitch, onSend, currentSubMode }) => {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full max-w-[700px]">
      {actions.map((act, i) => {
        const isObject = typeof act === "object" && act !== null;
        if (isObject) {
          return (
            <Button
              key={i}
              size="sm"
              onClick={() => {
                if (act.targetMode) onSwitch(act.targetMode, false);
                onSend(act.prompt);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              {act.label}
            </Button>
          );
        }

        const isPillar = MODE_MAP[act];
        const label = isPillar ? `Next: ${isPillar.label}` : getSubModeLabel(act);
        const subModeId = isPillar ? isPillar.subModes[0].id : act;
        const isRecommended = !isPillar;

        return (
          <Button
            key={act}
            size="sm"
            variant={isRecommended ? "default" : "outline"}
            onClick={() => {
              if (isPillar) {
                // Return to AI to ask for specific submode choice
                onSend(`Switch to ${isPillar.label} mode. Show me my options.`);
              } else {
                onSwitch(subModeId, true);
              }
            }}
            className={isRecommended ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            {label} {isRecommended && "★"}
          </Button>
        );
      })}
    </div>
  );
};
