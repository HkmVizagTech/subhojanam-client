

 const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://subhojanam-server-main-882278565284.asia-south1.run.app';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
class AdminAPI {
  async deleteCampaign(id) {
    return this.request(`/api/admin/campaigns/${id}`, {
      method: 'DELETE',
    });
  }
  async getCampaigns() {
    return this.request('/api/admin/campaigns');
  }

  async createCampaign(data) {
    return this.request('/api/admin/create-campaign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getUtmStats() {
    return this.request('/api/admin/utm-stats');
  }
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('adminToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include', 
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/login';
        }
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    return this.request('/api/admin/dashboard/stats');
  }

  async getRecentTransactions(limit = 5) {
    return this.request(`/api/admin/dashboard/recent-transactions?limit=${limit}`);
  }

  async getTopDonors(limit = 5) {
    return this.request(`/api/admin/dashboard/top-donors?limit=${limit}`);
  }

  async getMonthlyTrends(year = new Date().getFullYear()) {
    return this.request(`/api/admin/dashboard/monthly-trends?year=${year}`);
  }

  async getAllTransactions(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || '',
      status: params.status || 'all',
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
    }).toString();

    return this.request(`/api/admin/transactions?${queryParams}`);
  }

  async getTransactionStats(params = {}) {
    const queryParams = new URLSearchParams({
      status: params.status || 'all',
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
    }).toString();

    return this.request(`/api/admin/transactions/stats?${queryParams}`);
  }

  async getTransactionById(id) {
    return this.request(`/api/admin/transactions/${id}`);
  }

  async exportTransactions(params = {}) {
    const queryParams = new URLSearchParams({
      status: params.status || 'all',
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
    }).toString();

    return this.request(`/api/admin/transactions/export?${queryParams}`);
  }

  async getAllDonors(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      search: params.search || '',
    }).toString();

    return this.request(`/api/admin/donors?${queryParams}`);
  }

  async getDonorStats() {
    return this.request('/api/admin/donors/stats');
  }

  async getDonorById(email) {
    return this.request(`/api/admin/donors/${encodeURIComponent(email)}`);
  }

  async getAnalyticsOverview() {
    return this.request('/api/admin/analytics/overview');
  }

  async getDonationsByAmountRange() {
    return this.request('/api/admin/analytics/amount-range');
  }

  async getTopLocations(limit = 5) {
    return this.request(`/api/admin/analytics/top-locations?limit=${limit}`);
  }

  async getSettings() {
    return this.request('/api/admin/settings');
  }

  async updateSettings(settings) {
    return this.request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getAllSubscriptions() {
    return this.request('/api/admin/subscriptions');
  }

  async getSubscriptionsForReview() {
    return this.request('/api/admin/subscriptions/review');
  }

  async getSubscriptionStats() {
    return this.request('/api/admin/subscriptions/stats');
  }

  async cancelSubscription(id) {
    return this.request(`/api/admin/subscriptions/${id}/cancel`, {
      method: 'PUT',
    });
  }
}

export default new AdminAPI();
