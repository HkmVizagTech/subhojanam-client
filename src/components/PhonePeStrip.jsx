import { useState } from "react";

const PHONEPE_UPI = "hkmivsp9.08@idfcbank";
const WA_NUMBER = "918977761187";
const UPI_DEEP_LINK = `upi://pay?pa=${PHONEPE_UPI}&pn=${encodeURIComponent("HARE KRISHNA MOVEMENT INDIA")}&cu=INR`;
const QR_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(UPI_DEEP_LINK)}`;

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid #e5e7eb", fontSize: "13px",
  boxSizing: "border-box", outline: "none", background: "white",
};

function PhonePeStrip() {
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", amount: "", utr: "" });

  const handlePay = () => {
    // Use anchor tag with UPI deep link — doesn't navigate away on desktop
    const a = document.createElement("a");
    a.href = UPI_DEEP_LINK;
    a.click();
    // Show "Already Paid" form after 2.5s (user returns from PhonePe app)
    setTimeout(() => setShowForm(true), 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(PHONEPE_UPI).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.mobile || !form.amount || !form.utr) {
      alert("Please fill all fields");
      return;
    }
    const msg =
      `Hare Krishna! 🙏\n\nNew PhonePe Donation:\n\nName: ${form.name}\nMobile: ${form.mobile}\nAmount: ₹${form.amount}\nUTR / Ref No: ${form.utr}\n\nPlease verify and generate receipt.`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
    setShowForm(false);
    setForm({ name: "", mobile: "", amount: "", utr: "" });
  };

  return (
    <div style={{ background: "#faf5ff", borderTop: "1px solid #e9d5ff", borderBottom: "1px solid #e9d5ff", padding: "20px 16px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "14px" }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.svg/200px-PhonePe_Logo.svg.png"
            alt="PhonePe"
            style={{ height: "24px", objectFit: "contain" }}
          />
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#5f259f" }}>Prefer PhonePe / UPI?</span>
        </div>

        {/* QR + UPI ID row */}
        <div style={{
          display: "flex", gap: "16px", alignItems: "center",
          background: "white", border: "1px solid #e9d5ff", borderRadius: "14px",
          padding: "16px", marginBottom: "12px", flexWrap: "wrap", justifyContent: "center"
        }}>
          <img
            src={QR_IMAGE_URL}
            alt="Scan to pay via PhonePe/UPI"
            width={130}
            height={130}
            style={{ borderRadius: "10px", border: "1px solid #f0e6ff", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: "160px" }}>
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>📷 Scan with any UPI app</div>
            <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>or use UPI ID</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#5f259f" }}>{PHONEPE_UPI}</div>
              <button onClick={handleCopy} style={{
                background: copied ? "#f0fdf4" : "#5f259f",
                color: copied ? "#166534" : "white",
                border: copied ? "1px solid #86efac" : "none",
                borderRadius: "8px", padding: "5px 11px",
                fontSize: "12px", fontWeight: "600", cursor: "pointer",
                whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s"
              }}>
                {copied ? "✅ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <button onClick={handlePay} style={{
            flex: 1, background: "#5f259f", color: "white", border: "none",
            borderRadius: "10px", padding: "12px", fontSize: "14px",
            fontWeight: "700", cursor: "pointer"
          }}>
            📱 Open in PhonePe App
          </button>
          <button onClick={() => setShowForm(f => !f)} style={{
            flex: 1, background: showForm ? "#5f259f" : "white",
            color: showForm ? "white" : "#5f259f",
            border: "1.5px solid #5f259f", borderRadius: "10px",
            padding: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
            transition: "all 0.2s"
          }}>
            ✅ Already Paid?
          </button>
        </div>

        {/* Success message */}
        {submitted && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px",
            padding: "12px 16px", color: "#166534", fontSize: "13px", textAlign: "center"
          }}>
            🙏 Thank you! Your details have been sent to our team. Receipt will be sent on WhatsApp shortly.
          </div>
        )}

        {/* Already Paid Form */}
        {showForm && !submitted && (
          <div style={{
            background: "white", border: "1px solid #e9d5ff", borderRadius: "12px",
            padding: "16px", marginTop: "4px"
          }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#5f259f", margin: "0 0 12px" }}>
              Share your payment details:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "4px" }}>Full Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "4px" }}>Mobile *</label>
                <input value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder="10-digit number" maxLength={10} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "4px" }}>Amount (₹) *</label>
                <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 2500" type="number" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "4px" }}>PhonePe Ref No. *</label>
                <input value={form.utr} onChange={e => setForm(p => ({ ...p, utr: e.target.value }))} placeholder="UTR / Transaction ID" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleSubmit} style={{
                background: "#5f259f", color: "white", border: "none",
                borderRadius: "8px", padding: "10px 20px",
                fontSize: "13px", fontWeight: "700", cursor: "pointer"
              }}>
                Send via WhatsApp →
              </button>
              <button onClick={() => setShowForm(false)} style={{
                background: "none", border: "1px solid #e5e7eb",
                borderRadius: "8px", padding: "10px 16px",
                fontSize: "13px", cursor: "pointer", color: "#888"
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Note */}
        {!submitted && (
          <p style={{ fontSize: "12px", color: "#999", textAlign: "center", marginTop: "12px", marginBottom: 0 }}>
            After paying, PhonePe may show a redirect screen — tap <strong style={{ color: "#5f259f" }}>Go Back / Done</strong> to return here, then click <strong style={{ color: "#5f259f" }}>Already Paid?</strong> to share your details.
          </p>
        )}

      </div>
    </div>
  );
}

export default PhonePeStrip;
