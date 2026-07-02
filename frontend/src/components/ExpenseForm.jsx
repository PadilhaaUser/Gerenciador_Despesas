import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, XCircle, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExpenseForm({ onSubmit, editingExpense, onCancelEdit, banks = [] }) {
  const initialFormState = {
    titulo: '',
    valor: '',
    categoria: 'alimentacao',
    data: new Date().toISOString().split('T')[0], // Padrão para hoje
    descricao: '',
    banco: '',
    isRecorrente: false,
    mesesTotais: 12,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [detectedFeedback, setDetectedFeedback] = useState('');

  // Prefilha os campos ao entrar no modo de edição
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        titulo: editingExpense.titulo,
        valor: editingExpense.valor,
        categoria: editingExpense.categoria,
        data: editingExpense.data,
        descricao: editingExpense.descricao || '',
        banco: editingExpense.banco || '',
        isRecorrente: false,
        mesesTotais: 12,
      });
      setErrors({});
      setDetectedFeedback('');
    } else {
      setFormData(initialFormState);
      setDetectedFeedback('');
    }
  }, [editingExpense]);

  const detectDateFromTitle = (titleText) => {
    if (!titleText) return null;

    const currentYear = new Date().getFullYear();
    let day = null, month = null, year = null;

    // 1. Tentar formato DD/MM/AAAA (ex: 15/07/2026)
    const matchFull = titleText.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
    if (matchFull) {
      day = parseInt(matchFull[1], 10);
      month = parseInt(matchFull[2], 10);
      year = parseInt(matchFull[3], 10);
    } else {
      // 2. Tentar formato DD/MM (ex: 15/07)
      const matchDayMonth = titleText.match(/\b(\d{1,2})[\/\-](\d{1,2})\b/);
      if (matchDayMonth) {
        day = parseInt(matchDayMonth[1], 10);
        month = parseInt(matchDayMonth[2], 10);
        year = currentYear;
      } else {
        // 3. Tentar "dia DD" ou "vence DD" ou "vencimento DD" (ex: dia 15)
        const matchDayOnly = titleText.match(/(?:dia|vence|vencimento|venc)\s+(\d{1,2})\b/i);
        if (matchDayOnly) {
          day = parseInt(matchDayOnly[1], 10);
          // Usa o mês e ano do campo de data atual ou da data de hoje
          const baseDate = formData.data ? new Date(formData.data + 'T00:00:00') : new Date();
          month = baseDate.getMonth() + 1;
          year = baseDate.getFullYear();
        }
      }
    }

    if (day !== null && month !== null && year !== null) {
      // Valida se a data é válida
      const testDate = new Date(year, month - 1, day);
      if (
        testDate.getFullYear() === year &&
        testDate.getMonth() === month - 1 &&
        testDate.getDate() === day
      ) {
        return {
          isoDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          formatted: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
        };
      }
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Se alterou o título, tenta detectar data
      if (name === 'titulo') {
        const detected = detectDateFromTitle(value);
        if (detected) {
          updated.data = detected.isoDate;
          setDetectedFeedback(`Data identificada: ${detected.formatted}`);
        }
      }
      
      return updated;
    });

    // Limpa feedback se o usuário alterar a data manualmente
    if (name === 'data') {
      setDetectedFeedback('');
    }

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
    if (formData.isRecorrente && (!formData.mesesTotais || parseInt(formData.mesesTotais) < 2)) {
      newErrors.mesesTotais = 'Insira uma duração de pelo menos 2 meses.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Prepara os dados: se banco for string vazia, envia null
      const dataToSend = {
        titulo: formData.titulo,
        valor: formData.valor,
        categoria: formData.categoria,
        descricao: formData.descricao,
        banco: formData.banco ? parseInt(formData.banco) : null,
      };

      if (formData.isRecorrente && !editingExpense) {
        dataToSend.data_inicio = formData.data;
        dataToSend.meses_totais = parseInt(formData.mesesTotais);
        dataToSend.isRecorrente = true;
      } else {
        dataToSend.data = formData.data;
      }

      await onSubmit(dataToSend);
      
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
        setDetectedFeedback('');
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
          {detectedFeedback && (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>
              <span>📅</span> {detectedFeedback}
            </div>
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
            <option value="aluguel">Aluguel</option>
            <option value="assinaturas">Assinaturas</option>
            <option value="luz">Luz</option>
            <option value="agua">Água</option>
            <option value="internet">Internet</option>
            <option value="produtos">Produtos (geral)</option>
            <option value="roupas">Roupas</option>
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

        {/* Banco (Opcional) */}
        {banks.length > 0 && (
          <div className="form-group">
            <label htmlFor="banco" className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={14} />
                Banco (Opcional)
              </span>
            </label>
            <select
              id="banco"
              name="banco"
              value={formData.banco}
              onChange={handleChange}
              className="select-custom"
              style={{ width: '100%' }}
            >
              <option value="">Sem banco associado</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.id}>
                  {bank.nome}
                </option>
              ))}
            </select>
          </div>
        )}

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

        {/* Mensalidade / Recorrência (Apenas ao Criar) */}
        {!editingExpense && (
          <div style={{
            margin: '1.25rem 0',
            padding: '0.85rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed rgba(255,255,255,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="isRecorrente"
                name="isRecorrente"
                checked={formData.isRecorrente}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    isRecorrente: e.target.checked
                  }));
                }}
                style={{ width: 'auto', cursor: 'pointer', margin: 0 }}
              />
              <label htmlFor="isRecorrente" className="form-label" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 600 }}>
                É uma mensalidade (despesa recorrente)?
              </label>
            </div>

            {formData.isRecorrente && (
              <div className="form-group animate-fade-in" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                <label htmlFor="mesesTotais" className="form-label">Duração (quantidade de meses)</label>
                <input
                  type="number"
                  id="mesesTotais"
                  name="mesesTotais"
                  value={formData.mesesTotais}
                  onChange={handleChange}
                  min="2"
                  max="60"
                  className="input-custom"
                  style={{ width: '100%' }}
                  required
                />
                {errors.mesesTotais && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                    {errors.mesesTotais}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

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
