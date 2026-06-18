# Music Recommendation System

Small demo music recommendation system with a FastAPI backend and a Vite + React frontend.

**Prerequisites:**
- Python 3.10+ (for backend)
- Node.js 16+ / npm or pnpm (for frontend)

**Repository layout:**
- `backend/` - FastAPI backend, data seeds, and scripts
- `frontend/` - Vite + React frontend
- `bridge_business_dataset.csv` - sample dataset

**Backend (run locally)**
1. Change into the backend folder:

   cd backend

2. Create a virtualenv and install dependencies:

   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt

3. Run the API (development):

   python -m uvicorn main:app --reload

Files of interest: [backend/main.py](backend/main.py), [backend/requirements.txt](backend/requirements.txt)

**Seeding / data**
- Use `seed.py` or `seed_many.py` in `backend/` to populate the database.
- Use `import_csv.py` to import `bridge_business_dataset.csv` if needed.

**Frontend (run locally)**
1. Change into the frontend folder:

   cd frontend

2. Install dependencies and start dev server:

   npm install
   npm run dev

File of interest: [frontend/package.json](frontend/package.json)

The frontend runs by default on port 5173 and the backend on port 8000.

**Dataset**
- See [bridge_business_dataset.csv](bridge_business_dataset.csv) at project root.

**Next steps**
- Run the backend and frontend concurrently, or use the provided `docker-compose.yml` for a containerized setup.

**License**
This repository contains demo code; add a license if you plan to publish.
