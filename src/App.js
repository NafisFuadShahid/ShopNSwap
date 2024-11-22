import "./App.css";
import "./styles/animations.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AuthProvider from "./context/auth";
import PrivateRoute from "./components/PrivateRoute";
import Sell from "./pages/Sell";
import MyFavorites from "./pages/MyFavorites";
import Ad from "./pages/Ad";
import Footer from "./components/Footer"; 
import Chat from "./pages/Chat";
import Chatbot from "./pages/Chatbot";
import Swap from "./pages/Swap";
import Donate from "./pages/Donate";
import Buy from "./pages/Buy";
import SearchResults from "./pages/SearchResults";
import Explore from "./pages/Explore";
import About from "./pages/About";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen mt-16">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route element={<PrivateRoute />}>
                <Route path="/sell" element={<Sell />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/favorites" element={<MyFavorites />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/swap" element={<Swap />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/buy" element={<Buy />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/:category/:id" element={<Ad />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/about" element={<About />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;