import { useState } from "react";

// Interactive practice quiz. Every question, choice, and correct answer renders
// server-side into the HTML (the <details> answer is native and crawlable), so
// the page carries real, unique content for search engines even before JS runs.
// Client JS adds click-to-check feedback on top.
export default function PracticeQuiz({ questions }) {
  const [picked, setPicked] = useState({}); // id -> chosen label

  return (
    <ol className="mt-8 space-y-8">
      {questions.map((q, i) => {
        const chosen = picked[q.id];
        const answerChoice = q.choices.find((c) => c.label === q.answer);
        return (
          <li key={q.id} className="rounded-lg border border-border p-5">
            <p className="font-medium">
              <span className="text-muted-foreground">{i + 1}.</span> {q.stem}
            </p>
            <div className="mt-4 space-y-2" role="group" aria-label={`Question ${i + 1} choices`}>
              {q.choices.map((c) => {
                const isChosen = chosen === c.label;
                const isCorrect = c.label === q.answer;
                let cls =
                  "flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ";
                if (chosen) {
                  if (isCorrect) cls += "border-green-500 bg-green-500/10";
                  else if (isChosen) cls += "border-red-500 bg-red-500/10";
                  else cls += "border-border opacity-70";
                } else {
                  cls += "border-border hover:bg-muted";
                }
                return (
                  <button
                    key={c.label}
                    type="button"
                    className={cls}
                    aria-pressed={isChosen}
                    onClick={() => setPicked((p) => ({ ...p, [q.id]: c.label }))}
                  >
                    <span className="font-mono text-xs font-semibold">{c.label}</span>
                    <span>{c.text}</span>
                  </button>
                );
              })}
            </div>
            {chosen && (
              <p className="mt-3 text-sm font-medium" role="status">
                {chosen === q.answer ? (
                  <span className="text-green-600">Correct.</span>
                ) : (
                  <span className="text-red-600">
                    Not quite — the correct answer is {q.answer}.
                  </span>
                )}
              </p>
            )}
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Show answer
              </summary>
              <p className="mt-2">
                <strong>Answer: {q.answer}</strong>
                {answerChoice ? ` — ${answerChoice.text}` : ""}
              </p>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
