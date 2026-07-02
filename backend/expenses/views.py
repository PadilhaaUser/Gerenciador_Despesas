from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.authtoken.models import Token
from .models import Expense, Bank, RecurringExpense
from .serializers import ExpenseSerializer, BankSerializer, RecurringExpenseSerializer
import datetime
import calendar
import re
import logging

logger = logging.getLogger(__name__)


def add_months(sourcedate, months):
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return datetime.date(year, month, day)


class BankViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, detalhar, editar e deletar bancos.
    Exige autenticação por Token e filtra bancos pelo usuário autenticado.
    """
    serializer_class = BankSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Bank.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class RecurringExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, detalhar e deletar mensalidades/despesas recorrentes.
    Exige autenticação por Token e filtra mensalidades pelo usuário autenticado.
    Ao criar uma mensalidade, gera automaticamente as despesas correspondentes para os próximos meses.
    """
    serializer_class = RecurringExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecurringExpense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        recurring_expense = serializer.save(user=self.request.user)
        
        # Gera as parcelas correspondentes no modelo Expense
        data_inicio = recurring_expense.data_inicio
        meses = recurring_expense.meses_totais
        
        for i in range(meses):
            parcela_date = add_months(data_inicio, i)
            # Título amigável com indicação da parcela: "Título (1/3)"
            titulo_parcela = f"{recurring_expense.titulo} ({i + 1}/{meses})"
            
            Expense.objects.create(
                user=self.request.user,
                banco=recurring_expense.banco,
                recurring_expense=recurring_expense,
                num_parcela=i + 1,
                titulo=titulo_parcela,
                valor=recurring_expense.valor,
                categoria=recurring_expense.categoria,
                data=parcela_date,
                descricao=recurring_expense.descricao
            )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, criar, detalhar, editar e deletar despesas.
    Exige autenticação por Token e filtra despesas pelo usuário autenticado.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)
        
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

        # Filtro por banco
        banco = self.request.query_params.get('banco')
        if banco:
            try:
                queryset = queryset.filter(banco_id=int(banco))
            except ValueError:
                pass  # Ignora caso o banco seja inválido

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class AuthRateThrottle(AnonRateThrottle):
    """Throttle específico para endpoints de autenticação (login/registro)."""
    scope = 'auth'


class RegisterView(APIView):
    """
    View para registrar um novo usuário e gerar um Token DRF inicial.
    Inclui validação de senha do Django, sanitização de username e rate-limiting.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
    
    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        email = request.data.get('email', '').strip()
        
        if not username or not password:
            return Response({'error': 'Usuário e senha são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Sanitização de username: apenas alfanuméricos, underscores e hifens
        if not re.match(r'^[a-zA-Z0-9_-]{3,30}$', username):
            return Response(
                {'error': 'O nome de usuário deve ter entre 3 e 30 caracteres e conter apenas letras, números, _ ou -.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Este nome de usuário já está em uso.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validação de senha usando os validators configurados no Django
        try:
            validate_password(password)
        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.create_user(username=username, password=password, email=email)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
        except Exception:
            logger.exception('Erro inesperado ao registrar usuário.')
            return Response(
                {'error': 'Ocorreu um erro interno. Tente novamente mais tarde.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):
    """
    View para autenticar um usuário existente e retornar o Token DRF correspondente.
    Inclui rate-limiting para prevenir brute-force.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
    
    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        
        if not username or not password:
            return Response({'error': 'Usuário e senha são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Usuário ou senha incorretos.'}, status=status.HTTP_400_BAD_REQUEST)
            
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_200_OK)
