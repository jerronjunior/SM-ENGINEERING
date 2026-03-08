# SM Engineering & Construction – Website

Modern responsive company website for **SM Engineering & Construction** (House Planning, Design, Cost Estimation, Structural & Approval Drawings). Built with React (Vite), Node.js/Express, and Firebase.

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Framer Motion, React Icons, React Helmet Async
- **Backend:** Node.js, Express
- **Database:** Firebase (Firestore)
- **Chat:** AI Chatbot (OpenAI API optional)
- **Deployment:** Ready for Vercel/Netlify (frontend) + Node host (backend)

## Project Structure

```
├── client/                 # React (Vite) frontend
│   ├── public/
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # Layout, Navbar, Footer, WhatsApp, Chatbot, etc.
│   │   ├── config/        # Constants (company info)
│   │   ├── pages/         # Home, About, Services, Projects, Blog, Contact
│   │   │   ├── admin/    # Admin login & dashboard
│   │   │   └── legal/    # Privacy, Terms, Cookie policy
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                 # Express backend
│   ├── config/
│   │   └── firebase.js    # Firebase Admin init
│   ├── routes/
│   │   ├── contact.js     # Contact form → Firestore
│   │   ├── projects.js    # Projects CRUD + image upload
│   │   ├── blog.js        # Blog CRUD + image upload
│   │   ├── admin.js       # Login, contacts list, mark read
│   │   ├── chat.js        # AI chatbot (OpenAI)
│   │   └── content.js     # Website content (optional)
│   ├── uploads/           # Project & blog images (created at runtime)
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── package.json            # Root scripts (concurrently)
└── README.md
```

## Firebase (Firestore) Setup

- Create Firestore and run the app once; indexes can be created automatically when you first query, or add a composite index on `projects` for `createdAt` (desc) and on `blog` for `createdAt` (desc) if prompted by the Firebase console.

## Firestore Collections

- **contacts** – Contact form submissions: `name`, `email`, `phone`, `subject`, `message`, `read`, `createdAt`
- **projects** – Projects: `title`, `description`, `type`, `status`, `beforeAfter`, `images[]`, `createdAt`
- **blog** – Blog posts: `title`, `excerpt`, `content`, `slug`, `image`, `createdAt`
- **websiteContent** (optional) – Key-value content for admin-editable text

## API Routes

| Method | Route | Description |
|--------|--------|-------------|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/projects` | List projects (public) |
| GET | `/api/projects/:id` | Get one project |
| POST | `/api/projects` | Create project (admin, multipart images) |
| PUT | `/api/projects/:id` | Update project (admin) |
| DELETE | `/api/projects/:id` | Delete project (admin) |
| GET | `/api/blog` | List blog posts |
| GET | `/api/blog/slug/:slug` | Get post by slug |
| POST | `/api/blog` | Create post (admin, multipart image) |
| PUT | `/api/blog/:id` | Update post (admin) |
| DELETE | `/api/blog/:id` | Delete post (admin) |
| POST | `/api/admin/login` | Admin login (email/password) |
| GET | `/api/admin/contacts` | List contact messages (admin) |
| PATCH | `/api/admin/contacts/:id/read` | Mark message read (admin) |
| POST | `/api/chat` | AI chat message (optional OpenAI) |
| GET/PUT | `/api/content/:key` | Get/update website content (admin for PUT) |

## How to Run

### 1. Install dependencies

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore Database**.
3. Go to **Project settings → Service accounts** and **Generate new private key**. You will get a JSON file.
4. In the project root, create `server/.env` (copy from `server/.env.example`). Set:
   - `FIREBASE_PROJECT_ID` – from the JSON
   - `FIREBASE_CLIENT_EMAIL` – from the JSON
   - `FIREBASE_PRIVATE_KEY` – the full private key string from the JSON (keep the `\n` for newlines or paste the key with real newlines inside quotes)
5. Set admin credentials:
   - `ADMIN_EMAIL` – e.g. `admin@smengconstruction.com`
   - `ADMIN_PASSWORD` – secure password for dashboard login
6. (Optional) For AI chatbot: set `OPENAI_API_KEY` in `server/.env`.

### 3. Run development

From the project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000  

The Vite dev server proxies `/api` to the backend.

### 4. Build for production

```bash
npm run build
```

This builds the client into `client/dist`. To run the backend and serve the built client:

```bash
cd server
# Set NODE_ENV=production and ensure .env is set
npm start
```

In production, set `CLIENT_URL` in `server/.env` to your frontend URL (e.g. `https://yourdomain.com`) for CORS.

### 5. Environment variables

**Server (`server/.env`):**

- `PORT` – default 5000  
- `CLIENT_URL` – frontend origin for CORS  
- `NODE_ENV` – development / production  
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` – Firebase Admin  
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` – admin login  
- `OPENAI_API_KEY` – optional, for chatbot  

**Client:**  
- `VITE_API_URL` – optional; default is `/api` (relative, works with proxy or same host).

## Features

- **Home:** Hero, intro, services highlight, why choose us, counters, CTA, WhatsApp button  
- **About:** Company intro, mission/vision, engineer qualification, background  
- **Services:** House planning & design, cost estimation, structural/approval drawings, material details  
- **Projects:** Gallery with filters (all/completed/upcoming/residential/commercial), before-after and upcoming sections  
- **Blog:** List and single post by slug  
- **Contact:** Form (saved to Firestore), map placeholder, phone/email/WhatsApp  
- **Legal:** Privacy Policy, Terms & Conditions, Cookie Policy  
- **WhatsApp** floating button  
- **AI Chatbot** (if `OPENAI_API_KEY` is set)  
- **Admin dashboard:** Login, view contact messages, add/edit/delete projects and blog posts, upload images  

## Deployment

- **Frontend:** Build with `npm run build` and deploy `client/dist` to Vercel, Netlify, or any static host. Set `VITE_API_URL` to your backend URL (e.g. `https://api.yourdomain.com`).
- **Backend:** Deploy the `server` folder to a Node host (Railway, Render, Fly.io, etc.). Set all `server/.env` variables and ensure `uploads` is writable (or use cloud storage for images).
- **Firebase:** Use the same project and service account keys in production; restrict Firestore rules and keep `.env` secrets out of the repo.

## Default admin

After copying `.env.example` to `.env`, the first login uses the email and password you set in `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Change these in production.

---

**SM Engineering & Construction**  
No.89, Badulla, Gamewela Passara, Passara, 90500  
+94 774 222 353 | smengconstruction@gmail.com
