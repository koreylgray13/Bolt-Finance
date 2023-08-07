# Generated by Django 4.1.7 on 2023-04-25 22:32

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import simple_history.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("boltxplaid", "0025_remove_studentloan_account_id_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="HistoricalStudentLoan",
            fields=[
                (
                    "id",
                    models.BigIntegerField(
                        auto_created=True, blank=True, db_index=True, verbose_name="ID"
                    ),
                ),
                (
                    "account_number",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                ("expected_payoff_date", models.DateField(blank=True, null=True)),
                ("guarantor", models.CharField(blank=True, max_length=50, null=True)),
                (
                    "interest_rate_percentage",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=5, null=True
                    ),
                ),
                (
                    "is_overdue",
                    models.BooleanField(blank=True, default=False, null=True),
                ),
                (
                    "last_payment_amount",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("last_payment_date", models.DateField(blank=True, null=True)),
                (
                    "last_statement_balance",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("last_statement_issue_date", models.DateField(blank=True, null=True)),
                ("loan_name", models.CharField(blank=True, max_length=50, null=True)),
                ("loan_status", models.JSONField(blank=True, null=True)),
                (
                    "minimum_payment_amount",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("next_payment_due_date", models.DateField(blank=True, null=True)),
                ("origination_date", models.DateField(blank=True, null=True)),
                (
                    "origination_principal_amount",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=15, null=True
                    ),
                ),
                (
                    "outstanding_interest_amount",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "payment_reference_number",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                ("pslf_status", models.JSONField(blank=True, null=True)),
                ("repayment_plan", models.JSONField(blank=True, null=True)),
                (
                    "sequence_number",
                    models.CharField(blank=True, max_length=10, null=True),
                ),
                ("servicer_address", models.JSONField(blank=True, null=True)),
                (
                    "ytd_interest_paid",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "ytd_principal_paid",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("loan_end_date", models.DateField(blank=True, null=True)),
                ("loan_type", models.CharField(blank=True, max_length=50, null=True)),
                ("history_id", models.AutoField(primary_key=True, serialize=False)),
                ("history_date", models.DateTimeField(db_index=True)),
                ("history_change_reason", models.CharField(max_length=100, null=True)),
                (
                    "history_type",
                    models.CharField(
                        choices=[("+", "Created"), ("~", "Changed"), ("-", "Deleted")],
                        max_length=1,
                    ),
                ),
                (
                    "history_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "plaid_account",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to="boltxplaid.plaidaccount",
                    ),
                ),
            ],
            options={
                "verbose_name": "historical student loan",
                "verbose_name_plural": "historical student loans",
                "ordering": ("-history_date", "-history_id"),
                "get_latest_by": ("history_date", "history_id"),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name="HistoricalMortgageLoan",
            fields=[
                (
                    "id",
                    models.BigIntegerField(
                        auto_created=True, blank=True, db_index=True, verbose_name="ID"
                    ),
                ),
                (
                    "account_number",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                (
                    "current_late_fee",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "escrow_balance",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("has_pmi", models.BooleanField(blank=True, null=True)),
                ("has_prepayment_penalty", models.BooleanField(blank=True, null=True)),
                (
                    "interest_rate_percentage",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=5, null=True
                    ),
                ),
                (
                    "interest_rate_type",
                    models.CharField(blank=True, max_length=50, null=True),
                ),
                (
                    "last_payment_amount",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("last_payment_date", models.DateField(blank=True, null=True)),
                ("loan_term", models.CharField(blank=True, max_length=50, null=True)),
                ("loan_type_description", models.CharField(max_length=50)),
                ("maturity_date", models.DateField(blank=True, null=True)),
                (
                    "next_monthly_payment",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("next_payment_due_date", models.DateField(blank=True, null=True)),
                ("origination_date", models.DateField(blank=True, null=True)),
                (
                    "origination_principal_amount",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "past_due_amount",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("history_id", models.AutoField(primary_key=True, serialize=False)),
                ("history_date", models.DateTimeField(db_index=True)),
                ("history_change_reason", models.CharField(max_length=100, null=True)),
                (
                    "history_type",
                    models.CharField(
                        choices=[("+", "Created"), ("~", "Changed"), ("-", "Deleted")],
                        max_length=1,
                    ),
                ),
                (
                    "history_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "plaid_account",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to="boltxplaid.plaidaccount",
                    ),
                ),
            ],
            options={
                "verbose_name": "historical mortgage loan",
                "verbose_name_plural": "historical mortgage loans",
                "ordering": ("-history_date", "-history_id"),
                "get_latest_by": ("history_date", "history_id"),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name="HistoricalCreditLine",
            fields=[
                (
                    "id",
                    models.BigIntegerField(
                        auto_created=True, blank=True, db_index=True, verbose_name="ID"
                    ),
                ),
                (
                    "is_overdue",
                    models.BooleanField(blank=True, default=False, null=True),
                ),
                (
                    "last_payment_amount",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("last_payment_date", models.DateField(blank=True, null=True)),
                (
                    "last_statement_balance",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("last_statement_issue_date", models.DateField(blank=True, null=True)),
                (
                    "minimum_payment_amount",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("next_payment_due_date", models.DateField(blank=True, null=True)),
                ("history_id", models.AutoField(primary_key=True, serialize=False)),
                ("history_date", models.DateTimeField(db_index=True)),
                ("history_change_reason", models.CharField(max_length=100, null=True)),
                (
                    "history_type",
                    models.CharField(
                        choices=[("+", "Created"), ("~", "Changed"), ("-", "Deleted")],
                        max_length=1,
                    ),
                ),
                (
                    "history_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "plaid_account",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to="boltxplaid.plaidaccount",
                    ),
                ),
            ],
            options={
                "verbose_name": "historical credit line",
                "verbose_name_plural": "historical credit lines",
                "ordering": ("-history_date", "-history_id"),
                "get_latest_by": ("history_date", "history_id"),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
    ]