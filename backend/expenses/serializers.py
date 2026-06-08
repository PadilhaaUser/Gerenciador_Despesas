from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 
            'titulo', 
            'valor', 
            'categoria', 
            'categoria_display', 
            'data', 
            'descricao', 
            'created_at', 
            'updated_at'
        ]
        
    def validate_valor(self, value):
        if value <= 0:
            raise serializers.ValidationError("O valor da despesa deve ser maior que zero.")
        return value
