import sys
import json
import pandas as pd
import joblib # MENGGUNAKAN JOBLIB, BUKAN PICKLE

def main():
    try:
        # 1. Baca data JSON dari PHP
        input_data = sys.stdin.read()
        if not input_data:
            raise ValueError("Tidak ada data yang diterima oleh Python.")
            
        data = json.loads(input_data)
        
        # 2. Buka file menggunakan JOBLIB (Agar cocok dengan model_trainer.py Anda)
        model = joblib.load('model_prediksi_stunting.pkl')
        daftar_fitur = joblib.load('daftar_fitur_input.pkl')
            
        results = []
        
        # 3. Proses setiap data kabupaten
        for item in data:
            row_dict = {
                'Persentase_BBLR': item['Persentase_BBLR'],
                'Persentase_Gizi_Buruk': item['Persentase_Gizi_Buruk'],
                'Sanitasi_dan_Kebersihan_Lingkungan_mean': item['Sanitasi_dan_Kebersihan_Lingkungan_mean'],
                'Ketersediaan_Air_Bersih_mean': item['Ketersediaan_Air_Bersih_mean'],
                'Pendidikan_Ibu_SMP/MTs_mean': item['Pendidikan_Ibu_SMP/MTs_mean'],
                'Penghasilan_keluarga_mean': item['Penghasilan_keluarga_mean']
            }
            
            df = pd.DataFrame([row_dict])
            df = df[daftar_fitur] # Sabuk pengaman urutan kolom
            
            # 4. Lakukan Prediksi (Outputnya adalah ANGKA, misal: 25.4)
            prediksi_angka = model.predict(df)[0]
            
            # 5. Terjemahkan Angka menjadi Kategori Kerentanan (Standar SSGI/WHO)
            if prediksi_angka < 10:
                kategori = "Rendah"
            elif 10 <= prediksi_angka < 20:
                kategori = "Sedang"
            elif 20 <= prediksi_angka < 30:
                kategori = "Tinggi"
            else:
                kategori = "Sangat Tinggi"
            
            # Simpan hasil kategori berupa teks ke variabel yang dibaca PHP
            item['kategori_risiko'] = kategori
            results.append(item)
            
        # 6. Kembalikan data matang + hasil prediksi ke PHP
        output = {"status": "success", "data": results}
        print(json.dumps(output))
        
    except Exception as e:
        error_output = {"status": "error", "message": str(e)}
        print(json.dumps(error_output))

if __name__ == "__main__":
    main()