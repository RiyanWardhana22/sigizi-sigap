import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapDashboard() {
  const centerPosition = [2.115355, 99.545097];
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 z-0 relative">
      <MapContainer
        center={centerPosition}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        {/* Layer Peta Dasar menggunakan OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* --- Contoh Data Dummy Sementara --- */}
        {/* Titik 1: Kota Medan */}
        <Marker position={[3.595196, 98.672223]}>
          <Popup>
            <div className="text-center min-w-[150px]">
              <h3 className="font-bold text-sigizi-green border-b pb-1 mb-2">
                Kota Medan
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Tingkat Risiko:{" "}
                <span className="text-red-600 font-bold">Tinggi</span>
              </p>
              <p className="text-sm text-gray-600">
                Total Stunting: 1.250 anak
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Titik 2: Kabupaten Deli Serdang */}
        <Marker position={[3.55, 98.833333]}>
          <Popup>
            <div className="text-center min-w-[150px]">
              <h3 className="font-bold text-sigizi-green border-b pb-1 mb-2">
                Kab. Deli Serdang
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Tingkat Risiko:{" "}
                <span className="text-orange-500 font-bold">Sedang</span>
              </p>
              <p className="text-sm text-gray-600">Total Stunting: 850 anak</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
