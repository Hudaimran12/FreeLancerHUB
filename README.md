# FreelanceHub – Full Stack Web Application

A full-stack freelance services platform inspired by Fiverr/Upwork, built with **Express.js** (backend) and **Vanilla JavaScript** (frontend).

---
## Author
Huda Imran

## 📸 Features

- 🏠 **Home Page** with hero search, category cards, and featured services
- 🔍 **Browse Services** with real-time search, category filter, and sort
- 🔖 **Save Services** – bookmark services for later
- 🚀 **Hire Services** – simulate hiring with a confirmation modal
- 📊 **Dashboard** – view stats, saved & hired services
- 🖱️ **Drag & Drop** – drag service cards into Save/Hire drop zones
- 📱 **Responsive** – works on mobile, tablet, and desktop
- ➕ **Add New Service** – bonus POST /api/services endpoint

---

## 🛠️ Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | HTML, CSS, JavaScript   |
| Backend  | Node.js + Express.js    |
| Data     | In-memory + JSON file   |

---

## 📡 API Endpoints

| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| GET    | /api/services       | Get all services (supports ?search=, ?category=, ?sort=) |
| GET    | /api/services/:id   | Get a single service    |
| POST   | /api/services       | Add a new service       |
| POST   | /api/save           | Save a service          |
| POST   | /api/hire           | Hire a service          |
| GET    | /api/saved          | Get all saved services  |
| GET    | /api/hired          | Get all hired services  |

---

## 🚀 How to Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

### 3. Open in browser
```
http://localhost:3000
```

---

## 📁 Project Structure

```
FreelanceHub/
├── client/
│   ├── index.html          # Single-page app (all pages)
│   ├── css/
│   │   └── style.css       # All styles with CSS variables
│   └── js/
│       └── app.js          # Frontend logic, API calls, DOM
│
├── server/
│   ├── server.js           # Express setup, middleware
│   ├── routes/
│   │   └── services.js     # All route definitions
│   ├── controllers/
│   │   └── servicesController.js   # Business logic
│   └── data/
│       └── services.json   # 12 sample services
│
├── package.json
└── README.md
```

---

## 👨‍💻 Author
Huda Imran
Built as a Lab 10 project demonstrating full-stack web development with Express.js and vanilla JavaScript.
