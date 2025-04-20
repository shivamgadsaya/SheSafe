# SheSafe - Women's Safety Application

SheSafe is a comprehensive web application focused on women's safety and empowerment. It provides features like emergency SOS alerts, community safety reporting, guardian tracking, and emergency responder coordination.

## Features

### For Users (Women)
- **Emergency SOS**: Quickly send alerts with location data to guardians and emergency responders
- **Community Reports**: Report and view safety incidents in your area
- **Guardian Management**: Add trusted contacts as guardians who can be notified during emergencies
- **Profile Management**: Update personal information and emergency contact preferences

### For Guardians
- **Dependent Tracking**: View the status of dependents who have added you as a guardian
- **Emergency Response**: Receive alerts when a dependent triggers an SOS and respond accordingly
- **Real-time Notifications**: Get notified immediately when help is needed

### For Emergency Responders
- **Alert Dashboard**: View active emergencies in your area
- **Status Management**: Update response status (en route, on scene, resolved)
- **Incident Tracking**: Keep track of past responses

## Tech Stack

- **Frontend**: React, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Geolocation**: Browser Geolocation API, Google Maps integration

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local instance or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/shesafe.git
cd shesafe
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=5003
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/shesafe
```

### Running the Application

1. Start the backend server
```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend client
```bash
cd client
npm start
```

3. Access the application at `http://localhost:3000`

### Demo Accounts

The following test accounts are automatically created when running the development server:

- **User**: test@example.com / password123
- **Guardian**: guardian@example.com / password123  
- **Responder**: responder@example.com / password123

## License

This project is licensed under the MIT License - see the LICENSE file for details. 