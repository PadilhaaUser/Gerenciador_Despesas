from rest_framework import viewsets
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, detalhar, editar e deletar despesas.
    Suporta filtros por categoria (categoria) e período (mes, ano).
    """
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        queryset = Expense.objects.all()
        
        # Filtro por categoria
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria=categoria)
            
        # Filtro por mês
        mes = self.request.query_params.get('mes')
        if mes:
            try:
                queryset = queryset.filter(data__month=int(mes))
            except ValueError:
                pass  # Ignora caso o mês seja inválido
                
        # Filtro por ano
        ano = self.request.query_params.get('ano')
        if ano:
            try:
                queryset = queryset.filter(data__year=int(ano))
            except ValueError:
                pass  # Ignora caso o ano seja inválido

        return queryset
