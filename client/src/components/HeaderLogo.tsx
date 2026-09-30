// HeaderLogo.tsx

import { NavLink } from "react-router-dom";
import { InkDropGroup } from "./InkDrops";

export function HeaderLogo() {
  return (
    <NavLink
      to="/"
      className="group flex items-center gap-2"
      aria-label="Hibi Notes home"
    >
      <span className="font-serif text-xl text-[#292824] transition-opacity group-hover:opacity-70">
        Hibi Notes
      </span>

      <InkDropGroup
        size={15}
        gap="gap-0.5"
        className="transition-transform duration-300 group-hover:rotate-[-2deg] group-hover:scale-105"
      />
    </NavLink>
  );
}