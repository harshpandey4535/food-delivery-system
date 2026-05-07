import { useMemo, useState } from "react";
import { buildChatReply } from "../data/mock";
import { useFoodApp } from "../context/AppContext";

type ChatEntry = {
  role: "bot" | "user";
  text: string;
};

export function Chatbot() {
  const { mealPlan, recommendations } = useFoodApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatEntry[]>([
    { role: "bot", text: "Ask me for budget meals, protein ideas, or planner suggestions." },
  ]);

  const quickSuggestions = useMemo(
    () => [
      "Suggest a healthy lunch",
      "What can I order under budget?",
      "Give me a high protein meal",
    ],
    [],
  );

  const respond = (prompt: string) => {
    const reply = buildChatReply(prompt);
    if (mealPlan) {
      return `${reply} Your current weekly plan has an estimated spend of Rs ${mealPlan.totalCost}.`;
    }

    if (recommendations.length > 0) {
      return `${reply} I also found ${recommendations[0].name} as a strong recommendation.`;
    }

    return reply;
  };

  const submit = (prompt: string) => {
    const value = prompt.trim();
    if (!value) return;

    setMessages((current) => [...current, { role: "user", text: value }, { role: "bot", text: respond(value) }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="w-[min(92vw,24rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Food Assistant</p>
              <p className="text-xs text-slate-500">Simple meal suggestions</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="app-chip">
              Close
            </button>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${message.role === "bot" ? "bg-slate-100 text-slate-700" : "ml-auto bg-slate-950 text-white"}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickSuggestions.map((item) => (
                <button key={item} type="button" onClick={() => submit(item)} className="app-chip text-[11px]">
                  {item}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submit(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask for a meal suggestion"
                className="app-input py-2.5"
              />
              <button type="submit" className="app-button px-4 py-2.5">
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="app-button shadow-xl shadow-slate-950/10">
          Chat
        </button>
      )}
    </div>
  );
}
