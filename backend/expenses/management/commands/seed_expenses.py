from django.core.management.base import BaseCommand
from expenses.models import Expense
from datetime import date
import random

class Command(BaseCommand):
    help = 'Popula o banco de dados com despesas de teste para fins de demonstração'

    def handle(self, *args, **options):
        # Limpa despesas existentes para evitar duplicados indesejados
        # Expense.objects.all().delete()
        
        despesas_mock = [
            # Junho 2026
            {"titulo": "Supermercado Semanal", "valor": 350.50, "categoria": "alimentacao", "data": date(2026, 6, 2), "descricao": "Compras de mercado para a semana"},
            {"titulo": "Combustível Carro", "valor": 120.00, "categoria": "transporte", "data": date(2026, 6, 3), "descricao": "Gasolina"},
            {"titulo": "Cinema & Jantar", "valor": 180.00, "categoria": "lazer", "data": date(2026, 6, 5), "descricao": "Fim de semana"},
            {"titulo": "Consulta Dermatologista", "valor": 250.00, "categoria": "saude", "data": date(2026, 6, 6), "descricao": "Consulta de rotina"},
            {"titulo": "Assinatura Netflix", "valor": 55.90, "categoria": "lazer", "data": date(2026, 6, 7), "descricao": "Mensalidade"},
            
            # Maio 2026
            {"titulo": "Almoço de Negócios", "valor": 85.00, "categoria": "alimentacao", "data": date(2026, 5, 12), "descricao": "Almoço com cliente"},
            {"titulo": "Uber para Aeroporto", "valor": 65.40, "categoria": "transporte", "data": date(2026, 5, 15), "descricao": "Viagem a trabalho"},
            {"titulo": "Farmácia", "valor": 45.90, "categoria": "saude", "data": date(2026, 5, 18), "descricao": "Remédios para alergia"},
            {"titulo": "Show de Rock", "valor": 300.00, "categoria": "lazer", "data": date(2026, 5, 20), "descricao": "Ingresso do show"},
            {"titulo": "Curso Online", "valor": 199.90, "categoria": "outros", "data": date(2026, 5, 22), "descricao": "Curso de React e Django"},
            {"titulo": "Supermercado Mensal", "valor": 680.00, "categoria": "alimentacao", "data": date(2026, 5, 5), "descricao": "Compra grande de mantimentos"},
            {"titulo": "Troca de Óleo", "valor": 180.00, "categoria": "transporte", "data": date(2026, 5, 8), "descricao": "Manutenção preventiva"},

            # Abril 2026
            {"titulo": "Delivery Pizza", "valor": 75.00, "categoria": "alimentacao", "data": date(2026, 4, 10), "descricao": "Fim de semana"},
            {"titulo": "Passagem de Ônibus", "valor": 45.00, "categoria": "transporte", "data": date(2026, 4, 12), "descricao": "Recarga bilhete único"},
            {"titulo": "Exames de Sangue", "valor": 120.00, "categoria": "saude", "data": date(2026, 4, 15), "descricao": "Check-up"},
            {"titulo": "Livro de Finanças", "valor": 49.90, "categoria": "outros", "data": date(2026, 4, 18), "descricao": "Leitura mensal"},
            {"titulo": "Presente de Aniversário", "valor": 150.00, "categoria": "lazer", "data": date(2026, 4, 25), "descricao": "Presente para amigo"},
        ]

        count = 0
        for item in despesas_mock:
            # Cria apenas se não houver despesa com o mesmo título e data
            if not Expense.objects.filter(titulo=item["titulo"], data=item["data"]).exists():
                Expense.objects.create(**item)
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Sucesso! {count} despesas adicionadas.'))
