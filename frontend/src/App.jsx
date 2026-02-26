import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import HomeLayout from "./Layout/HomeLayout.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Meeting from "./Pages/Meeting.jsx";
import Company from "./Pages/Company.jsx";
import DefaultPage from "./Pages/DefaultPage.jsx";
import CreateEvent from "./Pages/CreateEvent.jsx";
import EventDetail from "./Components/EventDetail.jsx";
import UpdateEvent from "./Pages/UpdateEvent.jsx";
import DashboardStats from "./Components/Dashboard/DashboardStats.jsx";
import Users from "./Pages/Users.jsx";
import PartnerRequests from "./Pages/PartnerRequests.jsx";

function App() {
  return (
    <Routes>
      {/* All routes are public - no authentication required */}
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<DashboardStats />} />
        <Route path="create" element={<CreateEvent />} />
        <Route path="users" element={<Users />} />
        <Route path="/event/:id" element={<Dashboard />} />
        <Route path="/event/update/:id" element={<UpdateEvent />} />
        <Route path="/event/:id/meeting" element={<Meeting />} />
        <Route path="/event/:id/company" element={<Company />} />
        <Route path="/event/:id/partner-requests" element={<PartnerRequests />} />
      </Route>

      {/* Fallback route for invalid paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
