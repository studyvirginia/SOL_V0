import { useEffect, useMemo, useRef, useState } from "react";

export default function ChatWindowNew() {
  const [subject, setSubject] = useState("Math");
  const [courseOptions, setCourseOptions] = useState({});
  const courses = useMemo(() => courseOptions[subject] || [], [courseOptions, subject]);
  const [course, setCourse] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();

        if (res.ok && data?.options) {
          setCourseOptions(data.options);
          const chosenSubject = data.options[subject] ? subject : Object.keys(data.options)[0] || "";
          const chosenCourses = data.options[chosenSubject] || [];
          setSubject(chosenSubject);
          setCourse(chosenCourses[0] || "");
        } else {
          console.error("Could not load course options", data);
        }
      } catch (err) {
        console.error("Error fetching course options", err);
      }
    }

    loadCourses();
  }, [subject]);

  useEffect(() => {
    setCourse((prev) => (courses.includes(prev) ? prev : courses[0] || prev));
  }, [courses]);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome! Choose a subject/course and ask a question (e.g., 'Explain the Pythagorean theorem').",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(e) {
    e?.preventDefault?.();
    setError("");

    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          subject,
          course,
          sessionMemory: messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data?.response || "(empty response)" }]);
    } catch (err) {
      setError(err?.message || "Something went wrong");
      setMessages((prev) => [...prev, { role: "assistant", content: "I hit an error talking to the server. Check your API key and try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white shadow-large p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">SOL Study Assistant</h2>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-gray-100 bg-white p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {Object.keys(courseOptions).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Course</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="space-y-3">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-base leading-relaxed ${isUser ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-900"}`}>
                  {m.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-200 px-4 py-2 text-sm text-gray-600 italic">AI is thinking...</div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
        <input
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here to ask a question or learn something..."
          disabled={loading}
        />
        <button
          type="submit"
          className="rounded-full bg-primary-500 p-3 text-white shadow-soft hover:bg-primary-600 disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10L21 3 8 10.5 21 18 3 10z" />
          </svg>
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-gray-500 text-center">All subjects are dynamically loaded from CSV curriculum data.</p>
    </div>
  );
}
