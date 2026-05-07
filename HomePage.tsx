import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFoodApp } from "../context/AppContext";

export function HomePage() {
  const { restaurants, recommendations, cart, user } = useFoodApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredRestaurants = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) return restaurants;

    return restaurants.filter((restaurant) => {
      const haystack = [restaurant.name, restaurant.location, restaurant.cuisine, ...restaurant.tags].join(" ").toLowerCase();
      return haystack.includes(search);
    });
  }, [restaurants, query]);

  return (
    <div className="space-y-8">
      <section className="app-panel overflow-hidden px-6 py-6 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-indigo-600">MealLane</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Order food, plan the week, and keep your spend under control.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Find restaurants, add menu items to your cart, create a weekly meal plan based on budget and preferences, and track every order in one dashboard.
            </p>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => navigate("/meal-planner")} className="app-button">
                Build meal plan
              </button>
              <Link to="/dashboard" className="app-button-secondary">
                View dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10">
            <p className="text-sm text-slate-300">Welcome back</p>
            <p className="mt-2 text-2xl font-semibold">{user?.name}</p>
            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                {restaurants.length} restaurants available
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                {cart.length} items waiting in cart
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                {recommendations.length} personalized recommendations
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                AI planner and chatbot enabled
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Restaurants</h2>
            <p className="text-sm text-slate-500">Search by name, location, cuisine, or tags.</p>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="app-input max-w-sm"
            placeholder="Search restaurants"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredRestaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              className="group rounded-3xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{restaurant.name}</h3>
                  <p className="text-sm text-slate-500">
                    {restaurant.cuisine} | {restaurant.location}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {restaurant.rating.toFixed(1)} rating
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="app-chip">{restaurant.deliveryTime}</span>
                {restaurant.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="app-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
