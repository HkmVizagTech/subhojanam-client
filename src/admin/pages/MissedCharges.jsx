import { useState } from "react"
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Search, FileText } from "lucide-react"
import adminAPI from "../../services/adminApi"

function MissedCharges() {
  const [tab, setTab] = useState("unreceipted")
  const [unreceipted, setUnreceipted] = useState([])
  const [unreceiptedLoading, setUnreceiptedLoading] = useState(false)
  const [unreceiptedScanned, setUnreceiptedScanned] = useState(false)
  const [unreceiptedProcessing, setUnreceiptedProcessing] = useState({})
  const [unreceiptedResults, setUnreceiptedResults] = useState({})
  const [charges, setCharges] = useState([])
  const [chargesLoading, setChargesLoading] = useState(false)
  const [chargesScanned, setChargesScanned] = useState(false)
  const [registering, setRegistering] = useState({})
  const [chargeResults, setChargeResults] = useState({})

  const formatDate = (date) => new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  })

  const scanUnreceipted = async () => {
    try {
      setUnreceiptedLoading(true); setUnreceiptedScanned(false); setUnreceipted([]); setUnreceiptedResults({})
      const res = await adminAPI.request("/api/admin/subscriptions/unreceipted-charges")
      setUnreceipted(res.data || []); setUnreceiptedScanned(true)
    } catch (err) { alert("Scan failed: " + err.message) }
    finally { setUnreceiptedLoading(false) }
  }

  const generateReceipt = async (item) => {
    const key = item.donationId
    try {
      setUnreceiptedProcessing(prev => ({ ...prev, [key]: true }))
      const res = await adminAPI.request("/api/admin/subscriptions/generate-missing-receipt", {
        method: "POST", body: JSON.stringify({ donationId: key }),
      })
      setUnreceiptedResults(prev => ({ ...prev, [key]: { success: true, message: res.message } }))
      setUnreceipted(prev => prev.filter(u => u.donationId !== key))
    } catch (err) { setUnreceiptedResults(prev => ({ ...prev, [key]: { success: false, message: err.message } })) }
    finally { setUnreceiptedProcessing(prev => ({ ...prev, [key]: false })) }
  }

  const generateAll = async () => {
    if (!window.confirm(`Generate receipts for all ${unreceipted.length} donations?`)) return
    for (const item of unreceipted) await generateReceipt(item)
  }

  const scanMissed = async () => {
    try {
      setChargesLoading(true); setChargesScanned(false); setCharges([]); setChargeResults({})
      const res = await adminAPI.request("/api/admin/subscriptions/missed-charges")
      setCharges(res.data || []); setChargesScanned(true)
    } catch (err) { alert("Scan failed: " + err.message) }
    finally { setChargesLoading(false) }
  }

  const registerCharge = async (charge) => {
    const key = charge.paymentId
    try {
      setRegistering(prev => ({ ...prev, [key]: true }))
      const res = await adminAPI.request("/api/admin/subscriptions/register-missed-charge", {
        method: "POST", body: JSON.stringify({ subscriptionId: charge.subscriptionId, paymentId: charge.paymentId }),
      })
      setChargeResults(prev => ({ ...prev, [key]: { success: true, message: res.message } }))
      setCharges(prev => prev.filter(c => c.paymentId !== key))
    } catch (err) { setChargeResults(prev => ({ ...prev, [key]: { success: false, message: err.message } })) }
    finally { setRegistering(prev => ({ ...prev, [key]: false })) }
  }

  const registerAll = async () => {
    if (!window.confirm(`Register all ${charges.length} missed payments?`)) return
    for (const charge of charges) await registerCharge(charge)
  }

  const s = {
    page: { padding: "24px", maxWidth: "900px" },
    title: { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: 0 },
    sub: { color: "#888", fontSize: "14px", marginTop: "6px" },
    tabActive: { padding: "9px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", border: "none", background: "#0A97EF", color: "white" },
    tabInactive: { padding: "9px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", border: "none", background: "#f3f4f6", color: "#555" },
    scanBtn: (loading) => ({ display: "flex", alignItems: "center", gap: "8px", background: "#0A97EF", color: "white", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }),
    allBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#22c55e", color: "white", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
    actionBtn: (loading) => ({ display: "flex", alignItems: "center", gap: "6px", background: loading ? "#e5e7eb" : "#0A97EF", color: loading ? "#888" : "white", border: "none", borderRadius: "10px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }),
    card: { background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
    warning: { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" },
    success: { textAlign: "center", padding: "40px", background: "#f0fdf4", borderRadius: "16px", border: "1px solid #86efac" },
  }

  const ResultBanners = ({ results }) => (
    <div style={{ marginBottom: "16px" }}>
      {Object.entries(results).map(([key, r]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "10px", marginBottom: "6px", background: r.success ? "#f0fdf4" : "#fef2f2", border: `1px solid ${r.success ? "#86efac" : "#fca5a5"}`, fontSize: "13px", color: r.success ? "#166534" : "#991b1b" }}>
          {r.success ? <CheckCircle size={14} /> : <XCircle size={14} />} {r.message}
        </div>
      ))}
    </div>
  )

  const SuccessBox = ({ msg }) => (
    <div style={s.success}>
      <CheckCircle size={32} color="#22c55e" style={{ marginBottom: "10px" }} />
      <p style={{ color: "#166534", fontWeight: "600", margin: 0 }}>{msg}</p>
    </div>
  )

  const DonorCard = ({ item, onAction, processing, actionLabel }) => (
    <div style={s.card}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e", marginBottom: "4px" }}>{item.donorName}</div>
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>{item.donorMobile} · {item.donorEmail}</div>
        <div style={{ fontSize: "12px", color: "#555" }}>
          <span style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: "6px", marginRight: "8px" }}>₹{item.amount?.toLocaleString("en-IN")}</span>
          <span style={{ color: "#aaa" }}>{formatDate(item.date)}</span>
        </div>
        {item.paymentId && <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px", fontFamily: "monospace" }}>{item.paymentId}</div>}
      </div>
      <button onClick={onAction} disabled={processing} style={s.actionBtn(processing)}>
        {processing ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Processing...</> : <><CheckCircle size={14} /> {actionLabel}</>}
      </button>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={s.title}>Missed Subscription Charges</h1>
        <p style={s.sub}>Find and fix subscription payments with missing records or missing receipts.</p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <button style={tab === "unreceipted" ? s.tabActive : s.tabInactive} onClick={() => setTab("unreceipted")}>📄 Missing Receipts</button>
        <button style={tab === "missed" ? s.tabActive : s.tabInactive} onClick={() => setTab("missed")}>🔍 Missing Records</button>
      </div>

      {tab === "unreceipted" && (
        <div>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>Finds paid subscription donations in DB with no receipt yet. Calls DCC API → generates receipt → sends WhatsApp.</p>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button onClick={scanUnreceipted} disabled={unreceiptedLoading} style={s.scanBtn(unreceiptedLoading)}>
              <Search size={16} />{unreceiptedLoading ? "Scanning..." : "Scan for Missing Receipts"}
            </button>
            {unreceipted.length > 0 && <button onClick={generateAll} style={s.allBtn}><FileText size={16} />Generate All ({unreceipted.length})</button>}
          </div>
          {Object.keys(unreceiptedResults).length > 0 && <ResultBanners results={unreceiptedResults} />}
          {unreceiptedScanned && unreceipted.length === 0 && <SuccessBox msg={Object.keys(unreceiptedResults).length > 0 ? "All receipts generated and sent!" : "All subscription receipts are already generated!"} />}
          {unreceipted.length > 0 && (
            <div>
              <div style={s.warning}><AlertCircle size={16} color="#ea580c" /><span style={{ fontSize: "13px", color: "#9a3412" }}><strong>{unreceipted.length}</strong> subscription payment{unreceipted.length > 1 ? "s" : ""} with no receipt.</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {unreceipted.map(item => <DonorCard key={item.donationId} item={{ ...item, paymentId: item.paymentId }} onAction={() => generateReceipt(item)} processing={unreceiptedProcessing[item.donationId]} actionLabel="Generate" />)}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "missed" && (
        <div>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>Scans Razorpay for subscription payments with no record in DB. Creates record, calls DCC API, generates receipt, sends WhatsApp.</p>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button onClick={scanMissed} disabled={chargesLoading} style={s.scanBtn(chargesLoading)}>
              <Search size={16} />{chargesLoading ? "Scanning Razorpay..." : "Scan for Missing Records"}
            </button>
            {charges.length > 0 && <button onClick={registerAll} style={s.allBtn}><CheckCircle size={16} />Register All ({charges.length})</button>}
          </div>
          {Object.keys(chargeResults).length > 0 && <ResultBanners results={chargeResults} />}
          {chargesScanned && charges.length === 0 && <SuccessBox msg={Object.keys(chargeResults).length > 0 ? "All missed charges registered!" : "All subscription payments are accounted for!"} />}
          {charges.length > 0 && (
            <div>
              <div style={s.warning}><AlertCircle size={16} color="#ea580c" /><span style={{ fontSize: "13px", color: "#9a3412" }}><strong>{charges.length}</strong> unregistered payment{charges.length > 1 ? "s" : ""} found in Razorpay.</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {charges.map(charge => <DonorCard key={charge.paymentId} item={{ ...charge, paymentId: charge.paymentId }} onAction={() => registerCharge(charge)} processing={registering[charge.paymentId]} actionLabel="Register" />)}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default MissedCharges
