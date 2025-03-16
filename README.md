# Buy Sell Rent Webapp

A full-stack marketplace application built with the MERN stack (MongoDB, Express, React, Node.js) for college students to buy, sell, and rent items.

## Features

- User authentication and authorization
- Create, read, update, and delete listings
- Search and filter listings by category
- Messaging system between users
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/college-marketplace.git
   cd college-marketplace
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory based on the `.env.example` file
   - Set `NODE_ENV=production` for production deployment

## Development

To run the application in development mode:

```
npm run dev
```

This will start both the server and client in development mode.

## Production Deployment

1. Build the client:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## Deploying to GitHub

1. Initialize a Git repository (if not already done):
   ```
   git init
   ```

2. Add all files to the repository:
   ```
   git add .
   ```

3. Commit the changes:
   ```
   git commit -m "Initial commit"
   ```

4. Add your GitHub repository as a remote:
   ```
   git remote add origin https://github.com/yourusername/college-marketplace.git
   ```

5. Push to GitHub:
   ```
   git push -u origin main
   ```

## Environment Variables

### Server (.env)

- `NODE_ENV` - Set to 'production' for production deployment
- `PORT` - Port for the server (default: 5001)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `JWT_EXPIRE` - JWT token expiration time

### Client (.env)

- `REACT_APP_NODE_ENV` - Set to 'production' for production build
- `REACT_APP_API_URL` - API URL for production (default: '/api')

## License

GNU General Public License V3.0
