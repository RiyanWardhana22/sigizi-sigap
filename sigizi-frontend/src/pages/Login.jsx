// sigizi-frontend/src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEnvelope, FaLock, FaUser } from "react-icons/fa";

export default function Login() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    // Cek apakah user sudah login sebelumnya
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      // Redirect berdasarkan role
      if (user.role === "orang_tua") {
        navigate("/orangtua/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (isLoginView) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/login.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
          },
        );
        const data = await response.json();
        
        if (data.status === "success") {
          if (rememberMe) {
            localStorage.setItem("rememberedEmail", email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }

          localStorage.setItem("user", JSON.stringify(data.user));
          
          // Redirect berdasarkan role
          if (data.user.role === "orang_tua") {
            navigate("/orangtua/dashboard");
          } else {
            navigate("/dashboard");
          }
        } else {
          setErrorMsg(data.message);
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
        setErrorMsg("Tidak dapat terhubung ke server. Pastikan XAMPP menyala.");
      }
    } else {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/register.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nama_lengkap: namaLengkap,
              email: email,
              password: password,
            }),
          },
        );
        const data = await response.json();

        if (data.status === "success") {
          setSuccessMsg(
            "Pendaftaran berhasil! Silakan masuk dengan akun Anda.",
          );
          setIsLoginView(true);
          setPassword("");
        } else {
          setErrorMsg(data.message);
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
        setErrorMsg("Tidak dapat terhubung ke server. Pastikan XAMPP menyala.");
      }
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert(
      "Untuk mengatur ulang kata sandi, silakan hubungi Administrator atau kader Posyandu setempat.",
    );
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setErrorMsg("");
    setSuccessMsg("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-sigizi-green p-8 text-center text-white">
          <h2 className="text-3xl font-black tracking-wide">SI-GIZI SIGAP</h2>
          <p className="text-gray-50 mt-2 text-sm font-medium">
            {isLoginView
              ? "Masuk ke panel dasbor Anda"
              : "Daftar sebagai Orang Tua baru"}
          </p>
        </div>

        <div className="p-8">
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 rounded text-sm font-medium animate-fadeIn">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 mb-6 rounded text-sm font-medium animate-fadeIn">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field Nama Lengkap (Hanya tampil saat Register) */}
            {!isLoginView && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-green focus:border-transparent outline-none transition"
                    placeholder="Masukkan nama lengkap"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required={!isLoginView}
                  />
                </div>
              </div>
            )}

            {/* Field Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2 border bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-green focus:border-transparent outline-none transition"
                  placeholder="namaanda@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Field Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2 border bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-green focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Baris Ingat Saya & Lupa Password (Hanya tampil saat Login) */}
            {isLoginView && (
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 rounded text-sigizi-green focus:ring-sigizi-green w-4 h-4"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Ingat saya
                </label>
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  className="text-sm font-semibold text-sigizi-green hover:text-sigizi-light-green transition"
                >
                  Lupa password?
                </a>
              </div>
            )}

            {/* Tombol Utama */}
            <button
              type="submit"
              className="w-full bg-sigizi-green text-white font-bold py-3 px-4 rounded-lg hover:bg-sigizi-light-green shadow-lg hover:shadow-xl transition duration-300 mt-6"
            >
              {isLoginView ? "Login" : "Daftar Akun Baru"}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-8 text-center text-sm text-gray-600 border-t pt-6">
            {isLoginView ? (
              <p>
                Belum terdaftar?{" "}
                <button
                  onClick={toggleView}
                  className="font-bold text-sigizi-green hover:underline"
                >
                  Buat akun Orang Tua
                </button>
              </p>
            ) : (
              <p>
                Sudah punya akun?{" "}
                <button
                  onClick={toggleView}
                  className="font-bold text-sigizi-green hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}