# Generated by Django 4.2.17 on 2025-01-20 20:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('blog_app', '0002_post_analytics_alter_postanalytics_post'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='tags',
        ),
        migrations.DeleteModel(
            name='Tag',
        ),
    ]
