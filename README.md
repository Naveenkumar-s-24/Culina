# 🍳 Culina - AI-Powered Recipe Discovery Platform

A modern, interactive recipe discovery platform with AI-powered features, built with React and FastAPI.

## ✨ Features

- 🌍 **Interactive World Map** - Explore recipes by cuisine from around the globe
- 🤖 **AI ChatBot** - Get personalized recipe recommendations
- 🎲 **Recipe Roulette** - Discover random recipes
- 🔬 **Molecular Oracle** - Analyze ingredient compatibility
- 🧪 **Fusion Lab** - Combine recipes to create unique dishes
- 📊 **Flavor Radar** - Visualize recipe characteristics
- ⏱️ **Cook Time Dial** - Filter recipes by preparation time
- 🎯 **Chef Quest** - Gamified cooking challenges

## 🚀 Tech Stack

### Frontend
- React 19
- React Simple Maps
- D3.js
- CSS3 with custom animations

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Python 3.12

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

### Backend Setup

```bash
cd recipes_backend

# Install dependencies
pip install -r requirements.txt

# Load initial data
python load_data.py

# Start the server
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on `http://localhost:3000`

## 🎮 Usage

1. Start the backend server first
2. Start the frontend development server
3. Open `http://localhost:3000` in your browser
4. Explore recipes, chat with the AI bot, and discover new cuisines!

## 📁 Project Structure

```
Culina/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API integration
│   │   └── assets/          # Images and static files
│   └── package.json
│
├── recipes_backend/         # FastAPI backend
│   ├── main.py             # Main API routes
│   ├── models.py           # Database models
│   ├── database.py         # Database configuration
│   ├── chat_engine.py      # AI chat logic
│   └── requirements.txt
│
└── README.md
```

## 🔧 API Endpoints

- `GET /api/recipes` - Get paginated recipes
- `GET /api/recipes/search` - Search recipes with filters
- `POST /api/chat` - Chat with AI bot
- `POST /api/ai/fuse` - Fuse two recipes
- `GET /api/ai/oracle` - Get ingredient compatibility
- `GET /api/ai/freshness/{recipe_id}` - Get freshness report
- `GET /api/ai/chronology/{recipe_id}` - Get flavor evolution

## 🎨 Features in Detail

### Interactive World Map
Click on countries to explore regional cuisines and discover authentic recipes from around the world.

### AI ChatBot
Ask questions about recipes, get cooking tips, and receive personalized recommendations based on your preferences.

### Recipe Fusion Lab
Combine two different recipes to create innovative fusion dishes with AI-generated suggestions.

### Molecular Oracle
Understand the chemical compatibility of ingredients and why certain flavors work well together.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Naveenkumar S

## 🙏 Acknowledgments

- Recipe data sourced from various culinary databases
- Built with modern web technologies
- Inspired by the love of cooking and technology
