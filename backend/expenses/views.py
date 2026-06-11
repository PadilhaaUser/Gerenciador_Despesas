from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Expense
from .serializers import ExpenseSerializer

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

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(APIView):
    """
    View para registrar um novo usuário e gerar um Token DRF inicial.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        
        if not username or not password:
            return Response({'error': 'Usuário e senha são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Este nome de usuário já está em uso.'}, status=status.HTTP_400_BAD_REQUEST)
            
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
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    View para autenticar um usuário existente e retornar o Token DRF correspondente.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
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
