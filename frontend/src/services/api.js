let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Remove trailing slash if present
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}

// If it doesn't end with /api, append it
if (!baseUrl.endsWith('/api')) {
  baseUrl = `${baseUrl}/api`;
}

const API_BASE_URL = baseUrl;

/**
 * Constrói a URL com os parâmetros de consulta fornecidos.
 */
function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
}

export const api = {
  /**
   * Lista despesas filtradas
   * @param {Object} filters - { categoria, mes, ano }
   */
  async getExpenses(filters = {}) {
    const url = buildUrl('/expenses/', filters);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Falha ao carregar as despesas.');
    }
    return response.json();
  },

  /**
   * Cria uma nova despesa
   * @param {Object} expenseData
   */
  async createExpense(expenseData) {
    const url = `${API_BASE_URL}/expenses/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.json();
  },

  /**
   * Atualiza uma despesa existente
   * @param {number|string} id
   * @param {Object} expenseData
   */
  async updateExpense(id, expenseData) {
    const url = `${API_BASE_URL}/expenses/${id}/`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.json();
  },

  /**
   * Remove uma despesa
   * @param {number|string} id
   */
  async deleteExpense(id) {
    const url = `${API_BASE_URL}/expenses/${id}/`;
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Falha ao remover a despesa.');
    }
    return true;
  }
};
