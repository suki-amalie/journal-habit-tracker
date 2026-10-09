
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useHotkey } from "../hooks/useHotkey";
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
      <div className="sticky top-0 z-20 shrink-0 bg-[#f7f3ea] px-4 py-3">

      <nav
        aria-label="Journal sections"
        className="inline-flex rounded-xl border border-[#D8D0C2] bg-[#F3EFE7] p-1"
      >
        {tabs.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#FAF8F3] text-[#292824] shadow-sm"
                  : "text-[#716D63] hover:text-[#292824]"
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
