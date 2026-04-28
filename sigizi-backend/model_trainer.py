import sys
import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix
import warnings

warnings.filterwarnings('ignore')
try:
    file_path = sys.argv[1]
    algorithm = sys.argv[2]
    df = pd.read_csv(file_path)
    cols_to_drop = ['Kabupaten/Kota', 'Kategori', 'Klaster', 'Pred_Random Forest', 'Pred_SVM', 'Pred_KNN']
    X = df.drop(columns=[c for c in cols_to_drop if c in df.columns])
    y = df['Klaster'] if 'Klaster' in df.columns else df.iloc[:, -1]
    result = {}
    if algorithm in ['random_forest', 'svm']:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        if algorithm == 'random_forest':
            model = RandomForestClassifier(random_state=42)
        else:
            model = SVC(random_state=42)
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
        rec = recall_score(y_test, y_pred, average='macro', zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()
        result = {
            "status": "success",
            "accuracy": f"{acc*100:.1f}%",
            "precision": f"{prec*100:.1f}%",
            "recall": f"{rec*100:.1f}%",
            "confusionMatrix": cm
        }
    elif algorithm == 'kmeans':
        model = KMeans(n_clusters=3, random_state=42)
        model.fit(X)
        result = {
            "status": "success",
            "accuracy": "N/A (Clustering)",
            "precision": "-",
            "recall": "-",
            "confusionMatrix": [[0,0,0],[0,0,0],[0,0,0]], 
            "message": "Model K-Means berhasil mengelompokkan wilayah menjadi 3 Klaster."
        }
    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"status": "error", "message": str(e)}))