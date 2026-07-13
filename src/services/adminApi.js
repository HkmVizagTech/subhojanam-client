
import { apiBaseUrl } from "../lib/apiConfig.js";

class AdminAPI {
  // Special CSV export fetcher
  async exportTransactionsCSV(params = {}) {
    const queryParams = new URLSearchParams({
      status: params.status || 'all',
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
    }).toString();

    const url = apiBaseUrl(`/api/admin/transactions/export?${queryParams}`);
    const token = localStorage.getItem('adminToken');
    const config = {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
    };
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }
    return response.blob();
  }
  async exportPrasadamCSV(status = "pending") {
    const url = apiBaseUrl(`/api/admin/prasadam/export?status=${status}`);
    const token = localStorage.getItem('adminToken');
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'text/csv',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error(`Failed to export: ${response.status}`);
    return response.blob();
  }

  async uploadFestivalCampaign(formData) {
    const url = apiBaseUrl("/api/admin/festival-campaigns");
    const token = localStorage.getItem('adminToken');
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // NOTE: no Content-Type — browser sets multipart boundary automatically
      },
      credentials: 'include',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data;
  }

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
    const url = apiBaseUrl(endpoint);
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
    const status = params.status || 'all';
    const query = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || '',
    };
    if (params.startDate) query.startDate = params.startDate;
    if (params.endDate) query.endDate = params.endDate;
    if (typeof params.mahaprasadam === 'boolean') query.mahaprasadam = params.mahaprasadam;
    if (typeof params.certificate === 'boolean') query.certificate = params.certificate;
    if (params.hasReceipt) query.hasReceipt = params.hasReceipt;
    const queryParams = new URLSearchParams(query).toString();
    return this.request(`/api/admin/transactions?status=${status}&${queryParams}`);
  }

  async getTransactionStats(params = {}) {
    const status = params.status || 'all';
    const queryParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
    }).toString();
    const statusParam = `status=${status}`;
    const query = queryParams ? `${statusParam}&${queryParams}` : statusParam;
    return this.request(`/api/admin/transactions/stats?${query}`);
  }

  async getTransactionById(id) {
    return this.request(`/api/admin/transactions/${id}`);
  }

  async resendReceipt(id) {
    return this.request(`/api/admin/transactions/${id}/resend-receipt`, {
      method: "POST",
    });
  }

  async markReceiptGenerated(id) {
    return this.request(`/api/admin/transactions/${id}/mark-receipt-generated`, {
      method: "PATCH",
    });
  }

  async exportTransactions(params = {}) {
    const status = params.status || 'all';
    const queryParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
    }).toString();
    const query = queryParams ? `status=${status}&${queryParams}` : `status=${status}`;
    return this.request(`/api/admin/transactions/export?${query}`);
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
