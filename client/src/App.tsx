import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import JournalLayout from "./layouts/JournalLayout";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Journal from "./pages/Journal";
import JournalHistory from "./pages/JournalHistory";
import ProtectedRoute from "./components/ProtectedRoutes";
import Login from "./pages/Login";
import Register from "./pages/Register"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All routes inside this wrapper require authentication. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/journal" element={<JournalLayout />}>
              <Route index element={<Navigate to="write" replace />} />
              <Route path="write" element={<Journal />} />
              <Route path="history" element={<JournalHistory />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
