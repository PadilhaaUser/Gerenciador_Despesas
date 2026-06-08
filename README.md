# Gerenciador de Despesas Pessoais Fullstack

Este é um projeto fullstack de **Gerenciador de Despesas Pessoais** desenvolvido para demonstração e portfólio. Ele conta com uma API REST robusta desenvolvida em Django e Django REST Framework e uma interface web moderna e reativa desenvolvida em React + Vite.

O banco de dados do projeto está pronto para se integrar com o serviço de PostgreSQL na nuvem **Neon.tech**, com um fallback inteligente para **SQLite local** para facilitar a inicialização inicial do projeto sem qualquer atrito de configuração.

---

## 🏗️ Estrutura do Projeto

O repositório é dividido em duas pastas principais:
- `/backend`: API REST construída com Django, Django REST Framework, Django CORS Headers, django-filter e psycopg2.
- `/frontend`: Aplicação SPA construída com React, Vite, Recharts (para gráficos) e Lucide React (ícones).

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- Python (versão 3.10 ou superior)
- Node.js (versão 18 ou superior) e npm

---

### 2. Configurando o Backend (Django)

1. Entre no diretório do backend:
   ```bash
   cd backend
   ```

2. Crie um ambiente virtual Python:
   ```bash
   # No Windows (PowerShell/CMD):
   python -m venv venv
   ```

3. Ative o ambiente virtual:
   ```bash
   # No Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   
   # No Windows (CMD):
   .\venv\Scripts\activate.bat
   
   # No Linux/macOS:
   source venv/bin/activate
   ```

4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

5. Configurando o Banco de Dados (PostgreSQL via **Neon.tech**):
   - Crie uma conta gratuita em [Neon.tech](https://neon.tech/) e inicie um novo projeto de banco de dados.
   - Copie a **Connection String** gerada (começando com `postgres://...`).
   - Crie um arquivo `.env` dentro da pasta `backend/` seguindo o modelo do arquivo `.env.example`:
     ```env
     DEBUG=True
     SECRET_KEY=sua-chave-secreta-de-desenvolvimento
     DATABASE_URL=postgres://seu_usuario:sua_senha@seu_host.neon.tech/neondb?sslmode=require
     ```
   - *Nota: Caso o arquivo `.env` ou a variável `DATABASE_URL` não estejam presentes, o sistema iniciará automaticamente em **SQLite** criando o arquivo `db.sqlite3` na pasta raíz do backend.*

6. Execute as migrações para criar as tabelas no banco de dados:
   ```bash
   python manage.py migrate
   ```

7. Popule o banco com dados de teste realistas utilizando nosso comando de semente customizado:
   ```bash
   python manage.py seed_expenses
   ```

8. Inicie o servidor local do Django:
   ```bash
   python manage.py runserver
   ```
   *O backend estará rodando no endereço [http://localhost:8000](http://localhost:8000).*

---

### 3. Configurando o Frontend (React + Vite)

1. Abra um novo terminal e navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências do Node.js:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
   *O frontend estará disponível no endereço [http://localhost:5173](http://localhost:5173).*

---

## 🎨 Características do Design e Funcionalidades

- **Design Premium Glassmorphism**: Interface construída em Vanilla CSS com tema escuro elegante, painéis translúcidos, sombras suaves e micro-interações integradas.
- **Gráfico Interativo por Categoria**: Gráfico de barras responsivo com Recharts exibindo a divisão dos gastos em tempo real.
- **Filtros Combinados**: Filtros de gastos por Categoria e período (Mês/Ano) de forma reativa e integrada com endpoints do Django.
- **Estatísticas Rápidas**: Sumarização automática do Total Gasto, Maior Categoria de Gastos e quantidade de despesas ativas nos filtros.
- **Confetti de Sucesso**: Efeito de celebração visual ao registrar uma nova despesa no sistema.
