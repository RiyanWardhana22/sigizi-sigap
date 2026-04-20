import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 1. TERIMA PROP 'mode' DARI HALAMAN INDUK
export default function MapDashboard({ mode = "balita" }) {
  // --- STATE UNTUK MODE 1: BALITA (Milik Teman Anda) ---
  const [laporan, setLaporan] = useState([]);
  
  // --- STATE UNTUK MODE 2: MACHINE LEARNING (Baru) ---
  const [agregatML, setAgregatML] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);

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

  // 2. FETCH SEMUA DATA SAAT HALAMAN DIBUKA
  useEffect(() => {
    // A. Ambil Data Titik Balita
    const fetchPetaBalita = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_laporan.php`);
        const data = await response.json();
        if (data.status === "success") setLaporan(data.data);
      } catch (error) {
        console.error("Gagal mengambil data peta balita:", error);
      }
    };

    // B. Ambil Data Prediksi Kerentanan ML dari Database
    const fetchPetaML = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_agregat_wilayah.php`);
        const data = await response.json();
        if (data.status === "success") setAgregatML(data.data);
      } catch (error) {
        console.error("Gagal mengambil data ML:", error);
      }
    };

    // C. Ambil File GeoJSON dari folder public
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch("/sumut.geojson"); // Pastikan namanya sumut.geojson
        const data = await response.json();
        setGeoJsonData(data);
      } catch (error) {
        console.error("Gagal memuat GeoJSON. Pastikan file sumut.geojson ada di folder public.", error);
      }
    };

    fetchPetaBalita();
    fetchPetaML();
    fetchGeoJSON();
  }, []);

  const centerPosition = [2.115355, 99.545097];

  // ================= LOGIKA WARNA MIKRO (BALITA) =================
  const getMarkerColor = (totalAnak, totalStunting, totalPraStunting) => {
    if (totalAnak === 0 || totalAnak === "0") return "#9ca3af";
    if (totalStunting > 0) return "#ef4444";
    if (totalPraStunting > 0) return "#eab308";
    return "#22c55e";
  };
  
  const getMarkerRadius = (totalAnak) => {
    const baseRadius = 8;
    const anakCount = parseInt(totalAnak) || 0;
    return baseRadius + anakCount * 3;
  };

  // ================= LOGIKA WARNA MAKRO (MACHINE LEARNING) =================
  const getPolygonStyle = (feature) => {
    // 1. GUNAKAN KUNCI 'kab_kota' (Sesuai hasil log console Anda)
    const namaKabGeoJSON = feature.properties.kab_kota || "";
    
    // 2. Logika Pencocokan Pintar (Menghapus kata 'Kabupaten' atau 'Kota' agar sinkron dengan DB)
    const dataWilayah = agregatML.find((item) => {
      const namaDB = item.kabupaten_kota.toLowerCase()
        .replace("kabupaten ", "").replace("kota ", "").trim();
      const namaGeo = namaKabGeoJSON.toLowerCase()
        .replace("kabupaten ", "").replace("kota ", "").trim();
      return namaDB === namaGeo;
    });

    let fillColor = "#e5e7eb"; // Default: Abu-abu jika tidak cocok
    let fillOpacity = 0.6;

    if (dataWilayah) {
      fillOpacity = 0.8;
      const risiko = dataWilayah.tingkat_kerentanan;
      // Mewarnai berdasarkan hasil prediksi di Database
      if (risiko === "Rendah") fillColor = "#22c55e";      // Hijau
      else if (risiko === "Sedang") fillColor = "#facc15"; // Kuning
      else if (risiko === "Tinggi") fillColor = "#f97316"; // Oranye
      else if (risiko === "Sangat Tinggi") fillColor = "#dc2626"; // Merah
    }

    return {
      fillColor: fillColor,
      weight: 1.5,
      opacity: 1,
      color: "white",
      fillOpacity: fillOpacity,
    };
  };

  const onEachFeature = (feature, layer) => {
    const namaKabGeoJSON = feature.properties.kab_kota || "Wilayah Tidak Diketahui";
    
    // 1. Cari Data Prediksi ML & Input Dinas
    const dataWilayah = agregatML.find((item) => {
      const namaDB = item.kabupaten_kota.toLowerCase().replace("kabupaten ", "").replace("kota ", "").trim();
      const namaGeo = namaKabGeoJSON.toLowerCase().replace("kabupaten ", "").replace("kota ", "").trim();
      return namaDB === namaGeo;
    });

    // 2. Cari Data Faktual Stunting (Mikro)
    const dataFakta = laporan.find((item) => {
      const namaLaporan = item.nama_kabupaten.toLowerCase().replace("kabupaten ", "").replace("kota ", "").trim();
      const namaGeo = namaKabGeoJSON.toLowerCase().replace("kabupaten ", "").replace("kota ", "").trim();
      return namaLaporan === namaGeo;
    });

    let risikoTeks = "BELUM ADA DATA";
    let warnaRisiko = "#9ca3af";

    if (dataWilayah) {
      risikoTeks = dataWilayah.tingkat_kerentanan.toUpperCase();
      if (risikoTeks === 'RENDAH') warnaRisiko = '#16a34a';
      else if (risikoTeks === 'SEDANG') warnaRisiko = '#ca8a04';
      else if (risikoTeks === 'TINGGI') warnaRisiko = '#ea580c';
      else warnaRisiko = '#dc2626';
    }

    // 3. Susun HTML Popup dengan Desain 2 Kartu (Scrollable)
    layer.bindPopup(`
      <div style="text-align: left; min-width: 250px; max-height: 350px; overflow-y: auto; padding-right: 5px; font-family: ui-sans-serif, system-ui, sans-serif;">
        <h3 style="font-weight: 900; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-bottom: 12px; font-size: 15px; color: #1f2937; text-transform: uppercase;">
          ${namaKabGeoJSON}
        </h3>

        ${dataWilayah ? `
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="font-size: 10px; color: #475569; font-weight: 800; letter-spacing: 0.5px;">PREDIKSI RISIKO (ML)</span>
            <span style="font-weight: 900; font-size: 12px; padding: 3px 8px; border-radius: 4px; background-color: ${warnaRisiko}20; color: ${warnaRisiko};">
              ${risikoTeks}
            </span>
          </div>
          
          <p style="font-size: 10px; color: #475569; font-weight: 800; letter-spacing: 0.5px; margin: 0 0 6px 0;">FAKTOR DETERMINAN (INPUT DINAS):</p>
          <table style="width: 100%; font-size: 11px; color: #334155; border-collapse: collapse;">
            <tbody>
              <tr><td style="padding: 2px 0;">Bayi BBLR</td><td style="text-align: right; font-weight: 700; color: #ef4444;">${parseFloat(dataWilayah.p_bblr).toFixed(1)}%</td></tr>
              <tr><td style="padding: 2px 0;">Balita Gizi Buruk</td><td style="text-align: right; font-weight: 700; color: #ef4444;">${parseFloat(dataWilayah.p_gizi_buruk).toFixed(1)}%</td></tr>
              <tr><td style="padding: 2px 0;">Sanitasi Layak</td><td style="text-align: right; font-weight: 700; color: #22c55e;">${parseFloat(dataWilayah.p_sanitasi).toFixed(1)}%</td></tr>
              <tr><td style="padding: 2px 0;">Air Bersih</td><td style="text-align: right; font-weight: 700; color: #22c55e;">${parseFloat(dataWilayah.p_air).toFixed(1)}%</td></tr>
              <tr><td style="padding: 2px 0;">Pendidikan Ibu &lt; SMP</td><td style="text-align: right; font-weight: 700; color: #f59e0b;">${parseFloat(dataWilayah.p_ibu).toFixed(1)}%</td></tr>
              <tr><td style="padding: 2px 0;">Rata-rata Penghasilan</td><td style="text-align: right; font-weight: 700; color: #3b82f6;">Rp${Number(dataWilayah.penghasilan).toLocaleString('id-ID')}</td></tr>
            </tbody>
          </table>
          <div style="font-size: 9px; color: #94a3b8; text-align: right; margin-top: 6px;">Diperbarui: ${dataWilayah.tanggal_input}</div>
        </div>
        ` : `
        <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px; margin-bottom: 12px; text-align: center;">
          <p style="font-size: 11px; color: #dc2626; font-weight: 600; margin: 0;">Data agregat faktor sosial-ekonomi belum diinput oleh Dinas.</p>
        </div>
        `}

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
          <p style="font-size: 10px; font-weight: 800; margin: 0 0 8px 0; color: #4b5563; letter-spacing: 0.5px;">LAPORAN KASUS BALITA (MIKRO)</p>
          
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px solid #f3f4f6;">
            <span style="color: #6b7280;">Total Anak Terukur</span> 
            <b style="color: #111827;">${dataFakta ? dataFakta.total_anak : 0}</b>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
            <span style="color: #6b7280;">Gizi Normal</span> 
            <b style="color: #16a34a;">${dataFakta ? dataFakta.total_normal : 0}</b>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
            <span style="color: #6b7280;">Pra-stunting</span> 
            <b style="color: #ca8a04;">${dataFakta ? dataFakta.total_prastunting : 0}</b>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: #6b7280;">Stunting</span> 
            <b style="color: #dc2626;">${dataFakta ? dataFakta.total_stunting : 0}</b>
          </div>
        </div>

      </div>
    `);

    // Efek Hover Poligon
    layer.on({
      mouseover: (e) => { e.target.setStyle({ weight: 3, color: '#666', fillOpacity: 0.9 }); },
      mouseout: (e) => { e.target.setStyle({ weight: 1.5, color: 'white', fillOpacity: dataWilayah ? 0.8 : 0.6 }); }
    });
  };

  return (
    <div className="w-full h-full">
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

        {/* --- LOGIKA PERGANTIAN RENDER PETA --- */}
        {mode === "balita" ? (
          /* RENDER 1: TITIK KASUS BALITA (ASLI) */
          laporan.map((wilayah, index) => {
            const posisi = koordinatWilayah[wilayah.nama_kabupaten];
            if (posisi) {
              const warnaLingkaran = getMarkerColor(
                wilayah.total_anak,
                wilayah.total_stunting,
                wilayah.total_prastunting
              );
              return (
                <CircleMarker
                  key={index}
                  center={posisi}
                  pathOptions={{
                    color: warnaLingkaran,
                    fillColor: warnaLingkaran,
                    fillOpacity: 0.7,
                  }}
                  radius={getMarkerRadius(wilayah.total_anak)}
                >
                  <Popup>
                    <div className="text-center min-w-[150px]">
                      <h3 className="font-bold text-gray-800 border-b pb-1 mb-2">
                        {wilayah.nama_kabupaten}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 border-b pb-1">
                        Total Anak Terdata: <strong>{wilayah.total_anak}</strong>
                      </p>
                      <div className="flex flex-col gap-1 text-sm text-left">
                        <p className="flex justify-between items-center">
                          <span className="text-green-600">Normal:</span>
                          <span className="font-bold bg-green-100 px-2 rounded text-green-700">
                            {wilayah.total_normal || 0}
                          </span>
                        </p>
                        <p className="flex justify-between items-center">
                          <span className="text-yellow-600">Pra-stunting:</span>
                          <span className="font-bold bg-yellow-100 px-2 rounded text-yellow-700">
                            {wilayah.total_prastunting || 0}
                          </span>
                        </p>
                        <p className="flex justify-between items-center">
                          <span className="text-red-600">Stunting:</span>
                          <span className="font-bold bg-red-100 px-2 rounded text-red-700">
                            {wilayah.total_stunting || 0}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            }
            return null;
          })
        ) : (
          /* RENDER 2: POLIGON KERENTANAN MACHINE LEARNING */
          geoJsonData && (
            <GeoJSON
              key={agregatML.length} // Force re-render saat data DB masuk
              data={geoJsonData}
              style={getPolygonStyle}
              onEachFeature={onEachFeature}
            />
          )
        )}
      </MapContainer>
    </div>
  );
}