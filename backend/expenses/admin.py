from django.contrib import admin
from .models import Expense, Bank

@admin.register(Bank)
class BankAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cor', 'user', 'created_at')
    list_filter = ('cor',)
    search_fields = ('nome',)

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'valor', 'categoria', 'banco', 'data', 'created_at')
    list_filter = ('categoria', 'banco', 'data')
    search_fields = ('titulo', 'descricao')
    date_hierarchy = 'data'
    ordering = ('-data',)
