// sigizi-frontend/src/pages/orangtua/OrangTuaPengaturan.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";

export default function OrangTuaPengaturan() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileData, setProfileData] = useState({
    nama_lengkap: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "orang_tua" && parsedUser.role !== "super_admin") {
      navigate("/dashboard");
      return;
    }
    setUser(parsedUser);
    setProfileData({
      nama_lengkap: parsedUser.nama_lengkap,
      email: parsedUser.email,
    });
    setLoading(false);
  }, [navigate]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/update_user.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            nama_lengkap: profileData.nama_lengkap,
            email: profileData.email,
            role: user.role,
          }),
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        const updatedUser = {
          ...user,
          nama_lengkap: profileData.nama_lengkap,
          email: profileData.email,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        setIsEditing(false);

        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan sistem" });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: "error", text: "Password baru tidak cocok!" });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter!" });
      return;
    }

    try {
      const loginResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/login.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            password: passwordData.current_password,
          }),
        },
      );
      const loginData = await loginResponse.json();

      if (loginData.status !== "success") {
        setMessage({ type: "error", text: "Password saat ini salah!" });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/update_user.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            nama_lengkap: profileData.nama_lengkap,
            email: user.email,
            role: user.role,
            password: passwordData.new_password,
          }),
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        setMessage({ type: "success", text: "Password berhasil diubah!" });
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        setShowPasswordForm(false);

        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan sistem" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sigizi-green"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">PENGATURAN AKUN</h1>
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              <FontAwesomeIcon
                icon={
                  message.type === "success"
                    ? fas.faCheckCircle
                    : fas.faExclamationCircle
                }
              />
              {message.text}
            </div>
          )}

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={fas.faUser} /> Informasi Profil
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sigizi-green hover:text-sigizi-light-green text-sm font-semibold"
                  >
                    Edit Profil
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="nama_lengkap"
                      value={profileData.nama_lengkap}
                      onChange={handleProfileChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({
                          nama_lengkap: user.nama_lengkap,
                          email: user.email,
                        });
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-sigizi-green hover:bg-sigizi-light-green text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={fas.faSave} /> Simpan
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FontAwesomeIcon
                      icon={fas.faUser}
                      className="text-gray-400"
                    />
                    <div>
                      <p className="text-xs text-gray-500">Nama Lengkap</p>
                      <p className="font-medium">{user.nama_lengkap}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FontAwesomeIcon
                      icon={fas.faEnvelope}
                      className="text-gray-400"
                    />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FontAwesomeIcon
                      icon={fas.faUserTag}
                      className="text-gray-400"
                    />
                    <div>
                      <p className="text-xs text-gray-500">Role</p>
                      <p className="font-medium capitalize">
                        {user.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={fas.faLock} /> Ubah Password
              </h2>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition font-semibold"
                >
                  Ubah Password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimal 6 karakter
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sigizi-green"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          current_password: "",
                          new_password: "",
                          confirm_password: "",
                        });
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-sigizi-green hover:bg-sigizi-light-green text-white py-2 rounded-lg transition"
                    >
                      Ubah Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
