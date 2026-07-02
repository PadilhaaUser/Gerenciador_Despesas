from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Expense, RecurringExpense
from datetime import date

class ExpenseAPITests(APITestCase):
    def setUp(self):
        # Cria usuário de teste e configura cabeçalho de autenticação
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        # Cria algumas despesas de teste vinculadas ao usuário
        self.expense1 = Expense.objects.create(
            user=self.user,
            titulo="Mercado",
            valor=150.00,
            categoria="alimentacao",
            data=date(2026, 6, 1),
            descricao="Compras do mês"
        )
        self.expense2 = Expense.objects.create(
            user=self.user,
            titulo="Combustível",
            valor=80.00,
            categoria="transporte",
            data=date(2026, 6, 2)
        )
        self.expense3 = Expense.objects.create(
            user=self.user,
            titulo="Cinema",
            valor=50.00,
            categoria="lazer",
            data=date(2026, 5, 15)  # Mês anterior
        )
        self.list_url = reverse('expense-list')

    def test_list_expenses_authenticated(self):
        """Testa se a API lista todas as despesas corretas do usuário logado"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_list_expenses_unauthenticated(self):
        """Testa se a API recusa listar sem token de autenticação"""
        self.client.credentials()  # Remove credenciais
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_expense(self):
        """Testa a criação de uma nova despesa via POST"""
        data = {
            "titulo": "Remédio",
            "valor": "35.50",
            "categoria": "saude",
            "data": "2026-06-03",
            "descricao": "Analgésico"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # O banco do usuário deve ter 4 despesas agora
        self.assertEqual(Expense.objects.filter(user=self.user).count(), 4)
        self.assertEqual(Expense.objects.latest('id').titulo, "Remédio")
        self.assertEqual(Expense.objects.latest('id').user, self.user)

    def test_create_invalid_expense(self):
        """Testa se o validador de valor positivo funciona"""
        data = {
            "titulo": "Erro",
            "valor": "-10.00",  # Valor negativo inválido
            "categoria": "outros",
            "data": "2026-06-03"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Expense.objects.filter(user=self.user).count(), 3)

    def test_filter_by_category(self):
        """Testa o filtro por categoria via query param"""
        response = self.client.get(self.list_url, {'categoria': 'alimentacao'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titulo'], "Mercado")

    def test_filter_by_period(self):
        """Testa o filtro de período (mês e ano) via query params"""
        response = self.client.get(self.list_url, {'mes': 6, 'ano': 2026})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        response = self.client.get(self.list_url, {'mes': 5, 'ano': 2026})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titulo'], "Cinema")

    def test_delete_expense(self):
        """Testa a remoção de uma despesa via DELETE"""
        detail_url = reverse('expense-detail', args=[self.expense1.id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Expense.objects.filter(user=self.user).count(), 2)

    def test_data_isolation_between_users(self):
        """Testa se um usuário não consegue ver nem alterar dados de outro usuário"""
        # Cria outro usuário e despesas para ele
        other_user = User.objects.create_user(username="otheruser", password="password123")
        other_expense = Expense.objects.create(
            user=other_user,
            titulo="Outro Mercado",
            valor=250.00,
            categoria="alimentacao",
            data=date(2026, 6, 1)
        )
        
        # Como self.user logado, deve ver apenas 3 despesas, não a do other_user
        response = self.client.get(self.list_url)
        self.assertEqual(len(response.data), 3)
        for exp in response.data:
            self.assertNotEqual(exp['id'], other_expense.id)

        # Tentativa de deletar despesa de outro usuário deve dar 404 (pois get_queryset filtra)
        detail_url = reverse('expense-detail', args=[other_expense.id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class AuthAPITests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.username = "newuser"
        self.password = "password123"
        self.email = "newuser@example.com"

    def test_register_user_success(self):
        """Testa registro de usuário com sucesso"""
        data = {
            "username": self.username,
            "password": self.password,
            "email": self.email
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], self.username)
        self.assertEqual(User.objects.filter(username=self.username).count(), 1)

    def test_register_user_duplicate_username(self):
        """Testa registro de usuário com nome já existente"""
        User.objects.create_user(username=self.username, password=self.password)
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_login_user_success(self):
        """Testa login de usuário com credenciais corretas"""
        User.objects.create_user(username=self.username, password=self.password)
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], self.username)

    def test_login_user_invalid_password(self):
        """Testa login de usuário com senha incorreta"""
        User.objects.create_user(username=self.username, password=self.password)
        data = {
            "username": self.username,
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('token', response.data)


class RecurringExpenseAPITests(APITestCase):
    def setUp(self):
        # Cria usuário de teste e configura cabeçalho de autenticação
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.list_url = reverse('recurring-expense-list')

    def test_create_recurring_expense_generates_installments(self):
        """Testa se a criação de uma mensalidade gera as parcelas de despesa corretas"""
        data = {
            "titulo": "Academia",
            "valor": "120.00",
            "categoria": "saude",
            "data_inicio": "2026-07-02",
            "meses_totais": 3,
            "descricao": "Mensalidade da academia"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Deve ter criado 1 RecurringExpense
        self.assertEqual(RecurringExpense.objects.filter(user=self.user).count(), 1)
        # Deve ter gerado 3 Expenses correspondentes
        self.assertEqual(Expense.objects.filter(user=self.user).count(), 3)
        
        # Verifica os títulos e parcelas
        expenses = Expense.objects.filter(user=self.user).order_by('data')
        self.assertEqual(expenses[0].titulo, "Academia (1/3)")
        self.assertEqual(expenses[0].data, date(2026, 7, 2))
        self.assertEqual(expenses[0].num_parcela, 1)
        
        self.assertEqual(expenses[1].titulo, "Academia (2/3)")
        self.assertEqual(expenses[1].data, date(2026, 8, 2))
        self.assertEqual(expenses[1].num_parcela, 2)
        
        self.assertEqual(expenses[2].titulo, "Academia (3/3)")
        self.assertEqual(expenses[2].data, date(2026, 9, 2))
        self.assertEqual(expenses[2].num_parcela, 3)

    def test_date_calculation_month_overflows(self):
        """Testa o cálculo de datas com estouros de fim de mês (ex: 31 de janeiro)"""
        data = {
            "titulo": "Netflix",
            "valor": "55.90",
            "categoria": "lazer",
            "data_inicio": "2026-01-31",
            "meses_totais": 3
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        expenses = Expense.objects.filter(user=self.user).order_by('data')
        # Parcelas devem cair em 31/Jan, 28/Fev (não bissexto) e 31/Mar
        self.assertEqual(expenses[0].data, date(2026, 1, 31))
        self.assertEqual(expenses[1].data, date(2026, 2, 28))
        self.assertEqual(expenses[2].data, date(2026, 3, 31))

    def test_delete_recurring_expense_cascades(self):
        """Testa se a deleção de uma mensalidade remove todas as parcelas associadas"""
        data = {
            "titulo": "Internet",
            "valor": "99.90",
            "categoria": "outros",
            "data_inicio": "2026-07-02",
            "meses_totais": 4
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        rec_id = response.data['id']
        
        # Deve ter 4 despesas criadas
        self.assertEqual(Expense.objects.filter(user=self.user).count(), 4)
        
        # Deleta a mensalidade
        detail_url = reverse('recurring-expense-detail', args=[rec_id])
        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Despesas devem ter sido removidas (cascade cascade)
        self.assertEqual(Expense.objects.filter(user=self.user).count(), 0)
        self.assertEqual(RecurringExpense.objects.filter(user=self.user).count(), 0)
