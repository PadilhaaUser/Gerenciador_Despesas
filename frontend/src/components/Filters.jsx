import React from 'react';
import { Filter } from 'lucide-react';

export default function Filters({ filters, onFilterChange }) {
  const categories = [
    { value: '', label: 'Todas as Categorias' },
    { value: 'alimentacao', label: 'Alimentação' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'lazer', label: 'Lazer' },
    { value: 'saude', label: 'Saúde' },
    { value: 'outros', label: 'Outros' },
  ];

  const months = [
    { value: '', label: 'Todos os Meses' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  // Anos dinâmicos para a seleção do portfólio
  const years = [
    { value: '', label: 'Todos os Anos' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
    { value: '2027', label: '2027' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({ categoria: '', mes: '', ano: '' });
  };

  const hasActiveFilters = filters.categoria || filters.mes || filters.ano;

  return (
    <div className="glass-card filters-bar" style={{ padding: '1rem 1.25rem' }}>
      <div className="filters-group">
        {/* Filtro por Categoria */}
        <select
          name="categoria"
          value={filters.categoria}
          onChange={handleChange}
          className="select-custom"
          aria-label="Filtrar por categoria"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Filtro por Mês */}
        <select
          name="mes"
          value={filters.mes}
          onChange={handleChange}
          className="select-custom"
          aria-label="Filtrar por mês"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Filtro por Ano */}
        <select
          name="ano"
          value={filters.ano}
          onChange={handleChange}
          className="select-custom"
          aria-label="Filtrar por ano"
        >
          {years.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={handleClearFilters}
          className="btn btn-secondary"
          style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
        >
          Limpar Filtros
        </button>
      )}
    </div>
  );
}
