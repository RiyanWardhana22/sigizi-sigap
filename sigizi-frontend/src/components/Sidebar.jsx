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
  FaUserCog,
} from "react-icons/fa";
import { IoArrowRedo } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";

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

  const superAdminMenus = [
    {
      name: "Ringkasan",
      icon: <FaHome />,
      path: "/dashboard",
      roles: ["super_admin", "dinas_kesehatan", "pemangku_kepentingan"],
    },
    {
      name: "Peta Spasial GIS",
      icon: <FaMapMarkedAlt />,
      path: "/dashboard/peta",
      roles: ["super_admin", "dinas_kesehatan", "pemangku_kepentingan"],
    },
    {
      name: "Manajemen Pengguna",
      icon: <FaUsers />,
      path: "/dashboard/users",
      roles: ["super_admin"],
    },
    {
      name: "Input Data Wilayah",
      icon: <FaDatabase />,
      path: "/input-wilayah",
      roles: ["super_admin", "dinas_kesehatan"],
    },
    {
      name: "Data Anak & Gizi",
      icon: <FaBaby />,
      path: "/dashboard/anak",
      roles: ["super_admin", "dinas_kesehatan", "orang_tua"],
    },
    {
      name: "Verifikasi Data",
      icon: <FaClipboardCheck />,
      path: "/dashboard/verifikasi",
      roles: ["super_admin", "dinas_kesehatan"],
    },
    {
      name: "Analisis & Evaluasi",
      icon: <FaChartPie />,
      path: "/dashboard/analisis",
      roles: ["super_admin", "pemangku_kepentingan"],
    },
    {
      name: "Laporan Rekapitulasi",
      icon: <TbReportAnalytics />,
      path: "/dashboard/laporan",
      roles: ["super_admin", "pemangku_kepentingan"],
    },
  ];

  const orangTuaMenus = [
    {
      name: "Dashboard Orang Tua",
      icon: <FaHome />,
      path: "/orangtua/dashboard",
      roles: ["super_admin", "orang_tua"],
    },
    {
      name: "Data Anak",
      icon: <FaChild />,
      path: "/orangtua/data-anak",
      roles: ["super_admin", "orang_tua"],
    },
    {
      name: "Pemantauan Gizi",
      icon: <FaAppleAlt />,
      path: "/orangtua/pemantauan-gizi",
      roles: ["super_admin", "orang_tua"],
    },
    {
      name: "Pengaturan Akun",
      icon: <FaUserCog />,
      path: "/orangtua/pengaturan",
      roles: ["super_admin", "orang_tua"],
    },
  ];

  let menuItems = [];
  if (userRole === "super_admin") {
    menuItems = [...superAdminMenus, ...orangTuaMenus];
  } else if (userRole === "orang_tua") {
    menuItems = orangTuaMenus;
  } else {
    menuItems = superAdminMenus.filter((menu) => menu.roles.includes(userRole));
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#0A2A20] text-white p-4 rounded-full shadow-[0_4px_20px_rgba(10,42,32,0.4)] border border-white/10 focus:outline-none hover:bg-[#124233] transition-all duration-300 transform hover:scale-105"
        title="Buka Menu"
      >
        <FaBars className="text-xl" />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2A20] text-white min-h-screen flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}
      >
        <div className="p-6 flex justify-between items-center lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-wide text-white">
              SI-GIZI SIGAP<span className="text-emerald-400"></span>
            </h2>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-rose-400 text-xl focus:outline-none transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
          <div className="mb-2">
            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-4 mb-3">
              Main Menu
            </p>
          </div>
          <ul className="space-y-1.5">
            {menuItems.map((menu, index) => {
              const isActive = location.pathname === menu.path;
              const isSeparator =
                userRole === "super_admin" && index === superAdminMenus.length;

              return (
                <li key={index}>
                  {isSeparator && (
                    <div className="mt-8 mb-3 px-4">
                      <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        Fitur Orang Tua (Preview)
                      </p>
                    </div>
                  )}
                  <Link
                    to={menu.path}
                    className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {/* Efek Garis Aktif */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-l-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                    )}

                    <span
                      className={`text-lg transition-colors ${isActive ? "text-emerald-400" : ""}`}
                    >
                      {menu.icon}
                    </span>
                    <span>{menu.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Account / Profile Section & Logout */}
        <div className="p-4 mt-auto border-t border-white/5">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-3 mb-2 bg-[#0f3629] border border-white/5 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm text-white truncate w-32">
                {userName || "User"}
              </p>
              <p className="text-[10px] text-emerald-400/80 truncate font-medium capitalize">
                {userRole === "super_admin"
                  ? "Super Admin"
                  : userRole === "orang_tua"
                    ? "Orang Tua"
                    : userRole?.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Tombol Logout Terpisah */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 focus:outline-none"
          >
            <IoArrowRedo className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
