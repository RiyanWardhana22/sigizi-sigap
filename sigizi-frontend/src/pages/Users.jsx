import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaPlus, FaEdit, FaTrash, FaUserShield } from "react-icons/fa";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost/sigizi-sigap/sigizi-backend/get_users.php",
      );
      const data = await response.json();

      if (data.status === "success") {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "super_admin") {
        alert(
          "Akses Ditolak! Hanya Super Admin yang bisa mengakses halaman ini.",
        );
        navigate("/dashboard");
      } else {
        fetchUsers();
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
            Super Admin
          </span>
        );
      case "dinas_kesehatan":
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
            Dinas Kesehatan
          </span>
        );
      case "pemangku_kepentingan":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            Pemangku Kepentingan
          </span>
        );
      default:
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            Orang Tua
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-sigizi-bg">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-8 py-4 flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">
            Manajemen Pengguna
          </h1>
        </header>

        <main className="p-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Tabel & Tombol Tambah */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                Daftar Akun Terdaftar
              </h2>
              <button className="bg-sigizi-green hover:bg-sigizi-light-green text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                <FaPlus /> Tambah Pengguna
              </button>
            </div>

            {/* Tabel Data */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Memuat data pengguna...
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-500 text-sm border-b">
                      <th className="p-4 font-medium text-center">
                        Nama Lengkap
                      </th>
                      <th className="p-4 font-medium text-center">Email</th>
                      <th className="p-4 font-medium text-center">Role</th>
                      <th className="p-4 font-medium text-center">Status</th>
                      <th className="p-4 font-medium text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-4 font-medium text-gray-800">
                          {u.nama_lengkap}
                        </td>
                        <td className="p-4 text-gray-600">{u.email}</td>
                        <td className="p-4 text-center">
                          {getRoleBadge(u.role)}
                        </td>
                        <td className="p-4">
                          {u.status_aktif ? (
                            <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                              Aktif
                            </span>
                          ) : (
                            <span className="text-red-600 text-sm font-bold flex items-center gap-1">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="p-4 flex justify-center gap-3">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit Role/Data"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            title="Hapus Akun"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-gray-500"
                        >
                          Belum ada data pengguna.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
