import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Download,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import adminAPI from "../../services/adminApi";
import { useNavigate } from "react-router-dom";
import "../styles/Receipts.css";

const convertAmountToWords = (amount) => {
  const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
  const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  const teens = ["TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];

  const convertLessThanThousand = (num) => {
    if (num === 0) return "";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    return ones[Math.floor(num / 100)] + " HUNDRED" + (num % 100 ? " " + convertLessThanThousand(num % 100) : "");
  };

  const num = parseInt(amount);
  if (num === 0) return "ZERO RUPEES ONLY";
  let result = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;
  if (crore > 0) result += convertLessThanThousand(crore) + " CRORE ";
  if (lakh > 0) result += convertLessThanThousand(lakh) + " LAKH ";
  if (thousand > 0) result += convertLessThanThousand(thousand) + " THOUSAND ";
  if (remainder > 0) result += convertLessThanThousand(remainder);
  return result.trim() + " RUPEES ONLY";
};

const formatReceiptNumber = (number) => {
  if (!number) return "N/A";
  if (typeof number === "string" && number.includes("HKMI|")) return number;
  return `HKMI|${new Date().getFullYear()}|D/VSP|${String(number).padStart(5, "0")}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [healthCheck, setHealthCheck] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const itemsPerPage = 20;

  const fetchReceipts = useCallback(async (page = 1, search = "", date = "") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: itemsPerPage,
        status: "paid,completed",
        hasReceipt: "true",
      };
      if (search) params.search = search;
      if (date) {
        params.startDate = date;
        // end of that day
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        params.endDate = end.toISOString();
      }

      const response = await adminAPI.getAllTransactions(params);
      const allTransactions = response.transactions || [];
      setReceipts(allTransactions);
      setPagination(response.pagination || null);
      setTotalAmount(response.pagination?.totalAmount || 0);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts(1, searchTerm, dateFilter);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
      fetchReceipts(1, searchInput, dateFilter);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
    fetchReceipts(1, searchTerm, dateFilter);
  }, [dateFilter]);

  const handlePageChange = (newPage) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
    fetchReceipts(newPage, searchTerm, dateFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openReceiptWindow = (receipt, autoPrint = false) => {
    const params = new URLSearchParams({
      name: receipt.name,
      amount: receipt.amount,
      amountInWords: convertAmountToWords(receipt.amount),
      receiptNumber: formatReceiptNumber(receipt.receiptNumber),
      receiptDate: receipt.receiptGeneratedAt || receipt.date,
      mobile: receipt.mobile,
      email: receipt.email || "",
      address: receipt.address || "",
      city: receipt.city || "",
      state: receipt.state || "",
      pincode: receipt.pincode || "",
      panNumber: receipt.panNumber || "",
      certificate: receipt.certificate ? "YES" : "NO",
      razorpayPaymentId: receipt.razorpayPaymentId || receipt.id,
      donorNumber: receipt.externalApiResponse?.DonorNumber || "",
      ...(autoPrint ? { autoPrint: "true" } : {}),
    });
    window.open(`/receipt-preview?${params.toString()}`, "_blank");
  };

  const totalPages = pagination?.totalPages || 1;
  const totalReceipts = pagination?.totalTransactions || receipts.length;

  const handleHealthCheck = async () => {
    setHealthLoading(true);
    try {
      const res = await adminAPI.request("/api/admin/receipts/health-check");
      setHealthCheck(res.health);
    } catch (err) {
      alert("Health check failed: " + err.message);
    } finally {
      setHealthLoading(false);
    }
  };

  if (loading && receipts.length === 0) {
    return (
      <div className="receipts-page">
        <div className="loading-state"><p>Loading receipts...</p></div>
      </div>
    );
  }

  return (
    <div className="receipts-page">
      <div className="page-header">
        <div className="header-content">
          <FileText size={32} />
          <div>
            <h1>Donation Receipts</h1>
            <p>Manage and download donation receipts</p>
          </div>
        </div>
      </div>

      <div className="receipts-stats">
        <div className="stat-card">
          <FileText size={24} />
          <div>
            <p>Total Receipts</p>
            <h3>{totalReceipts.toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card">
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>₹</span>
          <div>
            <p>Total Donations</p>
            <h3>₹{totalAmount?.toLocaleString("en-IN") || "0"}</h3>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <button onClick={handleHealthCheck} disabled={healthLoading} style={{
          background: "#0A97EF", color: "white", border: "none", borderRadius: "12px",
          padding: "12px 24px", fontSize: "14px", fontWeight: "600", cursor: healthLoading ? "not-allowed" : "pointer",
          opacity: healthLoading ? 0.7 : 1
        }}>
          {healthLoading ? "Checking..." : "📊 Health Check (Paid vs Receipts)"}
        </button>
      </div>

      {healthCheck && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, 
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
        }}>
          <div style={{
            background: "white", borderRadius: "16px", width: "100%", maxWidth: "500px",
            padding: "24px", maxHeight: "80vh", overflowY: "auto"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 20px" }}>Receipts Health Check</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "10px" }}>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px" }}>Total Paid</p>
                <h3 style={{ margin: 0, color: "#1a1a2e", fontSize: "20px" }}>{healthCheck.totalPaid}</h3>
                <p style={{ fontSize: "11px", color: "#aaa", margin: "4px 0 0" }}>₹{healthCheck.totalAmount?.toLocaleString("en-IN")}</p>
              </div>
              
              <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "10px" }}>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px" }}>With Receipts</p>
                <h3 style={{ margin: 0, color: "#1a1a2e", fontSize: "20px" }}>{healthCheck.withReceipts}</h3>
                <p style={{ fontSize: "11px", color: "#0A97EF", margin: "4px 0 0", fontWeight: "600" }}>{healthCheck.receiptPercentage}%</p>
              </div>

              <div style={{ background: "#fef2f2", padding: "12px", borderRadius: "10px" }}>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px" }}>Missing Receipts</p>
                <h3 style={{ margin: 0, color: "#dc2626", fontSize: "20px" }}>{healthCheck.missing}</h3>
                <p style={{ fontSize: "11px", color: "#aaa", margin: "4px 0 0" }}>₹{healthCheck.missingAmount?.toLocaleString("en-IN")}</p>
              </div>

              <div style={{ background: "#f5f5f5", padding: "12px", borderRadius: "10px" }}>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px" }}>Gap Amount</p>
                <h3 style={{ margin: 0, color: "#1a1a2e", fontSize: "20px" }}>₹{healthCheck.missingAmount?.toLocaleString("en-IN")}</h3>
              </div>
            </div>

            <button onClick={() => setHealthCheck(null)} style={{
              width: "100%", padding: "10px", background: "#0A97EF", color: "white",
              border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer"
            }}>Close</button>
          </div>
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, mobile, email, or receipt number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="date-filter">
          <Calendar size={18} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="loading-inline">Loading...</div>}

      {!loading && receipts.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No Receipts Found</h3>
          <p>There are no receipts matching your search criteria</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="receipts-table">
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Date</th>
                  <th>Donor Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>80G</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt._id}>
                    <td className="receipt-number-cell">
                      {formatReceiptNumber(receipt.receiptNumber)}
                    </td>
                    <td>{formatDate(receipt.receiptGeneratedAt)}</td>
                    <td className="donor-name-cell">{receipt.name}</td>
                    <td>{receipt.mobile}</td>
                    <td>{receipt.email || "N/A"}</td>
                    <td className="amount-cell">₹{receipt.amount.toLocaleString()}</td>
                    <td>
                      {receipt.certificate ? (
                        <span className="badge-yes">YES</span>
                      ) : (
                        <span className="badge-no">NO</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => openReceiptWindow(receipt)}
                          title="View Receipt"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-action btn-download"
                          onClick={() => openReceiptWindow(receipt, true)}
                          title="Download Receipt"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalReceipts)} of{" "}
                {totalReceipts} receipts
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          className={`pagination-number ${page === currentPage ? "active" : ""}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="pagination-ellipsis">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Receipts;
