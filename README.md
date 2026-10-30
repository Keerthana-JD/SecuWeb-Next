# SecuWeb-Next — Vulnerability Search Platform

SecuWeb-Next is a full-stack web application that enables users to search and explore publicly disclosed software vulnerabilities using the **National Vulnerability Database (NVD) CVE API 2.0**. It provides a simple interface to look up vulnerabilities by CVE ID, search using vendor or software keywords, and filter results by severity.

## 🌐 Live Demo

- **Live Website:** https://keerthana-jd.github.io/SecuWeb-Next/
- **Backend API:** https://secuweb-next-api.onrender.com

## ✨ Features

- Search vulnerabilities by CVE ID.
- Search using vendor or software keywords.
- Filter vulnerabilities by severity: Critical, High, Medium, and Low.
- View vulnerability descriptions and available details from the NVD API.
- Responsive and user-friendly interface.
- Full-stack application with a separately deployed frontend and backend.

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, HTML, CSS |
| Backend | Node.js, Express.js, CORS |
| Vulnerability Data | National Vulnerability Database (NVD) CVE API 2.0 |
| Deployment | GitHub Pages, Render |
| CI/CD | GitHub Actions |

## ⚙️ How It Works

1. The user enters a CVE ID, vendor keyword, or severity.
2. The React frontend sends an HTTP request to the Express backend.
3. The backend processes the request and retrieves vulnerability information from the NVD API.
4. The backend returns the results to the frontend.
5. The frontend displays the matching vulnerability information.

## 🎯 Uses of SecuWeb-Next

- **Vulnerability Research:** Look up publicly disclosed vulnerabilities using CVE identifiers.
- **Security Awareness:** Learn about known software vulnerabilities and their reported severity.
- **Software Risk Assessment:** Find public vulnerability records associated with software or vendor keywords.
- **Cybersecurity Learning:** Understand CVE records, vulnerability severity, REST APIs, and full-stack application development.
- **Initial Security Investigation:** Gather publicly available vulnerability information as a starting point for further security analysis.

### Example Searches

- **CVE ID:** `CVE-2021-44228`
- **Vendor Keyword:** `Microsoft`
- **Severity:** `HIGH`

*Note: Vendor and software searches use keyword matching. Results may include related records and are not guaranteed to be exact vendor-only matches.*

## 💻 Run Locally

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Keerthana-JD/SecuWeb-Next.git
cd SecuWeb-Next
```

### 2. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend runs at `http://localhost:5000`.

### 3. Start the Frontend

Open a separate terminal from the project root:

```bash
cd frontend
npm install
```

Create a `.env.development` file inside the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## 🔐 Scope and Limitations

- Uses publicly available vulnerability records from the NVD API.
- Does not perform penetration testing, scan source-code repositories, or discover new vulnerabilities.
- A matching CVE record does not necessarily mean that a particular system is affected; further assessment is required.
- Search results depend on the NVD API's availability and returned data.
- The free Render backend may sleep after inactivity, which can make the first request slower.

## 👩‍💻 Author

**Keerthana J D**
