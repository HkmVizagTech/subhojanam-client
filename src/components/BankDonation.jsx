import { useState } from "react";
import "../styles/bankdonation.css";

const BANK_DETAILS = `Beneficiary Name: HARE KRISHNA MOVEMENT INDIA\nBank Name: IDFC FIRST BANK LTD\nAccount No: 10091415313\nIFSC Code: IDFB0080412`;

function BankDonation() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_DETAILS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section className="bank-donation-section">
      <div className="bank-donation-box">
        <h2 className="bank-donation-title">Donation Through Bank (NEFT / RTGS)</h2>
        <div className="bank-details-grid">
          <div className="bank-row">
            <span className="bank-label">Beneficiary Name</span>
            <span className="bank-value">HARE KRISHNA MOVEMENT INDIA</span>
          </div>
          <div className="bank-row">
            <span className="bank-label">Bank Name</span>
            <span className="bank-value">IDFC FIRST BANK LTD</span>
          </div>
          <div className="bank-row">
            <span className="bank-label">Account No</span>
            <span className="bank-value">10091415313</span>
          </div>
          <div className="bank-row">
            <span className="bank-label">IFSC Code</span>
            <span className="bank-value">IDFB0080412</span>
          </div>
        </div>
        <button className={`bank-copy-btn${copied ? " copied" : ""}`} onClick={handleCopy}>
          {copied ? "✅ Copied!" : "📋 Copy Bank Details"}
        </button>
        <div className="bank-note">
          <span className="bank-note-icon">🙏</span>
          <p>
            After transferring, please send us a screenshot with your address and PAN on{" "}
            <a href="https://wa.me/918977761187" target="_blank" rel="noopener noreferrer">WhatsApp +91 89777 61187</a>{" "}
            or email <a href="mailto:mukunda@hkmvizag.org">mukunda@hkmvizag.org</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

export default BankDonation;
