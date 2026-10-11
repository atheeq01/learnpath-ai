import { Navigate, Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import CoursesPage from "./pages/CoursesPage";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="*" element={<Navigate to="/courses" replace />} />
      </Routes>
    </>
  );
}