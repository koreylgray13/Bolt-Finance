# Generated by Django 4.1.7 on 2023-04-16 00:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("boltxplaid", "0009_remove_plaiditem_institution_id_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="plaiditem",
            name="update_type",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
