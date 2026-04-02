import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import MachineLearning from "./pages/MachineLearning";
import DataAnak from "./pages/DataAnak";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/users" element={<Users />} />
        <Route path="/dashboard/ml" element={<MachineLearning />} />
        <Route path="/dashboard/anak" element={<DataAnak />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
