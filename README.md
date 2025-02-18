# Club Studio Scheduler

## Overview
Club Studio Scheduler is an automated class booking system for Club Studio fitness classes. This system allows users to:
- **Automate class bookings** for their preferred schedule.
- **Manually book classes** and add them to their calendar.
- **Manage personal preferences**, including selected classes, times, and days.
- **Join waitlists** automatically when classes are full.
- **Receive notifications** via email or Pushover (Apprise integration).

The system consists of a **React.js frontend** and a **Node.js backend** with **MariaDB** for database storage.

---
## Features
### ✅ Frontend (React.js)
- User authentication and session management.
- Class filtering and manual reservation.
- Preference management for automatic bookings.
- Real-time reservation status updates.
- Mobile-friendly UI using Tailwind CSS.

### ✅ Backend (Node.js, Express.js, MariaDB)
- Secure API for authentication and booking.
- Automated class booking via `node-schedule`.
- Pushover (Apprise) & email notifications.
- SQL-based storage for user preferences and credentials.
- Error handling and logging for debugging.

---
## Tech Stack
### **Frontend:**
- React.js (Tailwind CSS for styling)
- React Router for navigation
- LocalStorage for session management

### **Backend:**
- Node.js + Express.js
- MariaDB for user & preference storage
- `node-schedule` for automation
- `nodemailer` for email notifications
- `apprise` for Pushover notifications

### **Deployment & Environment:**
- Runs on a Linux server (Unraid, system service not included in this README)
- `.env` file for managing secrets & configurations

---
## Installation
### **Prerequisites**
- **Node.js** (v16 or later)
- **MariaDB** (or MySQL, properly configured)
- **NPM or Yarn**
- **.env file** with API credentials

### **Backend Setup**
1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-repo/CS-Scheduler.git
   cd CS-Scheduler/server
   ```
2. **Install dependencies**:
   ```sh
   npm install
   ```
3. **Set up the `.env` file** (refer to `.env.example`):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=ClubScheduler
   API_BASE_URL=https://api.clubstudio.com
   ```
4. **Run database migrations**:
   ```sh
   node db/migrate.js
   ```
5. **Start the backend server**:
   ```sh
   node index.js
   ```

### **Frontend Setup**
1. **Navigate to the frontend directory**:
   ```sh
   cd ../frontend
   ```
2. **Install dependencies**:
   ```sh
   npm install
   ```
3. **Start the development server**:
   ```sh
   npm start
   ```

---
## API Structure
### **Authentication**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Logs in a user and retrieves auth token |
| `/api/profile/my-profile` | POST | Fetches user profile details |

### **Class Reservations**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/classes/classes-by-club` | POST | Retrieves upcoming classes |
| `/api/classes/reservations` | POST | Fetches current reservations |
| `/api/booking/reserve-class` | POST | Reserves a spot in a class |
| `/api/booking/addToWaitList` | POST | Adds a user to a waitlist |
| `/api/booking/cancel` | POST | Cancels a class reservation |

### **User Preferences**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/preferences/savePreferences` | POST | Saves user preferences |
| `/api/preferences/getPreferences` | POST | Fetches stored preferences |
| `/api/preferences/deletePreference` | POST | Deletes a saved preference |

---
## Automation
### **Automated Class Booking (`scheduleBooking.js`)**
The system uses `node-schedule` to check stored preferences and execute bookings **exactly 7 days in advance** at the right time.
- If a spot is available, it will **automatically reserve** the class.
- If the class is full, it will **attempt to join the waitlist**.
- Users will receive a **Pushover notification** or **email confirmation** with booking details.

The automation is scheduled using:
```javascript
schedule.scheduleJob({ hour: bookingHour, minute: bookingMinute, dayOfWeek: scheduledDay }, () => {
    automateClassBooking(className, classTime, classDay);
});
```

### **Waitlist Handling**
When a class is full, the system automatically adds the user to the waitlist:
```javascript
if (!spots || spots.Items.length === 0) {
    console.log("🚫 No spots available. Attempting waitlist...");
    const waitlistResponse = await addToWaitList(targetClass.CLASS_SCHEDULES_ID, targetClass.START_TIME);
}
```

---
## Notifications
### **Email Confirmation (`notificationService.js`)**
Stylized HTML emails are sent for class bookings:
```html
<div style="font-family: Arial;">
    <h2>📅 Class Booking Confirmation</h2>
    <p>🏋️ Class: CS4</p>
    <p>⏰ Time: 6:30 PM</p>
    <p>📌 Spot Number: 12</p>
</div>
```

### **Pushover (Apprise)**
Users receive push notifications for confirmations or failures:
```javascript
sendAppriseNotification(`✅ ${username} successfully booked ${className} at ${classTime}`);
```

---
## Usage
1. **Log in** and authenticate using the frontend UI.
2. **Set up auto-booking preferences** for your classes, times, and days.
3. **The system will automatically book** your classes or waitlist you if full.
4. **Check your reservations** in the "My Reservations" section.
5. **Receive email or push notifications** about your bookings.

---
## Contributing
Pull requests and feature suggestions are welcome! Please open an issue if you encounter bugs.

---
## License
MIT License. Use freely and contribute!

