import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaTimes,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaUserAlt,
  FaUserMd,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nama_lengkap: "",
    email: "",
    password: "",
    role: "orang_tua",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "super_admin") {
        alert("Akses Ditolak! Halaman ini khusus Super Admin.");
        navigate("/dashboard");
      } else {
        fetchUsers();
      }
    }
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
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
      console.error("Gagal menambah pengguna:", error);
    }
  };

  const handleEditClick = (user) => {
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
        setShowEditModal(false);
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Gagal update pengguna:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?"))
      return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/delete_user.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        },
      );
      const data = await response.json();
      if (data.status === "success") {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Gagal menghapus pengguna:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === "Semua" || user.role === filterRole;
    return matchSearch && matchRole;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const stats = {
    total: users.length,
    orangTua: users.filter((u) => u.role === "orang_tua").length,
    dinkes: users.filter((u) => u.role === "dinas_kesehatan").length,
    pemangku: users.filter((u) => u.role === "pemangku_kepentingan").length,
    admin: users.filter((u) => u.role === "super_admin").length,
  };

  const formatRole = (role) => {
    switch (role) {
      case "orang_tua":
        return {
          text: "Orang Tua",
          color: "bg-blue-100 text-blue-700",
          icon: <FaUserAlt />,
        };
      case "dinas_kesehatan":
        return {
          text: "Dinas Kesehatan",
          color: "bg-green-100 text-green-700",
          icon: <FaUserMd />,
        };
      case "pemangku_kepentingan":
        return {
          text: "Pemangku Kepentingan",
          color: "bg-purple-100 text-purple-700",
          icon: <FaUserTie />,
        };
      case "super_admin":
        return {
          text: "Super Admin",
          color: "bg-red-100 text-red-700",
          icon: <FaUserShield />,
        };
      default:
        return {
          text: role,
          color: "bg-gray-100 text-gray-700",
          icon: <FaUserAlt />,
        };
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b px-8 py-5 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Manajemen Pengguna
            </h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Total
              </p>
              <h3 className="text-2xl font-black text-gray-800">
                {stats.total}
              </h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                Orang Tua
              </p>
              <h3 className="text-2xl font-black text-blue-800">
                {stats.orangTua}
              </h3>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl shadow-sm border border-green-100 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">
                Dinkes
              </p>
              <h3 className="text-2xl font-black text-green-800">
                {stats.dinkes}
              </h3>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl shadow-sm border border-purple-100 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">
                Pemangku
              </p>
              <h3 className="text-2xl font-black text-purple-800">
                {stats.pemangku}
              </h3>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
                Admin
              </p>
              <h3 className="text-2xl font-black text-red-800">
                {stats.admin}
              </h3>
            </div>
          </div>

          {/* KONTROL PENCARIAN & FILTER */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau email pengguna..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sigizi-green transition-all text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 w-full md:w-auto">
                <FaFilter className="text-gray-400 text-xs" />
                <select
                  className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer w-full"
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="Semua">Semua Role</option>
                  <option value="orang_tua">Orang Tua</option>
                  <option value="dinas_kesehatan">Dinas Kesehatan</option>
                  <option value="pemangku_kepentingan">
                    Pemangku Kepentingan
                  </option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
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
              className="bg-sigizi-green hover:bg-sigizi-light-green text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition transform active:scale-95"
            >
              <FaPlus />{" "}
              <span className="hidden sm:inline">Tambah Pengguna</span>
            </button>
          </div>

          {/* TABEL PENGGUNA */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="p-5">No</th>
                    <th className="p-5">Identitas Pengguna</th>
                    <th className="p-5">Kontak Email</th>
                    <th className="p-5">Hak Akses (Role)</th>
                    <th className="p-5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center">
                        <div className="w-8 h-8 border-4 border-sigizi-green border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm font-bold">
                          Memuat Data...
                        </p>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((user, index) => {
                      const roleUI = formatRole(user.role);
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50/80 transition"
                        >
                          <td className="p-5 text-sm font-bold text-gray-400">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="p-5">
                            <div className="text-sm font-medium text-gray-600">
                              {user.nama_lengkap}
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="text-sm font-medium text-gray-600">
                              {user.email}
                            </div>
                          </td>
                          <td className="p-5">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${roleUI.color}`}
                            >
                              {roleUI.icon} {roleUI.text}
                            </span>
                          </td>
                          <td className="p-5">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditClick(user)}
                                className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition shadow-sm"
                                title="Edit Pengguna"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm"
                                title="Hapus Pengguna"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-20 text-center flex flex-col items-center justify-center gap-3"
                      >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-3xl">
                          <FaUsers />
                        </div>
                        <p className="text-gray-400 font-bold text-sm italic tracking-tight">
                          Pengguna tidak ditemukan.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {filteredUsers.length > itemsPerPage && (
              <div className="bg-gray-50/50 p-5 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400">
                  Menampilkan{" "}
                  <span className="text-gray-700">{indexOfFirstItem + 1}</span>{" "}
                  hingga{" "}
                  <span className="text-gray-700">
                    {Math.min(indexOfLastItem, filteredUsers.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="text-gray-700">{filteredUsers.length}</span>{" "}
                  data
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={`p-2 rounded-lg border transition ${currentPage === 1 ? "text-gray-300 bg-gray-50" : "text-gray-600 bg-white hover:bg-gray-100 shadow-sm"}`}
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <div className="flex gap-1 flex-wrap justify-center">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition ${currentPage === i + 1 ? "bg-sigizi-green text-white shadow-md shadow-green-200" : "bg-white text-gray-400 hover:bg-gray-50 border"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={`p-2 rounded-lg border transition ${currentPage === totalPages ? "text-gray-300 bg-gray-50" : "text-gray-600 bg-white hover:bg-gray-100 shadow-sm"}`}
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL TAMBAH PENGGUNA */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div className="bg-sigizi-green px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                Tambah Pengguna
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sigizi-green transition text-sm"
                  placeholder="Masukkan nama..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Email Aktif
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sigizi-green transition text-sm"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sigizi-green transition text-sm"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Hak Akses (Role)
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sigizi-green transition text-sm font-bold text-gray-700 cursor-pointer"
                >
                  <option value="orang_tua">Orang Tua</option>
                  <option value="dinas_kesehatan">Dinas Kesehatan</option>
                  <option value="pemangku_kepentingan">
                    Pemangku Kepentingan
                  </option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-widest text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-sigizi-green hover:bg-sigizi-light-green text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PENGGUNA */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                Edit Pengguna
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/70 hover:text-white transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Email Aktif
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  placeholder="(Kosongkan jika tidak ingin diubah)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Hak Akses (Role)
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-bold text-gray-700 cursor-pointer"
                >
                  <option value="orang_tua">Orang Tua</option>
                  <option value="dinas_kesehatan">Dinas Kesehatan</option>
                  <option value="pemangku_kepentingan">
                    Pemangku Kepentingan
                  </option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-widest text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition"
                >
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
