import { Routes, Route, Navigate, useEffect, useState } from "react";
import { lazy, Suspense } from "react";
import Navbar from "./components/NavbarNew";
import Hero from "./components/Hero";
import Top from "./components/Top";
import DonationSection from "./components/DonationSection";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Lazy load below-fold components
const DonationCards = lazy(() => import("./components/DonationCards"));
const Moments = lazy(() => import("./components/Moments"));
const WhySwasthya = lazy(() => import("./components/WhySwasthya"));
const Impact = lazy(() => import("./components/Impact"));
const Working = lazy(() => import("./components/Working"));
const QuoteSection = lazy(() => import("./components/QuoteSection"));
const VideoSection = lazy(() => import("./components/VideoSection.jsx"));
const MealSection = lazy(() => import("./components/MealSection.jsx"));
const AboutSection = lazy(() => import("./components/AboutSection.jsx"));
const StoriesSection = lazy(() => import("./components/StoriesSection.jsx"));
const FeaturedOn = lazy(() => import("./components/FeaturedOn.jsx"));
const Final = lazy(() => import("./components/Final.jsx"));
const FAQsection = lazy(() => import("./components/FAQsection.jsx"));
const Footer = lazy(() => import("./components/Footer.jsx"));
const ThankYouPage = lazy(() => import("./components/Thankyoupage.jsx"));

// Lazy load all admin pages (never needed by donors)
const Login = lazy(() => import("./admin/pages/Login.jsx"));
const Register = lazy(() => import("./admin/pages/Register.jsx"));
const AdminLayout = lazy(() => import("./admin/components/AdminLayout.jsx"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard.jsx"));
const Transactions = lazy(() => import("./admin/pages/Transactions.jsx"));
const Subscriptions = lazy(() => import("./admin/pages/Subscriptions.jsx"));
const Donors = lazy(() => import("./admin/pages/Donors.jsx"));
const Analytics = lazy(() => import("./admin/pages/Analytics.jsx"));
const UtmStats = lazy(() => import("./admin/pages/UtmStats.jsx"));
const Settings = lazy(() => import("./admin/pages/Settings.jsx"));
const Receipts = lazy(() => import("./admin/pages/Receipts.jsx"));
const Campaigns = lazy(() => import("./admin/pages/Campaigns.jsx"));
const ReceiptPreview = lazy(() => import("./pages/ReceiptPreview.js"));

function StickyDonateBar() {
  const [visible, setVisible] = useState(false);
  const [onForm, setOnForm] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.6;

      // Show after scrolling past 60% of viewport
      setVisible(scrollY > heroHeight);

      // Hide when user is on the donation form section
      const form = document.querySelector('.main-section');
      if (form) {
        const formTop = form.getBoundingClientRect().top;
        const formBottom = form.getBoundingClientRect().bottom;
        setOnForm(formTop < window.innerHeight && formBottom > 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    const form = document.querySelector('.main-section');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isHidden = !visible || onForm;

  return (
    <div className={`sticky-donate-bar${isHidden ? ' hidden' : ''}`}>
      <button className="sticky-donate-bar__btn" onClick={scrollToForm}>
        🙏 Donate Now — ₹25 feeds one soul
      </button>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function Home() {
  return (
    <>
      <Top />
      <Navbar />
      <Hero />
      <DonationSection />
      <Suspense fallback={null}>
        <DonationCards />
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
      </Suspense>
      <ScrollToTop />
      <StickyDonateBar />
    </>
  );
}

function App() {
  return (
    <Suspense fallback={null}>
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
    </Suspense>
  );
}

export default App;
