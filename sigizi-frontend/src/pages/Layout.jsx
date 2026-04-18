import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  // SIMULASI: Nanti ini diambil dari state login/token JWT (Context/Redux)
  // Untuk sementara, kita 'paksa' sistem mengira yang login adalah dinas_kesehatan
  const currentRole = "dinas_kesehatan"; 

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* Sidebar diletakkan di kiri */}
      <Sidebar userRole={currentRole} />

      {/* Area Konten Utama di kanan */}
      <div className="flex-1 flex flex-col">
        
        {/* Navbar Atas (Opsional, untuk tombol Logout) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8">
          <button className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
            Keluar (Logout)
          </button>
        </header>

        {/* Di sinilah halaman-halaman lain (seperti Dashboard, InputWilayah, Peta) 
          akan dimunculkan secara bergantian oleh React Router.
        */}
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet /> 
        </main>

      </div>
    </div>
  );
}