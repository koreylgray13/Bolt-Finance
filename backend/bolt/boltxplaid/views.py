from .models import PlaidManager
from .serializers import *
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Max, Min, Sum
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import pandas as pd
from rest_framework.views import APIView
from plaid.models import *
from .models import *
from datetime import datetime, timedelta
from rest_framework import status
from django.db import connection
import json
from django.utils import timezone
from .models import Request

pm = PlaidManager()

client = pm.client

def get_location_and_payment_meta(transaction_response):
    location_dict = {
    'address': transaction_response['location']['address'],
    'city': transaction_response['location']['city'],
    'region': transaction_response['location']['region'],
    'postal_code': transaction_response['location']['postal_code'],
    'country': transaction_response['location']['country'],
    'lat': transaction_response['location']['lat'],
    'lon': transaction_response['location']['lon'],
    }
    payment_dict = {"by_order_of": transaction_response['payment_meta']['by_order_of'],
        "payee": transaction_response['payment_meta']['payee'],
        "payer": transaction_response['payment_meta']['payer'],
        "payment_method": transaction_response['payment_meta']['payment_method'],
        "payment_processor": transaction_response['payment_meta']['payment_processor'],
        "ppd_id": transaction_response['payment_meta']['ppd_id'],
        "reason": transaction_response['payment_meta']['reason'],
        "reference_number": transaction_response['payment_meta']['reference_number']}
    
    return location_dict, payment_dict

@api_view(['GET']) 
@permission_classes([IsAuthenticated])
def request_link_token(request, *args, **kwargs):
    
    user_id = str(request.user.id)
    link_token, request_id = pm.create_link_token(user_id=user_id)
    
    Request.objects.create(user=request.user, type='link-token', request_id=request_id, token=link_token).save()
    request = Request.objects.create(user=request.user, type='link-token', request_id=request_id, date=datetime.now(), token=link_token)
    request.save()
    return Response({link_token})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_plaid_item(request):
    if request.method == 'POST':
        # Exchange the public token for an access token
        access_token = pm.exchange_public_token(public_token=request.data['public_token'])[0]

        # Retrieve Plaid item and account information
        item_response = pm.get_plaid_item(access_token=access_token)

        # Serialize the PlaidItem instance
        item = PlaidItemSerializer(data=request.data)

        # Extract relevant information from item_response
        available_products = [str(i) for i in item_response['available_products']]
        billed_products = [str(i) for i in item_response['billed_products']]
        products = [str(i) for i in item_response['products']]
        institution_id = item_response['institution_id']
        institution_name = request.data['institution']['name']

        # Check if the PlaidItem instance is valid
        if item.is_valid():
            # Save the PlaidItem instance to the database
            item.save(user=request.user,
                        billed_products=billed_products, 
                        available_products=available_products, 
                        products=products, 
                        update_type=item_response['update_type'], 
                        item_id=item_response['item_id'], 
                        webhook=item_response['webhook'],
                        access_token=access_token,
                        institution_id=institution_id,
                        institution_name=institution_name,
                        last_successful_update=datetime.today())


            # Return a success response
            return Response("Plaid item created successfully.")
        else:
            # Return a bad request response with the errors
            return Response(item.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def plaid_sync_transactions(request):
    user = request.user
    items = Item.objects.filter(user_id=user.id)



    for item in items:
        accounts = PlaidAccount.objects.filter(item_id=item.id)
        # Get all the account IDs for this item
        account_ids = [account.account_id for account in accounts]

        with connection.cursor() as cursor:
            cursor.execute("SELECT latest_cursor FROM boltxplaid_plaidtransaction "
               "INNER JOIN boltxplaid_plaidaccount ON boltxplaid_plaidaccount.id = boltxplaid_plaidtransaction.plaid_account_id "
               "INNER JOIN boltxplaid_plaiditem ON boltxplaid_plaiditem.id = boltxplaid_plaidaccount.item_id "
               "WHERE boltxplaid_plaiditem.item_id = %s", [item.item_id])
            row = cursor.fetchone()
            cursor.close()
            latest_cursor = row[0] if row else None

        # Sync transactions for this item
        request = TransactionsSyncRequest(access_token=item.access_token)
        response = pm.client.transactions_sync(request)

        # Iterate through each page of new transaction updates for item
        while response['has_more']:
            request = TransactionsSyncRequest(
                access_token=item.access_token,
                cursor=response['next_cursor'],
            )
            response = pm.client.transactions_sync(request)

            # Add this page of results to the database
            for added_transaction in response['added']:
                if added_transaction['account_id'] in account_ids:
                    account = PlaidAccount.objects.get(account_id=added_transaction['account_id'])
                    location_dict = {
                        'address': added_transaction['location']['address'],
                        'city': added_transaction['location']['city'],
                        'region': added_transaction['location']['region'],
                        'postal_code': added_transaction['location']['postal_code'],
                        'country': added_transaction['location']['country'],
                        'lat': added_transaction['location']['lat'],
                        'lon': added_transaction['location']['lon'],
                    }
                    payment_dict = {
                        "by_order_of": added_transaction['payment_meta']['by_order_of'],
                        "payee": added_transaction['payment_meta']['payee'],
                        "payer": added_transaction['payment_meta']['payer'],
                        "payment_method": added_transaction['payment_meta']['payment_method'],
                        "payment_processor": added_transaction['payment_meta']['payment_processor'],
                        "ppd_id": added_transaction['payment_meta']['ppd_id'],
                        "reason": added_transaction['payment_meta']['reason'],
                        "reference_number": added_transaction['payment_meta']['reference_number']
                    }


                    with connection.cursor() as cursor:
                        cursor.execute("""
                            INSERT INTO boltxplaid_plaidtransaction (
                                plaid_account_id,
                                account_id,
                                account_owner,
                                amount,
                                name,
                                authorized_date,
                                authorized_datetime,
                                category,
                                category_id,
                                check_number,
                                date,
                                datetime,
                                iso_currency_code,
                                location,
                                merchant_name,
                                payment_channel,
                                payment_meta,
                                pending,
                                pending_transaction_id,
                                personal_finance_category,
                                transaction_code,
                                transaction_id,
                                transaction_type,
                                unofficial_currency_code,
                                latest_cursor
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, [
                            account.pk,
                            added_transaction.get('account_id'),
                            added_transaction.get('account_owner'),
                            added_transaction.get('amount'),
                            added_transaction.get('name'),
                            added_transaction.get('authorized_date'),
                            added_transaction.get('authorized_datetime'),
                            added_transaction.get('category'),
                            added_transaction.get('category_id'),
                            added_transaction.get('check_number'),
                            added_transaction.get('date'),
                            added_transaction.get('datetime'),
                            added_transaction.get('iso_currency_code'),
                            json.dumps(location_dict),
                            added_transaction.get('merchant_name'),
                            added_transaction.get('payment_channel'),
                            json.dumps(payment_dict),
                            added_transaction.get('pending'),
                            added_transaction.get('pending_transaction_id'),
                            added_transaction.get('personal_finance_category'),
                            added_transaction.get('transaction_code'),
                            added_transaction.get('transaction_id'),
                            added_transaction.get('transaction_type'),
                            added_transaction.get('unofficial_currency_code'),
                            added_transaction.get('latest_cursor'),
                        ])
                        cursor.close()
            for modified_transaction in response['modified']:
                if modified_transaction['account_id'] in account_ids:
                    account = PlaidAccount.objects.get(account_id=modified_transaction['account_id'])
                    location_dict = {
                        'address': modified_transaction['location']['address'],
                        'city': modified_transaction['location']['city'],
                        'region': modified_transaction['location']['region'],
                        'postal_code': modified_transaction['location']['postal_code'],
                        'country': modified_transaction['location']['country'],
                        'lat': modified_transaction['location']['lat'],
                        'lon': modified_transaction['location']['lon'],
                    }
                    payment_dict = {"by_order_of": modified_transaction['payment_meta']['by_order_of'],
                    "payee": modified_transaction['payment_meta']['payee'],
                    "payer": modified_transaction['payment_meta']['payer'],
                    "payment_method": modified_transaction['payment_meta']['payment_method'],
                    "payment_processor": modified_transaction['payment_meta']['payment_processor'],
                    "ppd_id": modified_transaction['payment_meta']['ppd_id'],
                    "reason": modified_transaction['payment_meta']['reason'],
                    "reference_number": modified_transaction['payment_meta']['reference_number']}
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            UPDATE boltxplaid_plaidtransaction
                            SET
                                plaid_account_id = %s,
                                account_id = %s,
                                account_owner = %s,
                                amount = %s,
                                name = %s,
                                authorized_date = %s,
                                authorized_datetime = %s,
                                category = %s,
                                category_id = %s,
                                check_number = %s,
                                date = %s,
                                datetime = %s,
                                iso_currency_code = %s,
                                location = %s,
                                merchant_name = %s,
                                payment_channel = %s,
                                payment_meta = %s,
                                pending = %s,
                                pending_transaction_id = %s,
                                personal_finance_category = %s,
                                transaction_code = %s,
                                transaction_id = %s,
                                transaction_type = %s,
                                unofficial_currency_code = %s,
                                latest_cursor = %s
                            WHERE transaction_id = %s
                        """, [
                            account.pk,
                            modified_transaction.get('account_id'),
                            modified_transaction.get('account_owner'),
                            modified_transaction.get('amount'),
                            modified_transaction.get('name'),
                            modified_transaction.get('authorized_date'),
                            modified_transaction.get('authorized_datetime'),
                            modified_transaction.get('category'),
                            modified_transaction.get('category_id'),
                            modified_transaction.get('check_number'),
                            modified_transaction.get('date'),
                            modified_transaction.get('datetime'),
                            modified_transaction.get('iso_currency_code'),
                            json.dumps(location_dict),
                            modified_transaction.get('merchant_name'),
                            modified_transaction.get('payment_channel'),
                            json.dumps(payment_dict),
                            modified_transaction.get('pending'),
                            modified_transaction.get('pending_transaction_id'),
                            modified_transaction.get('personal_finance_category'),
                            modified_transaction.get('transaction_code'),
                            modified_transaction.get('transaction_id'),
                            modified_transaction.get('transaction_type'),
                            modified_transaction.get('unofficial_currency_code'),
                            modified_transaction.get('latest_cursor'),
                            modified_transaction.get('transaction_id'),
                        ])
                        cursor.close()
            for removed_transaction in response['removed']:
                with connection.cursor() as cursor:
                    cursor.execute("DELETE FROM boltxplaid_plaidtransaction WHERE transaction_id = %s AND account_id = %s", [removed_transaction['transaction_id'], account_id])
                    cursor.close()

            # Update latest_cursor to the next cursor
            latest_cursor = response['next_cursor']

        # Update the latest_cursor in the database
        with connection.cursor() as cursor:
            cursor.execute("UPDATE boltxplaid_plaidtransaction SET latest_cursor = %s WHERE plaid_account_id IN (SELECT id FROM boltxplaid_plaidaccount WHERE item.item_id = %s)", [latest_cursor, item.item_id])

            cursor.close()

    return Response("Done") 


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def update_accounts(request):
    if request.method == 'GET':
        try:
            user = request.user
            items = Item.objects.filter(user_id=user.id)
            accounts = Account.objects.filter(item__user_id=user.id)
            for item in items:
                try:
                    access_token = item.access_token
                    account_data = pm.get_plaid_accounts(access_token=access_token)

                    for account in accounts:
                        for acc in account_data:
                            if account.account_id == acc['account_id']:
                                account.current = acc['balances']['current']
                                account.available = acc['balances']['available']
                                account.limit = acc['balances']['limit']
                                account.official_name = acc['official_name'] or account.name
                                account.save()
                except:
                    pass
            return Response("Accounts Updated")
        
        except Exception as e:
            print(e)
            return Response("Error Updating Accounts")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_accounts(request):
        user = request.user
        accounts = Account.objects.filter(item__user_id=user.id)
        serializer = ViewPlaidAccountSerializer(accounts, many=True)

        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_account_totals(request):
        user = request.user
        accounts = Account.objects.filter(item__user_id=user.id)

        total_loan = accounts.filter(type='loan').aggregate(Sum('current'))["current__sum"]
        if total_loan == None:
            total_loan = 0

        total_credit = accounts.filter(type='credit').aggregate(Sum('current'))["current__sum"]
        if total_credit == None:
            total_credit = 0
        
        total_debt = total_credit + total_loan

        total_checkings = accounts.filter(subtype='checking').aggregate(Sum('available'))["available__sum"]
        if total_checkings == None:
            total_checkings = 0

        total_savings = accounts.filter(subtype='savings').aggregate(Sum('available'))["available__sum"]
        if total_savings == None:
            total_savings = 0

        total_investments = accounts.filter(type='investment').aggregate(Sum('current'))["current__sum"]
        if total_investments == None:
            total_investments = 0

        net_worth = total_checkings + total_savings + total_investments - total_debt

        account_overview = {
            'checkings': "${:0,.0f}".format(total_checkings),
            'savings': "${:0,.0f}".format(total_savings),
            'investments': "${:0,.0f}".format(total_investments),
            'debt': "${:0,.0f}".format(total_debt), 
            'net_worth': "${:0,.0f}".format(net_worth)
        }
        return Response(account_overview)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    user = request.user
    transactions = Transaction.objects.filter(plaid_account__item__user_id=user.id).order_by('-date')
    # df = pd.DataFrame(list(transactions.values()))
    # df['date'] = pd.to_datetime(df['date'])
    # df['month'] = df['date'].dt.strftime('%Y-%m')
    # df['categories'] = df['category'].str.split(',')
    # df = df.explode('categories')
    # grouped_df = df.groupby(['month', 'categories']).size().reset_index(name='count')
    # print(df.groupby(['month', 'categories']).si)
    # grouped_df.to_csv('transactions.csv')

    serializer = PlaidTransactionSerializer(transactions, many=True)
    # return Response("Done")
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    if request.method == 'POST':
        user = request.user
        accounts = Account.objects.filter(item__user_id=user.id)
        accounts.filter(id=request.data[0]['id']).delete()
        return Response("Done")
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wallet_connect(request):
    if request.method == 'POST':
        print(request.data)
        return Response("Done")


@api_view(['GET'])
def update_liabilities(request):
    if request.method == 'GET':
        accounts = Account.objects.all()
        previous_item = None
        for account in accounts:
            if account.item != previous_item:
                previous_item = account.item
                if isinstance(previous_item, Item):
                    liabilities_exist = account.type in ['credit', 'loan']
                    if liabilities_exist:
                        try:
                            liabilities_response = pm.get_liabilities(access_token=account.item.access_token)
                            if len(liabilities_response[0]['credit']) > 0:
                                for credit in liabilities_response[0]['credit']:
                                    try:
                                        credit_liability = CreditLine.objects.get(plaid_account=Account.objects.get(account_id=credit['account_id']))
                                    except CreditLine.DoesNotExist:
                                        credit_liability = CreditLine(plaid_account=Account.objects.get(account_id=credit['account_id']))

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

                            if len(liabilities_response[0]['mortgage']) > 0:
                                for mortgage in liabilities_response[0]['mortgage']:
                                    try:
                                        mortgage_liability = MortgageLoan.objects.get(plaid_account=Account.objects.get(account_id=mortgage['account_id']))
                                    except MortgageLoan.DoesNotExist:
                                        mortgage_liability = MortgageLoan(plaid_account=Account.objects.get(account_id=mortgage['account_id']))

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

                            if len(liabilities_response[0]['student']) > 0:
                                for student in liabilities_response[0]['student']:
                                    print(student)
                                    try:
                                        student_liability = StudentLoan.objects.get(plaid_account=Account.objects.get(account_id=student['account_id']))
                                    except StudentLoan.DoesNotExist:
                                        student_liability = StudentLoan(plaid_account=Account.objects.get(account_id=student['account_id']))

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


                        except Exception as e:
                            print(e)
                            pass

        return Response("Done")
    
