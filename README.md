# TrioVibe 🌈

TrioVibe is a comprehensive, AI-powered emotional wellbeing platform designed to bridge the gap between technology and mental health. It leverages multi-modal emotion analysis (Text, Voice, Image, and Video) to provide users with deep insights into their emotional state and connects them with professional support.

## ✨ Features

### 🧠 AI Emotion Analysis
- **Text Analysis**: Real-time analysis of thoughts and journals.
- **Voice Analysis**: Detection of emotional nuances through pitch and tone.
- **Visual Analysis**: Facial expression recognition via Image and Video processing.
- **Insight Hub**: A dashboard of emotional history and progress over time.

### 💖 Therapy & Support
- **Therapist Matching**: Connect with experts based on specialization and ratings.
- **Professional Booking**: Seamless appointment scheduling.
- **Therapy Pal**: Real-time interaction for immediate support.

### 💬 Communication
- **Real-time Chat**: Connect with peers and professionals.
- **Video Calling**: High-quality, real-time video sessions for effective therapy.
- **Privacy First**: Secure and confidential interactions.

### 🎨 User Experience
- **Premium Design**: Modern glassmorphism aesthetic with smooth animations.
- **Dynamic Theming**: Full support for both Light and Dark modes.
- **Responsive Layout**: Optimized for all screen sizes.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Real-time**: Socket.io (Chat & WebRTC).
- **AI/ML**: Python (DeepFace, NLTK, etc. integrated via child processes).
- **Communication**: WebRTC for video calling.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Python (for ML models)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/TrioVibe.git
   cd TrioVibe
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   # Create a .env file with VITE_API_URL=http://localhost:5000
   npm run dev
   ```

3. **Backend Setup**:
   ```bash
   cd ../Backend
   npm install
   # Create a .env file with your MONGODB_URI, JWT_SECRET, etc.
   npm start
   ```

4. **ML Models Setup** (Optional for UI testing):
   - Ensure Python dependencies are installed as required by the `ml_predict.py` scripts.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contact
Your Name - [your-email@example.com](mailto:your-email@example.com)
Project Link: [https://github.com/your-username/TrioVibe](https://github.com/your-username/TrioVibe)
