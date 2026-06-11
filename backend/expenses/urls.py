from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, RegisterView, LoginView

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
]
