# 🚀 JobBoard → Freelance Marketplace Transformation Plan

## Overview
Transform the existing JobBoard into a full freelance marketplace (like Upwork/Freelancer) while keeping existing job board features. The app will support **two modes**: traditional job posting AND freelance project-based work.

---

## 📋 Phase 1: Freelancer Profiles & Skills System
> Allow users to create rich freelancer profiles

### Backend Tasks
- [x] **1.1** Create `FreelancerProfile` model (`models/FreelancerProfile.js`)
  - Fields: `userId`, `title` (e.g. "Full Stack Developer"), `bio`, `skills[]`, `hourlyRate`, `availability` (AVAILABLE/BUSY/NOT_AVAILABLE), `experienceLevel`, `portfolio[]` (title, description, imageUrl, link), `completedProjects`, `rating`, `totalEarnings`, `languages[]`, `location`, `category`
- [x] **1.2** Create `Skill` model (`models/Skill.js`)
  - Fields: `name`, `category` (e.g. "Web Development", "Design", "Marketing")
  - Pre-seed with common skills
- [x] **1.3** Create `freelancerController.js` with CRUD operations
  - `createProfile`, `updateProfile`, `getProfile`, `searchFreelancers` (filter by skill, rate, rating, availability)
- [x] **1.4** Create `freelancerRoutes.js`
  - `POST /api/freelancers/profile` - Create profile
  - `PUT /api/freelancers/profile` - Update profile
  - `GET /api/freelancers/:id` - Get profile
  - `GET /api/freelancers` - Search/browse freelancers
  - `GET /api/freelancers/me` - My profile
  - `GET /api/skills` - Get all skills/categories

### Frontend Tasks
- [x] **1.5** Create `FreelancerProfile` page (`app/freelancer/profile/page.tsx`)
  - Edit profile form: title, bio, skills (tag input), hourly rate, portfolio items, languages
- [x] **1.6** Create `FreelancerCard` component (`components/FreelancerCard.tsx`)
  - Avatar, name, title, rating stars, hourly rate, top skills, availability badge
- [x] **1.7** Create `Browse Freelancers` page (`app/freelancers/page.tsx`)
  - Search bar, filter sidebar (skills, rate range, rating, availability)
  - Grid of FreelancerCards with pagination
- [x] **1.8** Create `Freelancer Detail` page (`app/freelancers/[id]/page.tsx`)
  - Full profile with portfolio gallery, reviews, stats, "Hire Me" button

---

## 📋 Phase 2: Projects/Gigs System
> Companies/clients can post projects (fixed-price or hourly)

### Backend Tasks
- [x] **2.1** Create `Project` model (`models/Project.js`)
  - Fields: `title`, `description`, `clientId` (User), `companyId` (optional), `category`, `skills[]`, `budgetType` (FIXED/HOURLY), `budgetMin`, `budgetMax`, `duration` (LESS_THAN_1_MONTH, 1_TO_3_MONTHS, 3_TO_6_MONTHS, MORE_THAN_6_MONTHS), `experienceLevel`, `status` (OPEN/IN_PROGRESS/COMPLETED/CANCELLED), `attachments[]`, `deadline`, `proposals_count`
- [x] **2.2** Create `projectController.js`
  - `createProject`, `updateProject`, `getProject`, `getProjects` (with filters), `getMyProjects`, `closeProject`, `deleteProject`
- [x] **2.3** Create `projectRoutes.js`
  - Full CRUD + search/filter routes

### Frontend Tasks
- [x] **2.4** Create `Post Project` page (`app/projects/new/page.tsx`)
  - Multi-step form: Title & Description → Skills & Category → Budget & Duration → Review & Post
- [x] **2.5** Create `ProjectCard` component (`components/ProjectCard.tsx`)
  - Title, budget range, duration, skills tags, proposals count, posted time
- [x] **2.6** Create `Browse Projects` page (`app/projects/page.tsx`)
  - Search + filters (category, budget, duration, experience level, skills)
  - List of ProjectCards with pagination
- [x] **2.7** Create `Project Detail` page (`app/projects/[id]/page.tsx`)
  - Full description, client info, budget, skills, "Submit Proposal" button

---

## 📋 Phase 3: Proposals & Bidding System
> Freelancers submit proposals with bids on projects

### Backend Tasks
- [x] **3.1** Create `Proposal` model (`models/Proposal.js`)
  - Fields: `projectId`, `freelancerId`, `coverLetter`, `bidAmount`, `estimatedDuration`, `status` (PENDING/ACCEPTED/REJECTED/WITHDRAWN), `attachments[]`
- [x] **3.2** Create `proposalController.js`
  - `submitProposal`, `getProjectProposals` (client), `getMyProposals` (freelancer), `updateProposalStatus`, `withdrawProposal`
- [x] **3.3** Create `proposalRoutes.js`
- [x] **3.4** Socket notification: notify client when new proposal received, notify freelancer when proposal accepted/rejected

### Frontend Tasks
- [x] **3.5** Create `Submit Proposal` modal/page (`components/SubmitProposal.tsx`)
  - Cover letter editor, bid amount input, estimated duration, file attachments
- [x] **3.6** Create `My Proposals` page (`app/freelancer/proposals/page.tsx`)
  - List of submitted proposals with statuses
- [x] **3.7** Create `Project Proposals` view (for clients) - integrated into project detail page
  - List of proposals with freelancer info, bid, cover letter, Accept/Reject buttons

---

## 📋 Phase 4: Contracts & Milestones
> Once a proposal is accepted, create a contract with milestones

### Backend Tasks
- [x] **4.1** Create `Contract` model (`models/Contract.js`)
  - Fields: `projectId`, `clientId`, `freelancerId`, `proposalId`, `title`, `description`, `totalAmount`, `status` (ACTIVE/COMPLETED/DISPUTED/CANCELLED), `startDate`, `endDate`
- [x] **4.2** Create `Milestone` model (`models/Milestone.js`)
  - Fields: `contractId`, `title`, `description`, `amount`, `dueDate`, `status` (PENDING/IN_PROGRESS/SUBMITTED/APPROVED/REVISION_REQUESTED/PAID), `deliverables[]`
- [x] **4.3** Create `contractController.js`
  - `createContract` (auto-created when proposal accepted), `getContract`, `getMyContracts`, `updateContractStatus`, `addMilestone`, `updateMilestoneStatus`, `submitMilestone`, `approveMilestone`
- [x] **4.4** Create `contractRoutes.js`
- [x] **4.5** Socket notifications for milestone updates

### Frontend Tasks
- [x] **4.6** Create `My Contracts` page (`app/contracts/page.tsx`)
  - Active/completed contracts with progress bars
- [x] **4.7** Create `Contract Detail` page (`app/contracts/[id]/page.tsx`)
  - Contract info, milestone timeline/tracker, submit/approve deliverables
  - Progress tracking with visual indicators
- [x] **4.8** Create `MilestoneTracker` component (`components/MilestoneTracker.tsx`)
  - Visual timeline showing milestone statuses

---

## 📋 Phase 5: Messaging System
> Real-time chat between clients and freelancers

### Backend Tasks
- [x] **5.1** Create `Conversation` model (`models/Conversation.js`)
  - Fields: `participants[]`, `projectId` (optional), `lastMessage`, `updatedAt`
- [x] **5.2** Create `Message` model (`models/Message.js`)
  - Fields: `conversationId`, `senderId`, `content`, `type` (TEXT/FILE/IMAGE), `fileUrl`, `readBy[]`, `createdAt`
- [x] **5.3** Create `messageController.js`
  - `getConversations`, `getMessages`, `sendMessage`, `markAsRead`
- [x] **5.4** Create `messageRoutes.js`
- [x] **5.5** Socket.io real-time messaging events
  - `send-message`, `receive-message`, `typing`, `mark-read`

### Frontend Tasks
- [x] **5.6** Create `Messages` page (`app/messages/page.tsx`)
  - Split view: conversation list (left) + chat area (right)
  - Real-time message updates via socket
  - File/image sharing
  - Typing indicators
  - Unread badges
- [x] **5.7** Create `ChatBubble`, `ConversationItem` components
- [x] **5.8** Add message notification badge to Header

---

## 📋 Phase 6: Reviews & Ratings (Two-Way)
> Both clients and freelancers can review each other after contract completion

### Backend Tasks
- [x] **6.1** Create `FreelancerReview` model (`models/FreelancerReview.js`)
  - Fields: `contractId`, `reviewerId`, `revieweeId`, `role` (CLIENT_TO_FREELANCER / FREELANCER_TO_CLIENT), `rating` (1-5), `comment`, `skills_rating` (communication, quality, deadline, cooperation)
- [x] **6.2** Update freelancer profile to auto-calculate average rating
- [x] **6.3** Create review controller and routes

### Frontend Tasks
- [x] **6.4** Create `ReviewForm` component for post-contract reviews
- [x] **6.5** Display reviews on freelancer profiles and client profiles

---

## 📋 Phase 7: Dashboard Enhancements
> Enhanced dashboards for both freelancers and clients

### Frontend Tasks
- [x] **7.1** Create `Freelancer Dashboard` (`app/freelancer/dashboard/page.tsx`)
  - Stats: earnings this month, active contracts, completed projects, avg rating
  - Charts: earnings over time, projects by category
  - Active milestones/deadlines
  - Recent proposals status
- [x] **7.2** Enhance `Company Dashboard` with project management
  - Active projects, pending proposals to review, contract progress (Impl: `/projects/my`)
- [ ] **7.3** Add project stats to Admin dashboard

---

## 📋 Phase 8: Navigation & UI Updates
> Update the overall app navigation and landing page

### Frontend Tasks
- [x] **8.1** Update `Header` navigation
  - Add: "مشاريع" (Projects), "مستقلين" (Freelancers), "رسائل" (Messages) links
  - Role-based nav: Freelancer sees their dashboard, Client sees their projects
- [x] **8.2** Update `Home` page
  - Add "Find Freelancers" section with top-rated freelancer cards
  - Add "Browse Projects" section with recent projects
  - Add "How it Works" section for freelance flow
  - Stats: freelancers, projects completed, total paid
- [x] **8.3** Update `Footer` with new links
- [x] **8.4** Add role selection during registration (Job Seeker / Freelancer / Company)

---

## � Phase 9: Notifications & Integrations (New)
> Persistent notifications and external integrations

### Backend Tasks
- [ ] **9.1** Update `Notification` model to support marketplace events
  - Types: `PROPOSAL_RECEIVED`, `CONTRACT_CREATED`, `MILESTONE_UPDATED`, `NEW_REVIEW`, `NEW_MESSAGE`
- [ ] **9.2** Create `notificationController.js` and routes
  - `getNotifications`, `markAsRead`, `markAllAsRead`
- [ ] **9.3** Implement Email Notifications using `utils/email.js`
  - Send email on: New Proposal, Contract Started, Milestone Action
- [ ] **9.4** Payment Gateway Integration (Stripe)
  - Create PaymentIntent for milestones
  - Webhook handler for successful payments

### Frontend Tasks
- [ ] **9.5** Enhanced Notification Dropdown
  - Real-time updates + database persistence
- [ ] **9.6** Payment Modal
  - Credit card input for funding milestones

---

## �🗂️ New Models Summary

| Model | Description |
|-------|-------------|
| `FreelancerProfile` | Extended profile for freelancers |
| `Skill` | Skills/categories catalog |
| `Project` | Freelance project postings |
| `Proposal` | Freelancer bids on projects |
| `Contract` | Active work agreements |
| `Milestone` | Contract payment milestones |
| `Conversation` | Chat conversations |
| `Message` | Chat messages |
| `FreelancerReview` | Two-way reviews |
| `Notification` | System & Activity updates |

## 🗂️ New Pages Summary

| Page | Route | Role |
|------|-------|------|
| Browse Freelancers | `/freelancers` | Public |
| Freelancer Profile | `/freelancers/[id]` | Public |
| My Freelancer Profile | `/freelancer/profile` | Freelancer |
| Freelancer Dashboard | `/freelancer/dashboard` | Freelancer |
| Browse Projects | `/projects` | Public |
| Post Project | `/projects/new` | Client/Company |
| Project Detail | `/projects/[id]` | Public |
| My Proposals | `/freelancer/proposals` | Freelancer |
| My Contracts | `/contracts` | Both |
| Contract Detail | `/contracts/[id]` | Both |
| Messages | `/messages` | Authenticated |

---

## ⚡ Implementation Priority
1. **Phase 1** → Freelancer Profiles (foundation for everything)
2. **Phase 2** → Projects (clients need to post work)
3. **Phase 3** → Proposals (connecting freelancers to projects)
4. **Phase 4** → Contracts & Milestones (work management)
5. **Phase 5** → Messaging (communication)
6. **Phase 6** → Reviews (trust & quality)
7. **Phase 7** → Dashboards (analytics)
8. **Phase 8** → Navigation & UI polish
9. **Phase 9** → Notifications & Integrations
