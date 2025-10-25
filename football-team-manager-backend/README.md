# ⚙️ Backend - Fantasy Football Manager

This is the **backend** for the Fantasy Football Manager app.  
Built with **Node.js**, **Express.js**, and **MySQL** 🛠️⚽

---

## 🚀 Setup Instructions

1. **Install dependencies**
   ```bash
   npm install

2. **Create a `.env` file** in the backend root directory and add your environment variables:

   ```env
   DB_HOST=127.0.0.1
   DB_USER=user
   DB_PASS=root
   DB_NAME=football_team_manager
   PORT=8080
   JWT_SECRET=testkey

3. **Start the server**
   ```bash
   node server.js

## 🔗 API Endpoints

- `POST /api/login` → Login or signup user  
- `GET /api/` → Get current user and team  
- `GET /api/market` → Get all listed players  
- `POST /api/buy/:playerId` → Buy a player  
- `GET /api/my-listing` → Get your listed players  
- `POST /api/add-listing/:playerId` → Add a player to market  
- `DELETE /api/remove-listing/:playerId` → Remove a player from market  

## 🧰 Tech Stack

- **Node.js** — Server runtime  
- **Express.js** — Web framework  
- **MySQL** — Database for player and team data  

## 💡 Notes

- Make sure MySQL is running before starting the server.  
- The frontend connects to this backend API for authentication, team management, and transfer market actions.

---

Backend ready! ⚽🔥
