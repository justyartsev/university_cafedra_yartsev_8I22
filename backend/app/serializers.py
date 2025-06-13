import logging

logger = logging.getLogger(__name__)

from rest_framework import serializers
from .models import Office, Degree, Position, WorkTime, Professor, ProfessorDiscipline, ProfessorOtherActivity, Discipline, TeachingType, OtherActivity

class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ['id', 'number']

class DegreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Degree
        fields = ['id', 'name']

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name']

class WorkTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkTime
        fields = ['id', 'name']

class TeachingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeachingType
        fields = ['id', 'name']

class DisciplineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discipline
        fields = ['id', 'name']

class ProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professor
        fields = ['id', 'last_name', 'first_name', 'third_name']

class ProfessorDisciplineSerializer(serializers.ModelSerializer):
    professor = serializers.PrimaryKeyRelatedField(queryset=Professor.objects.all(), write_only=True)
    discipline = serializers.PrimaryKeyRelatedField(queryset=Discipline.objects.all(), write_only=True)
    teaching_type = serializers.PrimaryKeyRelatedField(queryset=TeachingType.objects.all(), write_only=True)
    discipline_detail = DisciplineSerializer(source='discipline', read_only=True)
    teaching_type_detail = TeachingTypeSerializer(source='teaching_type', read_only=True)
    professor_detail = ProfessorSerializer(source='professor', read_only=True)

    class Meta:
        model = ProfessorDiscipline
        fields = ['id', 'professor', 'discipline', 'teaching_type', 'discipline_detail', 'teaching_type_detail', 'professor_detail']
        extra_kwargs = {
            'professor': {'write_only': True},
            'discipline': {'write_only': True},
            'teaching_type': {'write_only': True},
        }

class OtherActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherActivity
        fields = ['id', 'name']

class ProfessorOtherActivitySerializer(serializers.ModelSerializer):
    activity = OtherActivitySerializer()
    class Meta:
        model = ProfessorOtherActivity
        fields = ['id', 'activity', 'description']

class ProfessorSerializer(serializers.ModelSerializer):
    office = serializers.PrimaryKeyRelatedField(queryset=Office.objects.all(), allow_null=True, required=False)
    degree = serializers.PrimaryKeyRelatedField(queryset=Degree.objects.all(), allow_null=True, required=False)
    position = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all(), required=True)
    work_time = serializers.PrimaryKeyRelatedField(queryset=WorkTime.objects.all(), required=True)
    disciplines = ProfessorDisciplineSerializer(many=True, read_only=True, source='professordiscipline_set')
    activities = ProfessorOtherActivitySerializer(many=True, read_only=True, source='professorotheractivity_set')

    class Meta:
        model = Professor
        fields = ['id', 'first_name', 'last_name', 'third_name', 'birth_date', 'email', 'phone_number', 'office', 'degree', 'position', 'work_time', 'disciplines', 'activities']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['office'] = OfficeSerializer(instance.office).data if instance.office_id else None
        ret['degree'] = DegreeSerializer(instance.degree).data if instance.degree_id else None
        ret['position'] = PositionSerializer(instance.position).data if instance.position_id else None
        ret['work_time'] = WorkTimeSerializer(instance.work_time).data if instance.work_time_id else None
        return ret

    def create(self, validated_data):
        logger.info("Полученные данные перед валидацией: %s", self.initial_data)
        logger.info("Валидированные данные: %s", validated_data)
        office = validated_data.pop('office', None)
        degree = validated_data.pop('degree', None)
        position = validated_data.pop('position')
        work_time = validated_data.pop('work_time')

        logger.info("Извлеченные объекты - office: %s, degree: %s, position: %s, work_time: %s", office, degree, position, work_time)

        try:
            professor = Professor.objects.create(
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                third_name=validated_data.get('third_name'),
                birth_date=validated_data['birth_date'],
                email=validated_data['email'],
                phone_number=validated_data['phone_number'],
                office=office,
                degree=degree,
                position=position,
                work_time=work_time
            )
            logger.info("Преподаватель успешно создан: %s", professor)
            return professor
        except Exception as e:
            logger.error("Ошибка при создании преподавателя: %s", str(e))
            raise serializers.ValidationError({"detail": str(e)})

class DisciplineSerializer(serializers.ModelSerializer):
    professordiscipline_set = ProfessorDisciplineSerializer(many=True, read_only=True)

    class Meta:
        model = Discipline
        fields = ['id', 'name', 'professordiscipline_set']