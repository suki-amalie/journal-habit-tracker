import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import JournalLayout from "./layouts/JournalLayout";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Journal from "./pages/Journal";
import JournalHistory from "./pages/JournalHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/journal" element={<JournalLayout />}>
            <Route path="write" element={<Journal />} />
            <Route path="history" element={<JournalHistory />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;