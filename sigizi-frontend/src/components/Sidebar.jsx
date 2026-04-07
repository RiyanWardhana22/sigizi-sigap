import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaMapMarkedAlt,
  FaUsers,
  FaCogs,
  FaSignOutAlt,
  FaBaby,
  FaClipboardCheck,
  FaChartPie,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function Sidebar({ handleLogout }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
    {
      name: "Verifikasi Data",
      icon: <FaClipboardCheck />,
      path: "/dashboard/verifikasi",
    },
    {
      name: "Laporan Kebijakan",
      icon: <FaChartPie />,
      path: "/dashboard/laporan",
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-sigizi-green text-white p-4 rounded-full shadow-2xl focus:outline-none hover:bg-sigizi-light-green transition-transform transform hover:scale-105"
        title="Buka Menu"
      >
        <FaBars className="text-xl" />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* 3. Sidebar Container Utama */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sigizi-green text-white min-h-screen flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}
      >
        <div className="p-6 text-center border-b border-sigizi-light-green flex justify-between items-center lg:block">
          <h2 className="text-2xl font-bold tracking-wider mx-auto">
            SI-GIZI
            <br className="hidden lg:block" />
            SIGAP
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white hover:text-red-300 text-2xl focus:outline-none transition"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-4">
            {menuItems.map((menu, index) => {
              const isActive = location.pathname === menu.path;
              return (
                <li key={index}>
                  <Link
                    to={menu.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-white text-sigizi-green font-bold shadow-sm"
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
            className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-500 transition-colors text-gray-200 hover:text-white font-medium"
          >
            <span className="text-xl">
              <FaSignOutAlt />
            </span>
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
}
