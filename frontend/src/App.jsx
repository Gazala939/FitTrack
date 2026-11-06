
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Workouts from "./pages/Workouts";

import DailyProgress from "./pages/DailyProgress";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";

import Notifications from "./pages/Notifications";

import WorkoutPlanner from "./pages/WorkoutPlanner";

import WorkoutCalendar from "./pages/WorkoutCalendar";

import ExerciseLibrary from "./pages/ExerciseLibrary";

import ProgressComparison from "./pages/ProgressComparison";

import WorkoutRecommendations from "./pages/WorkoutRecommendations";

import StreakTracking from "./pages/StreakTracking";
import Achievements from "./pages/Achievements";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route path="/register" element={<Register />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/workouts"
            element={
              <ProtectedRoute>
                <Workouts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <DailyProgress />
              </ProtectedRoute>
            }
          />

          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/workout-calendar"
            element={
              <ProtectedRoute>
                <WorkoutCalendar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/workout-planner"
            element={
              <ProtectedRoute>
                <WorkoutPlanner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exercise-library"
            element={
              <ProtectedRoute>
                <ExerciseLibrary />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <WorkoutRecommendations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/streaks"
            element={
              <ProtectedRoute>
                <StreakTracking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/progress-comparison"
            element={
              <ProtectedRoute>
                <ProgressComparison />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
