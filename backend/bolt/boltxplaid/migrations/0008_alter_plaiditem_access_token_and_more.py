# Generated by Django 4.1.7 on 2023-04-16 00:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("boltxplaid", "0007_plaiditem"),
    ]

    operations = [
        migrations.AlterField(
            model_name="plaiditem",
            name="access_token",
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name="plaiditem",
            name="institution_id",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name="plaiditem",
            name="institution_name",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name="plaiditem",
            name="item_id",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name="plaiditem",
            name="public_token",
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]
