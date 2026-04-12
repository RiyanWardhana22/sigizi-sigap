import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaPlus, FaEdit, FaTrash, FaUserShield, FaTimes } from "react-icons/fa";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    nama_lengkap: "",
    email: "",
    password: "",
    role: "orang_tua",
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_users.php`,
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
        alert("Akses Ditolak!");
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/add_user.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        alert(data.message);
        setShowAddModal(false);
        setFormData({
          id: "",
          nama_lengkap: "",
          email: "",
          password: "",
          role: "orang_tua",
        });
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Gagal menambah user:", error);
    }
  };

  const openEditModal = (user) => {
    setFormData({
      id: user.id,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/update_user.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        alert(data.message);
        setShowEditModal(false);
        setFormData({
          id: "",
          nama_lengkap: "",
          email: "",
          password: "",
          role: "orang_tua",
        });
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Gagal mengupdate user:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus akun ini? Data yang dihapus tidak dapat dikembalikan.",
      )
    ) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/delete_user.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
          },
        );
        const data = await response.json();

        if (data.status === "success") {
          alert(data.message);
          fetchUsers();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Gagal menghapus user:", error);
      }
    }
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

      <div className="flex-1 flex flex-col relative">
        <header className="bg-white shadow px-8 py-4 flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">
            MANAJEMEN PENGGUNA
          </h1>
        </header>

        <main className="p-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                Daftar Akun Terdaftar
              </h2>
              <button
                onClick={() => {
                  setFormData({
                    id: "",
                    nama_lengkap: "",
                    email: "",
                    password: "",
                    role: "orang_tua",
                  });
                  setShowAddModal(true);
                }}
                className="bg-sigizi-green hover:bg-sigizi-light-green text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
              >
                <FaPlus /> Tambah Pengguna
              </button>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Memuat data pengguna...
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-500 text-sm border-b">
                      <th className="p-4 font-medium">Nama Lengkap</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Status</th>
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
                        <td className="p-4">{getRoleBadge(u.role)}</td>
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
                            onClick={() => openEditModal(u)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit Data"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Hapus Akun"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {/* --- MODAL TAMBAH PENGGUNA --- */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-sigizi-green text-white">
                <h3 className="font-bold text-lg">Tambah Pengguna Baru</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="hover:text-red-300 transition"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-light-green outline-none"
                    placeholder="Masukkan nama"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-light-green outline-none"
                    placeholder="Masukkan email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-light-green outline-none"
                    placeholder="Buat password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role / Peran
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-light-green outline-none bg-white"
                  >
                    <option value="orang_tua">Orang Tua</option>
                    <option value="dinas_kesehatan">Dinas Kesehatan</option>
                    <option value="pemangku_kepentingan">
                      Pemangku Kepentingan
                    </option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sigizi-green hover:bg-sigizi-light-green text-white rounded-lg font-medium transition"
                  >
                    Simpan Pengguna
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL EDIT PENGGUNA --- */}
        {showEditModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
                <h3 className="font-bold text-lg">Edit Pengguna</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="hover:text-red-300 transition"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reset Password (Opsional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role / Peran
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="orang_tua">Orang Tua</option>
                    <option value="dinas_kesehatan">Dinas Kesehatan</option>
                    <option value="pemangku_kepentingan">
                      Pemangku Kepentingan
                    </option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Update Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
