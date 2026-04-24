<?php
require_once 'config.php';

try {
            $query = "
        SELECT 
            w.id, w.nama_kabupaten, aw.p_bblr, aw.p_gizi_buruk, aw.p_sanitasi, aw.p_air, aw.p_ibu, aw.penghasilan,
            (SELECT COUNT(id) FROM anak WHERE wilayah_id = w.id) as total_anak
        FROM wilayah w
        JOIN agregat_wilayah aw ON w.nama_kabupaten = aw.kabupaten_kota
        HAVING total_anak > 0
    ";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $data_wilayah = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($data_wilayah)) {
                        echo json_encode(["status" => "success", "data" => []]);
                        exit;
            }

            $batch_input = [];
            $wilayah_map = [];
            foreach ($data_wilayah as $row) {
                        $id_wilayah = "W_" . $row['id'];
                        $input_data = [
                                    "id_wilayah" => $id_wilayah,
                                    "p_bblr" => floatval($row['p_bblr']),
                                    "p_gizi_buruk" => floatval($row['p_gizi_buruk']),
                                    "p_sanitasi" => floatval($row['p_sanitasi']),
                                    "p_air" => floatval($row['p_air']),
                                    "p_ibu" => floatval($row['p_ibu']),
                                    "penghasilan" => floatval($row['penghasilan'])
                        ];

                        $batch_input[] = $input_data;
                        $wilayah_map[$id_wilayah] = [
                                    "nama" => str_replace(['Kabupaten ', 'Kota '], '', $row['nama_kabupaten']),
                                    "data_mentah" => $input_data
                        ];
            }
            $json_input = escapeshellarg(json_encode($batch_input));
            $command = "python model_predictor.py " . $json_input;
            $output = shell_exec($command);

            $pred_result = json_decode($output, true);
            $hasil_akhir = [];
            if (isset($pred_result['status']) && $pred_result['status'] === 'success') {
                        foreach ($pred_result['predictions'] as $hasil) {
                                    $klaster = $hasil['prediction'];
                                    $id = $hasil['id_wilayah'];
                                    if ($klaster > 0) {
                                                $status_text = $klaster == 2 ? "KRISIS" : "WASPADA";
                                                $pesan = $klaster == 2
                                                            ? "Sistem AI memprediksi kerentanan tinggi berdasarkan perpaduan sanitasi & air yang memburuk."
                                                            : "Berisiko tinggi jika intervensi gizi ibu tidak ditingkatkan.";

                                                $hasil_akhir[] = [
                                                            "wilayah" => $wilayah_map[$id]['nama'],
                                                            "klaster" => $klaster,
                                                            "status" => $status_text,
                                                            "pesan" => $pesan,
                                                            "data_mentah" => $wilayah_map[$id]['data_mentah']
                                                ];
                                    }
                        }
            } else {
                        foreach ($batch_input as $item) {
                                    $klaster = 0;
                                    if ($item['p_sanitasi'] < 40 || $item['p_air'] < 40) $klaster = 2;
                                    elseif ($item['p_ibu'] < 60) $klaster = 1;

                                    if ($klaster > 0) {
                                                $hasil_akhir[] = [
                                                            "wilayah" => $wilayah_map[$item['id_wilayah']]['nama'],
                                                            "klaster" => $klaster,
                                                            "status" => $klaster == 2 ? "KRISIS" : "WASPADA",
                                                            "pesan" => "Peringatan otomatis berdasarkan ambang batas infrastruktur.",
                                                            "data_mentah" => $item
                                                ];
                                    }
                        }
            }
            usort($hasil_akhir, function ($a, $b) {
                        return $b['klaster'] <=> $a['klaster'];
            });

            echo json_encode(["status" => "success", "data" => $hasil_akhir]);
} catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
