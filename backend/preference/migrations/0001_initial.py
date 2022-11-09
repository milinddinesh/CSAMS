# Generated by Django 3.2 on 2022-11-08 14:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('user', '0002_designation_faculty_facultyexperience_track_workload'),
        ('course', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Identifier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.PositiveIntegerField()),
                ('is_even_sem', models.BooleanField()),
            ],
        ),
        migrations.CreateModel(
            name='Preference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weigtage', models.PositiveSmallIntegerField()),
                ('experience', models.PositiveSmallIntegerField()),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='course.course')),
                ('faculty', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='user.faculty')),
                ('preference_sem_identifier', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='preference.identifier')),
            ],
        ),
        migrations.CreateModel(
            name='Config',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('preference_count', models.PositiveSmallIntegerField(default=3)),
                ('current_preference_sem', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='preference.identifier')),
            ],
        ),
    ]