from django.db import models
from .config import PlaidManager
from users.models import CustomUser
from simple_history.models import HistoricalRecords
from django.contrib.postgres.fields import ArrayField
from datetime import datetime
from django.utils import timezone

pm = PlaidManager()

class Request(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=100, null=True, blank=True)
    request_id = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(default=timezone.now, null=True, blank=True)
    token = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        template = '{0.user} ~ {0.type} ~ {0.date}'
        return template.format(self)

class Item(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    item_id = models.CharField(max_length=100, null=True, blank=True)
    institution_id = models.CharField(max_length=100, null=True, blank=True)
    institution_name = models.CharField(max_length=100, null=True, blank=True)
    access_token = models.CharField(max_length=500, null=True, blank=True)
    public_token = models.CharField(max_length=500, null=True, blank=True)
    available_products = ArrayField(models.CharField(max_length=100), null=True, blank=True)
    billed_products = ArrayField(models.CharField(max_length=100), null=True, blank=True)
    products = ArrayField(models.CharField(max_length=100), null=True, blank=True)
    webhook = models.URLField(null=True, blank=True)
    last_successful_update = models.DateTimeField(null=True, blank=True)
    last_failed_update = models.DateTimeField(null=True, blank=True)
    last_webhook_sent_at = models.DateTimeField(null=True, blank=True)
    last_webhook_code_sent = models.CharField(max_length=50, null=True, blank=True)
    consent_expiration_time = models.DateTimeField(null=True, blank=True)
    wallet = models.CharField(max_length=100, null=True, blank=True)
    transfer_status = models.CharField(max_length=100, null=True, blank=True)
    update_type = models.CharField(max_length=100, null=True, blank=True)

    def save(self, *args, **kwargs):
        created = not self.pk  # Determine if this is a new instance or not
        
        # Call the original save method to save the model
        super().save(*args, **kwargs)
        
        if created:
            # Create a new PlaidAccount instance when a new PlaidItem instance is created
            account_response = pm.get_plaid_accounts(access_token=self.access_token)
            account_response = [account.to_dict() for account in account_response]
            for account in account_response:
                Account.objects.create(item=self, 
                                            account_id=account['account_id'], 
                                            name=account['name'], current=account['balances']['current'], 
                                            available=account['balances']['available'], 
                                            iso_currency_code=account['balances']['iso_currency_code'], 
                                            unofficial_currency_code=account['balances']['unofficial_currency_code'], 
                                            limit=account['balances']['limit'], 
                                            type=account['type'], 
                                            subtype=account['subtype'], 
                                            mask=account['mask'])

    def delete(self, *args, **kwargs):
        # Call remove_plaid_item function
        response = pm.remove_plaid_item(self.access_token)
        
        # Create PlaidRequest entry
        plaid_request = PlaidRequest(
            user=self.user,
            type='item-delete',
            request_id=response['request_id'],
            date=datetime.now(),
            token=self.access_token,
        )

        plaid_request.save()
        
        super(PlaidItem, self).delete(*args, **kwargs)

    def __str__(self):
        template = '{0.institution_name}'
        return template.format(self)

class Account(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, null=True, blank=True)
    account_id = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    current = models.FloatField(null=True, blank=True)
    available = models.FloatField(null=True, blank=True)
    iso_currency_code = models.CharField(max_length=20, null=True, blank=True)
    unofficial_currency_code = models.CharField(max_length=20, null=True, blank=True)
    limit = models.FloatField(null=True, blank=True)
    type = models.CharField(max_length=100, null=True, blank=True)
    subtype = models.CharField(max_length=100, null=True, blank=True)
    mask = models.CharField(max_length=200, null=True, blank=True)
    verification_status = models.CharField(max_length=100, null=True, blank=True)
    class_type = models.CharField(max_length=200, null=True, blank=True)
    official_name = models.CharField(max_length=200, null=True, blank=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        created = not self.pk  # Determine if this is a new instance or not
        
        # Call the original save method to save the model
        super().save(*args, **kwargs)
        
        if created:
            if self.type in ['credit', 'loan']:
                liabilities_response = pm.get_liabilities(access_token=self.item.access_token)

                if liabilities_response[0]['credit'] != None and self.type == 'credit':
                    for credit in liabilities_response[0]['credit']:
                        try:
                            credit_liability = CreditLine.objects.get(plaid_account=Account.objects.get(account_id=credit['account_id']))
                        except CreditLine.DoesNotExist:
                            credit_liability = CreditLine(plaid_account=self)
                        credit_liability.is_overdue = credit['is_overdue']
                        credit_liability.last_payment_amount = credit['last_payment_amount']
                        credit_liability.last_payment_date = credit['last_payment_date']
                        credit_liability.last_statement_balance = credit['last_statement_balance']
                        credit_liability.last_statement_issue_date = credit['last_statement_issue_date']
                        credit_liability.minimum_payment_amount = credit['minimum_payment_amount']
                        credit_liability.next_payment_due_date = credit['next_payment_due_date']
                        credit_liability.save()

                        for apr in credit['aprs']:
                            try:
                                credit_liability_apr = APR.objects.get(credit=credit_liability, apr_percentage=apr['apr_percentage'], apr_type=apr['apr_type'])
                            except APR.DoesNotExist:
                                credit_liability_apr = APR(credit=credit_liability)

                            credit_liability_apr.apr_percentage = apr['apr_percentage']
                            credit_liability_apr.apr_type = apr['apr_type']
                            credit_liability_apr.balance_subject_to_apr = apr['balance_subject_to_apr']
                            credit_liability_apr.interest_charge_amount = apr['interest_charge_amount']
                            credit_liability_apr.save()

                elif liabilities_response[0]['mortgage'] != None and self.subtype == 'mortgage':
                    for mortgage in liabilities_response[0]['mortgage']:
                        try:
                            mortgage_liability = MortgageLoan.objects.get(plaid_account=Account.objects.get(account_id=mortgage['account_id']))
                        except MortgageLoan.DoesNotExist:
                            mortgage_liability = MortgageLoan(plaid_account=self)

                        mortgage_liability.account_number = mortgage['account_number']
                        mortgage_liability.current_late_fee = mortgage['current_late_fee']
                        mortgage_liability.escrow_balance = mortgage['escrow_balance']
                        mortgage_liability.has_pmi = mortgage['has_pmi']
                        mortgage_liability.has_prepayment_penalty = mortgage['has_prepayment_penalty']
                        mortgage_liability.interest_rate_percentage = mortgage['interest_rate']['percentage']
                        mortgage_liability.interest_rate_type = mortgage['interest_rate']['type']
                        mortgage_liability.last_payment_amount = mortgage['last_payment_amount']
                        mortgage_liability.last_payment_date = mortgage['last_payment_date']
                        mortgage_liability.loan_term = mortgage['loan_term']
                        mortgage_liability.loan_type_description = mortgage['loan_type_description']
                        mortgage_liability.maturity_date = mortgage['maturity_date']
                        mortgage_liability.next_monthly_payment = mortgage['next_monthly_payment']
                        mortgage_liability.next_payment_due_date = mortgage['next_payment_due_date']
                        mortgage_liability.origination_date = mortgage['origination_date']
                        mortgage_liability.origination_principal_amount = mortgage['origination_principal_amount']
                        mortgage_liability.past_due_amount = mortgage['past_due_amount']
                        mortgage_liability.save()

                        try:
                            mortgage_loan_property = PropertyAddress.objects.get(mortgage=mortgage_liability)
                        except PropertyAddress.DoesNotExist:
                            mortgage_loan_property = PropertyAddress(mortgage=mortgage_liability)

                        mortgage_loan_property.city = mortgage['property_address']['city']
                        mortgage_loan_property.country = mortgage['property_address']['country']
                        mortgage_loan_property.postal_code = mortgage['property_address']['postal_code']
                        mortgage_loan_property.region = mortgage['property_address']['region']
                        mortgage_loan_property.street = mortgage['property_address']['street']
                        mortgage_loan_property.save()

                elif liabilities_response[0]['student'] != None and self.subtype == 'student':
                    for student in liabilities_response[0]['student']:
                        try:
                            student_liability = StudentLoan.objects.get(plaid_account=Account.objects.get(account_id=student['account_id']))
                        except StudentLoan.DoesNotExist:
                            student_liability = StudentLoan(plaid_account=self)

                        student_liability.account_number = student['account_number']
                        student_liability.expected_payoff_date = student['expected_payoff_date']
                        student_liability.guarantor = student['guarantor']
                        student_liability.interest_rate_percentage = student['interest_rate_percentage']
                        student_liability.is_overdue = student['is_overdue']
                        student_liability.last_payment_amount = student['last_payment_amount']
                        student_liability.last_payment_date = student['last_payment_date']
                        student_liability.last_statement_balance = student['last_statement_balance']
                        student_liability.last_statement_issue_date = student['last_statement_issue_date']
                        student_liability.loan_name = student['loan_name']
                        student_liability.loan_end_date = student['loan_status']['end_date']
                        student_liability.loan_type = student['loan_status']['type']
                        student_liability.minimum_payment_amount = student['minimum_payment_amount']
                        student_liability.next_payment_due_date = student['next_payment_due_date']
                        student_liability.origination_date = student['origination_date']
                        student_liability.origination_principal_amount = student['origination_principal_amount']
                        student_liability.outstanding_interest_amount = student['outstanding_interest_amount']
                        student_liability.payment_reference_number = student['payment_reference_number']
                        student_liability.sequence_number = student['sequence_number']
                        student_liability.ytd_interest_paid = student['ytd_interest_paid']
                        student_liability.ytd_principal_paid = student['ytd_principal_paid']

                        student_liability.save()

    def __str__(self):
        template = '{0.item} ~ {0.name}'
        return template.format(self)

class Transaction(models.Model):
    plaid_account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    account_id = models.CharField(max_length=100, null=True, blank=True)
    account_owner = models.IntegerField(null=True, blank=True)
    amount = models.FloatField(null=True, blank=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    authorized_date = models.DateField(null=True, blank=True)
    authorized_datetime = models.DateTimeField(null=True, blank=True)
    category = ArrayField(models.CharField(max_length=100), null=True, blank=True)
    category_id = models.CharField(max_length=100, null=True, blank=True)
    check_number = models.IntegerField(null=True, blank=True)
    date = models.DateField(max_length=100, null=True, blank=True)
    datetime = models.DateTimeField(null=True, blank=True)
    iso_currency_code = models.CharField(max_length=100,null=True, blank=True)
    location = models.JSONField(null=True, blank=True)
    merchant_name = models.CharField(max_length=100, null=True, blank=True)
    payment_channel = models.CharField(max_length=100, null=True, blank=True)
    payment_meta = models.JSONField(null=True, blank=True)
    pending = models.BooleanField(null=True, blank=True)
    pending_transaction_id = models.CharField(max_length=100, null=True, blank=True)
    personal_finance_category = models.CharField(max_length=100, null=True, blank=True)
    transaction_code = models.CharField(max_length=100,null=True, blank=True)
    transaction_id = models.CharField(max_length=100,null=True, blank=True)
    transaction_type = models.CharField(max_length=100,null=True, blank=True)
    unofficial_currency_code = models.CharField(max_length=100,null=True, blank=True)
    latest_cursor = models.CharField(max_length=300,null=True, blank=True)
    def __str__(self):
        template = '{0.plaid_account} {0.name} ~ {0.amount}'
        return template.format(self)

class CreditLine(models.Model):
    plaid_account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    is_overdue = models.BooleanField(default=False, null=True, blank=True)
    last_payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_payment_date = models.DateField(null=True, blank=True)
    last_statement_balance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_statement_issue_date = models.DateField(null=True, blank=True)
    minimum_payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    next_payment_due_date = models.DateField(null=True, blank=True)
    history = HistoricalRecords()

    def __str__(self):
        template = '{0.plaid_account}'
        return template.format(self)

class APR(models.Model):
    credit = models.ForeignKey(CreditLine, on_delete=models.CASCADE, null=True, blank=True)
    apr_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    apr_type = models.CharField(max_length=50, null=True, blank=True)
    balance_subject_to_apr = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    interest_charge_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        template = '{0.credit}'
        return template.format(self)

class MortgageLoan(models.Model):
    plaid_account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    account_number = models.CharField(max_length=100, null=True, blank=True)
    current_late_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    escrow_balance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    has_pmi = models.BooleanField(null=True, blank=True)
    has_prepayment_penalty = models.BooleanField(null=True, blank=True)
    interest_rate_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    interest_rate_type = models.CharField(max_length=50, null=True, blank=True)
    last_payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_payment_date = models.DateField(null=True, blank=True)
    loan_term = models.CharField(max_length=50, null=True, blank=True)
    loan_type_description = models.CharField(max_length=50)
    maturity_date = models.DateField(null=True, blank=True)
    next_monthly_payment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    next_payment_due_date = models.DateField(null=True, blank=True)
    origination_date = models.DateField(null=True, blank=True)
    origination_principal_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    past_due_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    history = HistoricalRecords()

    def __str__(self):
        template = '{0.plaid_account}'
        return template.format(self)
    
class PropertyAddress(models.Model):
    mortgage = models.ForeignKey(MortgageLoan, on_delete=models.CASCADE, null=True, blank=True)
    city = models.CharField(max_length=50, null=True, blank=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    postal_code = models.CharField(max_length=10, null=True, blank=True)
    region = models.CharField(max_length=50, null=True, blank=True)
    street = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        template = '{0.mortgage}'
        return template.format(self)

class StudentLoan(models.Model):
    plaid_account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    account_number = models.CharField(max_length=100, null=True, blank=True)
    expected_payoff_date = models.DateField(null=True, blank=True)
    guarantor = models.CharField(max_length=50, null=True, blank=True)
    interest_rate_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_overdue = models.BooleanField(default=False, null=True, blank=True)
    last_payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_payment_date = models.DateField(null=True, blank=True)
    last_statement_balance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_statement_issue_date = models.DateField(null=True, blank=True)
    loan_name = models.CharField(max_length=50, null=True, blank=True)
    loan_status = models.JSONField(null=True, blank=True)
    minimum_payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    next_payment_due_date = models.DateField(null=True, blank=True)
    origination_date = models.DateField(null=True, blank=True)
    origination_principal_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    outstanding_interest_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_reference_number = models.CharField(max_length=100, null=True, blank=True)
    pslf_status = models.JSONField(null=True, blank=True)
    repayment_plan = models.JSONField(null=True, blank=True)
    sequence_number = models.CharField(max_length=10, null=True, blank=True)
    servicer_address = models.JSONField(null=True, blank=True)
    ytd_interest_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ytd_principal_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    loan_end_date = models.DateField(null=True, blank=True)
    loan_type = models.CharField(max_length=50, null=True, blank=True)
    history = HistoricalRecords()
