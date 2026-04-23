// sigizi-frontend/src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaMapMarkedAlt,
  FaUsers,
  FaDatabase,
  FaSignOutAlt,
  FaBaby,
  FaClipboardCheck,
  FaChartPie,
  FaBars,
  FaTimes,
  FaChild,
  FaAppleAlt,
  FaChartLine,
  FaUserCog,
  FaLock,
  FaUserShield,
} from "react-icons/fa";

export default function Sidebar({ handleLogout }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [showOrangTuaMenu, setShowOrangTuaMenu] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserRole(parsedUser.role);
      setUserName(parsedUser.nama_lengkap);
    }
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Menu untuk SUPER_ADMIN (lengkap)
  const superAdminMenus = [
    { name: "Ringkasan", icon: <FaHome />, path: "/dashboard", roles: ["super_admin", "dinas_kesehatan", "pemangku_kepentingan"] },
    { name: "Peta Spasial GIS", icon: <FaMapMarkedAlt />, path: "/dashboard/peta", roles: ["super_admin", "dinas_kesehatan", "pemangku_kepentingan"] },
    { name: "Manajemen Pengguna", icon: <FaUsers />, path: "/dashboard/users", roles: ["super_admin"] },
    { name: "Input Data Wilayah", icon: <FaDatabase />, path: "/input-wilayah", roles: ["super_admin", "dinas_kesehatan"] },
    { name: "Data Anak & Gizi", icon: <FaBaby />, path: "/dashboard/anak", roles: ["super_admin", "dinas_kesehatan", "orang_tua"] },
    { name: "Verifikasi Data", icon: <FaClipboardCheck />, path: "/dashboard/verifikasi", roles: ["super_admin", "dinas_kesehatan"] },
    { name: "Laporan Kebijakan", icon: <FaChartPie />, path: "/dashboard/laporan", roles: ["super_admin", "pemangku_kepentingan"] },
  ];

  // Menu khusus untuk ORANG TUA (akan ditampilkan juga untuk Super Admin)
  const orangTuaMenus = [
    { name: "Dashboard Orang Tua", icon: <FaHome />, path: "/orangtua/dashboard", roles: ["super_admin", "orang_tua"] },
    { name: "Data Anak", icon: <FaChild />, path: "/orangtua/data-anak", roles: ["super_admin", "orang_tua"] },
    { name: "Pemantauan Gizi", icon: <FaAppleAlt />, path: "/orangtua/pemantauan-gizi", roles: ["super_admin", "orang_tua"] },
    { name: "Pengaturan Akun", icon: <FaUserCog />, path: "/orangtua/pengaturan", roles: ["super_admin", "orang_tua"] },
  ];

  // Pilih menu berdasarkan role
  let menuItems = [];
  if (userRole === "super_admin") {
    // Super admin melihat semua menu (admin + orang tua)
    menuItems = [...superAdminMenus, ...orangTuaMenus];
  } else if (userRole === "orang_tua") {
    menuItems = orangTuaMenus;
  } else {
    // Untuk role lain (dinas_kesehatan, pemangku_kepentingan)
    menuItems = superAdminMenus.filter(menu => 
      menu.roles.includes(userRole)
    );
  }

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

        {/* Profile Section */}
        <div className="p-4 border-b border-sigizi-light-green">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-sigizi-green flex items-center justify-center font-bold text-lg">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm truncate">{userName || "User"}</p>
              <p className="text-xs text-gray-300">
                {userRole === "super_admin" ? "Super Admin" : 
                 userRole === "orang_tua" ? "Orang Tua" : 
                 userRole?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-4">
            {menuItems.map((menu, index) => {
              const isActive = location.pathname === menu.path;
              // Tambahkan separator untuk super admin antara menu admin dan orang tua
              const isSeparator = userRole === "super_admin" && index === superAdminMenus.length;
              
              return (
                <li key={index}>
                  {isSeparator && (
                    <div className="my-4 border-t border-sigizi-light-green opacity-50">
                      <p className="text-xs text-gray-300 mt-2 mb-2">FITUR ORANG TUA (Preview)</p>
                    </div>
                  )}
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
