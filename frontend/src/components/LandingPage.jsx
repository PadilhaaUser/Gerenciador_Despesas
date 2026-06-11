import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Shield, 
  Layers, 
  Zap, 
  CheckCircle, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

export default function LandingPage({ onNavigateToAuth }) {
  // Estado para a demonstração interativa
  const [mockExpenses, setMockExpenses] = useState([
    { id: 1, titulo: 'Supermercado Mensal', valor: 345.50, categoria: 'alimentacao', data: '2026-06-10', descricao: 'Compras para a casa' },
    { id: 2, titulo: 'Combustível Carro', valor: 120.00, categoria: 'transporte', data: '2026-06-09', descricao: 'Posto Ipiranga' },
    { id: 3, titulo: 'Ingresso Cinema', valor: 45.00, categoria: 'lazer', data: '2026-06-08', descricao: 'Filme novo de ficção' },
    { id: 4, titulo: 'Consulta Dentista', valor: 250.00, categoria: 'saude', data: '2026-06-05', descricao: 'Check-up anual' }
  ]);

  const [simForm, setSimForm] = useState({ titulo: '', valor: '', categoria: 'alimentacao' });
  const [showSimAlert, setShowSimAlert] = useState(false);

  // Manipuladores da simulação
  const handleAddSim = (e) => {
    e.preventDefault();
    if (!simForm.titulo.trim() || !simForm.valor) return;

    const newExp = {
      id: Date.now(),
      titulo: simForm.titulo,
      valor: parseFloat(simForm.valor),
      categoria: simForm.categoria,
      data: new Date().toISOString().split('T')[0],
      descricao: 'Adicionado na simulação'
    };

    setMockExpenses([newExp, ...mockExpenses]);
    setSimForm({ titulo: '', valor: '', categoria: 'alimentacao' });
    setShowSimAlert(true);
    setTimeout(() => setShowSimAlert(false), 4000);
  };

  const handleDeleteSim = (id) => {
    setMockExpenses(mockExpenses.filter(e => e.id !== id));
  };

  // Cálculos da simulação
  const totalExpenses = mockExpenses.reduce((sum, item) => sum + item.valor, 0);
  const mockReceita = 3500.00;
  const mockBalance = mockReceita - totalExpenses;

  // Categoria displays e cores
  const catMetadata = {
    alimentacao: { name: 'Alimentação', color: '#60a5fa', percentage: 0 },
    transporte: { name: 'Transporte', color: '#fb923c', percentage: 0 },
    lazer: { name: 'Lazer', color: '#f472b6', percentage: 0 },
    saude: { name: 'Saúde', color: '#34d399', percentage: 0 },
    outros: { name: 'Outros', color: '#a78bfa', percentage: 0 }
  };

  // Cálculo das porcentagens de gastos
  const catTotals = mockExpenses.reduce((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;
    return acc;
  }, {});

  Object.keys(catMetadata).forEach(cat => {
    const total = catTotals[cat] || 0;
    catMetadata[cat].percentage = totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0;
    catMetadata[cat].amount = total;
  });

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-layout">
      {/* Header */}
      <header className="landing-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Wallet size={22} />
          </div>
          <div>
            <h1 className="logo-title">Vesta</h1>
          </div>
        </div>
        <nav className="landing-nav">
          <button onClick={() => scrollToSection('features')} className="nav-link">Benefícios</button>
          <button onClick={() => scrollToSection('preview')} className="nav-link">Demonstração</button>
          <button onClick={() => onNavigateToAuth('login')} className="btn btn-secondary nav-btn-login" style={{ width: 'auto' }}>
            Entrar
          </button>
          <button onClick={() => onNavigateToAuth('register')} className="btn btn-primary nav-btn-register" style={{ width: 'auto' }}>
            Criar Conta
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="hero-badge-icon animate-pulse" />
            <span>Gerenciador de Despesas Premium</span>
          </div>
          <h1 className="hero-title">
            Assuma o controle total do seu <span className="gradient-text">dinheiro</span> com estilo
          </h1>
          <p className="hero-description">
            Vesta oferece uma experiência visual limpa, fluida e com tecnologia de ponta para você planejar, categorizar e gerenciar seus gastos diários de forma descomplicada.
          </p>
          <div className="hero-actions">
            <button onClick={() => onNavigateToAuth('register')} className="btn btn-primary hero-btn-start">
              Começar Grátis agora
              <ArrowRight size={18} />
            </button>
            <button onClick={() => scrollToSection('preview')} className="btn btn-secondary hero-btn-preview">
              Ver Preview Interativo
            </button>
          </div>
        </div>
        <div className="hero-art-container">
          <div className="hero-glow" />
          <div className="hero-floating-card card-1">
            <TrendingUp size={24} style={{ color: 'var(--success)' }} />
            <div>
              <span>Meta de Economia</span>
              <strong>+ 28% este mês</strong>
            </div>
          </div>
          <div className="hero-floating-card card-2">
            <Wallet size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <span>Saldo Disponível</span>
              <strong>R$ 4.280,00</strong>
            </div>
          </div>
          <div className="hero-visual-mesh">
            <div className="mesh-line" />
            <div className="mesh-line" />
            <div className="mesh-line" />
          </div>
        </div>
      </section>

      {/* Seção Benefícios */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Por que escolher o Vesta?</h2>
          <p className="section-subtitle">Tudo o que você precisa para manter as suas contas em dia em um só painel.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={22} className="feature-icon" />
            </div>
            <h3>Rapidez Incomparável</h3>
            <p>Cadastre seus gastos diários em segundos com nosso formulário otimizado e atalhos pensados na sua rotina.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Layers size={22} className="feature-icon" style={{ color: '#fb923c' }} />
            </div>
            <h3>Filtros Inteligentes</h3>
            <p>Filtre seus gastos por categoria, mês ou ano em tempo real com carregamento instantâneo.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <TrendingUp size={22} className="feature-icon" style={{ color: '#34d399' }} />
            </div>
            <h3>Gráficos Visuais</h3>
            <p>Monitore suas maiores categorias de gastos com gráficos circulares modernos e distribuição percentual clara.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Shield size={22} className="feature-icon" style={{ color: '#60a5fa' }} />
            </div>
            <h3>Segurança dos Seus Dados</h3>
            <p>Suas despesas são totalmente isoladas e seguras na sua conta, protegidas por autenticação forte.</p>
          </div>
        </div>
      </section>

      {/* Seção Preview Interativo */}
      <section id="preview" className="preview-section">
        <div className="section-header">
          <div className="preview-pill">Área de Testes</div>
          <h2 className="section-title">Experimente o Painel antes de entrar</h2>
          <p className="section-subtitle">Abaixo está um simulador em tempo real. Adicione itens e veja a mágica acontecer!</p>
        </div>

        {showSimAlert && (
          <div className="sim-toast-success">
            <Sparkles size={18} className="sim-toast-icon" />
            <p>
              <strong>Simulação ativa!</strong> Os dados acima são fictícios. Para salvar e gerenciar suas despesas de verdade,{' '}
              <button onClick={() => onNavigateToAuth('register')} className="sim-toast-link">crie uma conta gratuita</button>.
            </p>
          </div>
        )}

        <div className="mock-dashboard-wrapper">
          {/* Topo informativo do Mock Dashboard */}
          <div className="mock-db-header">
            <div className="mock-db-title-bar">
              <div className="mock-dot red" />
              <div className="mock-dot yellow" />
              <div className="mock-dot green" />
              <span className="mock-db-url">vesta.com/demonstracao-painel</span>
            </div>
          </div>

          {/* Interior do Mock Dashboard */}
          <div className="mock-db-content">
            {/* Cards de Resumo */}
            <div className="summary-container" style={{ marginBottom: '1.25rem' }}>
              <div className="glass-card summary-card" style={{ '--card-accent': 'var(--success)' }}>
                <div className="summary-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="summary-content">
                  <h4>Receitas Estimadas</h4>
                  <p>R$ {mockReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span className="summary-subtitle">Fixo Mensal de Teste</span>
                </div>
              </div>

              <div className="glass-card summary-card" style={{ '--card-accent': 'var(--danger)' }}>
                <div className="summary-icon">
                  <TrendingDown size={20} />
                </div>
                <div className="summary-content">
                  <h4>Total Despesas</h4>
                  <p>R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span className="summary-subtitle">Soma das Despesas de Simulação</span>
                </div>
              </div>

              <div className="glass-card summary-card" style={{ '--card-accent': 'var(--primary)' }}>
                <div className="summary-icon">
                  <DollarSign size={20} />
                </div>
                <div className="summary-content">
                  <h4>Saldo Simulador</h4>
                  <p style={{ color: mockBalance < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                    R$ {mockBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="summary-subtitle">Receitas - Despesas</span>
                </div>
              </div>
            </div>

            {/* Grid Principal do Dashboard Simulador */}
            <div className="dashboard-grid">
              
              {/* Lado Esquerdo: Gráfico e Lista */}
              <div className="main-section">
                
                {/* Distribuição por Categoria em CSS */}
                <div className="glass-card">
                  <h3 className="card-title">
                    <span className="logo-icon" style={{ padding: '2px', background: 'var(--primary)' }}>
                      <Layers size={14} />
                    </span>
                    Resumo de Gastos Simulados
                  </h3>
                  
                  {totalExpenses === 0 ? (
                    <div className="empty-chart-mock">
                      <p>Nenhum gasto adicionado na simulação para gerar relatório.</p>
                    </div>
                  ) : (
                    <div className="mock-chart-details-list">
                      {Object.keys(catMetadata).map(catKey => {
                        const { name, color, percentage, amount } = catMetadata[catKey];
                        if (amount === 0) return null;
                        return (
                          <div key={catKey} className="mock-chart-row">
                            <div className="mock-chart-row-info">
                              <span className="mock-chart-color-dot" style={{ backgroundColor: color }} />
                              <span className="mock-chart-category-name">{name}</span>
                              <span className="mock-chart-percentage">({percentage}%)</span>
                            </div>
                            <div className="mock-chart-progress-bar-wrapper">
                              <div className="mock-chart-progress-bar-fill" style={{ backgroundColor: color, width: `${percentage}%` }} />
                            </div>
                            <span className="mock-chart-amount">R$ {amount.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Lista de Transações Simulação */}
                <div className="glass-card">
                  <div className="list-header" style={{ marginTop: 0 }}>
                    <h3 className="card-title" style={{ marginBottom: 0 }}>
                      Transações Cadastradas ({mockExpenses.length})
                    </h3>
                    <span className="badge-dev" style={{ fontSize: '0.65rem' }}>Simulação</span>
                  </div>

                  <div className="expense-list-container" style={{ maxHeight: '300px' }}>
                    {mockExpenses.length === 0 ? (
                      <div className="empty-state">
                        <p className="empty-state-title">Nenhuma despesa simulada cadastrada.</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Use o formulário à direita para simular um cadastro.</p>
                      </div>
                    ) : (
                      mockExpenses.map(item => (
                        <div key={item.id} className="expense-item">
                          <div className="expense-left">
                            <div className={`cat-indicator cat-${item.categoria}`} />
                            <div className="expense-info-block">
                              <span className="expense-title">{item.titulo}</span>
                              <div className="expense-date-cat">
                                <span className={`badge ${item.categoria}`}>{catMetadata[item.categoria].name}</span>
                                <span className="dot" />
                                <span>{item.data}</span>
                              </div>
                            </div>
                          </div>
                          <div className="expense-right">
                            <span className="expense-value">R$ {item.valor.toFixed(2)}</span>
                            <button 
                              onClick={() => handleDeleteSim(item.id)} 
                              className="btn-danger-icon" 
                              title="Remover da simulação"
                              style={{ padding: '0.25rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Lado Direito: Formulário */}
              <div>
                <div className="glass-card">
                  <h3 className="card-title">Nova Despesa (Simulador)</h3>
                  
                  <form onSubmit={handleAddSim}>
                    <div className="form-group">
                      <label className="form-label">Título do Gasto</label>
                      <input
                        type="text"
                        className="input-custom"
                        placeholder="Ex: Almoço de Negócios"
                        value={simForm.titulo}
                        onChange={e => setSimForm({ ...simForm, titulo: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Valor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="input-custom"
                        placeholder="Ex: 45.90"
                        value={simForm.valor}
                        onChange={e => setSimForm({ ...simForm, valor: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Categoria</label>
                      <select
                        className="select-custom"
                        style={{ width: '100%' }}
                        value={simForm.categoria}
                        onChange={e => setSimForm({ ...simForm, categoria: e.target.value })}
                      >
                        <option value="alimentacao">Alimentação</option>
                        <option value="transporte">Transporte</option>
                        <option value="lazer">Lazer</option>
                        <option value="saude">Saúde</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                      <Plus size={16} />
                      Adicionar na Simulação
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Vesta Finanças. Desenvolvido com carinho para o controle eficiente de despesas pessoais.</p>
        <div className="footer-links">
          <span className="badge-dev">Seguro</span>
          <span className="badge-dev">Vite + Django</span>
        </div>
      </footer>
    </div>
  );
}
