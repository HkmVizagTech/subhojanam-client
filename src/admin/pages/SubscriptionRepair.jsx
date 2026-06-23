import { useState } from "react"
import adminAPI from "../../services/adminApi"

function SubscriptionRepair() {
  const [diagnosing, setDiagnosing] = useState(false)
  const [mismatches, setMismatches] = useState(null)
  const [fixing, setFixing] = useState("")
  const [syncSub, setSyncSub] = useState("")
  const [syncPay, setSyncPay] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [log, setLog] = useState([])

  const addLog = (msg) => setLog(prev => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev])

  const diagnose = async () => {
    setDiagnosing(true)
    try {
      const res = await adminAPI.request("/api/admin/subscription-repair/diagnose")
      setMismatches(res.mismatches || [])
      addLog(`Found ${res.count} mismatched records`)
    } catch (e) {
      addLog("Diagnose failed: " + e.message)
    } finally {
      setDiagnosing(false)
    }
  }

  const fixSub = async (subscriptionId) => {
    setFixing(subscriptionId)
    try {
      const res = await adminAPI.request("/api/admin/subscription-repair/fix", {
        method: "POST",
        body: JSON.stringify({ subscriptionId }),
      })
      addLog(`Fixed ${res.correctedCount} records for ${subscriptionId} → ${res.canonicalDonor?.name}`)
      diagnose()
    } catch (e) {
      addLog("Fix failed: " + e.message)
    } finally {
      setFixing("")
    }
  }

  const syncCharge = async () => {
    if (!syncSub || !syncPay) { alert("Enter both subscription ID and payment ID"); return }
    setSyncing(true)
    try {
      const res = await adminAPI.request("/api/admin/subscription-repair/sync-charge", {
        method: "POST",
        body: JSON.stringify({ subscriptionId: syncSub.trim(), paymentId: syncPay.trim() }),
      })
      addLog(res.message + (res.donor ? ` (${res.donor}, ₹${res.amount})` : ""))
      setSyncSub(""); setSyncPay("")
    } catch (e) {
      addLog("Sync failed: " + e.message)
    } finally {
      setSyncing(false)
    }
  }

  const [verifyId, setVerifyId] = useState("")
  const [verifyResult, setVerifyResult] = useState(null)
  const [verifying, setVerifying] = useState(false)

  const verifyPayment = async () => {
    if (!verifyId) { alert("Enter payment ID"); return }
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await adminAPI.request(`/api/admin/subscription-repair/verify?paymentId=${verifyId.trim()}`)
      setVerifyResult(res)
      addLog(`Verified ${verifyId}: Razorpay=${res.razorpay?.contact}, DB=${res.ourDbRecord?.name}`)
    } catch (e) {
      addLog("Verify failed: " + e.message)
    } finally {
      setVerifying(false)
    }
  }

  const box = { background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "20px", marginBottom: "20px" }
  const btn = { background: "#0A97EF", color: "white", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }
  const input = { padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }

  return (
    <div style={{ padding: "24px", maxWidth: "900px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "6px" }}>Subscription Repair</h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>Diagnose and fix wrong donor names on recurring charges, and sync missing subscription payments.</p>

      {/* Diagnose */}
      <div style={box}>
        <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>1. Diagnose Wrong Names</h3>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "14px" }}>Finds recurring charges whose donor name/mobile differs from the original subscription signup.</p>
        <button style={btn} onClick={diagnose} disabled={diagnosing}>
          {diagnosing ? "Scanning..." : "Run Diagnosis"}
        </button>

        {mismatches && mismatches.length === 0 && (
          <p style={{ marginTop: "14px", color: "#16a34a", fontWeight: "600" }}>✅ No mismatches found — all clean!</p>
        )}

        {mismatches && mismatches.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ fontSize: "13px", color: "#dc2626", fontWeight: "600", marginBottom: "10px" }}>{mismatches.length} mismatched records found:</p>
            {Object.values(mismatches.reduce((acc, m) => { acc[m.subscriptionId] = acc[m.subscriptionId] || { sub: m.subscriptionId, original: m, items: [] }; acc[m.subscriptionId].items.push(m); return acc }, {})).map(group => (
              <div key={group.sub} style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                <div style={{ fontSize: "12px", fontFamily: "monospace", color: "#991b1b", marginBottom: "6px" }}>{group.sub}</div>
                <div style={{ fontSize: "13px", marginBottom: "6px" }}>
                  Wrong: <strong>{group.items[0].recordName}</strong> ({group.items[0].recordMobile}) → Should be: <strong style={{ color: "#16a34a" }}>{group.items[0].originalName}</strong> ({group.items[0].originalMobile})
                </div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>{group.items.length} affected charge(s)</div>
                <button style={{ ...btn, background: "#16a34a", padding: "7px 14px", fontSize: "13px" }} onClick={() => fixSub(group.sub)} disabled={fixing === group.sub}>
                  {fixing === group.sub ? "Fixing..." : "Fix This Subscription"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync missing charge */}
      <div style={box}>
        <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>2. Sync Missing Charge</h3>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "14px" }}>If a monthly charge happened in Razorpay but isn't in our system, enter the subscription ID and payment ID to pull it in.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "420px" }}>
          <input style={input} placeholder="Subscription ID (sub_xxx)" value={syncSub} onChange={e => setSyncSub(e.target.value)} />
          <input style={input} placeholder="Payment ID (pay_xxx)" value={syncPay} onChange={e => setSyncPay(e.target.value)} />
          <button style={btn} onClick={syncCharge} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync This Charge"}
          </button>
        </div>
      </div>

      {/* Verify payment */}
      <div style={box}>
        <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>0. Verify Payment (Razorpay vs DB)</h3>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "14px" }}>Check what Razorpay says about a payment and compare with our database record.</p>
        <div style={{ display: "flex", gap: "10px", maxWidth: "520px" }}>
          <input style={input} placeholder="Payment ID (pay_xxx)" value={verifyId} onChange={e => setVerifyId(e.target.value)} />
          <button style={btn} onClick={verifyPayment} disabled={verifying}>{verifying ? "Checking..." : "Verify"}</button>
        </div>

        {verifyResult && (
          <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#1d4ed8", marginBottom: "8px" }}>RAZORPAY (Source of Truth)</div>
              <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
                <div>Contact: <strong>{verifyResult.razorpay?.contact || "—"}</strong></div>
                <div>Email: <strong>{verifyResult.razorpay?.email || "—"}</strong></div>
                <div>Amount: <strong>₹{verifyResult.razorpay?.amount}</strong></div>
                <div>Status: <strong>{verifyResult.razorpay?.status}</strong></div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>Sub: {verifyResult.razorpay?.subscription_id || "—"}</div>
              </div>
            </div>
            <div style={{ background: verifyResult.ourDbRecord?.mobile && verifyResult.razorpay?.contact?.includes(verifyResult.ourDbRecord?.mobile) ? "#f0fdf4" : "#fef2f2", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#991b1b", marginBottom: "8px" }}>OUR DATABASE</div>
              <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
                <div>Name: <strong>{verifyResult.ourDbRecord?.name || "Not found"}</strong></div>
                <div>Mobile: <strong>{verifyResult.ourDbRecord?.mobile || "—"}</strong></div>
                <div>Email: <strong>{verifyResult.ourDbRecord?.email || "—"}</strong></div>
                <div>Amount: <strong>₹{verifyResult.ourDbRecord?.amount}</strong></div>
              </div>
            </div>
            {verifyResult.allDonationsUnderSubscription?.length > 0 && (
              <div style={{ gridColumn: "1 / -1", background: "#f9fafb", borderRadius: "10px", padding: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#555", marginBottom: "8px" }}>ALL CHARGES UNDER THIS SUBSCRIPTION</div>
                {verifyResult.allDonationsUnderSubscription.map(d => (
                  <div key={d.id} style={{ fontSize: "12px", padding: "4px 0", borderBottom: "1px solid #eee" }}>
                    {new Date(d.date).toLocaleDateString("en-IN")} — <strong>{d.name}</strong> ({d.mobile}) ₹{d.amount} · {d.paymentId}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div style={box}>
          <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Activity Log</h3>
          <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#555", display: "flex", flexDirection: "column", gap: "4px" }}>
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionRepair
