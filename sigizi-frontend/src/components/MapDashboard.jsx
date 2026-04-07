import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapDashboard() {
  const [laporan, setLaporan] = useState([]);
  const koordinatWilayah = {
    Nias: [1.1963, 97.6453],
    "Mandailing Natal": [0.8656, 99.4253],
    "Tapanuli Selatan": [1.5936, 99.2731],
    "Tapanuli Tengah": [1.8596, 98.6656],
    "Tapanuli Utara": [2.0253, 99.0436],
    Toba: [2.35, 99.0],
    Labuhanbatu: [2.1, 100.1],
    Asahan: [2.9833, 99.6333],
    Simalungun: [2.9, 99.05],
    Dairi: [2.75, 98.3],
    Karo: [3.1167, 98.2833],
    "Deli Serdang": [3.55, 98.8333],
    Langkat: [3.75, 98.0],
    "Nias Selatan": [0.5833, 97.8],
    "Humbang Hasundutan": [2.3, 98.5],
    "Pakpak Bharat": [2.55, 98.25],
    Samosir: [2.6, 98.7],
    "Serdang Bedagai": [3.3667, 99.0833],
    "Batu Bara": [3.2167, 99.5833],
    "Padang Lawas Utara": [1.5, 99.75],
    "Padang Lawas": [1.25, 99.9],
    "Labuhanbatu Selatan": [1.8, 100.1],
    "Labuhanbatu Utara": [2.25, 99.8333],
    "Nias Utara": [1.4, 97.6],
    "Nias Barat": [1.0, 97.5],
    "Kota Sibolga": [1.7427, 98.7792],
    "Kota Tanjung Balai": [2.9667, 99.8],
    "Kota Pematangsiantar": [2.9667, 99.0667],
    "Kota Tebing Tinggi": [3.3274, 99.1623],
    "Kota Medan": [3.5951, 98.6722],
    "Kota Binjai": [3.6, 98.4833],
    "Kota PadangSidempuan": [1.3793, 99.2734],
    "Kota Gunungsitoli": [1.2833, 97.6167],
  };

  useEffect(() => {
    const fetchPeta = async () => {
      try {
        const response = await fetch(
          "http://localhost/sigizi-sigap/sigizi-backend/get_laporan.php",
        );
        const data = await response.json();
        if (data.status === "success") {
          setLaporan(data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data peta:", error);
      }
    };
    fetchPeta();
  }, []);

  const centerPosition = [2.115355, 99.545097];
  const getMarkerColor = (totalStunting) => {
    return totalStunting > 0 ? "#ef4444" : "#22c55e";
  };
  const getMarkerRadius = (totalAnak) => {
    const baseRadius = 8;
    return baseRadius + totalAnak * 3;
  };

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 z-0 relative">
      <MapContainer
        center={centerPosition}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Melakukan looping pada data laporan dari database */}
        {laporan.map((wilayah, index) => {
          const posisi = koordinatWilayah[wilayah.nama_kabupaten];
          if (posisi) {
            return (
              <CircleMarker
                key={index}
                center={posisi}
                pathOptions={{
                  color: getMarkerColor(wilayah.total_stunting),
                  fillColor: getMarkerColor(wilayah.total_stunting),
                  fillOpacity: 0.6,
                }}
                radius={getMarkerRadius(wilayah.total_anak)}
              >
                <Popup>
                  <div className="text-center min-w-[150px]">
                    <h3 className="font-bold text-gray-800 border-b pb-1 mb-2">
                      {wilayah.nama_kabupaten}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Anak Terdata: <strong>{wilayah.total_anak}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Gizi Normal:{" "}
                      <span className="text-green-600 font-bold">
                        {wilayah.total_normal || 0}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Stunting:{" "}
                      <span className="text-red-600 font-bold">
                        {wilayah.total_stunting || 0}
                      </span>
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
