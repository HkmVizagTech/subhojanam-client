import { useState } from "react";

const PHONEPE_UPI = "9666399108@ybl";
const WA_NUMBER = "918977761187";

function PhonePeStrip() {
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", amount: "", utr: "" });

  const handlePay = () => {
    const upiUrl = `upi://pay?pa=${PHONEPE_UPI}&pn=${encodeURIComponent("HARE KRISHNA MOVEMENT INDIA")}&cu=INR`;
    window.location.href = upiUrl;
    setTimeout(() => setShowForm(true), 2000);
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
    const msg = `Hare Krishna! 🙏\n\nNew PhonePe Donation:\n\nName: ${form.name}\nMobile: ${form.mobile}\nAmount: ₹${form.amount}\nUTR / Ref No: ${form.utr}\n\nPlease verify and generate receipt.`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
    setShowForm(false);
    setForm({ name: "", mobile: "", amount: "", utr: "" });
  };

  return (
    <div style={{
      background: "#faf5ff",
      borderTop: "1px solid #e9d5ff",
      borderBottom: "1px solid #e9d5ff",
      padding: "20px 16px",
    }}>
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

        {/* UPI ID row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "white", border: "1px solid #e9d5ff", borderRadius: "12px",
          padding: "12px 16px", marginBottom: "12px", gap: "12px"
        }}>
          <div>
            <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>UPI ID</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#5f259f" }}>{PHONEPE_UPI}</div>
          </div>
          <button onClick={handleCopy} style={{
            background: copied ? "#f0fdf4" : "#5f259f",
            color: copied ? "#166534" : "white",
            border: copied ? "1px solid #86efac" : "none",
            borderRadius: "8px", padding: "8px 14px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0
          }}>
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <button onClick={handlePay} style={{
            flex: 1, background: "#5f259f", color: "white", border: "none",
            borderRadius: "10px", padding: "12px", fontSize: "14px",
            fontWeight: "700", cursor: "pointer"
          }}>
            📱 Open PhonePe App
          </button>
          <button onClick={() => setShowForm(f => !f)} style={{
            flex: 1, background: "white", color: "#5f259f",
            border: "1.5px solid #5f259f", borderRadius: "10px",
            padding: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer"
          }}>
            ✅ Already Paid?
          </button>
        </div>

        {/* Success */}
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
              {[
                { key: "name", label: "Full Name *", placeholder: "Your name" },
                { key: "mobile", label: "Mobile *", placeholder: "10-digit number" },
                { key: "amount", label: "Amount (₹) *", placeholder: "e.g. 2500" },
                { key: "utr", label: "PhonePe Ref No. *", placeholder: "UTR / Transaction ID" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "4px" }}>{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: "8px",
                      border: "1px solid #e5e7eb", fontSize: "13px",
                      boxSizing: "border-box", outline: "none"
                    }}
                  />
                </div>
              ))}
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

      </div>
    </div>
  );
}

export default PhonePeStrip;
