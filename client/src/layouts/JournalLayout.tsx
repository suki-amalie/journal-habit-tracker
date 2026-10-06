import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/journal/write", label: "Write" },
  { to: "/journal/history", label: "History" },
];

function JournalLayout() {
  return (
    <div>
      <nav aria-label="Journal sections" className="mb-8 flex gap-6 border-b border-[#D8D0C2]">
        {tabs.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `-mb-px border-b-2 pb-2 text-sm transition-colors ${
                isActive
                  ? "border-[#4F8A47] text-[#292824]"
                  : "border-transparent text-[#716D63] hover:text-[#292824]"
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