from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Expense
from datetime import date

class ExpenseAPITests(APITestCase):
    def setUp(self):
        # Cria algumas despesas de teste
        self.expense1 = Expense.objects.create(
            titulo="Mercado",
            valor=150.00,
            categoria="alimentacao",
            data=date(2026, 6, 1),
            descricao="Compras do mês"
        )
        self.expense2 = Expense.objects.create(
            titulo="Combustível",
            valor=80.00,
            categoria="transporte",
            data=date(2026, 6, 2)
        )
        self.expense3 = Expense.objects.create(
            titulo="Cinema",
            valor=50.00,
            categoria="lazer",
            data=date(2026, 5, 15)  # Mês anterior
        )
        self.list_url = reverse('expense-list')

    def test_list_expenses(self):
        """Testa se a API lista todas as despesas corretas"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Deve listar 3 despesas
        self.assertEqual(len(response.data), 3)

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
        self.assertEqual(Expense.objects.count(), 4)
        self.assertEqual(Expense.objects.latest('id').titulo, "Remédio")

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
        # O banco ainda deve ter 3 despesas
        self.assertEqual(Expense.objects.count(), 3)

    def test_filter_by_category(self):
        """Testa o filtro por categoria via query param"""
        response = self.client.get(self.list_url, {'categoria': 'alimentacao'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titulo'], "Mercado")

    def test_filter_by_period(self):
        """Testa o filtro de período (mês e ano) via query params"""
        # Filtra por junho/2026 (mes=6, ano=2026) -> deve retornar 2 despesas
        response = self.client.get(self.list_url, {'mes': 6, 'ano': 2026})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Filtra por maio/2026 (mes=5, ano=2026) -> deve retornar 1 despesa
        response = self.client.get(self.list_url, {'mes': 5, 'ano': 2026})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titulo'], "Cinema")

    def test_delete_expense(self):
        """Testa a remoção de uma despesa via DELETE"""
        detail_url = reverse('expense-detail', args=[self.expense1.id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Expense.objects.count(), 2)
