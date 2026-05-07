import { useMemo } from "react";
import { useFoodApp } from "../context/AppContext";

function currency(value: number) {
  return `Rs ${value}`;
}

export function DashboardPage() {
  const { orders, mealPlan, recommendations, user } = useFoodApp();

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalCalories = mealPlan?.totalCalories ?? orders.reduce((sum, order) => {
      const calories = order.items.reduce((entrySum, item) => entrySum + item.calories * item.quantity, 0);
      return sum + calories;
    }, 0);
    const delivered = orders.filter((order) => order.status === "Delivered").length;

    return {
      totalSpent,
      totalCalories,
      delivered,
    };
  }, [orders, mealPlan]);

  const analytics = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const spending = labels.map((label, index) => ({
      label,
      value: orders.reduce((sum, order) => {
        const day = new Date(order.createdAt).getDay();
        const normalized = day === 0 ? 6 : day - 1;
        return normalized === index ? sum + order.totalPrice : sum;
      }, 0),
    }));

    const calories = labels.map((label, index) => ({
      label,
      value:
        mealPlan?.weeklyPlan[index]?.totalCalories ??
        orders.reduce((sum, order) => {
          const day = new Date(order.createdAt).getDay();
          const normalized = day === 0 ? 6 : day - 1;
          const orderCalories = order.items.reduce((entrySum, item) => entrySum + item.calories * item.quantity, 0);
          return normalized === index ? sum + orderCalories : sum;
        }, 0),
    }));

    return { spending, calories };
  }, [mealPlan, orders]);

  const maxSpend = Math.max(...analytics.spending.map((point) => point.value), 1);
  const maxCalories = Math.max(...analytics.calories.map((point) => point.value), 1);

  return (
    <div className="space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Order history, recommendation summary, and weekly analytics for {user?.name}.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Spending</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{currency(stats.totalSpent)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Calories</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.totalCalories}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Delivered orders</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.delivered}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="space-y-4">
          <div className="app-panel p-6">
            <h2 className="text-xl font-semibold text-slate-950">Weekly analytics</h2>
            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                  <span>Spending</span>
                  <span>Rs</span>
                </div>
                <div className="space-y-3">
                  {analytics.spending.map((point) => (
                    <div key={point.label} className="flex items-center gap-3">
                      <span className="w-10 text-xs font-medium text-slate-500">{point.label}</span>
                      <div className="h-3 flex-1 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-slate-950 transition-all"
                          style={{ width: `${(point.value / maxSpend) * 100}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs text-slate-500">{point.value ? currency(point.value) : "-"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                  <span>Calories</span>
                  <span>kcal</span>
                </div>
                <div className="space-y-3">
                  {analytics.calories.map((point) => (
                    <div key={point.label} className="flex items-center gap-3">
                      <span className="w-10 text-xs font-medium text-slate-500">{point.label}</span>
                      <div className="h-3 flex-1 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${(point.value / maxCalories) * 100}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs text-slate-500">{point.value || "-"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="app-panel p-6">
            <h2 className="text-xl font-semibold text-slate-950">Recommendations</h2>
            <div className="mt-4 space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.category} | {item.calories} cal</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-950">Rs {item.price}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Recommendations will appear after you place a few orders.</p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="app-panel p-6">
            <h2 className="text-xl font-semibold text-slate-950">Order history</h2>
            <div className="mt-4 space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <article key={order.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-950">{order.restaurantName}</p>
                        <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{order.status}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      {order.items.map((item) => (
                        <span key={`${order.id}-${item.id}`} className="app-chip">
                          {item.name} x {item.quantity}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Payment</span>
                      <span className="font-semibold text-slate-950">{currency(order.totalPrice)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">No orders yet. Place your first order from the cart page.</p>
              )}
            </div>
          </div>

          <div className="app-panel p-6">
            <h2 className="text-xl font-semibold text-slate-950">Meal plan snapshot</h2>
            {mealPlan ? (
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Budget: Rs {mealPlan.budget}</p>
                <p>Estimated cost: Rs {mealPlan.totalCost}</p>
                <p>Estimated calories: {mealPlan.totalCalories}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Create a weekly plan to see cost and calorie tracking here.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
