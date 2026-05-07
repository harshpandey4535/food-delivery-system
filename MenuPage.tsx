import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useFoodApp } from "../context/AppContext";

export function MenuPage() {
  const { restaurantId } = useParams();
  const { restaurants, addToCart, cart } = useFoodApp();

  const restaurant = restaurants.find((entry) => entry.id === restaurantId);

  const cartCounts = useMemo(() => {
    const counts = new Map<string, number>();
    cart.forEach((item) => {
      counts.set(`${item.restaurantId}:${item.id}`, item.quantity);
    });
    return counts;
  }, [cart]);

  if (!restaurant) {
    return (
      <div className="app-panel p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">Restaurant not found</h1>
        <p className="mt-2 text-slate-500">The selected restaurant is not available.</p>
        <Link to="/" className="mt-6 inline-flex app-button">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link to="/" className="app-link">
              Back to restaurants
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{restaurant.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {restaurant.cuisine} cuisine from {restaurant.location}. Delivery time {restaurant.deliveryTime}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurant.tags.map((tag) => (
              <span key={tag} className="app-chip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Menu</h2>
            <p className="text-sm text-slate-500">Add items directly to your cart.</p>
          </div>
          <Link to="/cart" className="app-button-secondary">
            Go to cart
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {restaurant.menu.map((item) => {
            const inCart = cartCounts.get(`${restaurant.id}:${item.id}`) ?? 0;

            return (
              <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.veg ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {item.veg ? "Veg" : "Non-veg"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="app-chip">Rs {item.price}</span>
                  <span className="app-chip">{item.calories} cal</span>
                  <span className="app-chip">{item.category}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="app-chip">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">In cart: {inCart}</p>
                  <button type="button" onClick={() => addToCart(item, restaurant)} className="app-button">
                    Add to cart
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
