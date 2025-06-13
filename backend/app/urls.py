from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OfficeViewSet, DegreeViewSet, PositionViewSet, WorkTimeViewSet, ProfessorViewSet, DisciplineViewSet, TeachingTypeViewSet, ProfessorDisciplineViewSet, OtherActivityViewSet

router = DefaultRouter()
router.register(r'offices', OfficeViewSet)
router.register(r'degrees', DegreeViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'work-times', WorkTimeViewSet)
router.register(r'professors', ProfessorViewSet)
router.register(r'disciplines', DisciplineViewSet)
router.register(r'teaching-types', TeachingTypeViewSet)
router.register(r'professor-disciplines', ProfessorDisciplineViewSet)
router.register(r'activities', OtherActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]