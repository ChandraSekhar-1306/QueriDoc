# 📄 QueriDoc

QueriDoc is a full-stack AI-powered PDF Q&A assistant. Users can upload PDFs, ask questions about the content, and get intelligent answers using advanced LLMs—all secured with Firebase authentication and cloud storage via Supabase.

---

## Features

- User authentication with Firebase
- Upload and store PDFs using Supabase Storage.
- Only those pdf's uploaded by that user is shown when they log in to their account.
- Ask questions about uploaded files (chat-style Q&A)
- Uses Together AI's Mixtral model + embedding for semantic search. Used llama-index LLM

---

# 📁 Project Structure – QueriDoc

```bash
QueriDoc/
├── backend/
│   ├── main.py                      # FastAPI backend
│   ├── .env                         # Environment variables
│   └── firebase_credentials.json    # ⚠️ Do NOT push this
├── frontend/
│   ├── src/
│   │   ├── components/              # UI components
│   │   ├── App.jsx                  # React app entry
│   │   └── firebase.js              # Firebase config (secure this)
│   ├── public/
│   └── vite.config.js
├── README.md

```

---

## ⚙️ Backend Setup (FastAPI)

### 1. Install dependencies

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # This Works only in Windows Power shell
pip install -r requirements.txt
```

### 2. Create `.env` in `/backend`

Create a `.env` file in the `/backend` directory with the following content:

```ini
TOGETHER_API_KEY=your_together_api_key
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_BUCKET=pdfs
DATABASE_URL=postgresql://username:password@host:port/dbname
```

### 3. Run Backend

Start the backend server using the following command:

```bash
uvicorn main:app --reload
```

## 🖥️ Frontend Setup (React + Vite)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure `firebase.js`

Edit the Firebase configuration in `src/firebase.js`:

```bash
// src/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
};

export const app = initializeApp(firebaseConfig);
```

### 3. Run frontend

```bash
npm run dev
```

## 📡 API Endpoints

| Method | Endpoint       | Description                          |
| ------ | -------------- | ------------------------------------ |
| POST   | `/upload`      | Upload a PDF and extract its text    |
| POST   | `/ask`         | Ask a question based on the PDF      |
| GET    | `/my-files`    | List uploaded files by the user      |
| GET    | `/qna-history` | Fetch Q&A history for a specific PDF |

## 🧠 Architecture Overview

| Layer    | Technology                     | Purpose                                                   |
| -------- | ------------------------------ | --------------------------------------------------------- |
| Frontend | React + Vite                   | UI, auth (Firebase), file upload, chat                    |
| Backend  | FastAPI (Python)               | API for upload, Q&A, history, text extraction             |
| Storage  | Supabase (Bucket)              | Stores PDFs and extracted text                            |
| Database | PostgreSQL (via SQLAlchemy)    | Stores metadata and Q&A history                           |
| AI       | Together AI (Mixtral, M2-BERT) | PDF Q&A via LLM (llama-index) + embedding-based retrieval |
