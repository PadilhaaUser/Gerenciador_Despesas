import React from 'react';
import { DollarSign, PieChart, TrendingUp } from 'lucide-react';

export default function SummaryCards({ expenses }) {
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

  // Formatação em BRL
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
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
  );
}
