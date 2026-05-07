import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useFoodApp } from "../context/AppContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/meal-planner", label: "Planner" },
  { to: "/cart", label: "Cart" },
  { to: "/dashboard", label: "Dashboard" },
];

export function Shell() {
  const { user, cart, logout } = useFoodApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-slate-900">
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/10">
              ML
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">MealLane</span>
              <span className="block text-xs text-slate-500">Food delivery and weekly planning</span>
            </span>
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{cart.length} items in cart</p>
            </div>
            <button type="button" onClick={logout} className="app-button-secondary hidden sm:inline-flex">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl justify-between gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex-1 rounded-2xl px-3 py-2 text-center text-sm font-medium ${isActive ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
