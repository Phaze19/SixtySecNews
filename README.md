# ⚡ 60sec News

> Your daily tech brief — AI-summarized news in 60 seconds.

A full-stack mobile app that fetches trending tech news, summarizes each article using AI, and delivers it in a clean, minimal feed. Built in 2 days as a self-initiated project.

---

## Features

- AI-generated 3-line summaries for every article
- "Why it matters" explanation for each story
- Text-to-speech audio briefing — listen while you get ready
- Save articles and read them later, offline
- Category tabs — AI, Tech, Startups
- Auto-refreshes every 3 hours automatically
- NYT-inspired UI with Playfair Display typography

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native (Expo) |
| Database | Firebase Firestore |
| Backend | Firebase Cloud Functions |
| AI Summarization | Groq API (LLaMA 3.3) |
| News Source | News API |
| Scheduler | cron-job.org |
| Font | Playfair Display (Google Fonts) |

---

## Architecture

Every 3 hours, a Cloud Function fetches the latest articles, sends them to Groq AI for summarization, and stores the enriched results in Firestore. The app reads from Firestore in real time.

---

## Getting Started

### Prerequisites
- Node.js v18+
- Expo CLI
- Firebase account
- Groq API key (free)
- News API key (free)

### Installation

1. Clone the repo
```bash
git clone https://github.com/Phaze19/SixtySecNews.git
cd SixtySecNews
```

2. Install dependencies
```bash
npm install
```

3. Create a `firebaseConfig.js` file in the root:
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

4. Set your API keys in `functions/index.js`

5. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

6. Start the app
```bash
npx expo start
```

---

## Screenshots

*Coming soon*

---

## Download

- Android APK — available on request
- iOS — coming soon

---

## Author

**Anurag Vedak**
2nd Year Computer Engineering Student
K.J. Somaiya School of Engineering, Mumbai

- LinkedIn: [linkedin.com/in/anuragvedak](https://linkedin.com/in/anuragvedak)
- GitHub: [github.com/Phaze19](https://github.com/Phaze19)

---

## License

MIT License — feel free to use this project as inspiration for your own builds.