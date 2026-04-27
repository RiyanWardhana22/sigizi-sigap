import { useEffect, useState } from "react";
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  GeoJSON, 
  useMap 
} from "react-leaflet";
import { dynamicMapLayer } from "esri-leaflet";
import { 
  FaLayerGroup, 
  FaWater, 
  FaFire, 
  FaInfoCircle,
  FaShieldAlt,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkedAlt
} from "react-icons/fa";
import "leaflet/dist/leaflet.css";

// =========================================================================
// KOMPONEN RENDER BNPB
// =========================================================================
const EsriDynamicLayer = ({ url, opacity }) => {
  const map = useMap();
  useEffect(() => {
    const layer = dynamicMapLayer({ url, opacity });
    layer.addTo(map);
    return () => map.removeLayer(layer);
  }, [map, url, opacity]);
  return null;
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500); // Jeda setengah detik memastikan animasi CSS Tailwind selesai
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// =========================================================================
// KOMPONEN SWITCH KUSTOM
// =========================================================================
const CustomToggle = ({ label, icon, active, onChange, activeColor }) => (
  <div 
    className={`flex items-center justify-between p-2.5 sm:p-3 bg-white border ${active ? 'border-gray-200 shadow-sm' : 'border-gray-100'} rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98]`}
    onClick={onChange}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-300 ${active ? activeColor.bg : 'bg-gray-50'} ${active ? activeColor.text : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${active ? 'text-gray-800' : 'text-gray-500'}`}>{label}</span>
    </div>
    <div className={`relative w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${active ? activeColor.switch : 'bg-gray-200'}`}>
      <div className={`w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default function MapDashboard({ mode = "balita" }) {
  const [laporan, setLaporan] = useState([]);
  const [agregatML, setAgregatML] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true); 
  
  const [layerBanjir, setLayerBanjir] = useState(false);
  const [layerKekeringan, setLayerKekeringan] = useState(false);

  // LOGIKA PINTAR: Cek apakah ada layer bencana yang menyala
  const isBencanaActive = layerBanjir || layerKekeringan;

  const koordinatWilayah = {
    Nias: [1.1963, 97.6453], "Mandailing Natal": [0.8656, 99.4253], "Tapanuli Selatan": [1.5936, 99.2731],
    "Tapanuli Tengah": [1.8596, 98.6656], "Tapanuli Utara": [2.0253, 99.0436], Toba: [2.35, 99.0],
    Labuhanbatu: [2.1, 100.1], Asahan: [2.9833, 99.6333], Simalungun: [2.9, 99.05],
    Dairi: [2.75, 98.3], Karo: [3.1167, 98.2833], "Deli Serdang": [3.55, 98.8333],
    Langkat: [3.75, 98.0], "Nias Selatan": [0.5833, 97.8], "Humbang Hasundutan": [2.3, 98.5],
    "Pakpak Bharat": [2.55, 98.25], Samosir: [2.6, 98.7], "Serdang Bedagai": [3.3667, 99.0833],
    "Batu Bara": [3.2167, 99.5833], "Padang Lawas Utara": [1.5, 99.75], "Padang Lawas": [1.25, 99.9],
    "Labuhanbatu Selatan": [1.8, 100.1], "Labuhanbatu Utara": [2.25, 99.8333], "Nias Utara": [1.4, 97.6],
    "Nias Barat": [1.0, 97.5], "Kota Sibolga": [1.7427, 98.7792], "Kota Tanjung Balai": [2.9667, 99.8],
    "Kota Pematangsiantar": [2.9667, 99.0667], "Kota Tebing Tinggi": [3.3274, 99.1623],
    "Kota Medan": [3.5951, 98.6722], "Kota Binjai": [3.6, 98.4833], "Kota PadangSidempuan": [1.3793, 99.2734],
    "Kota Gunungsitoli": [1.2833, 97.6167],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resBalita, resML, resGeo] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/get_laporan.php`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/get_agregat_wilayah.php`),
          fetch("/sumut.geojson")
        ]);
        
        const dataBalita = await resBalita.json();
        const dataML = await resML.json();
        const dataGeo = await resGeo.json();

        if (dataBalita.status === "success") setLaporan(dataBalita.data);
        if (dataML.status === "success") setAgregatML(dataML.data);
        setGeoJsonData(dataGeo);
      } catch (error) { console.error("Gagal memuat data peta", error); }
    };
    fetchData();
    if (window.innerWidth < 768) setIsLegendOpen(false);
  }, []);

  useEffect(() => {
    if (mode === "balita") {
      setIsMenuOpen(false);
      setLayerBanjir(false);
      setLayerKekeringan(false);
    }
  }, [mode]);

  const centerPosition = [2.115355, 99.545097];

  // ================= LOGIKA VISUAL MIKRO (BALITA) =================
  const getMarkerColor = (totalAnak, totalStunting, totalPraStunting) => {
    if (totalAnak === 0 || totalAnak === "0") return "#9ca3af";
    if (totalStunting > 0) return "#ef4444";
    if (totalPraStunting > 0) return "#eab308";
    return "#22c55e";
  };

  const getMarkerRadius = (totalAnak) => {
    const baseRadius = 6;
    const anakCount = parseInt(totalAnak) || 0;
    return baseRadius + (anakCount * 2); 
  };
  
  // =========================================================================
  // LOGIKA WARNA PINTAR (HOLLOW POLYGON)
  // =========================================================================
  const getPolygonStyle = (feature) => {
    const namaGeo = (feature.properties.kab_kota || "").toLowerCase().replace("kabupaten ", "").replace("kota ", "").trim();
    const dataWilayah = agregatML.find((item) => item.kabupaten_kota.toLowerCase().replace("kabupaten ", "").replace("kota ", "").trim() === namaGeo);

    let riskColor = "#9ca3af"; // Default Abu-abu
    let hasData = false;

    if (dataWilayah) {
      hasData = true;
      const r = dataWilayah.tingkat_kerentanan;
      riskColor = r === "Rendah" ? "#22c55e" : r === "Sedang" ? "#facc15" : r === "Tinggi" ? "#f97316" : "#dc2626";
    }

    // JIKA BENCANA MENYALA: Kosongkan isi, tebalkan garis batas dengan warna risiko
    if (isBencanaActive) {
      return {
        fillColor: riskColor,
        fillOpacity: 0, // Transparan 100% agar peta bencana terlihat
        color: hasData ? riskColor : "#9ca3af", // Garis berubah jadi warna risiko
        weight: 3.5, // Garis batas ditebalkan
        opacity: 1
      };
    } 
    
    // JIKA BENCANA MATI: Kembalikan warna isi seperti biasa (Peta Blok)
    return {
      fillColor: riskColor,
      fillOpacity: hasData ? 0.8 : 0.4,
      color: "white", // Garis batas putih
      weight: 1.5,
      opacity: 1
    };
  };

  const onEachFeature = (feature, layer) => {
    const namaGeo = (feature.properties.kab_kota || "Wilayah Tidak Diketahui").toLowerCase().replace("kabupaten ", "").replace("kota ", "").trim();
    const dataWilayah = agregatML.find((i) => i.kabupaten_kota.toLowerCase().replace("kabupaten ", "").replace("kota ", "").trim() === namaGeo);

    layer.bindPopup(`
      <div style="text-align: center; font-family: ui-sans-serif, system-ui, sans-serif; min-width:160px;">
        <h3 style="font-weight: 900; margin-bottom: 5px; font-size: 13px; text-transform:uppercase;">${feature.properties.kab_kota}</h3>
        ${dataWilayah ? `
          <p style="font-size: 10px; color: gray; margin: 0;">Risiko Stunting (ML):</p>
          <span style="font-weight: 900; font-size: 14px; color: ${
            dataWilayah.tingkat_kerentanan === 'Rendah' ? '#16a34a' :
            dataWilayah.tingkat_kerentanan === 'Sedang' ? '#ca8a04' :
            dataWilayah.tingkat_kerentanan === 'Tinggi' ? '#ea580c' : '#dc2626'
          };">${dataWilayah.tingkat_kerentanan.toUpperCase()}</span>
        ` : `<span style="font-size:10px; color:gray;">Belum ada data ML</span>`}
      </div>
    `);

    // Logika Hover juga harus disesuaikan
    layer.on({
      mouseover: (e) => {
        if (isBencanaActive) {
          e.target.setStyle({ fillOpacity: 0.2, weight: 5 }); // Saat di-hover batas makin tebal dan sedikit berwarna
        } else {
          e.target.setStyle({ fillOpacity: 0.95, weight: 3, color: '#666' });
        }
      },
      mouseout: (e) => {
        // Kembalikan ke style awal menggunakan fungsi getPolygonStyle
        e.target.setStyle(getPolygonStyle(feature));
      }
    });
  };

  return (
    <div className="w-full h-full relative font-sans">
      
      {/* ========================================================= */}
      {/* KANAN ATAS: MENU LAPISAN BENCANA */}
      {/* ========================================================= */}
      {mode === "kerentanan" && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-none">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md border transition-all duration-300 hover:bg-gray-50 active:scale-95 ${isMenuOpen ? 'border-blue-500 text-blue-600' : 'border-gray-200 text-gray-700'}`}
          >
            <FaLayerGroup className="text-sm sm:text-base" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">Lapisan Bencana</span>
            <FaChevronDown className={`text-[10px] sm:text-xs transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className={`pointer-events-auto transition-all duration-300 origin-top-right w-[calc(100vw-1.5rem)] max-w-[280px] sm:max-w-[320px] ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 hidden'}`}>
            <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-100">
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-[13px] font-black text-gray-800 uppercase tracking-tight">Konteks Kewilayahan</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Server Live InaRISK BNPB</p>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3">
                <CustomToggle label="Rawan Banjir" icon={<FaWater size={14} />} active={layerBanjir} onChange={() => setLayerBanjir(!layerBanjir)} activeColor={{ bg: 'bg-blue-100', text: 'text-blue-600', switch: 'bg-blue-500' }} />
                <CustomToggle label="Rawan Kekeringan" icon={<FaFire size={14} />} active={layerKekeringan} onChange={() => setLayerKekeringan(!layerKekeringan)} activeColor={{ bg: 'bg-orange-100', text: 'text-orange-600', switch: 'bg-orange-500' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* KIRI BAWAH: LEGENDA PETA */}
      {/* ========================================================= */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[1000] flex flex-col items-start gap-2 pointer-events-none">
        <button 
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
        >
          <FaMapMarkedAlt className="text-gray-500 text-sm" />
          <span className="text-xs font-bold tracking-tight">Legenda Peta</span>
          {isLegendOpen ? <FaChevronDown className="text-[10px] text-gray-400" /> : <FaChevronUp className="text-[10px] text-gray-400" />}
        </button>

        <div className={`pointer-events-auto transition-all duration-300 origin-bottom-left w-[calc(100vw-1.5rem)] max-w-[240px] sm:max-w-[260px] ${isLegendOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 hidden'}`}>
          <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 max-h-[50vh] overflow-y-auto custom-scrollbar">
            
            {mode === "balita" ? (
              <div className="flex flex-col gap-2">
                <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 mb-1 border-b pb-1">KASUS MIKRO (BALITA)</div>
                <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></div><span className="text-[11px] sm:text-xs font-semibold text-gray-700">Stunting Ditemukan</span></div>
                <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-white"></div><span className="text-[11px] sm:text-xs font-semibold text-gray-700">Pra-Stunting (Waspada)</span></div>
                <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white"></div><span className="text-[11px] sm:text-xs font-semibold text-gray-700">Gizi Normal / Aman</span></div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 mb-2 border-b pb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1"><FaShieldAlt/> RISIKO STUNTING (ML)</span>
                  </div>
                  
                  {/* PENANDA CERDAS DI LEGENDA: Beritahu user bentuk petanya berubah */}
                  {isBencanaActive && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-700 text-[9px] px-2 py-1 rounded mb-2 font-medium leading-tight">
                      Mode Overlay Aktif: Risiko ML kini ditampilkan sebagai <b className="font-bold">Warna Garis Batas Wilayah</b>.
                    </div>
                  )}

                  <div className="flex w-full h-1.5 sm:h-2 rounded-full overflow-hidden mb-1.5">
                    <div className="w-1/4 bg-green-500"></div>
                    <div className="w-1/4 bg-yellow-400"></div>
                    <div className="w-1/4 bg-orange-500"></div>
                    <div className="w-1/4 bg-red-600"></div>
                  </div>
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase">
                    <span>Aman</span><span>Waspada</span><span>Rawan</span><span>Kritis</span>
                  </div>
                </div>

                {isBencanaActive && (
                  <div className="mt-1 sm:mt-2 pt-2 sm:pt-3 border-t border-gray-100">
                    <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 mb-2 border-b pb-1 flex items-center gap-1.5">
                      {layerBanjir ? <FaWater className="text-blue-500"/> : <FaFire className="text-orange-500"/>} 
                      PETA KERAWANAN (BNPB)
                    </div>
                    <div className="flex items-center gap-2 mb-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500 opacity-70"></div><span className="text-[10px] sm:text-[11px] font-semibold text-gray-700">Kawasan Rawan Tinggi</span></div>
                    <div className="flex items-center gap-2 mb-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-yellow-400 opacity-70"></div><span className="text-[10px] sm:text-[11px] font-semibold text-gray-700">Tingkat Menengah</span></div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-green-500 opacity-70"></div><span className="text-[10px] sm:text-[11px] font-semibold text-gray-700">Kawasan Aman</span></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* KANVAS PETA LEAFLET                                       */}
      {/* ========================================================= */}
      <MapContainer center={centerPosition} zoom={7} scrollWheelZoom={true} className="w-full h-full z-0" zoomControl={false}>

        <MapResizer />
        <TileLayer attribution='&copy; OpenStreetMap | Data: Dinkes & BNPB' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* OVERLAY BNPB */}
        {mode === "kerentanan" && layerBanjir && (
          <EsriDynamicLayer url="https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_banjir_30/MapServer" opacity={0.65} />
        )}
        {mode === "kerentanan" && layerKekeringan && (
          <EsriDynamicLayer url="https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_kekeringan_30/MapServer" opacity={0.65} />
        )}

        {/* Trik Kunci: Tambahkan isBencanaActive ke dalam 'key' GeoJSON. 
          Ini memaksa React menggambar ulang ulang garis batas (Hollow/Solid) setiap kali sakelar bencana dinyalakan/dimatikan. 
        */}
        {mode === "balita" ? (
          laporan.map((w, i) => {
            const pos = koordinatWilayah[w.nama_kabupaten];
            if (pos) {
              const c = getMarkerColor(w.total_anak, w.total_stunting, w.total_prastunting);
              return (
                <CircleMarker 
                  key={i} 
                  center={pos} 
                  pathOptions={{ color: c, fillColor: c, fillOpacity: 0.8 }} 
                  radius={getMarkerRadius(w.total_anak)}
                >
                  <Popup>
                    <div style={{ textAlign: "left", fontFamily: "ui-sans-serif, system-ui, sans-serif", minWidth: "160px" }}>
                      <h3 style={{ fontWeight: 900, marginBottom: "8px", fontSize: "13px", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px", color: "#1f2937" }}>
                        {w.nama_kabupaten}
                      </h3>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                        <span style={{ color: "#6b7280", fontWeight: 600 }}>Total Anak:</span> 
                        <b style={{ color: "#1f2937" }}>{w.total_anak}</b>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                        <span style={{ color: "#6b7280", fontWeight: 600 }}>Gizi Normal:</span> 
                        <b style={{ color: "#16a34a" }}>{w.total_normal}</b>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                        <span style={{ color: "#6b7280", fontWeight: 600 }}>Pra-Stunting:</span> 
                        <b style={{ color: "#ca8a04" }}>{w.total_prastunting}</b>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                        <span style={{ color: "#6b7280", fontWeight: 600 }}>Stunting:</span> 
                        <b style={{ color: "#dc2626" }}>{w.total_stunting}</b>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            } return null;
          })
        ) : (
          geoJsonData && <GeoJSON key={`${agregatML.length}-${isBencanaActive}`} data={geoJsonData} style={getPolygonStyle} onEachFeature={onEachFeature} />
        )}
      </MapContainer>
    </div>
  );
}