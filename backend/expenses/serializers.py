from rest_framework import serializers
from .models import Expense, Bank


class BankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = ['id', 'nome', 'cor', 'created_at']

    def validate_nome(self, value):
        user = self.context['request'].user
        # Verifica duplicidade para o mesmo usuário (excluindo a instância atual em edição)
        qs = Bank.objects.filter(user=user, nome__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Você já possui um banco com este nome.")
        return value


class ExpenseSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    banco_nome = serializers.CharField(source='banco.nome', read_only=True, default=None)
    banco_cor = serializers.CharField(source='banco.cor', read_only=True, default=None)

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
            'banco',
            'banco_nome',
            'banco_cor',
            'created_at', 
            'updated_at'
        ]
        
    def validate_valor(self, value):
        if value <= 0:
            raise serializers.ValidationError("O valor da despesa deve ser maior que zero.")
        return value

    def validate_banco(self, value):
        if value is not None:
            # Garante que o banco pertence ao usuário autenticado
            user = self.context['request'].user
            if value.user != user:
                raise serializers.ValidationError("Banco inválido.")
        return value
