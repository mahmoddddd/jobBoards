# JobBoard Platform Documentation & Workflows

## 1. Project Overview
**JobBoard** is a comprehensive professional platform that combines two major recruitment models:
1.  **Traditional Recruitment (LinkedIn/Wuzzuf Style)**: Companies post full-time/part-time jobs, and job seekers apply with CVs.
2.  **Freelancing Marketplace (Upwork/Mostaql Style)**: Clients post short-term projects, and freelancers submit proposals (bids) to execute them.

The platform relies on a robust backend (Node.js/Express + MongoDB) and a modern frontend (Next.js + Tailwind CSS), supporting full Arabic/English internationalization (RTL/LTR).

---

## 2. User Roles (Types of Users)

The system is designed around 4 main roles, each with specific permissions and dashboards:

### A. Job Seeker (User)
*   **Goal**: Finding a permanent job (Full-time/Part-time).
*   **Key Features**:
    *   Profile with Resume/CV and Skills.
    *   Advanced Job Search (Location, Salary, Type).
    *   One-click Apply mechanism.
    *   Saved Jobs management.

### B. Freelancer
*   **Goal**: Finding projects/gigs to execute for profit.
*   **Key Features**:
    *   Professional Profile (Portfolio, Hourly Rate, Bio, Skills).
    *   Project Search (Budget, Duration, Category).
    *   Proposal Submission system (Bidding).
    *   Contract & Milestone management.
    *   Wallet & Earnings Dashboard.

### C. Company (Client)
*   **Goal**: Hiring employees OR finding freelancers for specific tasks.
*   **Key Features**:
    *   Company Profile (Logo, Description, Industry, Verification Status).
    *   **Post a Job**: For hiring employees.
    *   **Post a Project**: For hiring freelancers.
    *   Applicant Tracking System (ATS) for jobs.
    *   Proposal Management System for projects.

### D. System Administrator (Admin)
*   **Goal**: Managing the platform's health, safety, and revenue.
*   **Key Features**:
    *   **Approvals**: Reviewing new Jobs and Companies before they go live (`PENDING` -> `APPROVED`).
    *   **User Management**: Ban/Suspend users.
    *   **Disputes**: Arbitrating conflicts between Freelancers and Clients.
    *   **Financials**: Monitoring transactions and withdrawals (Planned).

---

## 3. Core Workflows

### Workflow 1: Registration & Onboarding
1.  **Sign Up**: User chooses account type (Job Seeker / Freelancer / Company).
2.  **Profile Completion**:
    *   *Freelancer*: Must add skills, hourly rate, and portfolio items.
    *   *Company*: Must add company details and industry.
3.  **Verification (Optional/Planned)**: Email verification and Identity check (KYC).

### Workflow 2: Traditional Job Recruitment (Hiring)
1.  **Post Job (Company)**: Company fills job details (Title, Salary Range, Requirements).
2.  **Admin Review**: Job status is `PENDING`. Admin reviews content. If safe, status becomes `APPROVED`.
3.  **Discovery**: Job appears in search results for Job Seekers.
4.  **Application**: Job Seeker clicks "Apply".
5.  **Selection**: Company views list of applicants, downloads CVs, and contacts candidates externally or via message.

### Workflow 3: Freelance Project Lifecycle (The Core Engine)
This is the complex workflow imitating Upwork/Mostaql.

#### Phase 1: Posting & Bidding
1.  **Post Project (Client)**: Client defines scope, budget (Fixed/Hourly), and deadline.
2.  **Bidding (Freelancer)**: Freelancers submit **Proposals**.
    *   *Inputs*: Bid Amount, Estimated Duration, Cover Letter.
3.  **Selection (Client)**: Client reviews proposals, checks freelancer profiles/ratings.
4.  **Interview (Optional)**: Chat between Client and Freelancer to clarify details.

#### Phase 2: Contract Initiation
1.  **Offer**: Client selects a winner and sends an Offer.
2.  **Escrow (Financial)**: *[Pending Implementation]* Client deposits the agreed amount into the system's Secure Escrow.
3.  **Acceptance**: Freelancer accepts the offer.
4.  **Active Contract**: A `Contract` record is created with status `ACTIVE`.

#### Phase 3: Execution & Delivery
1.  **Milestones**: Work can be divided into chunks (e.g., "Design", "Development", "Testing").
2.  **Submission**: Freelancer submits work for a Milestone.
3.  **Review**: Client reviews the submission.
    *   *Approve*: Funds for this milestone are released to Freelancer's Wallet.
    *   *Reject*: Revision requested.

#### Phase 4: Closure & Feedback
1.  **Completion**: When all milestones are done, contract is marked `COMPLETED`.
2.  **Rating**: Both parties rate each other (1-5 stars + Review text).
3.  **Portfolio**: The project is automatically added to the Freelancer's history with the rating.

### Workflow 4: Financial Withdrawal (Planned)
1.  **Earnings**: Freelancer accumulates funds in their generic `Wallet`.
2.  **Hold Period**: Funds remain "Available" after a safety period (e.g., 14 days).
3.  **Withdrawal Request**: Freelancer requests payout to Bank/PayPal.
4.  **Admin Processing**: Admin reviews and approves the transfer.

---

## 4. Technical Architecture
*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons, `next-intl` (i18n).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ORM).
*   **Authentication**: JWT (JSON Web Tokens) in HttpOnly cookies.
*   **Real-time**: Socket.io (for Chat and Notifications).

## 5. Current Implementation Status vs Roadmap

| Feature | Status | Notes |
| :--- | :---: | :--- |
| **User Auth & Profiles** | ✅ Done | Login, Register, Profile Editing |
| **Job Posting & Applying** | ✅ Done | Full cycle implemented |
| **Project Posting & Bidding** | ✅ Done | Full cycle implemented (UI/Logic) |
| **Admin Dashboard** | ✅ Done | Stats, Approvals, Charts |
| **Internationalization (Ar/En)** | ✅ Done | Full RTL support |
| **Real-time Chat** | 🚧 Partial | UI exists, Socket integration needed |
| **Wallet & Escrow System** | ❌ Pending | **Next Priority** |
| **Payment Gateway** | ❌ Pending | Stripe/Paypal integration |
| **Dispute System** | ❌ Pending | Admin intervention tools |
