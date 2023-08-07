# Generated by Django 4.1.7 on 2023-04-16 02:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("boltxplaid", "0012_remove_plaiditem_institution_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="historicalplaidaccount",
            name="unofficial_currency_code",
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name="plaidaccount",
            name="unofficial_currency_code",
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
