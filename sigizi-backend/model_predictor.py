import sys
import json
import joblib
import pandas as pd
import os

try:
    input_json = sys.argv[1]
    data_list = json.loads(input_json)
    
    model_path = os.path.join(os.path.dirname(__file__), 'model_prediksi_stunting.pkl')
    model = joblib.load(model_path)
    
    fitur_path = os.path.join(os.path.dirname(__file__), 'daftar_fitur_input.pkl')
    features = joblib.load(fitur_path)
    
    hasil_prediksi = []
    for data in data_list:
        df = pd.DataFrame([data])
        for f in features:
            if f not in df.columns:
                df[f] = 0
        df = df[features]
        
        prediction = int(model.predict(df)[0])
        hasil_prediksi.append({
            "id_wilayah": data.get("id_wilayah", "unknown"),
            "prediction": prediction
        })
        
    print(json.dumps({"status": "success", "predictions": hasil_prediksi}))

except Exception as e:
    print(json.dumps({"status": "error", "message": str(e)}))