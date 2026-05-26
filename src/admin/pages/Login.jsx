import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, User, AlertCircle } from "lucide-react"
import "./Login.css"
import { apiBaseUrl } from "../../lib/apiConfig.js";

function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password")
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch(apiBaseUrl('/api/auth/login'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      localStorage.setItem("adminToken", data.token)
      localStorage.setItem("adminUser", JSON.stringify(data.admin))

      navigate("/admin/dashboard")
      
    } catch (err) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError("") // Clear error when user types
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-box">
        <div className="login-header">
          <div className="logo-circle">
            <Lock size={32} />
          </div>
          <h1>Admin Login</h1>
          <p>Welcome back! Please login to your account.</p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <User size={16} />
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Subhojanam Admin Panel © 2024</p>
        </div>
      </div>
    </div>
  )
}

export default Login
