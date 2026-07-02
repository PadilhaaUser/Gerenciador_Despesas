from django.contrib import admin
from .models import Expense, Bank, RecurringExpense

@admin.register(Bank)
class BankAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cor', 'user', 'created_at')
    list_filter = ('cor',)
    search_fields = ('nome',)

@admin.register(RecurringExpense)
class RecurringExpenseAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'valor', 'categoria', 'banco', 'data_inicio', 'meses_totais', 'created_at')
    list_filter = ('categoria', 'banco', 'data_inicio')
    search_fields = ('titulo', 'descricao')
    date_hierarchy = 'data_inicio'
    ordering = ('-data_inicio',)

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'valor', 'categoria', 'banco', 'data', 'recurring_expense', 'num_parcela', 'created_at')
    list_filter = ('categoria', 'banco', 'data')
    search_fields = ('titulo', 'descricao')
    date_hierarchy = 'data'
    ordering = ('-data',)
