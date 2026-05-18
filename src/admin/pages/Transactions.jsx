import { useState, useEffect } from "react"
import { Search, Download, Filter, Calendar, X, Check, Send } from "lucide-react"
import adminAPI from "../../services/adminApi"
import "../styles/Transactions.css"

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [prasadamFilter, setPrasadamFilter] = useState("all") // all | yes | no
  const [certificateFilter, setCertificateFilter] = useState("all") // all | yes | no
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendResult, setResendResult] = useState(null)

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, filterStatus, prasadamFilter, certificateFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchTransactions()
      } else {
        setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchStats()
  }, [filterStatus, prasadamFilter, certificateFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const prasadamForBackend = prasadamFilter === 'all' ? undefined : prasadamFilter === 'yes';
      const certificateForBackend = certificateFilter === 'all' ? undefined : certificateFilter === 'yes';
      const response = await adminAPI.getAllTransactions({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: filterStatus,
        mahaprasadam: prasadamForBackend,
        certificate: certificateForBackend
      })

      setTransactions(response.transactions)
      setPagination(response.pagination)
      setError(null)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getTransactionStats({
        status: filterStatus
      })
      setStats(response.stats)
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await adminAPI.exportTransactionsCSV({
        status: filterStatus
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting transactions:", err);
      alert("Failed to export transactions");
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetails = (txn) => {
    setSelectedTransaction(txn)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedTransaction(null)
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>Manage and track all donation transactions</p>
        </div>
        <button className="export-btn" onClick={handleExport}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {loading && !transactions.length ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading transactions...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>{error}</p>
          <button onClick={fetchTransactions}>Retry</button>
        </div>
      ) : (
        <>
          <div className="transactions-stats">
            <div className="stat-box">
              <p>Total Transactions</p>
              <h3>{stats?.totalTransactions || 0}</h3>
            </div>
            <div className="stat-box">
              <p>Total Amount</p>
              <h3>₹{(stats?.totalAmount || 0).toLocaleString()}</h3>
            </div>
            {/* <div className="stat-box">
              <p>Successful</p>
              <h3>{stats?.successfulTransactions || 0}</h3>
            </div> */}
          </div>

          <div className="filters-section">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <Filter size={18} />
                <select 
                  value={filterStatus} 
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="paid,active,completed">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="filter-group">
                <label style={{ marginRight: 6 }}>Prasadam Required</label>
                <select
                  value={prasadamFilter}
                  onChange={e => {
                    setPrasadamFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="filter-group">
                <label style={{ marginRight: 6 }}>80G Certificate</label>
                <select
                  value={certificateFilter}
                  onChange={e => {
                    setCertificateFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="filter-group">
                <Calendar size={18} />
                <input type="date" />
              </div>
            </div>
          </div>

          <div className="transactions-table-wrapper">
            {transactions.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No transactions found
              </p>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Donor Details</th>
                    <th>Contact</th>
                    <th>Amount</th>
                    <th>80G Certificate</th>
                    <th>Prasadam</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td className="txn-id">{txn.id}</td>
                      <td>
                        <div className="donor-details">
                          <p className="donor-name">{txn.name}</p>
                          <p className="donor-email">{txn.email}</p>
                        </div>
                      </td>
                      <td className="mobile">{txn.mobile}</td>
                      <td className="amount">₹{txn.amount.toLocaleString()}</td>
                      <td className="certificate-cell">
                        {txn.certificate ? (
                          <span className="certificate-yes">
                            <Check size={18} color="#22c55e" />
                          </span>
                        ) : (
                          <span className="certificate-no">-</span>
                        )}
                      </td>
                      <td className="certificate-cell">
                        {txn.mahaprasadam ? (
                          <span className="certificate-yes">
                            <Check size={18} color="#22c55e" />
                          </span>
                        ) : (
                          <span className="certificate-no">-</span>
                        )}
                      </td>
                      <td className="date">{formatDate(txn.date)}</td>
                      <td>
                        <span className={`status-badge ${txn.status.toLowerCase()}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn view-btn" onClick={() => handleViewDetails(txn)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                    disabled={loading}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button 
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showModal && selectedTransaction && (
        <div className="transaction-modal-overlay" onClick={closeModal}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Transaction Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value">{selectedTransaction.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">₹{selectedTransaction.amount.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date & Time:</span>
                    <span className="detail-value">{formatDate(selectedTransaction.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedTransaction.status.toLowerCase()}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Donor Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedTransaction.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedTransaction.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mobile:</span>
                    <span className="detail-value">{selectedTransaction.mobile}</span>
                  </div>
                  {selectedTransaction.sevaDate && (
                    <div className="detail-item">
                      <span className="detail-label">Seva Date:</span>
                      <span className="detail-value">{selectedTransaction.sevaDate}</span>
                    </div>
                  )}
                  {selectedTransaction.dob && (
                    <div className="detail-item">
                      <span className="detail-label">Date of Birth:</span>
                      <span className="detail-value">{selectedTransaction.dob}</span>
                    </div>
                  )}
                  {selectedTransaction.occasion && (
                    <div className="detail-item">
                      <span className="detail-label">Occasion:</span>
                      <span className="detail-value">{selectedTransaction.occasion}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedTransaction.certificate && (
                <div className="detail-section certificate-section">
                  <h3>80G Certificate Details</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">PAN Number:</span>
                      <span className="detail-value">{selectedTransaction.panNumber || 'N/A'}</span>
                    </div>
                    <div className="detail-item full-width">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">{selectedTransaction.address || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">City:</span>
                      <span className="detail-value">{selectedTransaction.city || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">State:</span>
                      <span className="detail-value">{selectedTransaction.state || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pincode:</span>
                      <span className="detail-value">{selectedTransaction.pincode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedTransaction.mahaprasadam && (
                <div className="detail-section certificate-section">
                  <h3>Maha Prasadam Details</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Delivery Option:</span>
                      <span className="detail-value">
                        {selectedTransaction.prasadamAddressOption === 'same' 
                          ? 'Same as certificate address' 
                          : selectedTransaction.prasadamAddressOption === 'different'
                          ? 'Different address'
                          : 'Not specified'}
                      </span>
                    </div>
                    {selectedTransaction.prasadamAddressOption === 'different' && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Delivery Address:</span>
                        <span className="detail-value">{selectedTransaction.prasadamAddress || 'N/A'}</span>
                      </div>
                    )}
                    {(selectedTransaction.prasadamAddressOption === 'same' || !selectedTransaction.prasadamAddressOption) && (
                      <>
                        <div className="detail-item full-width">
                          <span className="detail-label">Address:</span>
                          <span className="detail-value">{selectedTransaction.address || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">City:</span>
                          <span className="detail-value">{selectedTransaction.city || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">State:</span>
                          <span className="detail-value">{selectedTransaction.state || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Pincode:</span>
                          <span className="detail-value">{selectedTransaction.pincode || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedTransaction.isRecurring && (
                <div className="detail-section">
                  <h3>Subscription Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">Monthly Recurring</span>
                    </div>
                    {selectedTransaction.subscriptionId && (
                      <div className="detail-item">
                        <span className="detail-label">Subscription ID:</span>
                        <span className="detail-value">{selectedTransaction.subscriptionId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    className="resend-receipt-btn"
                    disabled={resending}
                    onClick={async () => {
                      setResending(true)
                      setResendResult(null)
                      try {
                        const data = await adminAPI.resendReceipt(selectedTransaction._id)
                        setResendResult(data)
                      } catch (err) {
                        setResendResult({ success: false, message: err.message })
                      } finally {
                        setResending(false)
                      }
                    }}
                  >
                    <Send size={16} />
                    {resending ? "Sending..." : "Resend Receipt via WhatsApp"}
                  </button>

                  <button
                    className="resend-receipt-btn"
                    style={{ background: "#6b7280" }}
                    disabled={resending}
                    onClick={async () => {
                      setResending(true)
                      setResendResult(null)
                      try {
                        const data = await adminAPI.markReceiptGenerated(selectedTransaction._id)
                        setResendResult({ ...data, message: data.success ? "Receipt marked — will now show in Receipts tab" : data.message })
                      } catch (err) {
                        setResendResult({ success: false, message: err.message })
                      } finally {
                        setResending(false)
                      }
                    }}
                  >
                    <Check size={16} />
                    Fix Receipt Visibility (No WhatsApp)
                  </button>
                </div>
                {resendResult && (
                  <p className={`resend-result ${resendResult.success ? "success" : "error"}`}>
                    {resendResult.success ? "✅ " : "❌ "}{resendResult.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
