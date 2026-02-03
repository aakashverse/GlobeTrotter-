# 🌍 GlobeTrotter - Travel Planner & Trip Management Platform

**GlobeTrotter** is a full-stack travel planning platform that helps users organize trips, manage itineraries, track expenses, chat with trip mates, and get AI-powered trip assistance.

---

## 🚀 Features

### User Authentication
- Register, login, logout
- JWT-based authentication & session restore
- Password hashing with bcrypt

### Trip Management
- Create, update, delete trips
- Invite & join trip mates
- Track trip status, budget, and destinations

### Trip Stops & Itinerary
- Add stops with activities
- Manage expenses per stop
- Save custom itinerary

### Chat & Collaboration
- Real-time chat using Socket.IO
- Only authorized trip members can chat

### AI Travel Assistant
- AI-powered assistant using OpenAI API
- Suggests trip activities, budget tips, and itinerary improvements

### Analytics (Admin)
- Total users & trips
- Active users today
- Popular cities & countries
- Trips timeline and average trip duration
- Expense analytics by category & date

---

## 🛠 Tech Stack

| Layer         | Technology |
|---------------|------------|
| Frontend      | React.js, Vite |
| Backend       | Node.js, Express.js |
| Database      | MySQL 8.0 |
| Real-time     | Socket.IO |
| AI            | OpenAI GPT-4.1-mini |
| Auth & Security | JWT, bcrypt, cookie-parser |
| Deployment    | Railway / Vercel |

---

## 📦 Installation

### Prerequisites
- Node.js v22+
- MySQL 8+
- OpenAI API Key

### Steps

```bash
git clone https://github.com/yourusername/globetrotter.git
cd globetrotter
npm start
