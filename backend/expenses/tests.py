from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Expense
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
