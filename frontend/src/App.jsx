import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import SummaryCards from './components/SummaryCards';
import Filters from './components/Filters';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseChart from './components/ExpenseChart';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import BankManager from './components/BankManager';
import { Wallet, PieChart, AlertTriangle, LogOut, User as UserIcon, Building2 } from 'lucide-react';

export default function App() {
  // Controle de Sessão e Rotas Condicionais
  const [user, setUser] = useState(api.getCurrentUser());
  const [token, setToken] = useState(sessionStorage.getItem('vesta_token'));
  const [view, setView] = useState(sessionStorage.getItem('vesta_token') ? 'app' : 'landing');
  const [authMode, setAuthMode] = useState('login');

  const [expenses, setExpenses] = useState([]);
  const [banks, setBanks] = useState([]);
  const [filters, setFilters] = useState({ categoria: '', mes: '', ano: '', banco: '' });
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBankManager, setShowBankManager] = useState(false);

  // Carrega as despesas sempre que os filtros mudarem e o usuário estiver logado
  const loadExpenses = async (activeFilters = filters) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getExpenses(activeFilters);
      setExpenses(data);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar as despesas. Verifique se o servidor Django está rodando na porta 8000.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os bancos do usuário
  const loadBanks = async () => {
    if (!token) return;
    try {
      const data = await api.getBanks();
      setBanks(data);
    } catch (err) {
      console.error('Erro ao carregar bancos:', err);
    }
  };

  useEffect(() => {
    if (token && view === 'app') {
      loadExpenses();
      loadBanks();
    }
  }, [filters, token, view]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSubmitExpense = async (formData) => {
    if (editingExpense) {
      // Editar
      await api.updateExpense(editingExpense.id, formData);
      setEditingExpense(null);
    } else {
      // Criar
      if (formData.isRecorrente) {
        const { isRecorrente, ...cleanData } = formData;
        await api.createRecurringExpense(cleanData);
      } else {
        await api.createExpense(formData);
      }
    }
    await loadExpenses();
  };

  const handleDeleteExpense = async (id, recurringExpenseId = null, deleteEntireSeries = false) => {
    try {
      if (deleteEntireSeries && recurringExpenseId) {
        await api.deleteRecurringExpense(recurringExpenseId);
      } else {
        await api.deleteExpense(id);
      }
      // Se estava editando a despesa excluída, cancela a edição
      if (editingExpense && editingExpense.id === id) {
        setEditingExpense(null);
      }
      await loadExpenses();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir despesa.');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    // Rola suavemente até o formulário no mobile
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  // Callback de sucesso na autenticação (login ou cadastro)
  const handleAuthSuccess = (loggedUser, authToken) => {
    setUser(loggedUser);
    setToken(authToken);
    setView('app');
  };

  // Callback de logout
  const handleLogout = () => {
    api.logout();
    setUser(null);
    setToken(null);
    setExpenses([]);
    setBanks([]);
    setView('landing');
  };

  // ─── Bancos ─────────────────────────────────────────────
  const handleAddBank = async (bankData) => {
    await api.createBank(bankData);
    await loadBanks();
  };

  const handleDeleteBank = async (bankId) => {
    await api.deleteBank(bankId);
    // Se o filtro ativo era o banco excluído, limpa o filtro
    if (filters.banco === String(bankId)) {
      setFilters(prev => ({ ...prev, banco: '' }));
    }
    await loadBanks();
    await loadExpenses();
  };

  // Roteamento condicional baseado no estado 'view'
  if (view === 'landing') {
    return (
      <LandingPage 
        onNavigateToAuth={(mode) => {
          setAuthMode(mode);
          setView('auth');
        }} 
      />
    );
  }

  if (view === 'auth') {
    return (
      <Auth 
        initialMode={authMode} 
        onAuthSuccess={handleAuthSuccess} 
        onBackToLanding={() => setView('landing')} 
      />
    );
  }

  return (
    <div className="app-container animate-fade-in">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="logo-title">Vesta - Gerenciador de Despesas</h1>
          </div>
        </div>

        {user && (
          <div className="user-profile-header">
            <button
              onClick={() => setShowBankManager(true)}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '0.45rem 1rem' }}
              title="Gerenciar bancos"
            >
              <Building2 size={16} />
              <span>Bancos{banks.length > 0 ? ` (${banks.length})` : ''}</span>
            </button>
            <div className="user-info">
              <div className="user-avatar">
                <UserIcon size={16} />
              </div>
              <span className="username-display">{user.username}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary logout-btn" 
              style={{ width: 'auto', padding: '0.45rem 1rem' }}
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        )}
      </header>

      {/* Cards de Resumo */}
      <SummaryCards expenses={expenses} banks={banks} />

      {/* Barra de Filtros */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Filters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onRefresh={loadExpenses}
          loading={loading}
          banks={banks}
        />
      </div>

      {/* Grid Principal */}
      <div className="dashboard-grid">
        {/* Coluna da Esquerda: Gráfico e Lista */}
        <div className="main-section">
          {/* Card do Gráfico */}
          <div className="glass-card">
            <h3 className="card-title">
              <PieChart size={18} className="logo-icon" style={{ padding: '2px', background: 'var(--primary)' }} />
              Gastos por Categoria
            </h3>
            {loading ? (
              <div className="loader-container">
                <div className="spinner" />
                <p style={{ fontSize: '0.85rem' }}>Carregando gráfico...</p>
              </div>
            ) : (
              <ExpenseChart expenses={expenses} />
            )}
          </div>

          {/* Card da Listagem */}
          {error ? (
            <div className="glass-card" style={{ display: 'flex', gap: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <AlertTriangle size={24} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'var(--danger)', fontWeight: 700 }}>Erro de Conexão</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {error}
                </p>
                <button 
                  onClick={() => loadExpenses()} 
                  className="btn btn-secondary" 
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', marginTop: '0.75rem' }}
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          ) : loading && expenses.length === 0 ? (
            <div className="glass-card loader-container">
              <div className="spinner" />
              <p style={{ fontSize: '0.85rem' }}>Carregando despesas...</p>
            </div>
          ) : (
            <ExpenseList
              expenses={expenses}
              onDelete={handleDeleteExpense}
              onEdit={handleEditExpense}
              editingId={editingExpense?.id}
            />
          )}
        </div>

        {/* Coluna da Direita: Formulário */}
        <div>
          <ExpenseForm
            onSubmit={handleSubmitExpense}
            editingExpense={editingExpense}
            onCancelEdit={handleCancelEdit}
            banks={banks}
          />
        </div>
      </div>

      {/* Modal de Gerenciamento de Bancos */}
      {showBankManager && (
        <BankManager
          banks={banks}
          onAddBank={handleAddBank}
          onDeleteBank={handleDeleteBank}
          onClose={() => setShowBankManager(false)}
        />
      )}
    </div>
  );
}
