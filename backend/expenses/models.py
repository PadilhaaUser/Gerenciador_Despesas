from django.db import models
from django.contrib.auth.models import User


class Bank(models.Model):
    """Modelo para representar uma conta bancária do usuário."""
    
    COR_CHOICES = [
        ('#820ad1', 'Nubank (Roxo)'),
        ('#ee7d00', 'Inter (Laranja)'),
        ('#003399', 'Itaú (Azul)'),
        ('#cc2229', 'Bradesco (Vermelho)'),
        ('#fff200', 'Banco do Brasil (Amarelo)'),
        ('#e3120b', 'Santander (Vermelho)'),
        ('#00a650', 'Sicredi (Verde)'),
        ('#004b87', 'Caixa (Azul)'),
        ('#21a038', 'PagBank (Verde)'),
        ('#1a1a2e', 'C6 Bank (Preto)'),
        ('#ff4500', 'Original (Laranja)'),
        ('#6b7280', 'Outro (Cinza)'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='banks',
        verbose_name="Usuário"
    )
    nome = models.CharField(max_length=100, verbose_name="Nome do Banco")
    cor = models.CharField(
        max_length=7,
        choices=COR_CHOICES,
        default='#6b7280',
        verbose_name="Cor"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")

    class Meta:
        verbose_name = "Banco"
        verbose_name_plural = "Bancos"
        ordering = ['nome']
        unique_together = ['user', 'nome']

    def __str__(self):
        return self.nome


class Expense(models.Model):
    CATEGORIA_CHOICES = [
        ('alimentacao', 'Alimentação'),
        ('transporte', 'Transporte'),
        ('lazer', 'Lazer'),
        ('saude', 'Saúde'),
        ('outros', 'Outros'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='expenses', 
        null=True, 
        blank=True,
        verbose_name="Usuário"
    )
    banco = models.ForeignKey(
        Bank,
        on_delete=models.SET_NULL,
        related_name='expenses',
        null=True,
        blank=True,
        verbose_name="Banco"
    )
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
