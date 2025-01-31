# CS-Scheduler

## Overview
CS-Scheduler is a Node.js and React application designed to manage and display upcoming fitness classes by interacting with the LA Fitness API. It allows users to view their profiles, schedule classes, and see details about class types, availability, and instructors.

## Features
- Fetch and display user profile data.
- Fetch and display upcoming classes with detailed information.
- Categorize classes based on `UiCategoryId` and `RoomTemplateID`.
- Dynamic updating of credentials via environment variables.

## Installation

### Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)
- A GitHub account

### Clone the Repository
```bash
git clone https://github.com/jaskarn78/CS-Scheduler.git
cd CS-Scheduler
```

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add the following:
   ```plaintext
   AUTH_USERNAME=your_username
   AUTH_PASSWORD=your_password
   ```
   Replace `your_username` and `your_password` with your API credentials.

4. Run the server:
   ```bash
   node index.js
   ```

### Frontend Setup
1. Navigate to the `cs-class-scheduler-frontend` directory:
   ```bash
   cd cs-class-scheduler-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   By default, the app runs on `http://localhost:3000`.

## Dynamic Credentials Configuration
To securely handle API credentials, the application uses environment variables. Follow these steps:

1. Install the `dotenv` package in the backend:
   ```bash
   npm install dotenv
   ```
2. Ensure the `.env` file is created in the `server` directory with the following content:
   ```plaintext
   AUTH_USERNAME=your_username
   AUTH_PASSWORD=your_password
   ```
3. Update the `config.js` file in the `server/config` directory to include:
   ```javascript
   module.exports = {
       API_BASE_URL: 'https://publicapi.lafitness.com/LAF_S4.7.15/Services',
       AUTH_CREDENTIALS: {
           username: process.env.AUTH_USERNAME || 'default_username',
           password: process.env.AUTH_PASSWORD || 'default_password',
       },
       CLIENT: {
           Version: '1.3.6.5',
           VariantId: '744',
           Platform: 'iOS',
           OSVersion: '18.3',
           DeviceID: 'DEVICE_ID',
           MacAddress: '02:00:00:00:00:00',
           Model: 'iPhone17,1',
       },
   };
   ```
4. Ensure the following line is added to the top of your `index.js` file to load the `.env` file:
   ```javascript
   require('dotenv').config();
   ```

## Building and Serving the App
1. Build the React frontend:
   ```bash
   cd cs-class-scheduler-frontend
   npm run build
   ```
   This generates a `build` folder with the production-ready app.

2. Serve the React app from the Node.js backend:
   - Ensure the `build` folder is copied to the `server` directory.
   - Update the `index.js` file in the `server` directory:
     ```javascript
     const express = require('express');
     const path = require('path');
     const app = express();

     app.use(express.static(path.join(__dirname, 'build')));

     app.get('*', (req, res) => {
         res.sendFile(path.join(__dirname, 'build', 'index.html'));
     });

     app.listen(3000, () => {
         console.log('Server is running on http://localhost:3000');
     });
     ```

3. Restart the server:
   ```bash
   node index.js
   ```

Access the app at `http://localhost` or your mapped domain.

## Contributing
Feel free to open issues or create pull requests to enhance the project. Contributions are welcome!

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

**Author:** Jaskarn Jagpal

