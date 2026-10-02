import { useState, useEffect, useCallback } from "react"
import { Search, Clock, CheckCircle2, XCircle, X, Package } from "lucide-react"
import adminAPI from "../../services/adminApi"

const PAYMENT_MODES = [
  { value: "phonepe", label: "PhonePe" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
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

const todayStr = () => new Date().toISOString().slice(0, 10)

const s = {
  page: { padding: "24px", maxWidth: "1000px" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "16px", marginBottom: "12px" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "4px" },
  btn: { border: "none", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
}

function PendingTransactions() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [flash, setFlash] = useState(null)

  const [payFor, setPayFor] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState("")

  const LIMIT = 20

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const q = new URLSearchParams({ page, limit: LIMIT, search })
      const res = await adminAPI.request("/api/admin/pending-transactions?" + q.toString())
      setItems(res.items || [])
      setTotal(res.total || 0)
      setError("")
    } catch (e) {
      setError(e.message || "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const t = setTimeout(load, 400)
    return () => clearTimeout(t)
  }, [load])

  const openPay = (it) => {
    setPayFor(it)
    setModalError("")
    setForm({
      utr: "", paymentMode: "phonepe", paymentDate: todayStr(),
      amount: it.amount, name: it.name, mobile: it.mobile, email: it.email || "",
      occasion: it.occasion || "", sevakName: it.sevakName || "", sevaDate: it.sevaDate || "",
      certificate: it.certificate, panNumber: it.panNumber, address: it.address, city: it.city, state: it.state, pincode: it.pincode,
      mahaprasadam: it.mahaprasadam, prasadamName: it.prasadamName || it.name, prasadamMobile: it.prasadamMobile || it.mobile,
      prasadamAddress: it.prasadamAddress, prasadamCity: it.prasadamCity, prasadamState: it.prasadamState, prasadamPincode: it.prasadamPincode,
    })
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value })

  const submitPay = async () => {
    if (!form.utr.trim()) { setModalError("UTR / payment reference is required"); return }
    if (form.certificate && (!form.panNumber || !form.address || !form.city || !form.state || !form.pincode)) {
      setModalError("80G certificate needs PAN, address, city, state and pincode"); return
    }
    if (form.mahaprasadam && (!form.prasadamAddress || !form.prasadamCity || !form.prasadamState || !form.prasadamPincode)) {
      setModalError("Prasadam needs a full delivery address"); return
    }
    setSaving(true); setModalError("")
    try {
      const res = await adminAPI.request("/api/admin/pending-transactions/" + payFor.id + "/mark-paid", {
        method: "POST", body: JSON.stringify(form),
      })
      setFlash({ ok: true, text: res.message + (res.receiptNumber ? " (" + res.receiptNumber + ")" : "") })
      setPayFor(null)
      load()
    } catch (e) {
      setModalError(e.message || "Failed")
    } finally {
      setSaving(false)
    }
  }

  const closeItem = async (it) => {
    const reason = window.prompt("Close this pending record for " + it.name + " (" + it.mobile + ")?\n\nOptional reason (e.g. 'paid again separately', 'donor declined'):", "")
    if (reason === null) return
    try {
      const res = await adminAPI.request("/api/admin/pending-transactions/" + it.id + "/close", {
        method: "POST", body: JSON.stringify({ reason }),
      })
      setFlash({ ok: true, text: res.message })
      load()
    } catch (e) {
      setFlash({ ok: false, text: e.message || "Failed" })
    }
  }

  const fmt = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  const pages = Math.max(Math.ceil(total / LIMIT), 1)

  return (
    <div style={s.page}>
      <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Clock size={22} color="#d97706" /> Pending Transactions
      </h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "18px" }}>
        Payments that were started but never completed. If the donor paid later, mark it paid with their UTR / reference — you can add prasadam or fix details at the same time, and the receipt goes out automatically. Otherwise close it.
      </p>

      {flash && (
        <div style={{ padding: "12px 14px", borderRadius: "10px", marginBottom: "14px", fontSize: "13px",
          background: flash.ok ? "#f0fdf4" : "#fef2f2", color: flash.ok ? "#166534" : "#991b1b",
          border: "1px solid " + (flash.ok ? "#86efac" : "#fca5a5"), display: "flex", justifyContent: "space-between" }}>
          <span>{flash.ok ? "✅ " : "❌ "}{flash.text}</span>
          <button onClick={() => setFlash(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>
        </div>
      )}

      <div style={{ position: "relative", marginBottom: "16px" }}>
        <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "#aaa" }} />
        <input style={{ ...s.input, paddingLeft: "36px" }} placeholder="Search by name, mobile or email..."
          value={search} onChange={(e) => { setPage(1); setSearch(e.target.value) }} />
      </div>

      <div style={{ fontSize: "13px", color: "#888", marginBottom: "10px" }}>{total} pending</div>

      {loading ? <p style={{ color: "#888" }}>Loading...</p>
        : error ? <p style={{ color: "#dc2626" }}>{error}</p>
        : items.length === 0 ? <p style={{ color: "#16a34a", fontWeight: 600 }}>🎉 No pending transactions.</p>
        : items.map((it) => (
          <div key={it.id} style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>{(it.name || "").trim()} <span style={{ color: "#16a34a" }}>₹{it.amount}</span></div>
                <div style={{ fontSize: "13px", color: "#666" }}>{it.mobile}{it.email ? " · " + it.email : ""}</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
                  Started {fmt(it.createdAt)}{it.utmCampaign ? " · " + it.utmCampaign : ""}
                </div>
                <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                  {it.isRecurring && <span style={{ fontSize: "11px", background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>Monthly signup</span>}
                  {it.reminded && <span style={{ fontSize: "11px", background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>Reminded</span>}
                  {it.mahaprasadam && <span style={{ fontSize: "11px", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>Prasadam requested</span>}
                  {it.laterPaidSameAmount && <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>Donor paid same amount later — likely stale</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                {!it.isRecurring && (
                  <button onClick={() => openPay(it)} style={{ ...s.btn, background: "#16a34a", color: "white", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={15} /> Mark Paid
                  </button>
                )}
                <button onClick={() => closeItem(it)} style={{ ...s.btn, background: "white", color: "#dc2626", border: "1px solid #fca5a5", display: "flex", alignItems: "center", gap: "6px" }}>
                  <XCircle size={15} /> Close
                </button>
              </div>
            </div>
          </div>
        ))}

      {pages > 1 && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", marginTop: "16px" }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ ...s.btn, background: "#f3f4f6" }}>Prev</button>
          <span style={{ fontSize: "13px", color: "#666" }}>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} style={{ ...s.btn, background: "#f3f4f6" }}>Next</button>
        </div>
      )}

      {payFor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "22px", maxWidth: "560px", width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "17px" }}>Mark Paid — {(payFor.name || "").trim()}</h3>
              <button onClick={() => setPayFor(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={s.label}>UTR / Payment reference *</label>
                <input style={s.input} value={form.utr} onChange={set("utr")} placeholder="e.g. 619407984513" />
              </div>
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>Payment mode</label>
                  <select style={s.input} value={form.paymentMode} onChange={set("paymentMode")}>
                    {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Payment date</label>
                  <input type="date" style={s.input} value={form.paymentDate} onChange={set("paymentDate")} />
                </div>
              </div>
              <div style={s.grid2}>
                <div><label style={s.label}>Name</label><input style={s.input} value={form.name} onChange={set("name")} /></div>
                <div><label style={s.label}>Amount (₹)</label><input type="number" style={s.input} value={form.amount} onChange={set("amount")} /></div>
              </div>
              <div style={s.grid2}>
                <div><label style={s.label}>Mobile</label><input style={s.input} value={form.mobile} onChange={set("mobile")} /></div>
                <div><label style={s.label}>Email</label><input style={s.input} value={form.email} onChange={set("email")} /></div>
              </div>
              <div style={s.grid2}>
                <div><label style={s.label}>Occasion</label><input style={s.input} value={form.occasion} onChange={set("occasion")} placeholder="Birthday, Anniversary..." /></div>
                <div><label style={s.label}>Seva date</label><input type="date" style={s.input} value={form.sevaDate} onChange={set("sevaDate")} /></div>
              </div>
              <div><label style={s.label}>Sevak name</label><input style={s.input} value={form.sevakName} onChange={set("sevakName")} /></div>

              <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontWeight: 600 }}>
                <input type="checkbox" checked={!!form.certificate} onChange={set("certificate")} /> 80G certificate
              </label>
              {form.certificate && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "#f9fafb", padding: "12px", borderRadius: "10px" }}>
                  <input style={s.input} placeholder="PAN number *" value={form.panNumber} onChange={set("panNumber")} />
                  <input style={s.input} placeholder="Address *" value={form.address} onChange={set("address")} />
                  <div style={s.grid2}>
                    <input style={s.input} placeholder="City *" value={form.city} onChange={set("city")} />
                    <select style={s.input} value={form.state} onChange={set("state")}>
                      <option value="">Select State *</option>
                      {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <input style={s.input} placeholder="Pincode *" value={form.pincode} onChange={set("pincode")} />
                </div>
              )}

              <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontWeight: 600 }}>
                <input type="checkbox" checked={!!form.mahaprasadam} onChange={set("mahaprasadam")} />
                <Package size={14} color="#7c3aed" /> Add Mahaprasadam delivery
              </label>
              {form.mahaprasadam && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "#faf5ff", padding: "12px", borderRadius: "10px" }}>
                  <div style={s.grid2}>
                    <input style={s.input} placeholder="Recipient name" value={form.prasadamName} onChange={set("prasadamName")} />
                    <input style={s.input} placeholder="Recipient mobile" value={form.prasadamMobile} onChange={set("prasadamMobile")} />
                  </div>
                  <textarea rows={2} style={{ ...s.input, resize: "vertical" }} placeholder="Delivery address *" value={form.prasadamAddress} onChange={set("prasadamAddress")} />
                  <div style={s.grid2}>
                    <input style={s.input} placeholder="City *" value={form.prasadamCity} onChange={set("prasadamCity")} />
                    <select style={s.input} value={form.prasadamState} onChange={set("prasadamState")}>
                      <option value="">Select State *</option>
                      {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <input style={s.input} placeholder="Pincode *" value={form.prasadamPincode} onChange={set("prasadamPincode")} />
                </div>
              )}
            </div>

            {modalError && (
              <div style={{ marginTop: "12px", padding: "10px 12px", borderRadius: "10px", fontSize: "13px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" }}>
                ❌ {modalError}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => setPayFor(null)} style={{ ...s.btn, background: "white", border: "1px solid #e5e7eb", color: "#555" }}>Cancel</button>
              <button onClick={submitPay} disabled={saving} style={{ ...s.btn, flex: 1, background: saving ? "#9ca3af" : "#16a34a", color: "white", padding: "11px" }}>
                {saving ? "Processing — DCC, receipt, WhatsApp..." : "Mark Paid & Send Receipt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingTransactions
