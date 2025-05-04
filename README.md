# ShopnSwap

**ShopnSwap** is a dynamic marketplace platform where users can **buy**, **sell**, **swap**, and even **donate** products. Whether you're decluttering, looking for great deals, or want to trade your items, ShopnSwap provides a seamless, community-focused experience.

---

## ✨ Key Features

- **Buy & Sell Products**  
  Post ads to sell your products, or browse to buy from others.

- **Swap Products**  
  Trade items directly with other users.

- **Donate Products**  
  Give away things you don't need anymore.

- **User Accounts & Authentication**  
  Secure sign-up and login via Firebase Authentication.

- **Real-Time Notifications & Messaging**  
  Swap notifications and in-app chat powered by Firestore.

- **Google Maps Integration**  
  Location-based filtering and updates.

- **Payments**  
  Integrated Stripe and Bkash checkout for purchases.

---

## 🛠 Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router
- **Backend:** Firebase (Auth, Firestore, Storage), Stripe
- **Other:** Google Maps API, React Icons, react-toastify

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/shopnswap.git
cd shopnswap
```

###  Install Dependencies
```bash
npm install
```

### Configure Environment Variables
```bash
# Firebase
REACT_APP_API_KEY=your_firebase_api_key
REACT_APP_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_PROJECT_ID=your_firebase_project_id
REACT_APP_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_MESSAGE_SENDER_ID=your_firebase_message_sender_id
REACT_APP_APP_ID=your_firebase_app_id
REACT_APP_DATABASE_URL=your_firebase_database_url
```
```bash
# Stripe
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key 
y
```
```bash
# Google Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🔧 Firebase Setup

Go to the [Firebase Console](https://console.firebase.google.com/):

- **Authentication:** Enable **Email/Password** sign-in method.
- **Firestore:** Create the database (start in **test mode** or add **security rules** for production).
- **Storage:** Enable **Cloud Storage** for image uploads.
- **Add Web App:** Register your app to obtain the Firebase config values needed for your `.env.local` file.

---

## 💳 Stripe Setup

- Sign up at [Stripe](https://stripe.com/) and get your:
  - **Publishable Key** (for frontend use)
  - **Secret Key** (for backend use only)

✅ **Test payments:**  
Use the Stripe test card:  
`4242 4242 4242 4242` (any valid expiry date + CVC)

---

## 🗺️ Google Maps Setup

- Get an API key from the [Google Cloud Console](https://console.cloud.google.com/).
- Enable the **Maps JavaScript API** for your project.


