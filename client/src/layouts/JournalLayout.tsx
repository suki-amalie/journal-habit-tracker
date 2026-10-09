import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useHotkey } from "../hooks/useHotkey";
import { PetalDrift } from "../components/Petal";
const tabs = [
  { to: "/journal/write", label: "Write" },
  { to: "/journal/history", label: "History" },
];

function JournalLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useHotkey("w", () =>
    navigate(
      pathname.endsWith("/history") ? "/journal/write" : "/journal/history",
    ),
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="sticky top-0 z-30 shrink-0 bg-[#f7f3ea] px-4 py-3">
        {/* Hanging forget-me-nots */}
  <img
    src="/forget-me-not.png"
    alt=""
    aria-hidden="true"
    className="absolute right-42 -top-2 z-top-6 h-30 w-auto -scale-y-100 rotate-42  object-contain"
  />


  
<PetalDrift theme="blue"/>

        <nav
          aria-label="Journal sections"
          className="inline-flex rounded-full bg-[#efe9dc] p-1"
        >
          {tabs.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-[#fffefa] text-[#292824] shadow-sm"
                    : "text-[#8a867c] hover:text-[#292824]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default JournalLayout;
