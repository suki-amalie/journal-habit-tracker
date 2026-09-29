import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/journal" element={<Journal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
