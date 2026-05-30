import { useState } from "react"
import { CheckCircle, RefreshCw } from "lucide-react"
import adminAPI from "../../services/adminApi"

const PAYMENT_MODES = [
  { value: "phonepe", label: "PhonePe" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
]

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
  "Puducherry","Chandigarh","Andaman and Nicobar Islands","Dadra and Nagar Haveli","Lakshadweep"
]

const defaultForm = {
  name: "", mobile: "", email: "",
  amount: "", offlineRefNo: "", offlinePaymentMode: "bank_transfer",
  paymentDate: new Date().toISOString().split("T")[0],
  certificate: false, panNumber: "",
  address: "", city: "", state: "", pincode: "",
  occasion: "", showInTransactions: true,
}

const s = {
  page: { padding: "24px", maxWidth: "700px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" },
  sub: { color: "#888", fontSize: "14px", margin: "0 0 24px" },
  section: { marginBottom: "24px" },
  sectionTitle: { fontSize: "13px", fontWeight: "700", color: "#555", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  grid1: { display: "grid", gridTemplateColumns: "1fr", gap: "12px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "5px" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "white" },
  select: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "white" },
  required: { color: "#ef4444", marginLeft: "2px" },
}

function OfflineDonation() {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.mobile || !form.amount || !form.offlineRefNo) {
      alert("Name, Mobile, Amount and Reference Number are required")
      return
    }
    try {
      setLoading(true)
      setResult(null)
      const res = await adminAPI.request("/api/admin/transactions/offline", {
        method: "POST",
        body: JSON.stringify(form),
      })
      setResult({ success: true, data: res })
      setForm(defaultForm)
    } catch (err) {
      setResult({ success: false, message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const submitBtnStyle = (loading) => ({
    background: loading ? "#e5e7eb" : "#0A97EF", color: loading ? "#888" : "white",
    border: "none", borderRadius: "12px", padding: "13px 32px",
    fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", gap: "8px"
  })

  return (
    <div style={s.page}>
      <h1 style={s.title}>Offline Donation Entry</h1>
      <p style={s.sub}>Register donations received via PhonePe, bank transfer, cash or cheque.</p>

      {result && (
        <div style={{
          padding: "16px 20px", borderRadius: "12px", marginBottom: "24px",
          background: result.success ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${result.success ? "#86efac" : "#fca5a5"}`,
          color: result.success ? "#166534" : "#991b1b"
        }}>
          {result.success ? (
            <div>
              <div style={{ fontWeight: "700", marginBottom: "6px" }}>✅ Donation registered successfully!</div>
              <div style={{ fontSize: "13px" }}>Donor: <strong>{result.data.donorName}</strong> · Amount: <strong>₹{result.data.amount?.toLocaleString("en-IN")}</strong></div>
              {result.data.receiptNumber && <div style={{ fontSize: "13px" }}>Receipt: <strong>{result.data.receiptNumber}</strong></div>}
              <div style={{ fontSize: "13px", marginTop: "4px" }}>Receipt PDF generated and WhatsApp sent ✅</div>
            </div>
          ) : (
            <div>❌ {result.message}</div>
          )}
        </div>
      )}

      {/* Donor Details */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Donor Details</div>
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Full Name <span style={s.required}>*</span></label>
            <input style={s.input} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rama Krishna Das" />
          </div>
          <div>
            <label style={s.label}>Mobile <span style={s.required}>*</span></label>
            <input style={s.input} name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
          </div>
          <div>
            <label style={s.label}>Email</label>
            <input style={s.input} name="email" value={form.email} onChange={handleChange} placeholder="Optional" />
          </div>
          <div>
            <label style={s.label}>Occasion</label>
            <input style={s.input} name="occasion" value={form.occasion} onChange={handleChange} placeholder="e.g. Birthday, Anniversary" />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Payment Details</div>
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Amount (₹) <span style={s.required}>*</span></label>
            <input style={s.input} name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="e.g. 2500" />
          </div>
          <div>
            <label style={s.label}>Reference / UTR Number <span style={s.required}>*</span></label>
            <input style={s.input} name="offlineRefNo" value={form.offlineRefNo} onChange={handleChange} placeholder="PhonePe/Bank UTR/Cheque No." />
          </div>
          <div>
            <label style={s.label}>Payment Mode</label>
            <select style={s.select} name="offlinePaymentMode" value={form.offlinePaymentMode} onChange={handleChange}>
              {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Payment Date</label>
            <input style={s.input} name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* 80G Certificate */}
      <div style={s.section}>
        <div style={s.sectionTitle}>80G Certificate</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <input type="checkbox" id="certificate" name="certificate" checked={form.certificate} onChange={handleChange} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
          <label htmlFor="certificate" style={{ fontSize: "14px", cursor: "pointer" }}>Donor wants 80G certificate</label>
        </div>
        {form.certificate && (
          <div style={s.grid2}>
            <div>
              <label style={s.label}>PAN Number</label>
              <input style={s.input} name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="e.g. ABCDE1234F" maxLength={10} />
            </div>
            <div>
              <label style={s.label}>Address</label>
              <input style={s.input} name="address" value={form.address} onChange={handleChange} placeholder="Door No, Street" />
            </div>
            <div>
              <label style={s.label}>City</label>
              <input style={s.input} name="city" value={form.city} onChange={handleChange} placeholder="City" />
            </div>
            <div>
              <label style={s.label}>State</label>
              <select style={s.select} name="state" value={form.state} onChange={handleChange}>
                <option value="">Select State</option>
                {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Pincode</label>
              <input style={s.input} name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} />
            </div>
          </div>
        )}
      </div>

      {/* Visibility */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Transaction Visibility</div>
        <div style={{ display: "flex", gap: "12px" }}>
          {[
            { value: true, label: "Show in Transactions", desc: "Visible in main Transactions tab" },
            { value: false, label: "Separate (Offline Only)", desc: "Only visible in Offline filter" },
          ].map(opt => (
            <label key={String(opt.value)} style={{
              flex: 1, display: "flex", alignItems: "flex-start", gap: "10px",
              background: form.showInTransactions === opt.value ? "#eff6ff" : "#f9fafb",
              border: `1.5px solid ${form.showInTransactions === opt.value ? "#0A97EF" : "#e5e7eb"}`,
              borderRadius: "12px", padding: "12px 14px", cursor: "pointer"
            }}>
              <input
                type="radio"
                name="showInTransactions"
                checked={form.showInTransactions === opt.value}
                onChange={() => setForm(p => ({ ...p, showInTransactions: opt.value }))}
                style={{ marginTop: "2px", flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a2e" }}>{opt.label}</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading} style={submitBtnStyle(loading)}>
        {loading
          ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Processing...</>
          : <><CheckCircle size={16} /> Register Donation & Send Receipt</>
        }
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default OfflineDonation
