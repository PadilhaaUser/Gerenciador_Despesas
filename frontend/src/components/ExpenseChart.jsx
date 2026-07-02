import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

export default function ExpenseChart({ expenses }) {
  // 1. Agrupar os valores por categoria
  const categoriesMap = {
    alimentacao: { name: 'Alimentação', value: 0, color: '#60a5fa' },
    transporte: { name: 'Transporte', value: 0, color: '#fb923c' },
    lazer: { name: 'Lazer', value: 0, color: '#f472b6' },
    saude: { name: 'Saúde', value: 0, color: '#34d399' },
    aluguel: { name: 'Aluguel', value: 0, color: '#fb7185' },
    assinaturas: { name: 'Assinaturas', value: 0, color: '#38bdf8' },
    luz: { name: 'Luz', value: 0, color: '#f59e0b' },
    agua: { name: 'Água', value: 0, color: '#0ea5e9' },
    internet: { name: 'Internet', value: 0, color: '#6366f1' },
    produtos: { name: 'Produtos (geral)', value: 0, color: '#ec4899' },
    roupas: { name: 'Roupas', value: 0, color: '#14b8a6' },
    outros: { name: 'Outros', value: 0, color: '#a78bfa' },
  };

  expenses.forEach(exp => {
    if (categoriesMap[exp.categoria]) {
      categoriesMap[exp.categoria].value += parseFloat(exp.valor);
    }
  });

  // Converte em array e filtra categorias com valor > 0
  const chartData = Object.values(categoriesMap).filter(cat => cat.value > 0);

  // Formatação de Moeda
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Tooltip customizado para manter a identidade visual premium
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="chart-tooltip-val">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container-inner" style={{ color: '#64748b', fontSize: '0.9rem' }}>
        Sem despesas para o período selecionado para exibir o gráfico.
      </div>
    );
  }

  return (
    <div className="chart-container-inner">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={11}
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11}
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
