from django.urls import path
from .views import ClassifyImageView

urlpatterns = [
    path('classify/', ClassifyImageView.as_view(), name='classify'),
]