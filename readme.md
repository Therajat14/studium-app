# Studium: The Unified Platform for College Life 🎓

> **Studium** is a student-first platform that blends **Notion**'s knowledge sharing, **Reddit**'s community interaction, and **LinkedIn**'s professional networking—all within a single, secure, college-specific ecosystem.

---

## Project Vision & Problem Statement

The college experience is currently fragmented and inefficient. Students are forced to rely on a mix of disconnected platforms to manage their academic, social, and professional lives, which leads to several key problems:

- **Isolation in College:** New students often feel lost and struggle to find a supportive network, making it difficult to find peers for help or connect with seniors.
- **Scattered Resources:** Essential academic resources—like notes, past papers, and study guides—are buried in temporary WhatsApp groups or disorganized cloud drives, making them difficult to find and often lost forever.
- **Limited Networking:** Students lack a dedicated, peer-focused platform. LinkedIn is too formal for daily questions, and broad platforms like Reddit are not tailored to a specific campus community.
- **Lack of Trusted Reviews:** It’s difficult for students to make informed decisions about courses, faculty, and campus events without a centralized source of honest, peer-generated reviews.

**Studium** solves these problems by creating a single, cohesive hub that centralizes all aspects of campus life, empowering students to build community, share knowledge, and seize opportunities.

---

## 💡 Core Modules & Key Features

### 1. Authentication & Profiles (The "LinkedIn" Vibe)

- **User Registration:** Signup using a college email or roll number for identity verification.
- **Comprehensive Profiles:** Personal profile showcasing skills, academic interests, career goals, and links to professional portfolios.
- **Connections:** Follow and connect with peers, juniors, seniors, and alumni within the college.
- **Privacy Control:** Manage profile visibility and content access.

### 2. Community Interaction (The "Reddit" Vibe)

- **Main Feed:** Timeline of posts from college peers, central hub for discussions.
- **Diverse Post Types:** Text, images, polls, and file attachments supported.
- **Upvote/Downvote System:** Surface helpful content, filter noise.
- **Tags & Communities:** Hashtags like `#Placement`, `#FirstYearHelp` act as sub-communities.

### 3. Knowledge Sharing (The "Notion" Vibe)

- **Resource Library:** Centralized hub for uploading and accessing lecture notes, assignments, research papers.
- **Collaborative Docs:** Real-time collaboration on shared documents (study guides, projects).
- **Bookmark & Save:** Personal library for important posts/resources.

### 4. Q&A & Mentorship (Blend of Reddit + LinkedIn)

- **Ask a Question:** Crowdsourced answers on academics, career, or campus topics.
- **Mentorship Matching:** Connect juniors with seniors/alumni by shared skills.
- **Alumni Network:** Visible alumni profiles for guidance & networking.

### 5. Opportunities & Networking

- **Events Calendar:** Workshops, hackathons, campus fests, and events.
- **Internship/Job Board:** Share job openings, internships, and referrals.
- **Project Showcase:** Display side projects and gather feedback.

### 6. Campus Life & Reviews

- **College Reviews:** Rate and review faculty, courses, and campus facilities.
- **Local Help:** Discover the best places to eat, print notes, or hang out.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-time:** Socket.IO
- **File Storage:** AWS S3 (or similar cloud storage)

---

## 🚀 Getting Started

To get a local copy up and running, follow these steps:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/studium.git
cd studium

# 2. Install dependencies for frontend and backend
cd client   # or frontend
npm install
cd ../server  # or backend
npm install

# 3. Configure environment variables
# Create a .env file in the backend directory and add credentials:
# - MongoDB URI
# - AWS S3 keys
# - JWT secret, etc.

# 4. Run the application (example)
npm run dev
```
