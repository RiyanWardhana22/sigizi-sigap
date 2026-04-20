import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiDatabase, FiUsers, FiMap, FiSettings } from 'react-icons/fi';

// Daftar semua menu di sistem dan siapa saja yang boleh melihatnya
const MENU_ITEMS = [
  { title: "Dashboard", path: "/", icon: <FiHome />, roles: ["super_admin", "dinas_kesehatan", "orang_tua", "pemangku_kepentingan"] },
  { title: "Input Data Wilayah", path: "/input-wilayah", icon: <FiDatabase />, roles: ["super_admin", "dinas_kesehatan"] },
  { title: "Data Anak & Imunisasi", path: "/data-anak", icon: <FiUsers />, roles: ["super_admin", "dinas_kesehatan"] },
  { title: "Peta Sebaran Gizi", path: "/peta", icon: <FiMap />, roles: ["super_admin", "dinas_kesehatan", "pemangku_kepentingan"] },
  { title: "Manajemen Pengguna", path: "/users", icon: <FiUsers />, roles: ["super_admin"] }, // Disembunyikan dari Dinas
  { title: "Pengaturan Akun", path: "/settings", icon: <FiSettings />, roles: ["super_admin", "dinas_kesehatan", "orang_tua", "pemangku_kepentingan"] }
];

export default function Sidebar({ userRole }) {
  const location = useLocation();
  
  // Filter menu: Hanya tampilkan jika array 'roles' mencakup role user saat ini
  const allowedMenus = MENU_ITEMS.filter(menu => menu.roles.includes(userRole));

  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col border-r border-blue-800">
      {/* Header Sidebar */}
      <div className="h-16 flex items-center px-6 border-b border-blue-800 bg-blue-950">
        <h1 className="text-xl font-bold tracking-wide">SiGizi Sigap</h1>
      </div>

      {/* Profil Singkat User */}
      <div className="px-6 py-6 border-b border-blue-800">
        <p className="text-sm text-blue-200">Login sebagai:</p>
        <p className="font-semibold text-lg capitalize">{userRole.replace('_', ' ')}</p>
      </div>

      {/* Navigasi Menu */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        {allowedMenus.map((menu, index) => {
          const isActive = location.pathname === menu.path;
          return (
            <Link 
              key={index} 
              to={menu.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? "bg-blue-600 text-white" // Warna aktif (Flat design)
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{menu.icon}</span>
              {menu.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}