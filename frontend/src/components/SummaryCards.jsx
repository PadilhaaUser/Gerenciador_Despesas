import React from 'react';
import { DollarSign, PieChart, TrendingUp, Building2 } from 'lucide-react';

export default function SummaryCards({ expenses, banks = [] }) {
  // 1. Calcular total gasto
  const total = expenses.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

  // 2. Calcular maior categoria de gasto
  const categoryTotals = expenses.reduce((acc, curr) => {
    const valor = parseFloat(curr.valor);
    acc[curr.categoria_display] = (acc[curr.categoria_display] || 0) + valor;
    return acc;
  }, {});

  let highestCategory = 'Nenhuma';
  let highestValue = 0;
  Object.entries(categoryTotals).forEach(([category, val]) => {
    if (val > highestValue) {
      highestValue = val;
      highestCategory = category;
    }
  });

  // 3. Calcular totais por banco
  const bankTotals = {};
  expenses.forEach(exp => {
    if (exp.banco && exp.banco_nome) {
      if (!bankTotals[exp.banco]) {
        bankTotals[exp.banco] = {
          nome: exp.banco_nome,
          cor: exp.banco_cor || '#6b7280',
          total: 0,
          count: 0,
        };
      }
      bankTotals[exp.banco].total += parseFloat(exp.valor);
      bankTotals[exp.banco].count += 1;
    }
  });

  const bankTotalEntries = Object.values(bankTotals).sort((a, b) => b.total - a.total);

  // Formatação em BRL
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <>
      <div className="summary-container">
        {/* Card 1: Total Gasto */}
        <div className="glass-card summary-card" style={{ '--card-accent': '#10b981' }}>
          <div className="summary-icon">
            <DollarSign size={22} />
          </div>
          <div className="summary-content">
            <h4>Total Gasto</h4>
            <p>{formatCurrency(total)}</p>
            <div className="summary-subtitle">Filtros aplicados inclusos</div>
          </div>
        </div>

        {/* Card 2: Maior Categoria */}
        <div className="glass-card summary-card" style={{ '--card-accent': '#8b5cf6' }}>
          <div className="summary-icon">
            <TrendingUp size={22} />
          </div>
          <div className="summary-content">
            <h4>Maior Categoria</h4>
            <p>{highestCategory}</p>
            <div className="summary-subtitle">
              {highestValue > 0 ? `Total de ${formatCurrency(highestValue)}` : 'Sem registros'}
            </div>
          </div>
        </div>

        {/* Card 3: Transações */}
        <div className="glass-card summary-card" style={{ '--card-accent': '#3b82f6' }}>
          <div className="summary-icon">
            <PieChart size={22} />
          </div>
          <div className="summary-content">
            <h4>Despesas</h4>
            <p>{expenses.length}</p>
            <div className="summary-subtitle">Transações registradas</div>
          </div>
        </div>
      </div>

      {/* Cards de Totais por Banco */}
      {bankTotalEntries.length > 0 && (
        <div className="bank-summary-container">
          <h4 className="bank-summary-title">
            <Building2 size={16} />
            Totais por Banco
          </h4>
          <div className="bank-summary-grid">
            {bankTotalEntries.map(entry => (
              <div 
                key={entry.nome} 
                className="glass-card bank-summary-card"
                style={{ '--bank-color': entry.cor }}
              >
                <div className="bank-summary-indicator" style={{ background: entry.cor }} />
                <div className="bank-summary-info">
                  <span className="bank-summary-name">{entry.nome}</span>
                  <span className="bank-summary-value">{formatCurrency(entry.total)}</span>
                  <span className="bank-summary-count">
                    {entry.count} despesa{entry.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
