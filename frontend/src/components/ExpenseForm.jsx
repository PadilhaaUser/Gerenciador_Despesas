import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExpenseForm({ onSubmit, editingExpense, onCancelEdit }) {
  const initialFormState = {
    titulo: '',
    valor: '',
    categoria: 'alimentacao',
    data: new Date().toISOString().split('T')[0], // Padrão para hoje
    descricao: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Prefilha os campos ao entrar no modo de edição
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        titulo: editingExpense.titulo,
        valor: editingExpense.valor,
        categoria: editingExpense.categoria,
        data: editingExpense.data,
        descricao: editingExpense.descricao || '',
      });
      setErrors({});
    } else {
      setFormData(initialFormState);
    }
  }, [editingExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpa erro específico ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'O título é obrigatório.';
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'Insira um valor maior que zero.';
    }
    if (!formData.categoria) newErrors.categoria = 'A categoria é obrigatória.';
    if (!formData.data) newErrors.data = 'A data é obrigatória.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      
      // Animação de confete apenas ao criar novas despesas!
      if (!editingExpense) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#8b5cf6', '#a78bfa', '#10b981', '#60a5fa']
        });
      }

      // Limpa formulário se não estiver editando
      if (!editingExpense) {
        setFormData(initialFormState);
      }
    } catch (err) {
      console.error(err);
      // Mapeia erros vindos da API Django (DRF)
      if (typeof err === 'object') {
        setErrors(err);
      } else {
        setErrors({ general: 'Erro ao salvar despesa. Verifique a conexão com o backend.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <h3 className="card-title">
        {editingExpense ? (
          <>
            <Save size={18} className="logo-icon" style={{ padding: '2px', background: '#8b5cf6' }} />
            Editar Despesa
          </>
        ) : (
          <>
            <PlusCircle size={18} className="logo-icon" style={{ padding: '2px', background: '#10b981' }} />
            Nova Despesa
          </>
        )}
      </h3>

      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            {errors.general}
          </div>
        )}

        {/* Título */}
        <div className="form-group">
          <label htmlFor="titulo" className="form-label">Título</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ex: Supermercado Semanal"
            className="input-custom"
            required
          />
          {errors.titulo && (
            <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              {Array.isArray(errors.titulo) ? errors.titulo[0] : errors.titulo}
            </span>
          )}
        </div>

        {/* Valor */}
        <div className="form-group">
          <label htmlFor="valor" className="form-label">Valor (R$)</label>
          <input
            type="number"
            id="valor"
            name="valor"
            value={formData.valor}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            placeholder="0,00"
            className="input-custom"
            required
          />
          {errors.valor && (
            <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              {Array.isArray(errors.valor) ? errors.valor[0] : errors.valor}
            </span>
          )}
        </div>

        {/* Categoria */}
        <div className="form-group">
          <label htmlFor="categoria" className="form-label">Categoria</label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="select-custom"
            style={{ width: '100%' }}
            required
          >
            <option value="alimentacao">Alimentação</option>
            <option value="transporte">Transporte</option>
            <option value="lazer">Lazer</option>
            <option value="saude">Saúde</option>
            <option value="outros">Outros</option>
          </select>
          {errors.categoria && (
            <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              {Array.isArray(errors.categoria) ? errors.categoria[0] : errors.categoria}
            </span>
          )}
        </div>

        {/* Data */}
        <div className="form-group">
          <label htmlFor="data" className="form-label">Data</label>
          <input
            type="date"
            id="data"
            name="data"
            value={formData.data}
            onChange={handleChange}
            className="input-custom"
            required
          />
          {errors.data && (
            <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              {Array.isArray(errors.data) ? errors.data[0] : errors.data}
            </span>
          )}
        </div>

        {/* Descrição */}
        <div className="form-group">
          <label htmlFor="descricao" className="form-label">Descrição (Opcional)</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Ex: Compra de frutas e legumes no sacolão"
            className="textarea-custom"
          />
          {errors.descricao && (
            <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              {Array.isArray(errors.descricao) ? errors.descricao[0] : errors.descricao}
            </span>
          )}
        </div>

        {/* Ações */}
        <div className="btn-group-row">
          {editingExpense && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="btn btn-secondary"
              disabled={submitting}
            >
              <XCircle size={16} />
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {editingExpense ? <Save size={16} /> : <PlusCircle size={16} />}
            {submitting ? 'Salvando...' : editingExpense ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  );
}
