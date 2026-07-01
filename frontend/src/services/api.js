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
 * Retorna os headers comuns incluindo Authorization se o token existir.
 */
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = sessionStorage.getItem('vesta_token');
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
}

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
   * Realiza login do usuário
   */
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao realizar login.');
    }
    
    const data = await response.json();
    sessionStorage.setItem('vesta_token', data.token);
    sessionStorage.setItem('vesta_user', JSON.stringify(data.user));
    return data;
  },

  /**
   * Registra um novo usuário
   */
  async register(username, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar conta.');
    }
    
    const data = await response.json();
    sessionStorage.setItem('vesta_token', data.token);
    sessionStorage.setItem('vesta_user', JSON.stringify(data.user));
    return data;
  },

  /**
   * Faz logout do usuário removendo os dados do sessionStorage
   */
  logout() {
    sessionStorage.removeItem('vesta_token');
    sessionStorage.removeItem('vesta_user');
  },

  /**
   * Retorna as informações do usuário logado atualmente
   */
  getCurrentUser() {
    const userStr = sessionStorage.getItem('vesta_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // ─── Bancos ───────────────────────────────────────────────

  /**
   * Lista todos os bancos do usuário
   */
  async getBanks() {
    const url = `${API_BASE_URL}/banks/`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    if (response.status === 401) {
      api.logout();
      window.location.reload();
      throw new Error('Sessão expirada.');
    }
    if (!response.ok) {
      throw new Error('Falha ao carregar os bancos.');
    }
    return response.json();
  },

  /**
   * Cria um novo banco
   * @param {Object} bankData - { nome, cor }
   */
  async createBank(bankData) {
    const url = `${API_BASE_URL}/banks/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bankData),
    });

    if (response.status === 401) {
      api.logout();
      window.location.reload();
      throw new Error('Sessão expirada.');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.json();
  },

  /**
   * Remove um banco
   * @param {number|string} id
   */
  async deleteBank(id) {
    const url = `${API_BASE_URL}/banks/${id}/`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (response.status === 401) {
      api.logout();
      window.location.reload();
      throw new Error('Sessão expirada.');
    }
    if (!response.ok) {
      throw new Error('Falha ao remover o banco.');
    }
    return true;
  },

  // ─── Despesas ─────────────────────────────────────────────

  /**
   * Lista despesas filtradas
   * @param {Object} filters - { categoria, mes, ano, banco }
   */
  async getExpenses(filters = {}) {
    const url = buildUrl('/expenses/', filters);
    const response = await fetch(url, {
      headers: getHeaders()
    });
    if (response.status === 401) {
      api.logout();
      window.location.reload(); // Recarrega para voltar à tela de login
      throw new Error('Sessão expirada.');
    }
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
      headers: getHeaders(),
      body: JSON.stringify(expenseData),
    });
    
    if (response.status === 401) {
      api.logout();
      window.location.reload();
      throw new Error('Sessão expirada.');
    }
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
      headers: getHeaders(),
      body: JSON.stringify(expenseData),
    });
    
    if (response.status === 401) {
      api.logout();
      window.location.reload();
      throw new Error('Sessão expirada.');
    }
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
      headers: getHeaders()
    });
    
    if (response.status === 401) {
      api.logout();
      window.location.reload();
      throw new Error('Sessão expirada.');
    }
    if (!response.ok) {
      throw new Error('Falha ao remover a despesa.');
    }
    return true;
  }
};
