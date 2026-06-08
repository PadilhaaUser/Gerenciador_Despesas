from django.db import models

class Expense(models.Model):
    CATEGORIA_CHOICES = [
        ('alimentacao', 'Alimentação'),
        ('transporte', 'Transporte'),
        ('lazer', 'Lazer'),
        ('saude', 'Saúde'),
        ('outros', 'Outros'),
    ]

    titulo = models.CharField(max_length=255, verbose_name="Título")
    valor = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Valor")
    categoria = models.CharField(
        max_length=20, 
        choices=CATEGORIA_CHOICES, 
        verbose_name="Categoria"
    )
    data = models.DateField(verbose_name="Data")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Despesa"
        verbose_name_plural = "Despesas"
        ordering = ['-data', '-id']

    def __str__(self):
        return f"{self.titulo} - R$ {self.valor} ({self.get_categoria_display()})"
