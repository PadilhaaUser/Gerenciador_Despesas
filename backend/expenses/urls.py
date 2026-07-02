from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, BankViewSet, RecurringExpenseViewSet, RegisterView, LoginView

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'banks', BankViewSet, basename='bank')
router.register(r'recurring-expenses', RecurringExpenseViewSet, basename='recurring-expense')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
]
