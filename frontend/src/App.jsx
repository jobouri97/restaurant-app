import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CustomerOrderPage from "./pages/CustomerOrderPage.jsx";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />

      <Route path="/auth" element={<AuthPage />} />
      <Route path="/order/:qrCode" element={<CustomerOrderPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;
