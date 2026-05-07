import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFoodApp } from "../context/AppContext";

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register, user } = useFoodApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    diet: "veg" as const,
    cuisines: "healthy, indian",
    budget: "1200",
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          diet: form.diet,
          cuisines: form.cuisines.split(",").map((item) => item.trim()).filter(Boolean),
          budget: Number(form.budget),
        });
      }

      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-950/20">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-indigo-200">MealLane</p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Food delivery, weekly planning, and smart recommendations in one place.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-slate-300">
              Sign in to order from restaurants, build a weekly meal plan, and see recommendations powered by your order history.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              JWT login with refresh tokens
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              Razorpay test checkout integration
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              Meal planner and weekly analytics
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              Basic chatbot for food suggestions
            </div>
          </div>
        </section>

        <section className="app-panel p-6 sm:p-8">
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl px-4 py-3 transition ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-xl px-4 py-3 transition ${mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
            >
              Register
            </button>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {mode === "register" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  className="app-input"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
            ) : null}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="app-input"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="app-input"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>

            {mode === "register" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Diet preference</label>
                    <select
                      className="app-input"
                      value={form.diet}
                      onChange={(event) => setForm((current) => ({ ...current, diet: event.target.value as typeof form.diet }))}
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-veg</option>
                      <option value="vegan">Vegan</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Budget</label>
                    <input
                      type="number"
                      className="app-input"
                      value={form.budget}
                      onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
                      placeholder="1200"
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Preferred cuisines</label>
                  <input
                    className="app-input"
                    value={form.cuisines}
                    onChange={(event) => setForm((current) => ({ ...current, cuisines: event.target.value }))}
                    placeholder="healthy, indian, asian"
                  />
                </div>
              </>
            ) : null}

            <button type="submit" disabled={loading} className="app-button w-full">
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Demo note: if the backend is not running, the app falls back to local mock auth so the UI stays usable.
          </p>
        </section>
      </div>
    </div>
  );
}
