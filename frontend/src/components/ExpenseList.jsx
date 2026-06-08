import React from 'react';
import { Trash2, Edit3, Inbox, Calendar, Tag } from 'lucide-react';

export default function ExpenseList({ expenses, onDelete, onEdit, editingId }) {
  // Formatar Moeda em BRL
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  // Formatar data para exibição pt-BR (dd/mm/aaaa) a partir do formato aaaa-mm-dd
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (expenses.length === 0) {
    return (
      <div className="glass-card empty-state">
        <Inbox size={40} className="empty-state-icon" />
        <h3>Nenhuma despesa encontrada</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Tente limpar os filtros ou adicione uma nova despesa para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>
        Despesas Registradas
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
        Mostrando {expenses.length} despesa(s) ordenada(s) por data
      </p>

      <div className="expense-list-container">
        {expenses.map((expense) => {
          const isEditing = editingId === expense.id;
          
          return (
            <div 
              key={expense.id} 
              className={`expense-item ${isEditing ? 'editing' : ''}`}
              style={isEditing ? { borderLeft: '4px solid var(--primary)' } : {}}
            >
              <div className="expense-left">
                {/* Indicador de cor lateral baseado na categoria */}
                <div className={`cat-indicator cat-${expense.categoria}`} />
                
                <div className="expense-info-block">
                  <span className="expense-title">{expense.titulo}</span>
                  <div className="expense-date-cat">
                    <span className={`badge ${expense.categoria}`}>
                      {expense.categoria_display}
                    </span>
                    <span className="dot" />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={12} /> {formatDate(expense.data)}
                    </span>
                  </div>
                  {expense.descricao && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {expense.descricao}
                    </span>
                  )}
                </div>
              </div>

              <div className="expense-right">
                <span className="expense-value">
                  {formatCurrency(expense.valor)}
                </span>
                
                <div className="expense-actions">
                  {/* Editar */}
                  <button
                    onClick={() => onEdit(expense)}
                    className="btn-edit-icon"
                    title="Editar despesa"
                    aria-label={`Editar despesa ${expense.titulo}`}
                  >
                    <Edit3 size={14} />
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja remover "${expense.titulo}"?`)) {
                        onDelete(expense.id);
                      }
                    }}
                    className="btn-danger-icon"
                    title="Excluir despesa"
                    aria-label={`Excluir despesa ${expense.titulo}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
