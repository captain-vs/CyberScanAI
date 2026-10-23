# SecurityX

> A beginner-friendly cybersecurity learning platform with interactive lessons, safe simulations, quizzes, and gamified challenges.

SecurityX, formerly CyberScan AI, helps newcomers understand core cybersecurity concepts through guided learning experiences—not by pretending to be a replacement for professional security tools.

## What SecurityX is

SecurityX is designed for students and beginners who want one place to:

- Learn cybersecurity foundations and common security concepts.
- Complete quizzes and safe interactive challenges.
- Explore how security reports, OSINT records, and threat-analysis interfaces are structured.
- Track learning progress, points, challenges, and badges.
- Practice ethical and defensive cybersecurity thinking.

## Important: educational use only

SecurityX includes simulated OSINT reports, file-name awareness checks, and AI-assisted analysis experiences.

These features are for learning and demonstration purposes only:

- They do not confirm that an email was involved in a breach.
- They do not perform live WHOIS, DNS, social-profile, or dark-web intelligence lookups.
- They do not replace malware scanners, threat-intelligence platforms, penetration tests, or professional security advice.
- Do not use any result from SecurityX to make real-world security decisions.

Always use only systems, accounts, and data you own or have explicit permission to assess.

## Features

### Learn Hub

- Beginner-focused cybersecurity articles and learning modules.
- Interactive lessons covering topics such as networking, authentication, encryption, phishing awareness, and web security.
- Cybersecurity news feed.
- Learning roadmap and progress tracking.

### Scanning Workspace

- URL, IP, image, and file-name awareness activities.
- SHA-256, SHA-512, MD5, and Base64 utilities.
- AI-assisted explanations of possible risk indicators.
- Downloadable learning reports.

### OSINT Learning Simulators

- Breach Exposure Simulator.
- WHOIS Report Simulator.
- DNS Record Simulator.
- Metadata Learning Lab.
- Social Footprint Simulator.
- Email Pattern Simulator.

All OSINT modules use generated training scenarios and are clearly intended for educational use.

### GameZone

- Cybersecurity quizzes with explanations.
- Beginner-friendly CyberDojo challenges.
- Linux command practice scenarios.
- Points, levels, progress tracking, and leaderboard features.

### User Experience

- Firebase email/password and Google authentication.
- Personal profile and learning dashboard.
- Optional push notifications.
- Responsive dark cybersecurity-themed interface.
- Progressive Web App support.

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Framer Motion
- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database
- Firebase Cloud Messaging
- Groq API for AI-assisted explanations
- Vercel Analytics and Speed Insights
- Capacitor for Android packaging

## Screenshots

![SecurityX Screenshot 1](public/screenshot1.png)

![SecurityX Screenshot 2](public/screenshot2.png)

![SecurityX Screenshot 3](public/screenshot3.png)

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A Firebase project
- A Groq API key for AI-assisted features
- A NewsAPI key for the cyber-news section

### Install

```bash
git clone https://github.com/captain-vs/CyberScanAI.git
cd CyberScanAI
npm install
```

### Configure environment variables

Create a local `.env.local` file in the project root.

Never commit this file.

```env
# Server-side services
GROQ_API_KEY=
NEWS_API_KEY=
FIREBASE_SERVICE_ACCOUNT_KEY=

# Firebase client configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_VAPID_KEY=
```

`FIREBASE_SERVICE_ACCOUNT_KEY` must only exist in a protected server environment such as Vercel Environment Variables. Never expose it in browser code or commit it to GitHub.

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Production build

```bash
npm run build
npm start
```

## Deployment

SecurityX is configured for deployment on Vercel.

Before deploying:

1. Add every required environment variable in Vercel Project Settings.
2. Ensure `.env.local` is not committed to GitHub.
3. Confirm that Firebase Authentication providers are enabled.
4. Configure Firebase Firestore rules before enabling public multi-user features.
5. Review all public wording so simulated features are not presented as live intelligence.
6. Test authentication, quizzes, profile updates, and API routes in production.

## Security and Privacy Notes

SecurityX is actively being improved. Key principles include:

- Secrets are stored as environment variables.
- Firebase Authentication manages user sign-in.
- Firebase Admin operations run only on the server.
- Users should never upload malware or sensitive personal data.
- Simulated OSINT inputs should be treated as fictional learning examples.
- Firebase security rules should be tested before production changes.

## Current Limitations

SecurityX is a learning platform and prototype, not an enterprise security product.

Current limitations include:

- OSINT results are generated educational scenarios.
- File-name analysis does not inspect or execute uploaded files.
- AI-generated explanations can be inaccurate.
- Challenge scoring and multi-user functionality should continue to be hardened through server-side validation and strict Firestore rules.

## Contributing

Feedback, beginner-learning ideas, UI improvements, content corrections, and safe challenge ideas are welcome.

Before opening an issue or pull request:

- Do not submit secrets, API keys, malware, leaked credentials, or personal data.
- Keep content focused on authorized, ethical, and defensive cybersecurity education.
- Do not add real exploit payloads intended for use against live systems.

## Roadmap

- [ ] Guided beginner learning path
- [ ] More defensive coding challenges
- [ ] Stronger server-side GameZone scoring
- [ ] Privacy-safe public profile architecture
- [ ] Tested Firestore security rules
- [ ] More accessible learning content
- [ ] Improved mobile and Android experience
- [ ] Optional real integrations with transparent source and consent controls

## Disclaimer

SecurityX is an educational cybersecurity platform. It is not a substitute for professional security assessment, incident response, vulnerability management, or threat intelligence services.

Use responsibly, ethically, and only with explicit authorization.

---

Built by the SecurityX team.
