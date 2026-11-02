# Community Disaster Management and Resource Allocation System (CDM-RAS)

A complete, modern, responsive full-stack **MERN** application designed to serve as a centralized disaster management and emergency relief coordination platform. It seamlessly connects citizens, field volunteers, NGOs, and emergency administrators during natural disasters such as floods, earthquakes, cyclones, fires, and landslides.

---

## 🚀 Key Highlights & Features

- **Multi-Role RBAC**: 3 distinct, fully functional roles: **Citizen**, **Volunteer**, and **Administrator**.
- **1-Click Demo Logins**: Fast demo buttons on the Login page for instant review as Admin, Volunteer, or Citizen.
- **Interactive OpenStreetMap with React Leaflet**: Visualizes real-time disaster zones, active relief shelters, and citizen SOS distress calls with custom color-coded map pins and interactive popup cards.
- **7-Category Resource Allocation Engine**: Manages inventory across *Food Packets*, *Drinking Water*, *Medicines*, *Clothes*, *Blankets*, *First Aid Kits*, and *Rescue Equipment* with atomic inventory deduction and dispatch logging.
- **Emergency SOS Distress Dispatch**: Citizens can request urgent medical, rescue, or food aid with automated volunteer assignment and real-time alerts.
- **Volunteer Mission Tracking**: Volunteers can accept rescue missions, submit field progress updates, and increment their completed mission counter and badges.
- **Interactive Recharts Dashboard**: Visualizes resource availability vs distribution, disaster severity breakdowns, and activity feeds.
- **Live Emergency Marquee & Broadcasts**: Administrators can publish urgent bulletins with real-time notifications for all users.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React.js (Vite), React Router v6, Tailwind CSS, Lucide React Icons |
| **Mapping & Charts** | React Leaflet, OpenStreetMap, Leaflet DivIcons, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM (ObjectIds, pre-save hooks, aggregations) |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js password hashing, Role Middleware |
| **File Uploads** | Multer for incident evidence photos and attachments |

---

## 👥 User Roles & Capabilities

### 1. Citizen
- Register and log in with JWT authentication.
- Report disaster incidents with GPS coordinates, severity level, affected count, and photo evidence.
- Submit urgent Emergency Assistance Requests (SOS) for rescue, medical care, food, or drinking water.
- Track submitted request status (*Pending*, *Assigned*, *In-Progress*, *Fulfilled*).
- Search and locate nearby relief camps and shelters with live bed occupancy counters.
- View real-time disaster alerts, safety bulletins, and weather warnings.

### 2. Volunteer
- Register as an emergency responder with skill specializations (e.g., *Search & Rescue*, *First Aid*, *Boat Operation*, *Medical Care*), contact number, and blood group.
- View ongoing disaster incidents and open citizen SOS requests.
- Accept rescue and assistance tasks directly to deploy on-ground.
- Submit timestamped field progress notes and mark missions as completed.
- Update personal availability status (*Available*, *Busy*, *On-Mission*, *Inactive*).
- Track career rescue badges (*Gold Guardian*, *Medical Commander*, etc.).

### 3. Administrator
- Full administrative analytics dashboard with 7 core KPI metric cards and interactive Recharts.
- Verify, approve, reject, or resolve reported disaster incidents.
- Monitor all incoming citizen distress calls and dispatch volunteers to specific requests.
- Manage resource inventory across all 7 categories and execute resource allocations to shelters or disaster zones (atomically updates available stock).
- Manage relief shelters: add camps, update bed capacity and current occupancy, and configure camp facilities.
- Publish high-priority emergency broadcast alerts and public bulletins.
- Manage users: activate/deactivate accounts and modify access roles.

---

## 📦 Resource Inventory & Allocation Engine

Supports all 7 designated categories:
1. **Food packets** (e.g. Ready-to-Eat Emergency Food Packs)
2. **Drinking water** (e.g. 20L Cans & Packaged Water Pouches)
3. **Medicines** (e.g. Emergency Trauma & Antibiotic Kits)
4. **Clothes** (e.g. Waterproof Raincoats & Dry Clothing Bundles)
5. **Blankets** (e.g. Thermal Woolen Blankets)
6. **First aid kits** (e.g. Sterile Field First Aid Kits)
7. **Rescue equipment** (e.g. Inflatable Motorized Rescue Boats, Lifejackets)

When an administrator allocates supplies, the system verifies available depot stock, decrements inventory, increments allocated quantities, logs the recipient camp or disaster zone, and tracks delivery status (*Allocated* &rarr; *Dispatched* &rarr; *In-Transit* &rarr; *Delivered*).

---

## 🗄️ Database Collections (Mongoose Models)

1. **`Users`**: Name, email, hashed password, role (`citizen`, `volunteer`, `administrator`), phone, address, coordinates, avatar, status.
2. **`Disasters`**: Title, disasterType (`Flood`, `Earthquake`, `Cyclone`, `Fire`, `Landslide`, `Tsunami`, `Other`), incidentDescription, location (`coordinates [lng, lat]`, address, city), affectedPeople, severityLevel (`Low`, `Medium`, `High`, `Critical`), status (`Pending`, `Verified`, `In-Progress`, `Resolved`, `Rejected`), imageUrl, reportedBy, verifiedBy, reportDateTime.
3. **`EmergencyRequests`**: CitizenId, disasterId, requestType (`Rescue`, `Medical`, `Food`, `Drinking Water`, `Shelter`, `Clothes`), urgencyLevel, description, peopleCount, location, contactPhone, status (`Pending`, `Assigned`, `In-Progress`, `Fulfilled`, `Cancelled`), assignedVolunteer.
4. **`Volunteers`**: User reference, skills array, availabilityStatus (`Available`, `Busy`, `On-Mission`, `Inactive`), bloodGroup, contactNumber, address, location coordinates, totalTasksCompleted, badge.
5. **`Resources`**: ResourceName, category, unit, availableQuantity, requiredQuantity, allocatedQuantity, storageLocation, distributionStatus (`In-Stock`, `Low-Stock`, `Out-of-Stock`), minimumThreshold.
6. **`ResourceAllocations`**: Resource reference, disaster reference, shelter reference, allocatedQuantity, allocatedBy, purpose, priority, status (`Allocated`, `Dispatched`, `In-Transit`, `Delivered`, `Cancelled`), dispatchDate, deliveryDate.
7. **`Shelters`**: Name, address, city, location coordinates, capacity, currentOccupancy, contactPerson, contactPhone, facilities array, status (`Active`, `Near Full`, `Full`, `Inactive`).
8. **`Tasks`**: Title, description, emergencyRequest reference, disaster reference, assignedVolunteer reference, priority, status (`Assigned`, `In-Progress`, `Completed`, `Cancelled`), location, progressUpdates array, completedAt.
9. **`Notifications`**: Recipient, targetRole, title, message, type (`Emergency Alert`, `Shelter Notice`, `Resource Allocation`, `General Announcement`), severity (`Critical`, `High`, `Warning`, `Info`), isBroadcast, readBy.

---

## 🔑 Pre-Configured Demo Accounts

For grading, demonstration, and evaluation, you can sign in instantly using the 1-click buttons on the login screen or manually:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@disaster.org` | `admin123` |
| **Volunteer** | `volunteer@disaster.org` | `volunteer123` |
| **Citizen** | `citizen@disaster.org` | `citizen123` |

---

## ⚙️ Installation & Running Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` (or MongoDB Atlas URI)

---

### Step 1: Clone or Navigate to the Workspace
```bash
cd "comunity disaster management"
```

---

### Step 2: Install Backend Dependencies & Configure Environment
```bash
cd backend
npm install
```

Ensure `backend/.env` exists (a default file has already been generated):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/disaster_management
JWT_SECRET=super_secret_jwt_key_disaster_management_2026_secure
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Populate Sample Seed Data
Run the comprehensive seed script to load realistic disasters, shelters, inventory, volunteers, and SOS requests:
```bash
npm run seed
```

---

### Step 4: Start the Backend Server
```bash
npm start
# or for live reloading during development:
npm run dev
```
Backend API will be running at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

---

### Step 5: Install Frontend Dependencies & Start Vite Dev Server
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Application will launch at: `http://localhost:5173`

---

## 📡 REST API Summary

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new Citizen or Volunteer | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | Public |
| `GET` | `/api/auth/me` | Get current authenticated user profile | Authenticated |
| `PUT` | `/api/auth/profile` | Update user location, phone, or volunteer skills | Authenticated |
| `GET` | `/api/auth/users` | List all users with role and status filters | Admin |
| `PATCH` | `/api/auth/users/:id` | Update user role or account status | Admin |
| `GET` | `/api/dashboard/stats` | Aggregated metrics & Recharts analytics | Authenticated |
| `GET` | `/api/disasters` | List disaster incidents with filters & search | Public / Auth |
| `GET` | `/api/disasters/:id` | Get disaster details and geo-coordinates | Public / Auth |
| `POST` | `/api/disasters` | Report new disaster with image upload | Authenticated |
| `PATCH` | `/api/disasters/:id/status` | Verify or update disaster report status | Admin |
| `GET` | `/api/emergency-requests` | List emergency SOS assistance requests | Authenticated |
| `POST` | `/api/emergency-requests` | Submit emergency SOS assistance request | Authenticated |
| `PATCH` | `/api/emergency-requests/:id/assign` | Assign volunteer & dispatch rescue task | Admin / Volunteer |
| `PATCH` | `/api/emergency-requests/:id/status` | Accept or update emergency request status | Admin / Volunteer |
| `GET` | `/api/resources` | List resource stock across all 7 categories | Authenticated |
| `POST` | `/api/resources` | Add new item to central inventory | Admin |
| `PUT` | `/api/resources/:id` | Update inventory stock levels | Admin |
| `GET` | `/api/allocations` | List resource allocation dispatch records | Authenticated |
| `POST` | `/api/allocations` | Allocate resources (atomically deducts stock) | Admin |
| `PATCH` | `/api/allocations/:id/status`| Update logistics status (*Dispatched*, *Delivered*) | Admin / Volunteer |
| `GET` | `/api/shelters` | List relief camps with live occupancy data | Authenticated |
| `POST` | `/api/shelters` | Register new emergency shelter / camp | Admin |
| `PUT` | `/api/shelters/:id` | Update shelter capacity, occupancy, or amenities | Admin |
| `GET` | `/api/volunteers` | Directory of registered volunteer responders | Authenticated |
| `GET` | `/api/tasks` | Operational rescue tasks board | Volunteer / Admin |
| `PATCH` | `/api/tasks/:id/accept` | Volunteer accepts task and deploys | Volunteer |
| `PATCH` | `/api/tasks/:id/progress` | Submit task progress note or mark completed | Volunteer / Admin |
| `GET` | `/api/notifications` | Public alerts & broadcast bulletins | Authenticated |
| `POST` | `/api/notifications` | Broadcast high-priority emergency bulletin | Admin |

---

## 🎨 UI/UX Design System

- **Navigation**: Deep navy (`#0f172a`, `#0a0f1d`) header and responsive sidebar.
- **Emergency Alerts**: Vibrant crimson and ruby red (`#dc2626`, `#ef4444`) with pulsing indicators.
- **Pending Requests & Warnings**: Amber & orange (`#ea580c`, `#f59e0b`).
- **Completed Missions & Safe Shelters**: Emerald green (`#10b981`, `#16a34a`).
- **Clean Backgrounds**: Slate-50 light grey (`#f8fafc`) with polished white card containers.
