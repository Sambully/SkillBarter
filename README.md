# SkillBarter

SkillBarter is a full-stack MERN application that enables users to swap skills, chat in real-time, and share resources in a 3D immersive environment.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Three.js / React Three Fiber
- Firebase (Auth & Firestore)
- Socket.io-client

**Backend:**
- Node.js & Express
- MongoDB (Mongoose)
- Cloudinary (File Storage)
- Google Gemini AI (Generative Content)
- Socket.io (Real-time communication)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd SkillBarter
```

### 2. Backend Setup

1.  **Navigate to the Backend folder:**
    ```bash
    cd Backend
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    Create a file named `.env` in the `Backend` folder and add the following keys. **(See [API Setup Guide](#api-setup-guide) below for how to get these keys)**.

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    
    # Cloudinary (for image/file uploads)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # AI Features
    GEMINI_KEY=your_gemini_api_key
    
    # Security
    JWT_SECRET=some_super_secret_key_string
    ```

    > **Note:** The `JWT_SECRET` can be any random string you create (e.g., "mysecretkey123").

4.  **Start the Backend:**
    ```bash
    node index.js
    ```
    You should see: `Server running on port 5000`.

### 3. Frontend Setup

1.  **Open a new terminal and navigate to the frontend folder:**
    ```bash
    cd frontend
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    Create a file named `.env` in the `frontend` folder.

    ```env
    VITE_API_URL=http://localhost:5000
    
    # Firebase Configuration
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    ```

4.  **Start the Frontend:**
    ```bash
    npm run dev
    ```

### Only Use These Exact Variable Names
The application strictly looks for these variable names. Copy and paste these blocks directly into your `.env` files.

#### `Backend/.env`
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_KEY=your_gemini_api_key
JWT_SECRET=your_secure_random_string
```

#### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 🏃‍♂️ Usage

1.  **Register/Login:** Create an account to access the platform.
2.  **Explore:** Browse skills and users on the dashboard.
3.  **Chat:** Click on a user to start a conversation.
4.  **Barter:** Negotiate skill swaps in real-time.


