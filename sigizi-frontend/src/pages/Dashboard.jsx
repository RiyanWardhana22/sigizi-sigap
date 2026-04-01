export default function Dashboard() {
  return (
    <div className="min-h-screen bg-sigizi-bg p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 border-l-4 border-sigizi-green">
        <h1 className="text-2xl font-bold text-gray-800">
          Selamat Datang di Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Ini adalah halaman utama setelah berhasil login.
        </p>
      </div>
    </div>
  );
}
