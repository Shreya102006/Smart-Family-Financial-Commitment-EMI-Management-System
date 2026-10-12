# Smart Family Financial Commitment & EMI Management System

A full-stack, enterprise-grade financial management platform designed to centralize and track family loans, home/car EMIs, education fees, insurance premiums, utility bills, and payment schedules with automatic overdue detection and reminder alerts.

---

## 🌟 Key Features

1. **Authentication & Security**
   - User Registration & Login with JWT (JSON Web Tokens).
   - Password encryption using BCrypt.
   - Spring Security with Stateless Session management and CORS configuration.
   - Guarded routes in React with automatic session handling.

2. **Family Management**
   - Create and manage family profiles.
   - Add, edit, and delete family members with assigned relationships (Father, Mother, Daughter, Son, Spouse, etc.).
   - Assign individual financial commitments to specific family members or shared household expenses.

3. **Financial Commitments & Loans**
   - Categorization by commitment type:
     - Home Loan EMI
     - Car Loan EMI
     - Personal Loan EMI
     - Education Fee
     - Insurance Premium
     - Rent
     - Utility Bill
     - Credit Card Installment
     - Other Recurring Payment
   - Repayment frequencies: Monthly, Quarterly, Half-Yearly, Yearly, One-Time.
   - Automated total liability calculations and dynamic repayment progress tracking.

4. **Automated Payment Schedule Generation**
   - Automatically generates scheduled payment records across the loan tenure based on start date, end date, frequency, installment amount, and monthly due day.
   - Intelligently calculates chronological installment due dates.

5. **Payment Tracking & Lifecycle Management**
   - Dynamic payment status states: `UPCOMING`, `PENDING` (Due Today), `PAID`, `OVERDUE`.
   - "Mark as Paid" action with customizable settled amounts, payment dates, and payment notes.
   - Automatic deduction from remaining commitment balances and recalculation of repayment progress.

6. **Interactive Financial Dashboard**
   - 7 key metrics cards:
     1. Total Monthly Commitments
     2. Total Active Commitments
     3. Upcoming Payments Count
     4. Pending Payments Count
     5. Overdue Payments Count
     6. Total Paid Amount
     7. Total Remaining Balance
   - Visual charts powered by Chart.js:
     - Monthly commitment and settlement trends (Bar Chart)
     - Paid vs Remaining debt breakdown (Doughnut Chart)
     - Loan category distribution (Doughnut Chart)
   - Real-time overdue action alert banner.

7. **Reminder & Overdue Detection System**
   - Automated scheduled service detects overdue payments when `currentDate > dueDate` and `paymentStatus != 'PAID'`.
   - Dynamic reminder notifications triggered at 7 days before, 3 days before, 1 day before, and on the due date.
   - Live notification badge and drop-down drawer with "Mark as Read" actions.

8. **Payment History & Reporting**
   - Full transaction history with multi-criteria filtering (search, category, status, date ranges, and sorting).
   - Family member-wise financial obligation analysis with progress bars.
   - Printable / PDF export ready reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, React Router 6, Bootstrap 5.3, Bootstrap Icons, Axios, Chart.js, react-chartjs-2 |
| **Backend** | Java 17/25, Spring Boot 3.2.5, Spring Data JPA, Hibernate, Spring Security, JJWT 0.11.5, Jakarta Validation, Maven 3.9 |
| **Database** | MySQL 8.0 (`smart_family_financial_db`) |
| **Architecture**| Clean Layered Architecture: Controller → Service → Repository → Entity |

---

## 📁 Project Folder Structure

```
smart-family-financial-system/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── DashboardCard.jsx
│       │   ├── CommitmentCard.jsx
│       │   ├── PaymentTable.jsx
│       │   ├── NotificationPanel.jsx
│       │   ├── ProgressBar.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── ErrorMessage.jsx
│       │   ├── ConfirmModal.jsx
│       │   └── ProtectedRoute.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── FamilyPage.jsx
│       │   ├── AddFamilyMemberPage.jsx
│       │   ├── CommitmentsPage.jsx
│       │   ├── AddCommitmentPage.jsx
│       │   ├── CommitmentDetailsPage.jsx
│       │   ├── PaymentsPage.jsx
│       │   ├── UpcomingPaymentsPage.jsx
│       │   ├── PaymentHistoryPage.jsx
│       │   ├── NotificationsPage.jsx
│       │   ├── ReportsPage.jsx
│       │   └── ProfilePage.jsx
│       ├── services/
│       │   └── api.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useAuth.js
│       ├── utils/
│       │   └── formatters.js
│       ├── assets/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── backend/
│   ├── pom.xml
│   ├── mvnw.cmd
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/
│           │       └── smartfamily/
│           │           └── financial/
│           │               ├── SmartFamilyFinancialApplication.java
│           │               ├── controller/
│           │               │   ├── AuthController.java
│           │               │   ├── UserController.java
│           │               │   ├── FamilyController.java
│           │               │   ├── FamilyMemberController.java
│           │               │   ├── CommitmentController.java
│           │               │   ├── PaymentController.java
│           │               │   ├── NotificationController.java
│           │               │   ├── DashboardController.java
│           │               │   └── ReportController.java
│           │               ├── service/
│           │               │   ├── AuthService.java
│           │               │   ├── UserService.java
│           │               │   ├── FamilyService.java
│           │               │   ├── FamilyMemberService.java
│           │               │   ├── CommitmentService.java
│           │               │   ├── PaymentService.java
│           │               │   ├── NotificationService.java
│           │               │   ├── DashboardService.java
│           │               │   └── ReportService.java
│           │               ├── repository/
│           │               │   ├── UserRepository.java
│           │               │   ├── FamilyRepository.java
│           │               │   ├── FamilyMemberRepository.java
│           │               │   ├── CommitmentRepository.java
│           │               │   ├── PaymentRepository.java
│           │               │   └── NotificationRepository.java
│           │               ├── entity/
│           │               │   ├── User.java
│           │               │   ├── Family.java
│           │               │   ├── FamilyMember.java
│           │               │   ├── Commitment.java
│           │               │   ├── Payment.java
│           │               │   └── Notification.java
│           │               ├── dto/
│           │               ├── security/
│           │               ├── exception/
│           │               └── config/
│           │                   ├── SecurityConfig.java
│           │                   └── DataLoader.java
│           └── resources/
│               ├── application.properties
│               └── data.sql
│
├── .env.example
└── README.md
```

---

## 🗄️ Database Setup

1. **Verify or Start MySQL**:
   Ensure MySQL service is running on default port `3306`.
   ```bash
   # On Windows (PowerShell)
   Get-Service -Name MySQL80
   Start-Service -Name MySQL80
   ```

2. **Create Database**:
   ```sql
   CREATE DATABASE IF NOT EXISTS smart_family_financial_db;
   ```

3. **Configure Credentials in `backend/src/main/resources/application.properties`**:
   ```properties
   spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:smart_family_financial_db}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true
   spring.datasource.username=${DB_USER:root}
   spring.datasource.password=${DB_PASSWORD:root}
   ```
   *(You can also set system environment variables `DB_USER` and `DB_PASSWORD`)*

---

## 🚀 Running the Application

### 1. Backend (Spring Boot)

Navigate to the backend directory:
```bash
cd backend
```

Compile and run using Maven:
```bash
mvn spring-boot:run
```
*(Or use the included Maven wrapper `mvnw.cmd spring-boot:run`)*

The backend server will start at:
👉 **`http://localhost:8083`**

On initial startup, `DataLoader` will automatically seed the **Aaradhya Family** demo dataset.

### 2. Frontend (React + Vite)

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

The frontend will start at:
👉 **`http://localhost:5173`**

---

## 🔑 Demo Credentials

A complete, realistic demo family is pre-seeded with Indian Rupee formatting:

| Field | Value |
|---|---|
| **Email** | `demo@smartfamily.com` |
| **Password** | `password123` |
| **Family Name** | Aaradhya Family |
| **Owner** | Rajesh Sharma |
| **Members** | Aaradhya (Daughter), Rajesh (Father), Priya (Mother) |
| **Commitments**| Home Loan EMI (₹25,000/mo), Car EMI (₹15,000/mo), School Fee (₹50,000/yr), Life Insurance (₹20,000/yr), Rent (₹12,000/mo), Utility Bill (₹3,000/mo) |

*(You can also click the **"Fill Demo Credentials"** button on the Login page for one-click access)*

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user and family
- `POST /api/auth/login` - Authenticate and receive JWT Bearer token

### User Profile
- `GET /api/users/profile` - Fetch current user profile
- `PUT /api/users/profile` - Update name / phone
- `PUT /api/users/change-password` - Securely change password

### Family & Members
- `GET /api/families` - Get families owned by current user
- `POST /api/families` - Create new family
- `GET /api/family-members` - Get members of family
- `POST /api/family-members` - Add member to family
- `PUT /api/family-members/{id}` - Update member
- `DELETE /api/family-members/{id}` - Remove member

### Financial Commitments
- `GET /api/commitments` - List commitments (with optional status & type filters)
- `POST /api/commitments` - Create commitment & automatically generate payment schedule
- `GET /api/commitments/{id}` - Get commitment details and progress
- `PUT /api/commitments/{id}` - Update commitment terms
- `DELETE /api/commitments/{id}` - Delete commitment and associated payments

### Payments & Tracking
- `GET /api/payments` - Master payment schedule
- `GET /api/payments/upcoming` - Upcoming and pending payments
- `GET /api/payments/pending` - Payments due today
- `GET /api/payments/overdue` - Overdue payments
- `GET /api/payments/history` - Historical settled payments
- `PUT /api/payments/{id}/pay` - Mark payment as paid, update balances & trigger notifications

### Dashboard & Analytics
- `GET /api/dashboard/summary` - Aggregate metrics, overdue alerts, and chart distributions
- `GET /api/dashboard/monthly` - Monthly trends of committed vs paid amounts
- `GET /api/dashboard/commitment-types` - Category-wise breakdown

### Notifications & Reminders
- `GET /api/notifications` - List reminders and overdue alerts
- `GET /api/notifications/unread-count` - Badge count for unread notifications
- `PUT /api/notifications/{id}/read` - Mark specific notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Reports
- `GET /api/reports/summary` - Comprehensive financial report with filters
- `GET /api/reports/member-wise` - Member-wise financial liabilities and progress

---

## 🛠️ Troubleshooting

- **MySQL Connection Error**:
  Verify the MySQL service is running (`Get-Service MySQL80`) and that your credentials in `application.properties` match your local MySQL configuration.
- **Port Conflict (8083 or 5173)**:
  Ensure no other process is using port 8083 (backend) or port 5173 (frontend).
- **CORS Issues in Development**:
  The backend `SecurityConfig` is configured to allow `http://localhost:5173`. If running on an alternate port, add it to `SecurityConfig.java`.
