import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const response = await fetch(
        "http://localhost/sigizi-sigap/sigizi-backend/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, password: password }),
        },
      );

      const data = await response.json();
      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setErrorMsg(data.message);
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      setErrorMsg("Tidak dapat terhubung ke server. Pastikan XAMPP menyala.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sigizi-bg px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-sigizi-green">
            SI-GIZI SIGAP
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        {/* Tampilkan kotak merah jika ada error */}
        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-light-green focus:border-transparent outline-none transition"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-light-green focus:border-transparent outline-none transition"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sigizi-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-sigizi-light-green transition duration-300"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
