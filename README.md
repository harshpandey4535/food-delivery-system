# MealLane Full-Stack Food Delivery App

MealLane is a beginner-friendly full-stack food delivery and meal planning system with:

- React frontend
- Express and Node.js backend
- MongoDB with Mongoose models
- Python ML recommendation service with Flask and Scikit-learn
- Razorpay test payment integration
- JWT auth with refresh tokens
- Weekly meal planner, order history, analytics, and chatbot suggestions

## Folder Structure

```txt
src/
  App.tsx
  components/
  context/
  data/
  pages/
  services/
  types.ts

backend/
  config/
  data/
  middleware/
  models/
  server.js

ml-service/
  app.py
  requirements.txt
```

## Frontend Features

- Login and register page
- Restaurant listing and menu page
- Cart page with Razorpay checkout button
- Weekly meal planner page
- Dashboard with order history and analytics
- React Router, Context API, Axios
- Responsive UI

## Backend REST APIs

- `POST /register`
- `POST /login`
- `POST /refresh-token`
- `GET /restaurants`
- `GET /menu/:id`
- `POST /cart`
- `POST /order`
- `GET /orders`
- `POST /meal-plan`
- `POST /recommend`
- `POST /payment/create-order`
- `POST /payment/verify`

## API Flow Diagram

```txt
React UI
  |-- login/register -------------> Express API -----> MongoDB
  |-- restaurant/menu ------------> Express API -----> MongoDB
  |-- order/checkout -------------> Express API -----> Razorpay
  |                                   |
  |                                   +-----------> Python ML Service
  |-- meal planner ------------------> Express API -----> Python ML Service
  |-- recommendations --------------> Express API -----> Python ML Service
```

## Data Flow

### Login

1. User submits email and password in the React login form.
2. Frontend calls `POST /login` with Axios.
3. Backend checks MongoDB, validates the password, and returns access and refresh tokens.
4. Frontend stores tokens and user profile in local storage.

### Order

1. User adds items to cart in React.
2. Cart page calls `POST /payment/create-order` to create a Razorpay test order.
3. Razorpay Checkout opens in the browser.
4. After payment success, frontend sends the Razorpay signature to `POST /payment/verify`.
5. Backend verifies the signature and then saves the order with MongoDB through `POST /order`.

### Recommendation

1. Frontend sends user preferences and past orders to `POST /recommend`.
2. Express backend forwards the request to the Flask ML service.
3. ML service scores meals with a simple content-based model.
4. Backend returns the recommended meals to React.

## Setup Instructions

### 1. Clone or open the project

Use this codebase as the project root.

### 2. Frontend setup

Install frontend dependencies from the root project:

```bash
npm install
```

Create a `.env` file in the root if needed:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

Run the frontend:

```bash
npm run dev
```

### One-tap start on Windows

If you are on Windows, double-click `start-all.bat` in the project root.

It will open three windows and start:

- React frontend
- Express backend
- Python ML service

### 3. MongoDB setup

Use either MongoDB Atlas or a local MongoDB instance.

Backend environment example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/meallane
JWT_SECRET=supersecretaccess
JWT_REFRESH_SECRET=supersecretrefresh
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
ML_SERVICE_URL=http://localhost:5000
PORT=4000
```

### 4. Backend setup

From the `backend/` folder, install the packages listed in the server file comments or your own package manifest:

```bash
npm install express mongoose cors dotenv jsonwebtoken bcryptjs razorpay
```

Run the backend:

```bash
node server.js
```

### 5. ML service setup

From the `ml-service/` folder:

```bash
pip install -r requirements.txt
python app.py
```

### 6. Razorpay test mode

1. Create a Razorpay test account.
2. Copy the test key ID and secret.
3. Add them to both the frontend and backend `.env` files.
4. Use Razorpay Checkout in test mode only while developing.

## Example API Integration

### Frontend Axios call

```ts
await apiClient.login({ email, password });
await apiClient.createRazorpayOrder(total * 100);
await apiClient.recommendMeals({ preferences, history, menuItems });
```

### Backend to ML service

```js
const response = await fetch(`${process.env.ML_SERVICE_URL}/recommend`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
```

## Sample Data

The project includes sample restaurant menus, cart items, order history, and meal plans so the UI can work even before you connect the backend.

## Notes

- The frontend falls back to local demo logic if the backend or ML service is offline.
- The backend is written with root-level REST routes to match the requested API design.
- The Python service uses a small sample dataset and a content-based ranking approach.
