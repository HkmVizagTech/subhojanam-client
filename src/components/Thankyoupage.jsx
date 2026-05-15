import { CheckCircle, Heart, Utensils, ArrowLeft, Download, Share2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/thankyou.css";
import logo from "../assets/logo.png"

const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  
  const donationId = searchParams.get("donationId");
  const hasCertificate = searchParams.get("certificate") === "true";

  const paymentDetails = {
    transactionId: searchParams.get("txn") || "TXN2026021998765",
    amount: searchParams.get("amount") || "1,100",
    name: searchParams.get("name") || "Devotee",
    email: searchParams.get("email") || "devotee@example.com",
    date: searchParams.get("date") || new Date().toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric",
    }),
    seva: "Annadana Seva",
    method: searchParams.get("method") || "UPI",
  };

  // Fire GA4 purchase event on page load
  useEffect(() => {
    try {
      if (typeof window.gtag === "function" && paymentDetails.transactionId) {
        window.gtag("event", "purchase", {
          transaction_id: paymentDetails.transactionId,
          value: parseFloat(String(paymentDetails.amount).replace(/,/g, "")) || 0,
          currency: "INR",
          items: [{
            item_id: "annadana-seva",
            item_name: "Annadana Seva Donation",
            quantity: 1,
            price: parseFloat(String(paymentDetails.amount).replace(/,/g, "")) || 0,
          }],
        });
      }
    } catch (e) {
      console.error("GA4 purchase event error:", e);
    }
  }, []);

  const handleWhatsAppShare = () => {
    const meals = Math.floor(
      parseFloat(String(paymentDetails.amount).replace(/,/g, "")) / 25
    ) || 20;
    const message = `🙏 I just donated ₹${paymentDetails.amount} through ISKCON Visakhapatnam's Annadana Seva and fed ${meals} people today!\n\nYou can also offer your seva here:\nhttps://annadan.harekrishnavizag.org\n\nHare Krishna! 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleDownloadReceipt = async () => {
    if (!donationId || !hasCertificate) {
      alert("Receipt download not available for this donation");
      return;
    }

    setDownloading(true);
    try {
  const response = await fetch(`https://subhojanam-server-main-882278565284.asia-south1.run.app/api/payment/download-receipt/${donationId}`);
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Receipt not ready yet. Please wait a moment and try again.");
        setDownloading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `80G_Receipt_${paymentDetails.transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloading(false);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download receipt. Please try again later.");
      setDownloading(false);
    }
  };

  const details = [
    { label: "Transaction ID", value: paymentDetails.transactionId },
    { label: "Donor Name", value: paymentDetails.name },
    { label: "Email", value: paymentDetails.email },
    { label: "Seva", value: paymentDetails.seva },
    { label: "Payment Method", value: paymentDetails.method },
    { label: "Date", value: paymentDetails.date },
  ];

  return (
    <div className="thankyou-page">
      <div className="thankyou-top-bar" />

      <div className="thankyou-container">
        <div className="thankyou-header">
          <div className="thankyou-logo">
            <img src={logo} alt="Annadana Seva Logo" />
          </div>
          <h1 className="thankyou-title">Hare Krishna! 🙏</h1>
        </div>

        <div className="thankyou-heading">
          <p className="subtitle">Thank You for Your Generous Donation</p>
        </div>

        <div className="message-card">
          <div className="message-card-header">
            <div className="message-card-icon">
              <Utensils />
            </div>
            <div>
              <h2 className="message-card-title">Annadana Seva</h2>
              <p className="message-card-text">
                Your contribution will help provide <strong>free nutritious meals</strong> to needy people and patient attendants at government hospitals through ISKCON Visakhapatnam's Annadana Seva program.
              </p>
            </div>
          </div>
          <div className="quote-box">
            <p>"Annadānam Mahādānam" — The gift of food is the greatest gift.</p>
          </div>
        </div>

        <div className="amount-card">
          <p className="amount-label">Amount Donated</p>
          <p className="amount-value">₹{paymentDetails.amount}</p>
          <p className="amount-blessing">May Lord Krishna bless you abundantly</p>
        </div>

        <div className="payment-details-card">
          <h3 className="payment-details-title">Payment Details</h3>
          {details.map((item) => (
            <div key={item.label} className="payment-detail-row">
              <span className="payment-detail-label">{item.label}</span>
              <span className="payment-detail-value">{item.value}</span>
            </div>
          ))}
          <div className="payment-total">
            <span className="payment-total-label">Total Amount</span>
            <span className="payment-total-value">₹{paymentDetails.amount}</span>
          </div>
        </div>

        <div className="thankyou-actions">
          {hasCertificate && donationId && (
            <button 
              className="btn-download" 
              onClick={handleDownloadReceipt}
              disabled={downloading}
            >
              <Download />
              {downloading ? "Downloading..." : "Download 80G Receipt"}
            </button>
          )}
          <button className="btn-whatsapp" onClick={handleWhatsAppShare}>
            <Share2 />
            Share on WhatsApp
          </button>
          <a href="/" className="btn-back">
            <ArrowLeft />
            Back to Home
          </a>
        </div>

        <p className="thankyou-footer">
          A confirmation has been sent to {paymentDetails.email}.<br />
          {hasCertificate && "Your 80G receipt will also be sent via WhatsApp shortly."}<br />
          For queries, contact{" "}
          <a href="mailto:mukunda@hkmvizag.org">mukunda@hkmvizag.org</a>
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage;
