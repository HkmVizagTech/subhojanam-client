import { useState } from "react";
import "../styles/bankdonation.css";

const BANK_DETAILS = `Beneficiary Name: HARE KRISHNA MOVEMENT INDIA\nBank Name: IDFC FIRST BANK LTD\nAccount No: 10091415313\nIFSC Code: IDFB0080412`;

const PHONEPE_UPI = "9666399108@ybl";
const PHONEPE_NUMBER = "9666399108";
const PHONEPE_NAME = "HARE KRISHNA MOVEMENT INDIA";

function BankDonation() {
  const [copied, setCopied] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [showPaidForm, setShowPaidForm] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", amount: "", utr: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    const upiUrl = `upi://pay?pa=${PHONEPE_UPI}&pn=${encodeURIComponent(PHONEPE_NAME)}&cu=INR`;
    window.location.href = upiUrl;
    setTimeout(() => setShowPaidForm(true), 2000);
  };

  const handleSubmitUTR = async () => {
    if (!form.name || !form.mobile || !form.amount || !form.utr) {
      alert("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const waMsg = `Hare Krishna! 🙏\n\nNew PhonePe Donation Received:\n\nName: ${form.name}\nMobile: ${form.mobile}\nAmount: ₹${form.amount}\nUTR/Ref No: ${form.utr}\n\nPlease verify and generate receipt.`;
      window.open(`https://wa.me/918977761187?text=${encodeURIComponent(waMsg)}`, "_blank");
      setSubmitted(true);
      setShowPaidForm(false);
    } catch (err) {
      alert("Something went wrong. Please contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bank-donation-section">

      {/* PhonePe Section */}
      <div className="bank-donation-box" style={{ marginBottom: "20px" }}>
        <h2 className="bank-donation-title">Donate via PhonePe / UPI</h2>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.svg/200px-PhonePe_Logo.svg.png"
            alt="PhonePe"
            style={{ height: "36px", objectFit: "contain" }}
          />
          <div>
            <div style={{ fontSize: "13px", color: "#888" }}>UPI ID</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#5f259f", letterSpacing: "0.5px" }}>{PHONEPE_UPI}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
          <button
            onClick={handlePhonePePay}
            style={{
              background: "#5f259f", color: "white", border: "none", borderRadius: "10px",
              padding: "11px 20px", fontSize: "14px", fontWeight: "700", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            📱 Pay via PhonePe
          </button>
          <button
            onClick={handleCopyUPI}
            style={{
              background: upiCopied ? "#f0fdf4" : "#f3f4f6", color: upiCopied ? "#166534" : "#555",
              border: `1px solid ${upiCopied ? "#86efac" : "#e5e7eb"}`, borderRadius: "10px",
              padding: "11px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer"
            }}
          >
            {upiCopied ? "✅ Copied!" : "📋 Copy UPI ID"}
          </button>
        </div>

        {submitted ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "14px 16px", color: "#166534", fontSize: "14px" }}>
            🙏 Thank you! Your payment details have been sent to our team on WhatsApp. We will generate your receipt shortly.
          </div>
        ) : showPaidForm ? (
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#5f259f", margin: "0 0 12px" }}>🙏 Thank you for your donation! Please share your details:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              {[
                { name: "name", placeholder: "Your Full Name", label: "Name *" },
                { name: "mobile", placeholder: "10-digit Mobile", label: "Mobile *" },
                { name: "amount", placeholder: "Amount Paid (₹)", label: "Amount *" },
                { name: "utr", placeholder: "UTR / Transaction ID", label: "PhonePe Ref No. *" },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#666", display: "block", marginBottom: "4px" }}>{f.label}</label>
                  <input
                    value={form[f.name]}
                    onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleSubmitUTR}
                disabled={submitting}
                style={{ background: "#5f259f", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
              >
                {submitting ? "Sending..." : "Send via WhatsApp →"}
              </button>
              <button
                onClick={() => setShowPaidForm(false)}
                style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", cursor: "pointer", color: "#888" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowPaidForm(true)}
            style={{ background: "none", border: "1px solid #5f259f", color: "#5f259f", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
          >
            ✅ Already Paid? Click here
          </button>
        )}

        <div className="bank-note" style={{ marginTop: "16px" }}>
          <span className="bank-note-icon">🙏</span>
          <p>
            <strong>Gentle Request!</strong> After paying, please use the <strong>"Already Paid?"</strong> button above to share your transaction details. 
            Our team will verify and send your receipt on WhatsApp within a few hours.
          </p>
        </div>
      </div>

      {/* Bank Transfer Section */}
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
        <button className={`bank-copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
          {copied ? "✅ Copied!" : "📋 Copy Bank Details"}
        </button>
        <div className="bank-note">
          <span className="bank-note-icon">🙏</span>
          <p>
            <strong>Gentle Request!</strong> After transferring, please send us a screenshot along with your
            complete address and PAN details on our WhatsApp{" "}
            <a href="https://wa.me/918977761187" target="_blank" rel="noopener noreferrer">+91 89777 61187</a>{" "}
            or email us at{" "}
            <a href="mailto:mukunda@hkmvizag.org">mukunda@hkmvizag.org</a>.
          </p>
        </div>
      </div>

    </section>
  );
}

export default BankDonation;
