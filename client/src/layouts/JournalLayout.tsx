
import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/journal/write", label: "Write" },
  { to: "/journal/history", label: "History" },
];

function JournalLayout() {
  return (
    <div>
      <nav
        aria-label="Journal sections"
        className="mb-8 inline-flex rounded-xl border border-[#D8D0C2] bg-[#F3EFE7] p-1"
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

      <Outlet />
    </div>
  );
}

export default JournalLayout;

