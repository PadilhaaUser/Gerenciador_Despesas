from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'valor', 'categoria', 'data', 'created_at')
    list_filter = ('categoria', 'data')
    search_fields = ('titulo', 'descricao')
    date_hierarchy = 'data'
    ordering = ('-data',)
