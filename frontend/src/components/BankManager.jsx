import React, { useState } from 'react';
import { Building2, Plus, Trash2, X, Palette, Loader } from 'lucide-react';

const BANK_PRESETS = [
  { nome: 'Nubank', cor: '#820ad1' },
  { nome: 'Inter', cor: '#ee7d00' },
  { nome: 'Itaú', cor: '#003399' },
  { nome: 'Bradesco', cor: '#cc2229' },
  { nome: 'Banco do Brasil', cor: '#fff200' },
  { nome: 'Santander', cor: '#e3120b' },
  { nome: 'Sicredi', cor: '#00a650' },
  { nome: 'Caixa', cor: '#004b87' },
  { nome: 'PagBank', cor: '#21a038' },
  { nome: 'C6 Bank', cor: '#1a1a2e' },
  { nome: 'Original', cor: '#ff4500' },
];

const COLOR_OPTIONS = [
  { value: '#820ad1', label: 'Nubank (Roxo)' },
  { value: '#ee7d00', label: 'Inter (Laranja)' },
  { value: '#003399', label: 'Itaú (Azul)' },
  { value: '#cc2229', label: 'Bradesco (Vermelho)' },
  { value: '#fff200', label: 'Banco do Brasil (Amarelo)' },
  { value: '#e3120b', label: 'Santander (Vermelho)' },
  { value: '#00a650', label: 'Sicredi (Verde)' },
  { value: '#004b87', label: 'Caixa (Azul)' },
  { value: '#21a038', label: 'PagBank (Verde)' },
  { value: '#1a1a2e', label: 'C6 Bank (Preto)' },
  { value: '#ff4500', label: 'Original (Laranja)' },
  { value: '#6b7280', label: 'Outro (Cinza)' },
];

export default function BankManager({ banks, onAddBank, onDeleteBank, onClose }) {
  const [mode, setMode] = useState('list'); // 'list' | 'add'
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#6b7280');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePresetClick = async (preset) => {
    // Verifica se já existe
    const exists = banks.some(b => b.nome.toLowerCase() === preset.nome.toLowerCase());
    if (exists) {
      setError(`Você já possui "${preset.nome}" cadastrado.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onAddBank({ nome: preset.nome, cor: preset.cor });
      setError(null);
    } catch (err) {
      setError(err?.nome?.[0] || err?.message || 'Erro ao adicionar banco.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('O nome do banco é obrigatório.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onAddBank({ nome: nome.trim(), cor });
      setNome('');
      setCor('#6b7280');
      setMode('list');
    } catch (err) {
      setError(err?.nome?.[0] || err?.message || 'Erro ao adicionar banco.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bank) => {
    if (!window.confirm(`Remover "${bank.nome}"? As despesas associadas não serão excluídas, apenas perderão a associação com este banco.`)) {
      return;
    }
    setLoading(true);
    try {
      await onDeleteBank(bank.id);
    } catch (err) {
      setError('Erro ao remover o banco.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar presets que ainda não foram adicionados
  const availablePresets = BANK_PRESETS.filter(
    preset => !banks.some(b => b.nome.toLowerCase() === preset.nome.toLowerCase())
  );

  return (
    <div className="bank-manager-overlay" onClick={onClose}>
      <div className="bank-manager-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bank-manager-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="logo-icon" style={{ padding: '6px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <Building2 size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Meus Bancos</h3>
          </div>
          <button className="btn-edit-icon" onClick={onClose} title="Fechar">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="auth-error-alert" style={{ margin: '0 0 1rem 0' }}>
            <span>{error}</span>
          </div>
        )}

        {/* Lista de bancos cadastrados */}
        {banks.length > 0 && (
          <div className="bank-list">
            {banks.map(bank => (
              <div key={bank.id} className="bank-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div 
                    className="bank-color-dot" 
                    style={{ backgroundColor: bank.cor }}
                  />
                  <span className="bank-item-name">{bank.nome}</span>
                </div>
                <button
                  className="btn-danger-icon"
                  onClick={() => handleDelete(bank)}
                  title={`Remover ${bank.nome}`}
                  disabled={loading}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {banks.length === 0 && mode === 'list' && (
          <div className="bank-empty-state">
            <Building2 size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
            <p>Nenhum banco cadastrado ainda.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Adicione seus bancos para organizar despesas por conta.
            </p>
          </div>
        )}

        {/* Separador */}
        {banks.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
        )}

        {/* Modo: Adicionar */}
        {mode === 'list' ? (
          <>
            {/* Presets rápidos */}
            {availablePresets.length > 0 && (
              <div className="bank-presets-section">
                <p className="bank-presets-title">Adicionar rapidamente:</p>
                <div className="bank-presets-grid">
                  {availablePresets.map(preset => (
                    <button
                      key={preset.nome}
                      className="bank-preset-btn"
                      onClick={() => handlePresetClick(preset)}
                      disabled={loading}
                      style={{ '--preset-color': preset.cor }}
                    >
                      <div 
                        className="bank-color-dot" 
                        style={{ backgroundColor: preset.cor }}
                      />
                      <span>{preset.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botão adicionar personalizado */}
            <button
              className="btn btn-secondary bank-custom-btn"
              onClick={() => { setMode('add'); setError(null); }}
              disabled={loading}
            >
              <Plus size={16} />
              Adicionar banco personalizado
            </button>
          </>
        ) : (
          /* Formulário personalizado */
          <form onSubmit={handleCustomSubmit} className="bank-custom-form">
            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Banco personalizado
            </p>
            
            <div className="form-group">
              <label className="form-label" htmlFor="bank-nome">Nome do Banco</label>
              <input
                id="bank-nome"
                type="text"
                className="input-custom"
                placeholder="Ex: Meu Banco"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cor de identificação</label>
              <div className="bank-color-picker">
                {COLOR_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`bank-color-option ${cor === opt.value ? 'active' : ''}`}
                    style={{ backgroundColor: opt.value }}
                    onClick={() => setCor(opt.value)}
                    title={opt.label}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div className="btn-group-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setMode('list'); setError(null); }}
                disabled={loading}
              >
                Voltar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !nome.trim()}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Adicionar
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
