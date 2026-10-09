import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CheckSquare,
  BookOpen,
} from "lucide-react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import ShortcutsHelp from "../components/ShortcutsHelp";
import { useHotkey } from "../hooks/useHotkey";
import { usePersistentToggle } from "../hooks/usePersistentToggle";

function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, toggleCollapsed] = usePersistentToggle(
    "layout:sidebar-collapsed",
  );
  const [helpOpen, setHelpOpen] = useState(false);

  useHotkey("b", toggleCollapsed);
  useHotkey("?", () => setHelpOpen((open) => !open));
  useHotkey("h", () => navigate("/habits"));
  useHotkey("j", () => navigate("/journal/write"));
  useHotkey("d", () => navigate("/"));

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Habits", href: "/habits", icon: CheckSquare },
    { label: "Journal", href: "/journal", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-[#5A3E32]">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col justify-between overflow-hidden bg-[#5A3E32] transition-[width] duration-200 ease-in-out ${
          collapsed ? "w-16" : "w-52"
        }`}
      >
        {/* Sidebar content */}
        <div className={`flex h-full flex-col ${collapsed ? "px-2" : "px-4"}`}>
          {/* Header */}
          <div className="relative mb-6 h-20 shrink-0">
            {/* Logo */}
            <div
              className={`absolute left-0 top-5 whitespace-nowrap font-serif text-2xl font-bold leading-none text-[#F7F3EA] transition-all duration-150 ${
                collapsed
                  ? "pointer-events-none -translate-x-2 opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              Hibi Notes
            </div>

            {/* Sidebar toggle */}
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={
                collapsed ? "Expand sidebar (B)" : "Collapse sidebar (B)"
              }
              title={collapsed ? "Expand sidebar (B)" : "Collapse sidebar (B)"}
              className="absolute right-2 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#D8C8BA] transition-colors hover:bg-[#836050] hover:text-[#F7F3EA]"
            >
              {collapsed ? (
                <ChevronRight size={18} strokeWidth={2.5} />
              ) : (
                <ChevronLeft size={18} strokeWidth={2.5} />
              )}
            </button>

            {/* Dots */}
            <div
              className={`absolute bottom-2 left-0 flex items-center gap-2 transition-all duration-200 ${collapsed ? "left-1 gap-1.5" : ""}`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#7C90A0]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#778A68]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#C48B9F]" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`group flex h-10 items-center rounded-xl text-sm font-medium transition-colors duration-200 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B5C8] ${
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                  } ${
                    isActive
                      ? "bg-[#F7F3EA] text-[#5A3E32] shadow-sm"
                      : "text-[#D8C8BA] hover:bg-[#6c4d3f] hover:text-[#F7F3EA]"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />

                  <span
                    className={`whitespace-nowrap transition-all duration-150 ${
                      collapsed
                        ? "pointer-events-none w-0 -translate-x-2 opacity-0"
                        : "w-auto translate-x-0 opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto mb-3 border-t border-[#6c4d3f] pt-3">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              title="Shortcuts (?)"
              className={`flex h-10 w-full items-center rounded-xl text-sm text-[#D8C8BA] transition-colors duration-200 hover:bg-[#6c4d3f] hover:text-[#F7F3EA] ${
                collapsed ? "justify-center" : "gap-3 px-3"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#836050] text-xs font-medium">
                ?
              </span>

              <span
                className={`whitespace-nowrap transition-all duration-150 ${
                  collapsed
                    ? "pointer-events-none w-0 -translate-x-2 opacity-0"
                    : "w-auto translate-x-0 opacity-100"
                }`}
              >
                Shortcuts
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="min-h-0 flex-1 bg-[#f7f3ea]">
        <main className="min-h-screen bg-[#f7f3ea]">
          <ErrorBoundary>
            <div key={pathname} className="animate-page-in">
              <Outlet />
            </div>
          </ErrorBoundary>
        </main>
      </div>

      {helpOpen && <ShortcutsHelp onClose={() => setHelpOpen(false)} />}
    </div>
  );
}

export default AppLayout;
