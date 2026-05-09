import { useState, useEffect } from "react";
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

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTransactions({
        limit: 1000,
        status: "paid",
      });

      // console.log('API Response:', response)

      const allTransactions = response.transactions || [];

      const paidDonations = allTransactions.filter(
        (txn) => txn.status === "paid" && txn.amount >= 1 && txn.receiptNumber,
      );

      // console.log('Filtered receipts:', paidDonations)

      setReceipts(paidDonations);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (receipt) => {
    const convertAmountToWords = (amount) => {
      const ones = [
        "",
        "ONE",
        "TWO",
        "THREE",
        "FOUR",
        "FIVE",
        "SIX",
        "SEVEN",
        "EIGHT",
        "NINE",
      ];
      const tens = [
        "",
        "",
        "TWENTY",
        "THIRTY",
        "FORTY",
        "FIFTY",
        "SIXTY",
        "SEVENTY",
        "EIGHTY",
        "NINETY",
      ];
      const teens = [
        "TEN",
        "ELEVEN",
        "TWELVE",
        "THIRTEEN",
        "FOURTEEN",
        "FIFTEEN",
        "SIXTEEN",
        "SEVENTEEN",
        "EIGHTEEN",
        "NINETEEN",
      ];

      const convertLessThanThousand = (num) => {
        if (num === 0) return "";
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100)
          return (
            tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
          );
        return (
          ones[Math.floor(num / 100)] +
          " HUNDRED" +
          (num % 100 ? " " + convertLessThanThousand(num % 100) : "")
        );
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
      if (thousand > 0)
        result += convertLessThanThousand(thousand) + " THOUSAND ";
      if (remainder > 0) result += convertLessThanThousand(remainder);

      return result.trim() + " RUPEES ONLY";
    };

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
    });

    window.open(`/receipt-preview?${params.toString()}`, "_blank");
  };

  const handleDownloadReceipt = (receipt) => {
    const convertAmountToWords = (amount) => {
      const ones = [
        "",
        "ONE",
        "TWO",
        "THREE",
        "FOUR",
        "FIVE",
        "SIX",
        "SEVEN",
        "EIGHT",
        "NINE",
      ];
      const tens = [
        "",
        "",
        "TWENTY",
        "THIRTY",
        "FORTY",
        "FIFTY",
        "SIXTY",
        "SEVENTY",
        "EIGHTY",
        "NINETY",
      ];
      const teens = [
        "TEN",
        "ELEVEN",
        "TWELVE",
        "THIRTEEN",
        "FOURTEEN",
        "FIFTEEN",
        "SIXTEEN",
        "SEVENTEEN",
        "EIGHTEEN",
        "NINETEEN",
      ];

      const convertLessThanThousand = (num) => {
        if (num === 0) return "";
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100)
          return (
            tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
          );
        return (
          ones[Math.floor(num / 100)] +
          " HUNDRED" +
          (num % 100 ? " " + convertLessThanThousand(num % 100) : "")
        );
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
      if (thousand > 0)
        result += convertLessThanThousand(thousand) + " THOUSAND ";
      if (remainder > 0) result += convertLessThanThousand(remainder);

      return result.trim() + " RUPEES ONLY";
    };

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
      donorNumber: receipt.externalApiResponse?.DonorNumber || "",
      certificate: receipt.certificate ? "YES" : "NO",
      razorpayPaymentId: receipt.razorpayPaymentId || receipt.id,
      autoPrint: "true",
    });

    window.open(`/receipt-preview?${params.toString()}`, "_blank");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatReceiptNumber = (number) => {
    if (!number) return "N/A";

    // If it's already a string containing the HKMI format, return as-is
    if (typeof number === "string" && number.includes("HKMI|")) {
      return number;
    }

    // If it's a number or needs formatting
    return `HKMI|${new Date().getFullYear()}|D/VSP|${String(number).padStart(5, "0")}`;
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.mobile?.includes(searchTerm) ||
      receipt.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(receipt.receiptNumber)?.includes(searchTerm);

    const matchesDate =
      !dateFilter ||
      new Date(receipt.receiptGeneratedAt)
        .toLocaleDateString("en-CA")
        .includes(dateFilter);

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReceipts = filteredReceipts.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  if (loading) {
    return (
      <div className="receipts-page">
        <div className="loading-state">
          <p>Loading receipts...</p>
        </div>
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
            <h3>{receipts.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>₹</span>
          <div>
            <p>Total Amount</p>
            <h3>
              ₹
              {receipts
                .reduce((sum, r) => sum + (r.amount || 0), 0)
                .toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, mobile, email, or receipt number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="date-filter">
          <Calendar size={18} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Filter by date"
          />
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
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
                {currentReceipts.map((receipt) => (
                  <tr key={receipt._id}>
                    <td className="receipt-number-cell">
                      {formatReceiptNumber(receipt.receiptNumber)}
                    </td>
                    <td>{formatDate(receipt.receiptGeneratedAt)}</td>
                    <td className="donor-name-cell">{receipt.name}</td>
                    <td>{receipt.mobile}</td>
                    <td>{receipt.email || "N/A"}</td>
                    <td className="amount-cell">
                      ₹{receipt.amount.toLocaleString()}
                    </td>
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
                          onClick={() => handleViewReceipt(receipt)}
                          title="View Receipt"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-action btn-download"
                          onClick={() => handleDownloadReceipt(receipt)}
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

          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredReceipts.length)} of{" "}
              {filteredReceipts.length} receipts
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-number ${page === currentPage ? "active" : ""}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  },
                )}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Receipts;
