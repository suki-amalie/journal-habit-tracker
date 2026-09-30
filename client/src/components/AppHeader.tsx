import { LayoutDashboard, PenLine } from "lucide-react";
import { NavLink } from "react-router-dom";

import { InkDropGroup } from "./InkDrops";

function AppHeader() {
  return (
    <header
      className="
        fixed
        inset-y-0
        left-0
        z-50
        hidden
        w-48
        bg-[#5A3E32]
        lg:block
      "
    >
      <div className="flex h-full flex-col px-7 py-8">
        <NavLink to="/" className="group">
          <div className="font-serif text-2xl text-[#F7F3EA]">
            Hibi Notes
          </div>

          <InkDropGroup
            size={21}
            gap="gap-1"
            className="mt-2"
          />
        </NavLink>

        <nav
          className="mt-16 flex flex-col gap-2"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `
                flex items-center gap-3
                rounded-md
                px-3 py-2.5
                text-sm
                transition-colors
                ${
                  isActive
                    ? "bg-[#F7F3EA]/10 text-[#F7F3EA]"
                    : "text-[#D8C8BA] hover:text-[#F7F3EA]"
                }
              `
            }
          >
            <LayoutDashboard size={16} strokeWidth={1.7} />
            Dashboard
          </NavLink>

          <NavLink
            to="/journal"
            className={({ isActive }) =>
              `
                flex items-center gap-3
                rounded-md
                px-3 py-2.5
                text-sm
                transition-colors
                ${
                  isActive
                    ? "bg-[#F7F3EA]/10 text-[#F7F3EA]"
                    : "text-[#D8C8BA] hover:text-[#F7F3EA]"
                }
              `
            }
          >
            <PenLine size={16} strokeWidth={1.7} />
            Journal
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default AppHeader;