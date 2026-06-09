import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import SummaryCards from './components/SummaryCards';
import Filters from './components/Filters';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseChart from './components/ExpenseChart';
import { Wallet, PieChart, RefreshCw, AlertTriangle } from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({ categoria: '', mes: '', ano: '' });
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega as despesas sempre que os filtros mudarem
  const loadExpenses = async (activeFilters = filters) => {
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

  useEffect(() => {
    loadExpenses();
  }, [filters]);

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
      await api.createExpense(formData);
    }
    await loadExpenses();
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.deleteExpense(id);
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

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="logo-title">Vesta - Gerenciamento de Despesas</h1>
          </div>
        </div>
      </header>

      {/* Cards de Resumo */}
      <SummaryCards expenses={expenses} />

      {/* Barra de Filtros */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Filters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onRefresh={loadExpenses}
          loading={loading}
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
          />
        </div>
      </div>
    </div>
  );
}
