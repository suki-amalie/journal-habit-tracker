import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader";

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#5A3E32]">
      <div className="min-h-screen lg:ml-48">
        <AppHeader />

        <main className="min-h-screen bg-[#f7f3ea]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;