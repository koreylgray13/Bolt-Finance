# Generated by Django 4.1.7 on 2023-04-16 00:13

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("boltxplaid", "0006_delete_requestedtokens"),
    ]

    operations = [
        migrations.CreateModel(
            name="PlaidItem",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("item_id", models.CharField(max_length=100)),
                ("institution_name", models.CharField(max_length=100)),
                ("institution_id", models.CharField(max_length=100)),
                ("access_token", models.CharField(max_length=500)),
                ("public_token", models.CharField(max_length=500)),
                (
                    "available_products",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.CharField(max_length=100),
                        blank=True,
                        null=True,
                        size=None,
                    ),
                ),
                (
                    "billed_products",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.CharField(max_length=100),
                        blank=True,
                        null=True,
                        size=None,
                    ),
                ),
                (
                    "products",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.CharField(max_length=100),
                        blank=True,
                        null=True,
                        size=None,
                    ),
                ),
                ("webhook", models.URLField(blank=True, null=True)),
                ("last_successful_update", models.DateTimeField(blank=True, null=True)),
                ("last_failed_update", models.DateTimeField(blank=True, null=True)),
                ("last_webhook_sent_at", models.DateTimeField(blank=True, null=True)),
                (
                    "last_webhook_code_sent",
                    models.CharField(blank=True, max_length=50, null=True),
                ),
                (
                    "consent_expiration_time",
                    models.DateTimeField(blank=True, null=True),
                ),
            ],
        ),
    ]