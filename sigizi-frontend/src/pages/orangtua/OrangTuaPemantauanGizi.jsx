// sigizi-frontend/src/pages/orangtua/OrangTuaPemantauanGizi.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnak } from "../../contexts/AnakContext";
import Sidebar from "../../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, Scatter
} from "recharts";
import { whoGrowthData, cdcGrowthData, calculatePercentile, calculateZScore } from "./growthReferences";

export default function OrangTuaPemantauanGizi() {
  const navigate = useNavigate();
  const { 
    selectedAnakId, 
    selectedAnakData, 
    anakList, 
    updateSelectedAnak, 
    updateAnakList,
    currentUserId,
    currentUserRole
  } = useAnak();
  
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [showAnakDropdown, setShowAnakDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [activeMainMenu, setActiveMainMenu] = useState("berat");
  const [activeSubMenu, setActiveSubMenu] = useState("bb_u");
  const [ageRange, setAgeRange] = useState("0-60");
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  
  const [orangTuaList, setOrangTuaList] = useState([]);
  const [selectedOrangTuaId, setSelectedOrangTuaId] = useState(null);
  const [superAdminAnakList, setSuperAdminAnakList] = useState([]);
  const [superAdminSelectedAnak, setSuperAdminSelectedAnak] = useState(null);
  const [superAdminShowAnakDropdown, setSuperAdminShowAnakDropdown] = useState(false);
  const [growthData, setGrowthData] = useState([]);
  const [superAdminGrowthData, setSuperAdminGrowthData] = useState([]);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Konstanta untuk validasi data
  const MAX_VALID_WEIGHT = 150;  // Maksimum berat badan normal untuk anak (kg)
  const MAX_VALID_HEIGHT = 200;  // Maksimum tinggi badan normal (cm)
  const MAX_VALID_IMT = 50;      // Maksimum IMT normal
  const MAX_VALID_LK = 70;       // Maksimum lingkar kepala (cm)

  // Mapping rentang umur dengan konfigurasi lengkap
  const ageRangeConfig = {
    '0-2': { 
      min: 0, max: 2, label: 'Grafik 0 - 2 Bulan', shortLabel: '0-2 bln', isWHO: true, icon: 'faBaby', step: 0.25,
      yDomain: { bb_u: [2, 8], tb_u: [45, 65], imt_u: [10, 20] }
    },
    '0-12': { 
      min: 0, max: 12, label: 'Grafik 0 - 12 Bulan', shortLabel: '0-12 bln', isWHO: true, icon: 'faBabyCarriage', step: 0.5,
      yDomain: { bb_u: [3, 12], tb_u: [48, 78], imt_u: [12, 24] }
    },
    '0-60': { 
      min: 0, max: 60, label: 'Grafik 0 - 5 Tahun', shortLabel: '0-5 thn', isWHO: true, icon: 'faChild', step: 1,
      yDomain: { bb_u: [5, 22], tb_u: [60, 120], imt_u: [12, 28] }
    },
    '60-216': { 
      min: 60, max: 216, label: 'Grafik 5 - 18 Tahun', shortLabel: '5-18 thn', isWHO: false, icon: 'faUserGraduate', step: 1,
      yDomain: { bb_u: [15, 100], tb_u: [110, 190], imt_u: [13, 35] }
    }
  };

  const lkAgeRangeConfig = {
    '0-2': { min: 0, max: 2, label: 'Grafik 0 - 2 Bulan', shortLabel: '0-2 bln', isWHO: true, icon: 'faBaby', step: 0.25, yDomain: [31, 38] },
    '0-12': { min: 0, max: 12, label: 'Grafik 0 - 12 Bulan', shortLabel: '0-12 bln', isWHO: true, icon: 'faBabyCarriage', step: 0.5, yDomain: [33, 48] },
    '0-60': { min: 0, max: 60, label: 'Grafik 0 - 5 Tahun', shortLabel: '0-5 thn', isWHO: true, icon: 'faChild', step: 1, yDomain: [40, 56] }
  };

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
    setUserRole(parsedUser.role);
    
    if (parsedUser.role === "super_admin") {
      fetchOrangTuaList();
    } else {
      fetchData(parsedUser.id, "orang_tua");
    }
  }, [navigate]);

  useEffect(() => {
    if (userRole === "orang_tua" && selectedAnakData) {
      generateGrowthData(selectedAnakData, setGrowthData);
    }
  }, [selectedAnakData, userRole]);

  useEffect(() => {
    if (userRole === "super_admin" && superAdminSelectedAnak) {
      generateGrowthData(superAdminSelectedAnak, setSuperAdminGrowthData);
    }
  }, [superAdminSelectedAnak, userRole]);

  // Reset ageRange when switching to Lingkar Kepala menu
  useEffect(() => {
    if (activeMainMenu === 'lingkar_kepala') {
      const validLKRanges = ['0-2', '0-12', '0-60'];
      if (!validLKRanges.includes(ageRange)) {
        setAgeRange('0-60');
      }
    }
  }, [activeMainMenu, ageRange]);

  const calculateAgeInMonths = (birthDate, measurementDate) => {
    let months = (measurementDate.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += measurementDate.getMonth();
    if (measurementDate.getDate() < birthDate.getDate()) months--;
    return Math.max(0, months);
  };

  const fetchOrangTuaList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/get_users.php`);
      const data = await response.json();
      
      if (data.status === "success") {
        const orangTua = data.data.filter(u => u.role === "orang_tua");
        setOrangTuaList(orangTua);
        if (orangTua.length > 0) {
          setSelectedOrangTuaId(orangTua[0].id);
          await fetchData(orangTua[0].id, "super_admin");
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching orang tua list:", error);
      setLoading(false);
    }
  };

  const fetchData = async (userId, role) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/get_riwayat_anak.php?user_id=${userId}`);
      const data = await response.json();
      
      if (data.status === "success") {
        const processedAnakList = data.data.map(anak => ({
          ...anak,
          id: Number(anak.id),
          riwayat: (anak.riwayat || []).map(r => ({
            ...r,
            tanggal_pengukuran: r.tanggal_pengukuran,
            tinggi_badan: Number(r.tinggi_badan),
            berat_badan: Number(r.berat_badan),
            lingkar_kepala: r.lingkar_kepala ? Number(r.lingkar_kepala) : null,
            z_score: r.z_score ? Number(r.z_score) : null,
            status_gizi: r.status_gizi
          })).sort((a, b) => new Date(a.tanggal_pengukuran) - new Date(b.tanggal_pengukuran))
        }));
        
        if (role === "orang_tua") {
          updateAnakList(processedAnakList, userId, role);
        } else {
          setSuperAdminAnakList(processedAnakList);
          if (processedAnakList.length > 0 && !superAdminSelectedAnak) {
            setSuperAdminSelectedAnak(processedAnakList[0]);
            generateGrowthData(processedAnakList[0], setSuperAdminGrowthData);
          }
        }
      } else if (data.status === "empty") {
        if (role === "orang_tua") {
          updateAnakList([], userId, role);
        } else {
          setSuperAdminAnakList([]);
          setSuperAdminSelectedAnak(null);
          setSuperAdminGrowthData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateGrowthData = (anak, setData) => {
    if (!anak || !anak.riwayat || anak.riwayat.length === 0) {
      setData([]);
      return;
    }
    
    const birthDate = new Date(anak.tanggal_lahir);
    
    const formattedData = anak.riwayat
      .filter(r => {
        // Filter data yang tidak valid (nilai terlalu besar atau negatif)
        const isValidWeight = r.berat_badan > 0 && r.berat_badan < MAX_VALID_WEIGHT;
        const isValidHeight = r.tinggi_badan > 0 && r.tinggi_badan < MAX_VALID_HEIGHT;
        const isValidLK = !r.lingkar_kepala || (r.lingkar_kepala > 0 && r.lingkar_kepala < MAX_VALID_LK);
        
        if (!isValidWeight || !isValidHeight) {
          console.warn(`Data tidak valid untuk anak ${anak.nama_anak}: Berat=${r.berat_badan}, Tinggi=${r.tinggi_badan}`);
        }
        return isValidWeight && isValidHeight && isValidLK;
      })
      .map(r => {
        const measurementDate = new Date(r.tanggal_pengukuran);
        const ageInMonths = calculateAgeInMonths(birthDate, measurementDate);
        
        const imt = r.tinggi_badan > 0 ? r.berat_badan / Math.pow(r.tinggi_badan / 100, 2) : null;
        
        return {
          tanggal: r.tanggal_pengukuran,
          usiaBulan: ageInMonths,
          usiaTahun: ageInMonths / 12,
          tinggi: r.tinggi_badan,
          berat: r.berat_badan,
          imt: imt,
          lingkar_kepala: r.lingkar_kepala,
          status_gizi: r.status_gizi,
          z_score: r.z_score
        };
      });
    setData(formattedData);
  };

  const handleOrangTuaChange = async (userId) => {
    setSelectedOrangTuaId(userId);
    setSuperAdminSelectedAnak(null);
    setSuperAdminGrowthData([]);
    await fetchData(userId, "super_admin");
  };

  const handleAnakChange = (anakId) => {
    const anak = anakList.find(a => a.id === anakId);
    if (anak) {
      updateSelectedAnak(anakId, anak, currentUserId);
    }
    setShowAnakDropdown(false);
  };

  const handleSuperAdminAnakChange = (anak) => {
    setSuperAdminSelectedAnak(anak);
    setSuperAdminShowAnakDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("selectedAnakId");
    localStorage.removeItem("currentUserId");
    navigate("/");
  };

  // Helper: Mendapatkan nilai referensi dengan INTERPOLASI LINEAR
  const getReferenceValue = (usiaBulan, jenisKelamin, indicator, percentileKey) => {
    const isMale = jenisKelamin === 'L';
    const isWHO = ageRangeConfig[ageRange]?.isWHO !== false;
    
    if (isWHO) {
      const data = whoGrowthData[indicator];
      if (!data) return null;
      const genderData = isMale ? data.laki : data.perempuan;
      if (!genderData) return null;
      
      const ages = Object.keys(genderData).map(Number).sort((a, b) => a - b);
      
      const lower = ages.filter(a => a <= usiaBulan).at(-1);
      const upper = ages.find(a => a > usiaBulan);
      
      if (lower === undefined) return genderData[ages[0]]?.[percentileKey];
      if (upper === undefined) return genderData[ages.at(-1)]?.[percentileKey];
      
      const v1 = genderData[lower]?.[percentileKey];
      const v2 = genderData[upper]?.[percentileKey];
      if (v1 == null || v2 == null) return v1 ?? v2;
      
      return v1 + (v2 - v1) * (usiaBulan - lower) / (upper - lower);
    } else {
      const data = cdcGrowthData[indicator];
      if (!data) return null;
      const genderData = isMale ? data.laki : data.perempuan;
      if (!genderData) return null;
      
      const ageInYears = usiaBulan / 12;
      const ages = Object.keys(genderData).map(Number).sort((a, b) => a - b);
      
      const lower = ages.filter(a => a <= ageInYears).at(-1);
      const upper = ages.find(a => a > ageInYears);
      
      if (lower === undefined) return genderData[ages[0]]?.[percentileKey];
      if (upper === undefined) return genderData[ages.at(-1)]?.[percentileKey];
      
      const v1 = genderData[lower]?.[percentileKey];
      const v2 = genderData[upper]?.[percentileKey];
      if (v1 == null || v2 == null) return v1 ?? v2;
      
      return v1 + (v2 - v1) * (ageInYears - lower) / (upper - lower);
    }
  };

  // Membuat data referensi lengkap dengan stacked area
  const generateFullReferenceData = (jenisKelamin, indicator) => {
    const isWHO = ageRangeConfig[ageRange]?.isWHO !== false;
    let config;
    if (activeMainMenu === 'lingkar_kepala') {
      config = lkAgeRangeConfig[ageRange];
    } else {
      config = ageRangeConfig[ageRange];
    }
    if (!config) return [];
    
    const referenceAges = [];
    const step = config.step;
    for (let age = config.min; age <= config.max + 0.01; age += step) {
      referenceAges.push(Math.round(age * 10) / 10);
    }
    if (referenceAges[referenceAges.length - 1] !== config.max) {
      referenceAges.push(config.max);
    }
    
    const referenceData = [];
    
    for (const usia of referenceAges) {
      const dataPoint = { usiaBulan: usia, usiaTahun: usia / 12 };
      
      if (isWHO) {
        const sdNeg3 = getReferenceValue(usia, jenisKelamin, indicator, '-3sd');
        const sdNeg2 = getReferenceValue(usia, jenisKelamin, indicator, '-2sd');
        const sd0 = getReferenceValue(usia, jenisKelamin, indicator, '0sd');
        const sd2 = getReferenceValue(usia, jenisKelamin, indicator, '2sd');
        const sd3 = getReferenceValue(usia, jenisKelamin, indicator, '3sd');
        
        if (sdNeg3 !== null) dataPoint.sdNeg3 = sdNeg3;
        if (sdNeg2 !== null) dataPoint.sdNeg2 = sdNeg2;
        if (sd0 !== null) dataPoint.sd0 = sd0;
        if (sd2 !== null) dataPoint.sd2 = sd2;
        if (sd3 !== null) dataPoint.sd3 = sd3;
        
        if (sdNeg3 && sdNeg2) dataPoint.zoneBawah = sdNeg2 - sdNeg3;
        if (sdNeg2 && sd2) dataPoint.zoneNormal = sd2 - sdNeg2;
        if (sd2 && sd3) dataPoint.zoneAtas = sd3 - sd2;
      } else {
        const p3 = getReferenceValue(usia, jenisKelamin, indicator, 'p3');
        const p5 = getReferenceValue(usia, jenisKelamin, indicator, 'p5');
        const p85 = getReferenceValue(usia, jenisKelamin, indicator, 'p85');
        const p90 = getReferenceValue(usia, jenisKelamin, indicator, 'p90');
        const p95 = getReferenceValue(usia, jenisKelamin, indicator, 'p95');
        const p97 = getReferenceValue(usia, jenisKelamin, indicator, 'p97');
        
        if (p3 !== null) dataPoint.baseP3 = p3;
        if (p5 !== null) dataPoint.baseP5 = p5;
        if (p85 !== null) dataPoint.baseP85 = p85;
        if (p90 !== null) dataPoint.baseP90 = p90;
        if (p95 !== null) dataPoint.baseP95 = p95;
        if (p97 !== null) dataPoint.baseP97 = p97;
        
        if (indicator === 'bb_u' || indicator === 'imt_u') {
          if (p3 && p5) dataPoint.zoneBahayaBawah = p5 - p3;
          if (p5 && p90) dataPoint.zoneNormal = p90 - p5;
          if (p90 && p95) dataPoint.zonePerhatianAtas = p95 - p90;
          if (p95 && p97) dataPoint.zoneBahayaAtas = p97 - p95;
        } else {
          if (p3 && p95) dataPoint.zoneNormal = p95 - p3;
          if (p95 && p97) dataPoint.zonePerhatianAtas = p97 - p95;
        }
      }
      
      referenceData.push(dataPoint);
    }
    
    return referenceData;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label, unit, indicator, jenisKelamin }) => {
    if (!active || !payload || !payload.length) return null;
    
    const isWHO = ageRangeConfig[ageRange]?.isWHO !== false;
    const usiaTahun = (label / 12).toFixed(1);
    const usiaBulan = label;
    
    const childData = payload.find(p => p.dataKey === 'nilai' || p.name === 'Data Anak');
    const childValue = childData?.value;
    
    let statusGizi = "-";
    let persentilAtauZScore = "-";
    
    if (childValue && childValue < 1000 && jenisKelamin) {
      if (indicator === 'berat') {
        if (isWHO) {
          const zScore = calculateZScore(childValue, label, jenisKelamin, 'bb_u');
          persentilAtauZScore = `Z-Score: ${zScore.toFixed(2)}`;
          if (zScore < -3) statusGizi = "Sangat Kurang";
          else if (zScore < -2) statusGizi = "Kurang";
          else if (zScore <= 2) statusGizi = "Normal";
          else if (zScore <= 3) statusGizi = "Gemuk";
          else statusGizi = "Obesitas";
        } else {
          const percentile = calculatePercentile(childValue, label, jenisKelamin, 'bb_u');
          persentilAtauZScore = `Persentil: ${percentile}`;
          if (percentile < 3) statusGizi = "Sangat Kurang";
          else if (percentile < 5) statusGizi = "Kurang";
          else if (percentile <= 90) statusGizi = "Normal";
          else if (percentile <= 95) statusGizi = "Gemuk";
          else if (percentile <= 97) statusGizi = "Obesitas";
          else statusGizi = "Obesitas Berat";
        }
      } else if (indicator === 'tinggi') {
        if (isWHO) {
          const zScore = calculateZScore(childValue, label, jenisKelamin, 'tb_u');
          persentilAtauZScore = `Z-Score: ${zScore.toFixed(2)}`;
          if (zScore < -3) statusGizi = "Sangat Pendek";
          else if (zScore < -2) statusGizi = "Pendek (Stunting)";
          else statusGizi = "Normal";
        } else {
          const percentile = calculatePercentile(childValue, label, jenisKelamin, 'tb_u');
          persentilAtauZScore = `Persentil: ${percentile}`;
          if (percentile < 3) statusGizi = "Sangat Pendek";
          else if (percentile < 5) statusGizi = "Pendek";
          else statusGizi = "Normal";
        }
      } else if (indicator === 'imt') {
        if (isWHO) {
          const zScore = calculateZScore(childValue, label, jenisKelamin, 'imt_u');
          persentilAtauZScore = `Z-Score: ${zScore.toFixed(2)}`;
          if (zScore < -3) statusGizi = "Sangat Kurus (Severe Wasting)";
          else if (zScore < -2) statusGizi = "Kurus (Wasting)";
          else if (zScore <= 1) statusGizi = "Normal";
          else if (zScore <= 2) statusGizi = "Gemuk";
          else statusGizi = "Obesitas";
        } else {
          const percentile = calculatePercentile(childValue, label, jenisKelamin, 'imt_u');
          persentilAtauZScore = `Persentil: ${percentile}`;
          if (percentile < 3) statusGizi = "Sangat Kurus";
          else if (percentile < 5) statusGizi = "Kurus";
          else if (percentile <= 85) statusGizi = "Normal";
          else if (percentile <= 95) statusGizi = "Gemuk";
          else if (percentile <= 97) statusGizi = "Obesitas";
          else statusGizi = "Obesitas Berat";
        }
      }
    }
    
    const statusColor = 
      statusGizi === "Normal" ? "text-green-600" :
      statusGizi.includes("Kurang") || statusGizi.includes("Pendek") || statusGizi.includes("Kurus") ? "text-yellow-600" :
      "text-orange-600";
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 min-w-[200px]">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          {ageRange === '60-216' ? `Usia ${usiaTahun} Tahun` : `Usia ${usiaBulan} Bulan`}
        </p>
        <p className="text-lg font-bold text-gray-800">
          {childValue && childValue < 1000 ? childValue.toFixed(1) : '-'} {unit}
        </p>
        <p className={`text-sm font-medium ${statusColor} mt-1`}>
          {statusGizi}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {persentilAtauZScore}
        </p>
      </div>
    );
  };

  // Render grafik utama dengan ComposedChart
  const renderGrowthChart = (indicator, yAxisLabel, unit) => {
    const displayGrowthData = userRole === "orang_tua" ? growthData : superAdminGrowthData;
    const anak = userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
    
    if (!anak) {
      return (
        <div className="text-center py-12 text-gray-500">
          <FontAwesomeIcon icon={fas.faChartLine} className="text-4xl mb-3 opacity-30" />
          <p>Pilih anak terlebih dahulu</p>
        </div>
      );
    }
    
    const jenisKelamin = anak.jenis_kelamin;
    const isWHO = ageRangeConfig[ageRange]?.isWHO !== false;
    const config = activeMainMenu === 'lingkar_kepala' ? lkAgeRangeConfig[ageRange] : ageRangeConfig[ageRange];
    
    if (!config) {
      return (
        <div className="text-center py-12 text-yellow-500">
          <FontAwesomeIcon icon={fas.faExclamationTriangle} className="text-4xl mb-3 opacity-50" />
          <p>Konfigurasi grafik tidak tersedia</p>
        </div>
      );
    }
    
    // Generate data referensi
    const referenceData = generateFullReferenceData(jenisKelamin, indicator);
    
    // Filter data anak yang valid (nilai tidak terlalu besar)
    const childPoints = displayGrowthData
      .filter(point => {
        const value = point[indicator];
        if (value === null || value === undefined) return false;
        if (indicator === 'berat') return value > 0 && value < MAX_VALID_WEIGHT;
        if (indicator === 'tinggi') return value > 0 && value < MAX_VALID_HEIGHT;
        if (indicator === 'imt') return value > 0 && value < MAX_VALID_IMT;
        return true;
      })
      .map(point => ({
        usiaBulan: point.usiaBulan,
        nilai: point[indicator],
        tanggal: point.tanggal
      }));
    
    const latestChildPoint = childPoints.slice(-1)[0];
    
    // MERGE data anak ke referenceData
    const mergedData = referenceData.map(refPoint => {
      const exactMatch = childPoints.find(cp => cp.usiaBulan === refPoint.usiaBulan);
      if (exactMatch) {
        return { ...refPoint, nilai: exactMatch.nilai };
      }
      return { ...refPoint, nilai: null };
    });
    
    // Dynamic Y domain dengan batasan aman
    let yDomain;
    if (indicator === 'berat') {
      yDomain = [...config.yDomain.bb_u];
      yDomain[1] = Math.min(yDomain[1], MAX_VALID_WEIGHT);
    } else if (indicator === 'tinggi') {
      yDomain = [...config.yDomain.tb_u];
      yDomain[1] = Math.min(yDomain[1], MAX_VALID_HEIGHT);
    } else if (indicator === 'imt') {
      yDomain = [...config.yDomain.imt_u];
      yDomain[1] = Math.min(yDomain[1], MAX_VALID_IMT);
    } else {
      yDomain = [0, 100];
    }
    
    // Adjust Y domain based on child data dengan batasan aman
    if (childPoints.length > 0) {
      const validValues = childPoints.map(p => p.nilai).filter(v => v < (indicator === 'berat' ? MAX_VALID_WEIGHT : (indicator === 'tinggi' ? MAX_VALID_HEIGHT : MAX_VALID_IMT)));
      if (validValues.length > 0) {
        const minChildValue = Math.min(...validValues);
        const maxChildValue = Math.max(...validValues);
        
        if (minChildValue < yDomain[0] && minChildValue < (indicator === 'berat' ? MAX_VALID_WEIGHT : MAX_VALID_HEIGHT)) {
          yDomain[0] = Math.max(0, minChildValue - 2);
        }
        if (maxChildValue > yDomain[1] && maxChildValue < (indicator === 'berat' ? MAX_VALID_WEIGHT : MAX_VALID_HEIGHT)) {
          yDomain[1] = Math.min((indicator === 'berat' ? MAX_VALID_WEIGHT : MAX_VALID_HEIGHT), maxChildValue + 5);
        }
      }
    }
    
    // Pastikan Y domain tidak negatif dan tidak terlalu besar
    yDomain[0] = Math.max(0, yDomain[0]);
    yDomain[1] = Math.min((indicator === 'berat' ? MAX_VALID_WEIGHT : (indicator === 'tinggi' ? MAX_VALID_HEIGHT : MAX_VALID_IMT)), yDomain[1]);
    
    // Jika Y domain masih tidak masuk akal, gunakan default yang aman
    if (yDomain[0] >= yDomain[1] || yDomain[1] > (indicator === 'berat' ? MAX_VALID_WEIGHT : MAX_VALID_HEIGHT)) {
      if (indicator === 'berat') yDomain = [0, 30];
      else if (indicator === 'tinggi') yDomain = [50, 140];
      else yDomain = [10, 25];
    }
    
    return (
      <div>
        {/* Info Card */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {indicator === 'berat' ? 'Berat Badan' : indicator === 'tinggi' ? 'Tinggi Badan' : 'IMT'} Terakhir
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {latestChildPoint && latestChildPoint.nilai < MAX_VALID_WEIGHT ? latestChildPoint.nilai.toFixed(1) : '-'} <span className="text-lg font-normal text-gray-500">{unit}</span>
              </p>
              {latestChildPoint && latestChildPoint.nilai < MAX_VALID_WEIGHT && (
                <p className="text-xs text-gray-400 mt-1">
                  Usia: {Math.floor(latestChildPoint.usiaBulan / 12)} Tahun {latestChildPoint.usiaBulan % 12} Bulan
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Standar Referensi</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isWHO ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {isWHO ? 'WHO' : 'CDC'} - {indicator === 'berat' ? 'BB/U' : indicator === 'tinggi' ? 'TB/U' : 'IMT/U'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Chart dengan ComposedChart */}
        <div style={{ height: "520px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
              
              <XAxis 
                type="number"
                dataKey="usiaBulan"
                scale="linear"
                domain={[config.min, config.max]}
                allowDataOverflow={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(v) => ageRange === '60-216' ? `${Math.round(v / 12)}` : `${v}`}
                label={{ value: ageRange === '60-216' ? 'Usia (tahun)' : 'Usia (bulan)', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              
              <YAxis 
                domain={yDomain}
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => {
                  if (value > 1000) return '?';
                  if (value > 100) return Math.round(value).toString();
                  return value.toFixed(1);
                }}
              />
              
              <Tooltip 
                content={(props) => <CustomTooltip {...props} unit={unit} indicator={indicator} jenisKelamin={jenisKelamin} />}
                cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              
              <Legend 
                verticalAlign="top" 
                height={40}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              />
              
              {/* Area Zona Warna untuk WHO */}
              {isWHO && (
                <>
                  <Area
                    type="monotone"
                    dataKey="sdNeg3"
                    stackId="1"
                    stroke="none"
                    fill="#fee2e2"
                    fillOpacity={0.5}
                    name="Zona Bahaya"
                    legendType="square"
                  />
                  <Area
                    type="monotone"
                    dataKey="zoneBawah"
                    stackId="1"
                    stroke="none"
                    fill="#fef3c7"
                    fillOpacity={0.5}
                    name="Zona Perhatian"
                    legendType="square"
                  />
                  <Area
                    type="monotone"
                    dataKey="zoneNormal"
                    stackId="1"
                    stroke="none"
                    fill="#d1fae5"
                    fillOpacity={0.6}
                    name="Zona Normal"
                    legendType="square"
                  />
                  <Area
                    type="monotone"
                    dataKey="zoneAtas"
                    stackId="1"
                    stroke="none"
                    fill="#fef3c7"
                    fillOpacity={0.5}
                    name="Zona Perhatian"
                    legendType="none"
                  />
                </>
              )}
              
              {/* Area Zona Warna untuk CDC */}
              {!isWHO && (
                <>
                  {indicator !== 'tb_u' ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey="baseP3"
                        stackId="1"
                        stroke="none"
                        fill="transparent"
                        legendType="none"
                      />
                      <Area
                        type="monotone"
                        dataKey="zoneBahayaBawah"
                        stackId="1"
                        stroke="none"
                        fill="#fee2e2"
                        fillOpacity={0.5}
                        name="Zona Bahaya"
                        legendType="square"
                      />
                      <Area
                        type="monotone"
                        dataKey="zoneNormal"
                        stackId="1"
                        stroke="none"
                        fill="#d1fae5"
                        fillOpacity={0.6}
                        name="Zona Normal"
                        legendType="square"
                      />
                      <Area
                        type="monotone"
                        dataKey="zonePerhatianAtas"
                        stackId="1"
                        stroke="none"
                        fill="#fef3c7"
                        fillOpacity={0.5}
                        name="Zona Perhatian"
                        legendType="square"
                      />
                      <Area
                        type="monotone"
                        dataKey="zoneBahayaAtas"
                        stackId="1"
                        stroke="none"
                        fill="#fee2e2"
                        fillOpacity={0.5}
                        name="Zona Bahaya"
                        legendType="none"
                      />
                    </>
                  ) : (
                    <>
                      <Area
                        type="monotone"
                        dataKey="baseP3"
                        stackId="1"
                        stroke="none"
                        fill="transparent"
                        legendType="none"
                      />
                      <Area
                        type="monotone"
                        dataKey="zoneNormal"
                        stackId="1"
                        stroke="none"
                        fill="#d1fae5"
                        fillOpacity={0.6}
                        name="Zona Normal"
                        legendType="square"
                      />
                      <Area
                        type="monotone"
                        dataKey="zonePerhatianAtas"
                        stackId="1"
                        stroke="none"
                        fill="#fef3c7"
                        fillOpacity={0.5}
                        name="Zona Perhatian"
                        legendType="square"
                      />
                    </>
                  )}
                </>
              )}
              
              {/* Garis Median / P50 */}
              <Line
                type="natural"
                dataKey={isWHO ? "sd0" : "baseP50"}
                stroke={isWHO ? "#166534" : "#2563eb"}
                strokeWidth={2.5}
                strokeDasharray={isWHO ? "0" : "5 5"}
                name={isWHO ? "Median WHO" : "P50 (Median CDC)"}
                dot={false}
                activeDot={false}
              />
              
              {/* Garis data anak */}
              <Line
                type="monotone"
                dataKey="nilai"
                stroke="#3b82f6"
                strokeWidth={4}
                name="Garis Pertumbuhan"
                dot={false}
                activeDot={false}
                connectNulls
                legendType="none"
              />
              
              {/* Scatter titik data anak */}
              <Scatter
                data={childPoints.filter(p => p.nilai < (indicator === 'berat' ? MAX_VALID_WEIGHT : MAX_VALID_HEIGHT))}
                dataKey="nilai"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth={2}
                name="Data Anak"
                shape="circle"
                line={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Keterangan zona warna */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#d1fae5' }}></div>
            <span className="text-gray-500">Zona Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fef3c7' }}></div>
            <span className="text-gray-500">Zona Perhatian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fee2e2' }}></div>
            <span className="text-gray-500">Zona Bahaya</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5" style={{ backgroundColor: isWHO ? '#166534' : '#2563eb' }}></div>
            <span className="text-gray-500">{isWHO ? 'Median WHO' : 'Median CDC'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
            <span className="text-gray-500">Data Anak</span>
          </div>
        </div>
      </div>
    );
  };

  // Render functions untuk setiap chart
  const renderBBUChart = () => renderGrowthChart('berat', 'Berat Badan (kg)', 'kg');
  const renderIMTUChart = () => renderGrowthChart('imt', 'IMT (kg/m²)', 'kg/m²');
  const renderTBUChart = () => renderGrowthChart('tinggi', 'Tinggi Badan (cm)', 'cm');

  // Render BB/TB chart
  const renderBBTBChart = () => {
    const displayGrowthData = userRole === "orang_tua" ? growthData : superAdminGrowthData;
    const anak = userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
    
    if (!anak) {
      return (
        <div className="text-center py-12 text-gray-500">
          <FontAwesomeIcon icon={fas.faChartLine} className="text-4xl mb-3 opacity-30" />
          <p>Pilih anak terlebih dahulu</p>
        </div>
      );
    }
    
    const scatterData = displayGrowthData
      .filter(point => point.tinggi > 0 && point.tinggi < MAX_VALID_HEIGHT && point.berat > 0 && point.berat < MAX_VALID_WEIGHT)
      .map(point => ({
        tinggi: point.tinggi,
        berat: point.berat,
        tanggal: point.tanggal,
        usiaBulan: point.usiaBulan
      }));
    
    const latestData = scatterData[scatterData.length - 1];
    
    return (
      <div>
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Data Terbaru</p>
              <p className="text-2xl font-bold text-gray-800">
                {latestData?.tinggi?.toFixed(1) || '-'} cm / {latestData?.berat?.toFixed(1) || '-'} kg
              </p>
              {latestData && (
                <p className="text-xs text-gray-400 mt-1">
                  Usia: {Math.floor(latestData.usiaBulan / 12)} Tahun {latestData.usiaBulan % 12} Bulan
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
          <FontAwesomeIcon icon={fas.faInfoCircle} className="mr-2 text-blue-400" />
          Grafik Berat Badan vs Tinggi Badan - Membandingkan berat dengan tinggi aktual anak
        </div>
        
        <div style={{ height: "450px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis 
                dataKey="tinggi" 
                name="Tinggi Badan" 
                unit=" cm"
                label={{ value: 'Tinggi Badan (cm)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                type="number"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                dataKey="berat" 
                name="Berat Badan" 
                unit=" kg"
                label={{ value: 'Berat Badan (kg)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                type="number"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value, name) => {
                  if (name === 'Tinggi Badan') return [`${value} cm`, name];
                  if (name === 'Berat Badan') return [`${value} kg`, name];
                  return [value, name];
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Scatter 
                name="Data Anak" 
                data={scatterData} 
                fill="#3b82f6" 
                stroke="#ffffff"
                strokeWidth={2}
                shape="circle"
              />
              <Line
                type="monotone"
                data={scatterData}
                dataKey="berat"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Garis Pertumbuhan"
                dot={false}
                activeDot={false}
                legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render LK/U chart with safety checks
  const renderLKUChart = () => {
    const displayGrowthData = userRole === "orang_tua" ? growthData : superAdminGrowthData;
    const anak = userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
    
    if (!anak) {
      return (
        <div className="text-center py-12 text-gray-500">
          <FontAwesomeIcon icon={fas.faChartLine} className="text-4xl mb-3 opacity-30" />
          <p>Pilih anak terlebih dahulu</p>
        </div>
      );
    }
    
    const config = lkAgeRangeConfig[ageRange];
    if (!config) {
      return (
        <div className="text-center py-12 text-yellow-500">
          <FontAwesomeIcon icon={fas.faExclamationTriangle} className="text-4xl mb-3 opacity-50" />
          <p>Memuat ulang grafik...</p>
        </div>
      );
    }
    
    const jenisKelamin = anak.jenis_kelamin;
    
    const referenceAges = [];
    for (let age = config.min; age <= config.max + 0.01; age += config.step) {
      referenceAges.push(Math.round(age * 10) / 10);
    }
    if (referenceAges[referenceAges.length - 1] !== config.max) {
      referenceAges.push(config.max);
    }
    
    const referenceData = [];
    for (const usia of referenceAges) {
      const dataPoint = { usiaBulan: usia };
      const sdNeg2 = getReferenceValue(usia, jenisKelamin, 'lk_u', '-2sd');
      const sd0 = getReferenceValue(usia, jenisKelamin, 'lk_u', '0sd');
      const sd2 = getReferenceValue(usia, jenisKelamin, 'lk_u', '2sd');
      
      if (sdNeg2 !== null) dataPoint.sdNeg2 = sdNeg2;
      if (sd0 !== null) dataPoint.sd0 = sd0;
      if (sd2 !== null) dataPoint.sd2 = sd2;
      
      if (sdNeg2 && sd0) dataPoint.zoneNormal = sd0 - sdNeg2;
      if (sd0 && sd2) dataPoint.zoneAtas = sd2 - sd0;
      referenceData.push(dataPoint);
    }
    
    const childPoints = displayGrowthData
      .filter(point => point.lingkar_kepala !== null && point.lingkar_kepala > 0 && point.lingkar_kepala < MAX_VALID_LK)
      .map(point => ({
        usiaBulan: point.usiaBulan,
        nilai: point.lingkar_kepala,
        tanggal: point.tanggal
      }));
    
    const mergedData = referenceData.map(refPoint => {
      const exactMatch = childPoints.find(cp => cp.usiaBulan === refPoint.usiaBulan);
      if (exactMatch) {
        return { ...refPoint, nilai: exactMatch.nilai };
      }
      return { ...refPoint, nilai: null };
    });
    
    const latestChildPoint = childPoints.slice(-1)[0];
    
    let yDomain = [...config.yDomain];
    if (childPoints.length > 0) {
      const minValue = Math.min(...childPoints.map(p => p.nilai));
      const maxValue = Math.max(...childPoints.map(p => p.nilai));
      if (minValue < yDomain[0]) yDomain[0] = Math.max(0, minValue - 2);
      if (maxValue > yDomain[1]) yDomain[1] = maxValue + 2;
    }
    
    yDomain[1] = Math.min(yDomain[1], MAX_VALID_LK);
    
    return (
      <div>
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Lingkar Kepala Terakhir</p>
              <p className="text-3xl font-bold text-gray-800">
                {latestChildPoint?.nilai?.toFixed(1) || '-'} <span className="text-lg font-normal text-gray-500">cm</span>
              </p>
              {latestChildPoint && (
                <p className="text-xs text-gray-400 mt-1">
                  Usia: {Math.floor(latestChildPoint.usiaBulan / 12)} Tahun {latestChildPoint.usiaBulan % 12} Bulan
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ height: "450px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis 
                type="number"
                dataKey="usiaBulan"
                scale="linear"
                domain={[config.min, config.max]}
                allowDataOverflow={false}
                tick={{ fontSize: 11 }}
                label={{ value: 'Usia (bulan)', position: 'insideBottom', offset: -15, fontSize: 11 }}
              />
              <YAxis 
                domain={yDomain}
                label={{ value: 'Lingkar Kepala (cm)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                formatter={(value, name, props) => {
                  if (name === 'Data Anak') {
                    return [`${value?.toFixed(1)} cm`, props.payload?.tanggal || 'Data Anak'];
                  }
                  return [`${value?.toFixed(1)} cm`, name];
                }}
              />
              <Legend verticalAlign="top" height={36} />
              
              <Area
                type="monotone"
                dataKey="sdNeg2"
                stackId="1"
                stroke="none"
                fill="#fef3c7"
                fillOpacity={0.5}
                name="Zona Perhatian"
              />
              <Area
                type="monotone"
                dataKey="zoneNormal"
                stackId="1"
                stroke="none"
                fill="#d1fae5"
                fillOpacity={0.6}
                name="Zona Normal"
              />
              <Area
                type="monotone"
                dataKey="zoneAtas"
                stackId="1"
                stroke="none"
                fill="#fef3c7"
                fillOpacity={0.5}
                name="Zona Perhatian"
                legendType="none"
              />
              
              <Line
                type="natural"
                dataKey="sd0"
                stroke="#166534"
                strokeWidth={2.5}
                name="Median"
                dot={false}
              />
              
              <Line
                type="monotone"
                dataKey="nilai"
                stroke="#3b82f6"
                strokeWidth={4}
                name="Garis Pertumbuhan"
                dot={false}
                activeDot={false}
                legendType="none"
                connectNulls
              />
              
              <Scatter
                data={childPoints}
                dataKey="nilai"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth={2}
                name="Data Anak"
                shape="circle"
                line={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderActiveChart = () => {
    if (activeMainMenu === 'berat') {
      switch (activeSubMenu) {
        case 'bb_u': return renderBBUChart();
        case 'bb_tb': return renderBBTBChart();
        case 'imt_u': return renderIMTUChart();
        default: return renderBBUChart();
      }
    } else if (activeMainMenu === 'tinggi') {
      return renderTBUChart();
    } else {
      return renderLKUChart();
    }
  };

  const calculateAgeDetail = (birthDate) => {
    if (!birthDate) return { years: 0, months: 0, days: 0 };
    const today = new Date();
    const birth = new Date(birthDate);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months, days };
  };

  const formatAge = (age) => {
    if (!age) return "-";
    const parts = [];
    if (age.years > 0) parts.push(`${age.years} Tahun`);
    if (age.months > 0) parts.push(`${age.months} Bulan`);
    if (age.days > 0) parts.push(`${age.days} Hari`);
    return parts.length === 0 ? "< 1 Hari" : parts.join(" ");
  };

  const getAvailableAgeRanges = () => {
    if (activeMainMenu === 'lingkar_kepala') {
      return ['0-2', '0-12', '0-60'];
    } else if (activeSubMenu === 'bb_tb') {
      return [];
    } else {
      return ['0-2', '0-12', '0-60', '60-216'];
    }
  };

  const getCurrentConfig = () => {
    if (activeMainMenu === 'lingkar_kepala') {
      return lkAgeRangeConfig[ageRange];
    }
    return ageRangeConfig[ageRange];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sigizi-green mx-auto"></div>
        </div>
      </div>
    );
  }

  const displayAnakData = userRole === "orang_tua" ? selectedAnakData : superAdminSelectedAnak;
  const displayAnakList = userRole === "orang_tua" ? anakList : superAdminAnakList;
  const displaySelectedAnakId = userRole === "orang_tua" ? selectedAnakId : superAdminSelectedAnak?.id;
  const ageDetail = displayAnakData ? calculateAgeDetail(displayAnakData.tanggal_lahir) : null;
  const formattedAge = ageDetail ? formatAge(ageDetail) : "-";
  const availableRanges = getAvailableAgeRanges();
  const showAgeDropdownMenu = availableRanges.length > 0 && activeSubMenu !== 'bb_tb';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={fas.faChartLine} className="text-2xl text-sigizi-green" />
            <h1 className="text-xl font-bold text-gray-800">Pemantauan Tumbuh Kembang</h1>
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
          {/* Super Admin Mode */}
          {userRole === "super_admin" && orangTuaList.length > 0 && (
            <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <FontAwesomeIcon icon={fas.faUsers} className="text-blue-600" />
                <h3 className="font-semibold text-blue-800">Mode Super Admin</h3>
              </div>
              <select
                value={selectedOrangTuaId || ""}
                onChange={(e) => handleOrangTuaChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {orangTuaList.map(ot => (
                  <option key={ot.id} value={ot.id}>
                    {ot.nama_lengkap} - {ot.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Child Selection */}
          {displayAnakList.length > 0 ? (
            <div className="mb-6">
              <div className="relative w-full md:w-80">
                <button
                  onClick={() => {
                    if (userRole === "orang_tua") {
                      setShowAnakDropdown(!showAnakDropdown);
                    } else {
                      setSuperAdminShowAnakDropdown(!superAdminShowAnakDropdown);
                    }
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sigizi-green to-sigizi-light-green flex items-center justify-center text-white font-bold">
                      {displayAnakData?.nama_anak?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{displayAnakData?.nama_anak || "Pilih Anak"}</p>
                      <p className="text-xs text-gray-500">
                        {formattedAge} • {displayAnakData?.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </p>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={fas.faChevronDown} className="text-gray-400" />
                </button>
                
                {(userRole === "orang_tua" && showAnakDropdown) && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAnakDropdown(false)}></div>
                    <div className="absolute left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                      {displayAnakList.map(anak => (
                        <button
                          key={anak.id}
                          onClick={() => handleAnakChange(anak.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                            {anak.nama_anak?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-800">{anak.nama_anak}</p>
                            <p className="text-xs text-gray-400">
                              Lahir: {anak.tanggal_lahir}
                            </p>
                          </div>
                          {displaySelectedAnakId === anak.id && (
                            <FontAwesomeIcon icon={fas.faCheckCircle} className="text-sigizi-green" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-gray-600">Belum ada data anak. Silakan tambahkan data anak terlebih dahulu.</p>
            </div>
          )}

          {/* Main Navigation Tabs */}
          {displayAnakData && (
            <div className="mb-6">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => {
                    setActiveMainMenu("berat");
                    setActiveSubMenu("bb_u");
                  }}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    activeMainMenu === "berat"
                      ? "bg-white text-sigizi-green shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon icon={fas.faWeightScale} />
                  Berat
                </button>
                <button
                  onClick={() => setActiveMainMenu("tinggi")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    activeMainMenu === "tinggi"
                      ? "bg-white text-sigizi-green shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}>
                  <FontAwesomeIcon icon={fas.faRuler} />
                  Tinggi
                </button>
                <button
                  onClick={() => setActiveMainMenu("lingkar_kepala")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    activeMainMenu === "lingkar_kepala"
                      ? "bg-white text-sigizi-green shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon icon={fas.faBrain} />
                  Lingkar Kepala
                </button>
              </div>
            </div>
          )}

          {/* Sub Menu untuk Berat */}
          {displayAnakData && activeMainMenu === "berat" && (
            <div className="mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSubMenu("bb_u")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition border ${
                    activeSubMenu === "bb_u"
                      ? "border-sigizi-green bg-green-50 text-sigizi-green"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  BB/U
                </button>
                <button
                  onClick={() => setActiveSubMenu("bb_tb")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition border ${
                    activeSubMenu === "bb_tb"
                      ? "border-sigizi-green bg-green-50 text-sigizi-green"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  BB/TB
                </button>
                <button
                  onClick={() => setActiveSubMenu("imt_u")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition border ${
                    activeSubMenu === "imt_u"
                      ? "border-sigizi-green bg-green-50 text-sigizi-green"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  IMT/U
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                {activeSubMenu === "bb_u" && "Berat Badan Sesuai Usia"}
                {activeSubMenu === "bb_tb" && "Berat Badan vs Tinggi Badan"}
                {activeSubMenu === "imt_u" && "Indeks Massa Tubuh Sesuai Usia"}
              </p>
            </div>
          )}

          {/* Dropdown Rentang Umur */}
          {displayAnakData && showAgeDropdownMenu && (
            <div className="mb-6">
              <div className="relative">
                <button
                  onClick={() => setShowAgeDropdown(!showAgeDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={fas.faCalendarAlt} className="text-sigizi-green" />
                    <span className="font-medium text-gray-700">
                      {getCurrentConfig()?.label || "Pilih Rentang Usia"}
                    </span>
                  </div>
                  <FontAwesomeIcon icon={fas.faChevronDown} className={`text-gray-400 transition-transform ${showAgeDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showAgeDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAgeDropdown(false)}></div>
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                      {availableRanges.map(range => {
                        const config = activeMainMenu === 'lingkar_kepala' ? lkAgeRangeConfig[range] : ageRangeConfig[range];
                        if (!config) return null;
                        return (
                          <button
                            key={range}
                            onClick={() => {
                              setAgeRange(range);
                              setShowAgeDropdown(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${
                              ageRange === range ? 'bg-green-50' : ''
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <FontAwesomeIcon icon={fas[config.icon] || fas.faChild} className="text-sigizi-green text-sm" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className={`font-medium ${ageRange === range ? 'text-sigizi-green' : 'text-gray-700'}`}>
                                {config.label}
                              </p>
                              <p className="text-xs text-gray-400">
                                {range === '60-216' ? 'Kurva CDC (Persentil)' : 'Kurva WHO (Z-Score)'}
                              </p>
                            </div>
                            {ageRange === range && (
                              <FontAwesomeIcon icon={fas.faCheckCircle} className="text-sigizi-green" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chart Container */}
          {displayAnakData && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              {renderActiveChart()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}