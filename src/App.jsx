import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Top from "./components/Top";
import DonationSection from "./components/DonationSection";
import DonationCards from "./components/DonationCards";
import SpecialSeva from "./components/SpecialSeva";
import Moments from "./components/Moments";
import QuoteSection from "./components/QuoteSection";
import Impact from "./components/Impact";
import Working from "./components/Working";
import VideoSection from "./components/VideoSection.jsx";
import MealSection from "./components/MealSection.jsx";
import AboutSection from "./components/AboutSection.jsx";
import TrustSection from "./components/TrustSection.jsx";
import StoriesSection from "./components/StoriesSection.jsx";
import Final from "./components/Final.jsx";
import FAQsection from "./components/FAQsection.jsx";
import Footer from "./components/Footer.jsx";
import ThankYouPage from "./components/Thankyoupage.jsx";
import Login from "./admin/pages/Login.jsx";
import Register from "./admin/pages/Register.jsx";
import AdminLayout from "./admin/components/AdminLayout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import Transactions from "./admin/pages/Transactions.jsx";
import Subscriptions from "./admin/pages/Subscriptions.jsx";
import Donors from "./admin/pages/Donors.jsx";
import Analytics from "./admin/pages/Analytics.jsx";
import UtmStats from "./admin/pages/UtmStats.jsx";
import Settings from "./admin/pages/Settings.jsx";
import Receipts from "./admin/pages/Receipts.jsx";
import HospitalsSection from "./components/HospitalsSection.jsx";
import FeaturedOn from "./components/FeaturedOn.jsx";
import WhySwasthya from "./components/WhySwasthya.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ReceiptPreview from "./pages/ReceiptPreview.js";
import Campaigns from "./admin/pages/Campaigns.jsx";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function Home() {
  useEffect(() => {
    // Delay slightly to ensure sections have mounted and layout is complete
    const t = setTimeout(() => {
      const donationSection = document.getElementById("donate") || document.getElementById("donation-section") || document.querySelector('.main-section');
      if (donationSection) {
        donationSection.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }, 60);

    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Top />
      <Navbar />
      <Hero />
  <DonationSection />
  <DonationCards />
  {/* <SpecialSeva /> */}
      <Moments />
      <WhySwasthya />
      <Impact />
      <Working />
      <QuoteSection />
      <VideoSection />
      <MealSection />
      <AboutSection />
      <StoriesSection />
      <FeaturedOn />
      <Final />
      <FAQsection />
      <Footer />
      <ScrollToTop />
      {/* <HospitalsSection /> */}
      {/* <TrustSection /> */}
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/receipt-preview" element={<ReceiptPreview />} />
      <Route path="/thankyou" element={<ThankYouPage />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/x7k9m2p5q8w3" element={<Register />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="donors" element={<Donors />} />
        <Route path="receipts" element={<Receipts />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="utm-stats" element={<UtmStats />} />
        <Route path="settings" element={<Settings />} />
  <Route path="campaigns" element={<Campaigns />} />
      </Route>
    </Routes>
  );
}

export default App;
