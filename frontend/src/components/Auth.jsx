import React, { useState } from 'react';
import { api } from '../services/api';
import { User, Lock, Mail, ShieldAlert, ArrowLeft, ArrowRight, Eye, EyeOff, Loader } from 'lucide-react';

export default function Auth({ onAuthSuccess, onBackToLanding, initialMode }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'register');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    if (!formData.username.trim()) {
      setError('O nome de usuário é obrigatório.');
      return false;
    }
    if (!isLogin && !formData.email.trim()) {
      setError('O e-mail é obrigatório.');
      return false;
    }
    if (!isLogin && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Por favor, insira um e-mail válido.');
      return false;
    }
    if (!formData.password) {
      setError('A senha é obrigatória.');
      return false;
    }
    if (!isLogin && formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await api.login(formData.username, formData.password);
      } else {
        data = await api.register(formData.username, formData.email, formData.password);
      }
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao realizar autenticação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glass-container">
        
        {/* Botão para voltar à Landing */}
        <button className="auth-back-btn" onClick={onBackToLanding}>
          <ArrowLeft size={16} />
          Voltar para o Início
        </button>

        <div className="auth-card-body">
          <div className="auth-header">
            <h2 className="auth-title">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta grátis'}
            </h2>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Insira suas credenciais para gerenciar suas finanças' 
                : 'Comece a economizar e ter o controle de seus gastos hoje mesmo'}
            </p>
          </div>

          {error && (
            <div className="auth-error-alert">
              <ShieldAlert size={18} className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            
            {/* Campo Usuário */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-username">Nome de Usuário</label>
              <div className="input-with-icon-wrapper">
                <User size={18} className="input-field-icon" />
                <input
                  id="auth-username"
                  name="username"
                  type="text"
                  className="input-custom input-with-icon"
                  placeholder="Ex: joao_silva"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo E-mail (Somente no Cadastro) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">Endereço de E-mail</label>
                <div className="input-with-icon-wrapper">
                  <Mail size={18} className="input-field-icon" />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    className="input-custom input-with-icon"
                    placeholder="Ex: joao@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Campo Senha */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Senha</label>
              <div className="input-with-icon-wrapper">
                <Lock size={18} className="input-field-icon" />
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-custom input-with-icon"
                  placeholder="Sua senha secreta"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Senha (Somente no Cadastro) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm-password">Confirmar Senha</label>
                <div className="input-with-icon-wrapper">
                  <Lock size={18} className="input-field-icon" />
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="input-custom input-with-icon"
                    placeholder="Confirme a senha anterior"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader size={18} className="spinner-icon animate-spin" />
                  Aguarde um momento...
                </>
              ) : (
                <>
                  {isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Dica de Credenciais Rápidas no Login */}
          {isLogin && (
            <div className="credentials-tip">
              <span className="dot bg-primary" />
              <p>Dica: Você pode criar uma conta agora ou acessar com dados de cadastro se já existirem.</p>
            </div>
          )}

          {/* Alternar entre Login/Cadastro */}
          <div className="auth-footer-toggle">
            {isLogin ? (
              <p>
                Não tem uma conta?{' '}
                <button 
                  type="button" 
                  className="auth-link-toggle"
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : (
              <p>
                Já possui uma conta?{' '}
                <button 
                  type="button" 
                  className="auth-link-toggle"
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Faça login
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
