import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaMapMarkedAlt,
  FaUsers,
  FaCogs,
  FaSignOutAlt,
  FaBaby,
} from "react-icons/fa";

export default function Sidebar({ handleLogout }) {
  const location = useLocation();
  const menuItems = [
    { name: "Ringkasan", icon: <FaHome />, path: "/dashboard" },
    {
      name: "Peta Spasial GIS",
      icon: <FaMapMarkedAlt />,
      path: "/dashboard/peta",
    },
    { name: "Manajemen Pengguna", icon: <FaUsers />, path: "/dashboard/users" },
    { name: "Machine Learning", icon: <FaCogs />, path: "/dashboard/ml" },
    { name: "Data Anak & Gizi", icon: <FaBaby />, path: "/dashboard/anak" },
  ];

  return (
    <div className="w-64 bg-sigizi-green text-white min-h-screen flex flex-col shadow-xl">
      <div className="p-6 text-center border-b border-sigizi-light-green">
        <h2 className="text-2xl font-bold tracking-wider">
          SI-GIZI
          <br />
          SIGAP
        </h2>
      </div>

      <div className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((menu, index) => {
            const isActive = location.pathname === menu.path;
            return (
              <li key={index}>
                <Link
                  to={menu.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white text-sigizi-green font-bold"
                      : "hover:bg-sigizi-light-green text-gray-200"
                  }`}
                >
                  <span className="text-xl">{menu.icon}</span>
                  <span>{menu.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-sigizi-light-green">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-lg hover:bg-red-500 transition-colors text-gray-200 hover:text-white"
        >
          <span className="text-xl">
            <FaSignOutAlt />
          </span>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}
