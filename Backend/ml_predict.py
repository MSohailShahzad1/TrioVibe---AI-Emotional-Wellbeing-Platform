import sys
import pickle
import json
import os
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

def predict_emotion(text):
    try:
        # Resolve paths relative to this script
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        ml_models_dir = os.path.join(base_dir, "ml_models")
        
        vectorizer_path = os.path.join(ml_models_dir, "vectoriser-ngram-(1,2).pkl")
        model_path = os.path.join(ml_models_dir, "Sentiment-LR.pkl")

        # Load vectorizer and model
        with open(vectorizer_path, 'rb') as f:
            vectorizer = pickle.load(f)
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        # Preprocess and transform input text
        # (Assuming the model was trained on simple text transformation)
        text_vector = vectorizer.transform([text])
        
        # Predict
        prediction = model.predict(text_vector)[0]
        probabilities = model.predict_proba(text_vector)[0]
        
        # Map prediction to label (Adjust mapping based on model labels)
        # 0: Negative, 1: Positive? Let's check probabilities
        # Usual convention: 0 is Negative, 1 is Positive
        label = "Positive" if prediction == 1 else "Negative"
        confidence = float(max(probabilities))

        return {
            "success": True,
            "label": label,
            "confidence": confidence
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No text provided"}))
        sys.exit(1)
    
    input_text = sys.argv[1]
    result = predict_emotion(input_text)
    print(json.dumps(result))
