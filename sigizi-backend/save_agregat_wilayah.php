<?php
// 1. Panggil koneksi database (CORS dan setingan PDO sudah otomatis dimuat dari sini)
require_once 'config.php'; 

// 2. Tangkap JSON murni dari Frontend (React)
$inputJSON = file_get_contents('php://input');
$inputData = json_decode($inputJSON, true);

if (!$inputData) {
    echo json_encode(['status' => 'error', 'message' => 'Tidak ada data JSON yang diterima dari React']);
    exit;
}

// 3. Buka jalur eksekusi ke Python
$python_path = "python"; // Ubah menjadi "python3" jika server teman Anda menggunakan Linux/Mac
$script_path = "model_predictor.py";

$descriptorspec = array(
   0 => array("pipe", "r"),  // stdin
   1 => array("pipe", "w"),  // stdout
   2 => array("pipe", "w")   // stderr
);

$process = proc_open("$python_path $script_path", $descriptorspec, $pipes);

if (is_resource($process)) {
    // Suapkan JSON ke Python
    fwrite($pipes[0], $inputJSON);
    fclose($pipes[0]);

    // Tangkap jawaban Python
    $python_output = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    
    // Tangkap error log Python (jika ada)
    $python_error = stream_get_contents($pipes[2]);
    fclose($pipes[2]);

    proc_close($process);

    // 4. Terjemahkan jawaban Python
    $result = json_decode($python_output, true);

    if ($result && $result['status'] === 'success') {
        
        $success_count = 0;
        
        // 5. SIAPKAN QUERY PDO (PREPARED STATEMENT)
        // PDO sangat aman, kita cukup menggunakan "titik dua" (:nama_kolom) sebagai pengganti nilai
        $sql = "INSERT INTO agregat_wilayah 
                (kabupaten_kota, p_bblr, p_gizi_buruk, p_sanitasi, p_air, p_ibu, penghasilan, tingkat_kerentanan, tanggal_input) 
                VALUES 
                (:kabupaten_kota, :p_bblr, :p_gizi_buruk, :p_sanitasi, :p_air, :p_ibu, :penghasilan, :tingkat_kerentanan, NOW())
                ON DUPLICATE KEY UPDATE 
                p_bblr = VALUES(p_bblr),
                p_gizi_buruk = VALUES(p_gizi_buruk),
                p_sanitasi = VALUES(p_sanitasi),
                p_air = VALUES(p_air),
                p_ibu = VALUES(p_ibu),
                penghasilan = VALUES(penghasilan),
                tingkat_kerentanan = VALUES(tingkat_kerentanan),
                tanggal_input = NOW()";

        // Siapkan 'senjata' query-nya
        $stmt = $conn->prepare($sql);
        
        // 6. Masukkan semua data + HASIL PREDIKSI ke Database
        foreach ($result['data'] as $row) {
            try {
                // Tembakkan 'peluru' datanya satu per satu (PDO otomatis mengamankan dari hacker)
                $stmt->execute([
                    ':kabupaten_kota' => $row['kab_kota'],
                    ':p_bblr' => $row['Persentase_BBLR'],
                    ':p_gizi_buruk' => $row['Persentase_Gizi_Buruk'],
                    ':p_sanitasi' => $row['Sanitasi_dan_Kebersihan_Lingkungan_mean'],
                    ':p_air' => $row['Ketersediaan_Air_Bersih_mean'],
                    ':p_ibu' => $row['Pendidikan_Ibu_SMP/MTs_mean'],
                    ':penghasilan' => $row['Penghasilan_keluarga_mean'],
                    ':tingkat_kerentanan' => $row['kategori_risiko']
                ]);
                
                $success_count++;
            } catch (PDOException $e) {
                // Jika 1 baris gagal (misal salah nama kolom di DB), simpan log error tapi lanjut ke baris berikutnya
                error_log("Gagal insert wilayah " . $row['kab_kota'] . ": " . $e->getMessage());
            }
        }
        
        // 7. Balas ke React bahwa semua sukses
        echo json_encode([
            'status' => 'success', 
            'message' => "$success_count wilayah berhasil diprediksi dan disimpan ke Database."
        ]);

    } else {
        echo json_encode([
            'status' => 'error', 
            'message' => 'Gagal dari Machine Learning: ' . ($result['message'] ?? 'Unknown Error'),
            'python_log' => $python_error
        ]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Server gagal menjalankan script Machine Learning.']);
}
?>