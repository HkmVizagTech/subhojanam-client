import { useState } from "react"
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Search } from "lucide-react"
import adminAPI from "../../services/adminApi"

function MissedCharges() {
  const [charges, setCharges] = useState([])
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [registering, setRegistering] = useState({})
  const [results, setResults] = useState({})

  const handleScan = async () => {
    try {
      setLoading(true)
      setScanned(false)
      setCharges([])
      setResults({})
      const res = await adminAPI.request("/api/admin/subscriptions/missed-charges")
      setCharges(res.data || [])
      setScanned(true)
    } catch (err) {
      alert("Failed to scan: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (charge) => {
    const key = charge.paymentId
    try {
      setRegistering(prev => ({ ...prev, [key]: true }))
      const res = await adminAPI.request("/api/admin/subscriptions/register-missed-charge", {
        method: "POST",
        body: JSON.stringify({ subscriptionId: charge.subscriptionId, paymentId: charge.paymentId }),
      })
      setResults(prev => ({ ...prev, [key]: { success: true, message: res.message } }))
      setCharges(prev => prev.filter(c => c.paymentId !== key))
    } catch (err) {
      setResults(prev => ({ ...prev, [key]: { success: false, message: err.message } }))
    } finally {
      setRegistering(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleRegisterAll = async () => {
    if (!window.confirm(`Register all ${charges.length} missed charges? This will call DCC API, generate receipts and send WhatsApp for each.`)) return
    for (const charge of charges) {
      await handleRegister(charge)
    }
  }

  const formatDate = (date) => new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  })

  return (
    <div style={{ padding: "24px", maxWidth: "900px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>Missed Subscription Charges</h1>
        <p style={{ color: "#888", fontSize: "14px", marginTop: "6px" }}>
          Scans Razorpay for subscription payments not in your database, then generates receipts and sends WhatsApp for each.
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={handleScan}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#0A97EF", color: "white", border: "none",
            borderRadius: "10px", padding: "10px 20px", fontSize: "14px",
            fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          <Search size={16} />
          {loading ? "Scanning Razorpay..." : "Scan for Missed Charges"}
        </button>

        {charges.length > 0 && (
          <button
            onClick={handleRegisterAll}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#22c55e", color: "white", border: "none",
              borderRadius: "10px", padding: "10px 20px", fontSize: "14px",
              fontWeight: "600", cursor: "pointer"
            }}
          >
            <CheckCircle size={16} />
            Register All ({charges.length})
          </button>
        )}
      </div>

      {/* Summary of completed */}
      {Object.keys(results).length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          {Object.entries(results).map(([key, result]) => (
            <div key={key} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px", borderRadius: "10px", marginBottom: "8px",
              background: result.success ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${result.success ? "#86efac" : "#fca5a5"}`,
              fontSize: "13px", color: result.success ? "#166534" : "#991b1b"
            }}>
              {result.success ? <CheckCircle size={15} /> : <XCircle size={15} />}
              <span><strong>{key}</strong> — {result.message}</span>
            </div>
          ))}
        </div>
      )}

      {scanned && charges.length === 0 && Object.keys(results).length === 0 && (
        <div style={{
          textAlign: "center", padding: "40px", background: "#f0fdf4",
          borderRadius: "16px", border: "1px solid #86efac"
        }}>
          <CheckCircle size={32} color="#22c55e" style={{ marginBottom: "10px" }} />
          <p style={{ color: "#166534", fontWeight: "600", margin: 0 }}>All subscription payments are accounted for!</p>
        </div>
      )}

      {scanned && charges.length === 0 && Object.keys(results).length > 0 && (
        <div style={{
          textAlign: "center", padding: "40px", background: "#f0fdf4",
          borderRadius: "16px", border: "1px solid #86efac"
        }}>
          <CheckCircle size={32} color="#22c55e" style={{ marginBottom: "10px" }} />
          <p style={{ color: "#166534", fontWeight: "600", margin: 0 }}>All missed charges have been registered!</p>
        </div>
      )}

      {charges.length > 0 && (
        <div>
          <div style={{
            background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px",
            padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <AlertCircle size={16} color="#ea580c" />
            <span style={{ fontSize: "13px", color: "#9a3412" }}>
              Found <strong>{charges.length}</strong> unregistered payment{charges.length > 1 ? "s" : ""}. Click Register to process each one.
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {charges.map(charge => (
              <div key={charge.paymentId} style={{
                background: "white", border: "1px solid #e5e7eb", borderRadius: "14px",
                padding: "16px 20px", display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: "16px", flexWrap: "wrap",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e", marginBottom: "4px" }}>
                    {charge.donorName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
                    {charge.donorMobile} · {charge.donorEmail}
                  </div>
                  <div style={{ fontSize: "12px", color: "#555" }}>
                    <span style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: "6px", marginRight: "8px" }}>
                      ₹{charge.amount.toLocaleString("en-IN")}
                    </span>
                    <span style={{ color: "#aaa" }}>{formatDate(charge.date)}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px", fontFamily: "monospace" }}>
                    {charge.paymentId}
                  </div>
                </div>

                <button
                  onClick={() => handleRegister(charge)}
                  disabled={registering[charge.paymentId]}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: registering[charge.paymentId] ? "#e5e7eb" : "#0A97EF",
                    color: registering[charge.paymentId] ? "#888" : "white",
                    border: "none", borderRadius: "10px", padding: "9px 18px",
                    fontSize: "13px", fontWeight: "600",
                    cursor: registering[charge.paymentId] ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {registering[charge.paymentId]
                    ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Processing...</>
                    : <><CheckCircle size={14} /> Register</>
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default MissedCharges
