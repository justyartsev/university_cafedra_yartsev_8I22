from django.db import models

class Office(models.Model):
    number = models.CharField(max_length=5, unique=True)

    def __str__(self):
        return self.number

    class Meta:
        db_table = 'office'

class Degree(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'degree'

class Position(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'position'

class OtherActivity(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'other_activity'

class Discipline(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'discipline'

class WorkTime(models.Model):
    name = models.FloatField(unique=True)

    def __str__(self):
        return str(self.name)

    class Meta:
        db_table = 'work_time'

class TeachingType(models.Model):
    name = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'teaching_type'

class Professor(models.Model):
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    third_name = models.CharField(max_length=20, blank=True, null=True)
    birth_date = models.DateField()
    email = models.CharField(max_length=30, unique=True)
    phone_number = models.CharField(max_length=11, unique=True)
    office = models.ForeignKey(Office, on_delete=models.DO_NOTHING, null=True, blank=True)
    degree = models.ForeignKey(Degree, on_delete=models.DO_NOTHING, null=True, blank=True)
    position = models.ForeignKey(Position, on_delete=models.DO_NOTHING)
    work_time = models.ForeignKey(WorkTime, on_delete=models.DO_NOTHING)

    def __str__(self):
        return f"{self.last_name} {self.first_name}"

    class Meta:
        db_table = 'professor'

class ProfessorDiscipline(models.Model):
    professor = models.ForeignKey(Professor, on_delete=models.DO_NOTHING)
    discipline = models.ForeignKey(Discipline, on_delete=models.DO_NOTHING)
    teaching_type = models.ForeignKey(TeachingType, on_delete=models.DO_NOTHING)

    def __str__(self):
        return f"{self.professor} - {self.discipline} ({self.teaching_type})"

    class Meta:
        db_table = 'professor_discipline'
        constraints = [
            models.UniqueConstraint(
                fields=['professor', 'discipline', 'teaching_type'],
                name='unique_professor_discipline_teaching_type'
            )
        ]

class ProfessorOtherActivity(models.Model):
    professor = models.ForeignKey(Professor, on_delete=models.DO_NOTHING)
    activity = models.ForeignKey(OtherActivity, on_delete=models.DO_NOTHING)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.professor} - {self.activity}"

    class Meta:
        db_table = 'professor_other_activity'
        constraints = [
            models.UniqueConstraint(
                fields=['professor', 'activity'],
                name='unique_professor_activity'
            )
        ]