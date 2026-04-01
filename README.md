# E-Prescription System

QR-based electronic prescription system built with the MERN stack.

## Overview

This project digitizes the prescription workflow between doctors, patients, and pharmacy staff:

- Doctor creates a patient profile and prescription
- Backend stores prescription data in MongoDB
- Backend generates a QR code payload for the prescription
- Patient can view linked prescriptions and present the QR code
- Pharmacy verifies the QR payload and marks the prescription as used
- Reusing an already used prescription is blocked

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Context API for authentication

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- bcryptjs password hashing
- qrcode for QR generation

## Project Structure

```text
e-prescription-system/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- styles/
|   |   `-- utils/
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|   |-- package.json
|   `-- .env.example
`-- README.md
```

## Roles

- `doctor`: creates patients and prescriptions
- `pharmacy`: verifies QR payloads and dispenses medication
- `patient`: views linked prescriptions and QR codes

## Backend Features

- JWT-based login and registration
- Role-based middleware
- Patient profile management for doctors
- Prescription creation with multiple medications
- QR code generation as base64 image data
- Verification endpoint for pharmacy staff
- Status transition from `active` to `used`
- Protection against repeat usage

## Frontend Features

- Login and registration pages
- Role-aware routing
- Doctor dashboard with:
  - patient form
  - prescription form
  - QR preview
  - prescription history
- Pharmacy dashboard with:
  - QR payload input
  - verification result
  - dispense confirmation
- Patient dashboard with:
  - linked prescriptions
  - QR display
  - medication instructions

## Environment Variables

### Server

Copy `server/.env.example` to `server/.env`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/e_prescription_system
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
PRESCRIPTION_TOKEN_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
```

### Client

Copy `client/.env.example` to `client/.env`.

```env
VITE_API_URL=http://localhost:5000/api
```

## Getting Started

1. Install dependencies in `client` and `server`.
2. Make sure MongoDB is running locally or update `MONGO_URI`.
3. Create the `.env` files shown above.
4. Start the backend from `server`.
5. Start the frontend from `client`.

Suggested commands:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

## Deploy (Netlify + Backend API)

Frontend can be deployed to Netlify, but the Express backend must be hosted separately (for example Render/Railway/VM), then connected via `VITE_API_URL`.

### 1. Deploy frontend to Netlify

This repo includes `netlify.toml` at project root:

- `base = "client"`
- `command = "npm run build"`
- `publish = "dist"`
- SPA redirect enabled (`/* -> /index.html`)

In Netlify dashboard:

1. Import this Git repository.
2. Keep the detected settings from `netlify.toml`.
3. Add environment variable:
   - `VITE_API_URL=https://your-backend-domain.com/api`
4. Deploy.

### 2. Host backend separately

Deploy `server` as a Node.js service and set:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PRESCRIPTION_TOKEN_EXPIRES_IN`
- `CLIENT_URL=https://your-netlify-site.netlify.app`

After backend is live, update Netlify `VITE_API_URL` (if needed) and trigger a redeploy.

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Patients

- `GET /api/patients`
- `POST /api/patients`

### Prescriptions

- `GET /api/prescriptions`
- `POST /api/prescriptions`
- `GET /api/prescriptions/:id`
- `POST /api/prescriptions/verify`
- `POST /api/prescriptions/use`

## Sample Prescription Create Payload

```json
{
  "patientId": "existing_patient_id",
  "medications": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "instructions": "Take one tablet twice a day after meals"
    }
  ]
}
```

## Test Scenarios

1. Register a doctor, pharmacy, and patient account.
2. Log in as doctor and create a patient profile.
3. Create a prescription with at least one medication.
4. Copy the generated QR payload token.
5. Log in as pharmacy and verify the token.
6. Confirm dispensing and ensure the status becomes `used`.
7. Try using the same token again and verify that it is blocked.
8. Log in as patient with the same email used by the doctor and verify the prescription is visible.

## Notes

- The QR image encodes a signed prescription token.
- For this MVP, the pharmacy UI accepts pasted QR payload text from a scanner output.
- In production, add HTTPS, email verification, audit logs, and a hardware/mobile QR scanner flow.
