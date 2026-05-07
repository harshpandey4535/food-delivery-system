import { FormEvent, useMemo, useState } from "react";
import { useFoodApp } from "../context/AppContext";

export function MealPlannerPage() {
  const { generatePlan, mealPlan, user, restaurants } = useFoodApp();
  const [budget, setBudget] = useState(String(user?.preferences.budget ?? 1400));
  const [diet, setDiet] = useState(user?.preferences.diet ?? "veg");
  const [cuisines, setCuisines] = useState((user?.preferences.cuisines ?? ["healthy"]).join(", "));
  const [loading, setLoading] = useState(false);

  const menuItemsHint = useMemo(() => restaurants.map((restaurant) => restaurant.cuisine).join(", "), [restaurants]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      await generatePlan({
        budget: Number(budget),
        diet,
        cuisines: cuisines.split(",").map((item) => item.trim()).filter(Boolean),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Weekly meal planner</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Enter your budget and preferences. The backend can call the Python ML service, and the app will fall back to a local planner if the service is offline.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="app-panel p-6">
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Weekly budget</label>
              <input className="app-input" type="number" min={0} value={budget} onChange={(event) => setBudget(event.target.value)} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Diet preference</label>
              <select className="app-input" value={diet} onChange={(event) => setDiet(event.target.value as typeof diet)}>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
                <option value="vegan">Vegan</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Preferred cuisines</label>
              <input className="app-input" value={cuisines} onChange={(event) => setCuisines(event.target.value)} placeholder="healthy, indian, asian" />
            </div>

            <button type="submit" disabled={loading} className="app-button w-full">
              {loading ? "Generating plan..." : "Generate weekly plan"}
            </button>
          </form>

          <p className="mt-4 text-xs leading-5 text-slate-500">Available cuisines in the demo dataset: {menuItemsHint}.</p>
        </section>

        <section className="space-y-4">
          {mealPlan ? (
            <>
              <div className="app-panel p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total cost</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">Rs {mealPlan.totalCost}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">Rs {mealPlan.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Calories</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">{mealPlan.totalCalories}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {mealPlan.weeklyPlan.map((day) => (
                  <article key={day.day} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">{day.day}</h3>
                      <span className="app-chip">Rs {day.totalCost} | {day.totalCalories} cal</span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <p className="font-medium text-slate-900">Breakfast</p>
                        <p className="text-slate-500">{day.breakfast.name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Lunch</p>
                        <p className="text-slate-500">{day.lunch.name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Dinner</p>
                        <p className="text-slate-500">{day.dinner.name}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="app-panel p-8 text-center text-slate-500">Generate a plan to see the weekly schedule here.</div>
          )}
        </section>
      </div>
    </div>
  );
}
