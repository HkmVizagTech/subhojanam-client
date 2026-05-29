import { useState } from "react";
import "../styles/bankdonation.css";

const BANK_DETAILS = `Beneficiary Name: HARE KRISHNA MOVEMENT INDIA\nBank Name: IDFC FIRST BANK LTD\nAccount No: 10091415313\nIFSC Code: IDFB0080412`;
const PHONEPE_UPI = "9666399108@ybl";
const WA_NUMBER = "918977761187";

function BankDonation() {
  const [copied, setCopied] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [showPaidForm, setShowPaidForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", amount: "", utr: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_DETAILS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(PHONEPE_UPI).then(() => {
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2500);
    });
  };

  const handlePhonePePay = () => {
    const upiUrl = `upi://pay?pa=${PHONEPE_UPI}&pn=${encodeURIComponent("HARE KRISHNA MOVEMENT INDIA")}&cu=INR`;
    window.location.href = upiUrl;
    setTimeout(() => setShowPaidForm(true), 2000);
  };

  const handleSubmit = () => {
    if (!form.name || !form.mobile || !form.amount || !form.utr) {
      alert("Please fill all fields");
      return;
    }
    setSubmitting(true);
    const msg = `Hare Krishna! 🙏\n\nNew PhonePe Donation:\n\nName: ${form.name}\nMobile: ${form.mobile}\nAmount: ₹${form.amount}\nUTR / Ref No: ${form.utr}\n\nPlease verify and generate receipt.`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
    setShowPaidForm(false);
    setSubmitting(false);
  };

  return (
    <section className="bank-donation-section">

      {/* PhonePe Box */}
      <div className="bank-donation-box">
        <h2 className="bank-donation-title">Donate via PhonePe / UPI</h2>

        <div className="phonepe-header">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.svg/200px-PhonePe_Logo.svg.png"
            alt="PhonePe"
            className="phonepe-logo"
          />
          <div>
            <p className="phonepe-upi-label">UPI ID</p>
            <p className="phonepe-upi-value">{PHONEPE_UPI}</p>
          </div>
        </div>

        <div className="phonepe-buttons">
          <button className="phonepe-pay-btn" onClick={handlePhonePePay}>
            📱 Pay via PhonePe
          </button>
          <button
            className={`phonepe-copy-btn${upiCopied ? " copied" : ""}`}
            onClick={handleCopyUPI}
          >
            {upiCopied ? "✅ Copied!" : "📋 Copy UPI ID"}
          </button>
        </div>

        {submitted ? (
          <div className="paid-success">
            🙏 Thank you! Your details have been sent to our team on WhatsApp. We will generate your receipt shortly.
          </div>
        ) : showPaidForm ? (
          <div className="paid-form">
            <p className="paid-form-title">🙏 Thank you! Please share your payment details:</p>
            <div className="paid-form-grid">
              <div className="paid-form-field">
                <label>Full Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div className="paid-form-field">
                <label>Mobile *</label>
                <input value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder="10-digit number" maxLength={10} />
              </div>
              <div className="paid-form-field">
                <label>Amount Paid (₹) *</label>
                <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 2500" type="number" />
              </div>
              <div className="paid-form-field">
                <label>PhonePe Ref No. *</label>
                <input value={form.utr} onChange={e => setForm(p => ({ ...p, utr: e.target.value }))} placeholder="UTR / Transaction ID" />
              </div>
            </div>
            <div className="paid-form-actions">
              <button className="paid-submit-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Sending..." : "Send via WhatsApp →"}
              </button>
              <button className="paid-cancel-btn" onClick={() => setShowPaidForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="phonepe-paid-btn" onClick={() => setShowPaidForm(true)}>
            ✅ Already Paid? Click here to share details
          </button>
        )}

        <div className="bank-note">
          <span className="bank-note-icon">🙏</span>
          <p>
            After paying, click <strong>"Already Paid?"</strong> to share your details.
            Our team will verify and send your receipt on WhatsApp within a few hours.
          </p>
        </div>
      </div>

      {/* Bank Transfer Box */}
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
