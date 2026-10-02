import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import DataQualityPage from "./pages/DataQualityPage";
import MachineLearningPage from "./pages/MachineLearningPage";
import LogsPage from "./pages/LogsPage";
import { DatasetProvider } from "./context/DatasetContext";

import "./App.css";

export default function App() {
  return (
    <DatasetProvider>
      <BrowserRouter>

        <div className="app-shell">

          <aside className="sidebar">

            <div className="brand">
              <div className="brand-icon">DG</div>

              <div>
                <h2>DataGuardian</h2>
                <span>Data Intelligence</span>
              </div>
            </div>

            <nav className="sidebar-nav">

              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span>▦</span>
                Dashboard
              </NavLink>

              <NavLink
                to="/quality"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span>✓</span>
                Data Quality
              </NavLink>

              <NavLink
                to="/ml"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span>◈</span>
                Machine Learning
              </NavLink>

              <NavLink
                to="/logs"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span>≡</span>
                Pipeline Logs
              </NavLink>

            </nav>

            <div className="sidebar-footer">

              <div className="system-status">

                <span className="status-dot"></span>

                <div>
                  <strong>System Online</strong>
                  <span>DataGuardian API</span>
                </div>

              </div>

            </div>

          </aside>

          <main className="main-content">

            <Routes>
              <Route
                path="/"
                element={<DashboardPage />}
              />

              <Route
                path="/quality"
                element={<DataQualityPage />}
              />

              <Route
                path="/ml"
                element={<MachineLearningPage />}
              />

              <Route
                path="/logs"
                element={<LogsPage />}
              />
            </Routes>

          </main>

        </div>

      </BrowserRouter>
    </DatasetProvider>
  );
}