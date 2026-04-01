import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaRobot,
  FaUpload,
  FaCogs,
  FaCheckCircle,
  FaChartBar,
  FaTable,
} from "react-icons/fa";

export default function MachineLearning() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState("random_forest");
  const [isTraining, setIsTraining] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "super_admin") {
        alert("Akses Ditolak! Hanya Super Admin.");
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTrainModel = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Silakan upload dataset (CSV) terlebih dahulu!");
      return;
    }
    setIsTraining(true);
    setResult(null);
    const formData = new FormData();
    formData.append("dataset", file);
    formData.append("algorithm", algorithm);
    try {
      const response = await fetch(
        "http://localhost/sigizi-sigap/sigizi-backend/train_model.php",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();
      if (data.status === "success") {
        setResult({
          accuracy: data.accuracy,
          precision: data.precision,
          recall: data.recall,
          confusionMatrix: data.confusionMatrix,
        });
      } else {
        alert("Error dari Server: " + data.message);
      }
    } catch (error) {
      console.error("Gagal melatih model:", error);
      alert("Terjadi kesalahan koneksi atau server gagal merespons.");
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-sigizi-bg">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 flex flex-col relative">
        <header className="bg-white shadow px-8 py-4 flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">
            CONTROL MACHINE LEARNING
          </h1>
        </header>

        <main className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panel Kiri: Form Control */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                  Konfigurasi Model
                </h2>

                <form onSubmit={handleTrainModel} className="space-y-5">
                  {/* Upload Dataset */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1. Upload Dataset (.csv)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FaUpload className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {file ? (
                          <span className="text-sigizi-green font-bold">
                            {file.name}
                          </span>
                        ) : (
                          "Klik atau seret file CSV ke sini"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Pilih Algoritma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2. Pilih Algoritma
                    </label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sigizi-light-green outline-none bg-white"
                    >
                      <option value="random_forest">
                        Random Forest (Classification)
                      </option>
                      <option value="svm">Support Vector Machine (SVM)</option>
                      <option value="kmeans">K-Means (Clustering)</option>
                    </select>
                  </div>

                  {/* Tombol Eksekusi */}
                  <button
                    type="submit"
                    disabled={isTraining}
                    className={`w-full py-3 rounded-lg font-bold text-white transition flex justify-center items-center gap-2 ${isTraining ? "bg-gray-400 cursor-not-allowed" : "bg-sigizi-green hover:bg-sigizi-light-green shadow-md"}`}
                  >
                    {isTraining ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                        Memproses Data...
                      </>
                    ) : (
                      <>Mulai Training Model</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Panel Kanan: Hasil Evaluasi */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-6 flex items-center gap-2">
                  <FaChartBar className="text-gray-500" /> Hasil Evaluasi Model
                </h2>

                {!isTraining && !result && (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <p>
                      Silakan upload dataset dan jalankan proses training untuk
                      melihat hasil.
                    </p>
                  </div>
                )}

                {isTraining && (
                  <div className="flex flex-col items-center justify-center h-64 text-sigizi-green">
                    <div className="w-16 h-16 border-4 border-sigizi-green border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold animate-pulse">
                      Sedang melatih algoritma {algorithm.replace("_", " ")}...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Mengekstrak fitur dan membagi dataset (80% Train, 20%
                      Test)
                    </p>
                  </div>
                )}

                {result && !isTraining && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
                      <FaCheckCircle className="text-xl" />
                      <div>
                        <p className="font-bold">Training Selesai!</p>
                        <p className="text-sm">
                          Model {algorithm.replace("_", " ").toUpperCase()}{" "}
                          berhasil dilatih dengan dataset baru.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                          Akurasi (Accuracy)
                        </p>
                        <p className="text-3xl font-bold text-sigizi-green mt-1">
                          {result.accuracy}
                        </p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                          Presisi (Precision)
                        </p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">
                          {result.precision}
                        </p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                          Recall
                        </p>
                        <p className="text-3xl font-bold text-orange-500 mt-1">
                          {result.recall}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaTable /> Confusion Matrix
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-center border-collapse">
                          <thead>
                            <tr className="bg-gray-100 text-gray-600 text-sm">
                              <th className="p-2 border border-gray-300">
                                Aktual \ Prediksi
                              </th>
                              <th className="p-2 border border-gray-300">
                                Kelas 0 (Aman)
                              </th>
                              <th className="p-2 border border-gray-300">
                                Kelas 1 (Rentan)
                              </th>
                              <th className="p-2 border border-gray-300">
                                Kelas 2 (Sangat Rentan)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.confusionMatrix.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                <td className="p-2 border border-gray-300 font-bold bg-gray-50 text-sm text-gray-600">
                                  Kelas {rowIndex}
                                </td>
                                {row.map((val, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className={`p-2 border border-gray-300 ${rowIndex === colIndex ? "bg-green-100 font-bold text-green-700" : "text-gray-700"}`}
                                  >
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        * Kotak berwarna hijau menunjukkan prediksi yang benar
                        (True Positives).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
