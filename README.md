# 🌎 Eco Impact Estimator Project

This project predicts and analyzes the environmental impact of products using machine learning models, real-time scraping, and interactive tools like a Chrome extension and web frontend.

---
## 📁 Project Structure

| Folder | Purpose |
|:------|:--------|
| `ml_model/` | Training and storing machine learning models (XGBoost) |
| `Website/` | Vite + React website frontend (Home, Learn, Predict pages) |
| `Extension/` | Chrome Extension for Amazon eco insights |
| `ReactPopup/` | Lightweight popup extension (shipping carbon estimator) |
| `static/` | Assets and other static resources |
| `emissions-proxy/` | (optional) Proxy layer for emissions data (if applicable) |
| `selenium_profile/` | Customized Selenium profile for scraping |

---

## 🚀 Installation

### Backend (Flask API + Machine Learning)

1. Clone this repo
2. Create a virtual environment (recommended)
```bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
3. Install backend dependencies
pip install -r requirements.txt
4. Start the Flask server
python app.py

Frontend (React Website)

1.Navigate to Website/
cd Website
npm install
2.To run in development mode
npm run dev
3.To build for production
npm run build
4.Production files will be located in /Website/dist/

Chrome Extension (Eco Tooltip & Popup)
1a.Navigate to Extension/ ➔ Load unpacked extension in Chrome (Developer Mode ON)

1b.Navigate to ReactPopup/dist/ ➔ Load the popup extension similarly (optional extra popup UI)



⚙️ Important Environment Variables
(Optional, if using a .env file)

FLASK_ENV=development
PORT=5000
SECRET_KEY=your_secret_key_here

📦 Machine Learning Models
1.Trained XGBoost models are saved inside ml_model/
2.Encoders and datasets are included (eco_dataset.csv, etc.)
3.You can retrain using train_model.py or train_xgboost.py