# Generated by Django 3.2 on 2022-11-08 14:55

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Batch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.PositiveSmallIntegerField()),
                ('sem', models.PositiveIntegerField()),
                ('advisors', models.ManyToManyField(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('credit', models.SmallIntegerField()),
                ('hours', models.SmallIntegerField()),
                ('l', models.SmallIntegerField()),
                ('t', models.SmallIntegerField()),
                ('p', models.SmallIntegerField()),
                ('is_elective', models.BooleanField()),
                ('batch', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='course.batch')),
            ],
        ),
        migrations.CreateModel(
            name='CourseIdentifer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.TextField()),
                ('name', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Program',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='CourseLab',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='+', to='course.course')),
                ('lab', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='course.course')),
            ],
        ),
        migrations.AddField(
            model_name='course',
            name='identifier',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='course.courseidentifer'),
        ),
        migrations.AddField(
            model_name='batch',
            name='program',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='course.program'),
        ),
    ]