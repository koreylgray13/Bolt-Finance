from plaid.models import *
import plaid
from plaid.api import plaid_api
from dotenv import load_dotenv
from django.conf import settings
from datetime import datetime
import plaid
from plaid.api import plaid_api
from dotenv import load_dotenv
import os
from django.db import connection
import json

load_dotenv()

class PlaidManager:
    
    def __init__(self):
        
        configuration = plaid.Configuration(
            host=plaid.Environment.Development,
            api_key={
                'clientId': settings.PLAID_CLIENT_ID,
                'secret': settings.PLAID_SECRET_DEVELOPMENT,
            }
        )

        api_client = plaid_api.ApiClient(configuration)
        self.client = plaid_api.PlaidApi(api_client)

    def create_link_token(self, user_id):
        request = {
            'products': ['liabilities'],
            'client_name': 'Bolt Finance',
            'country_codes': ['US'],
            'redirect_uri': 'https://www.boltfinance.io/',
            'language': 'en',
            'webhook': 'https://sample-webhook-uri.com',
            'link_customization_name': 'default',
            'user': {
                'client_user_id': user_id
            }
        }
        # create link token 
        response = self.client.link_token_create(request)
        return response['link_token'], response['request_id']

    def update_link_token(self, access_token):

        request = LinkTokenCreateRequest(
                client_name="Bolt Finance",
                country_codes=[CountryCode('US')],
                language='en',
                access_token = access_token,
                webhook='https://webhook.sample.com',
                user=LinkTokenCreateRequestUser(
                    client_user_id='client_user_id'
                )
            )
        response = self.client.link_token_create(request)
        return response

    def exchange_public_token(self, public_token):
        request = ItemPublicTokenExchangeRequest(public_token=public_token)
        response = self.client.item_public_token_exchange(request)
        return response['access_token'], response['item_id']

    def get_asset_report(self, access_token):
        request = AssetReportCreateRequest(
            access_tokens=[access_token],
            days_requested=60,
            options=AssetReportCreateRequestOptions(
                webhook='https://www.example.com',
                client_report_id='123',
                user=AssetReportUser(
                    client_user_id='7f57eb3d2a9j6480121fx361',
                    first_name='Jane',
                    middle_name='Leah',
                    last_name='Doe',
                    ssn='123-45-6789',
                    phone_number='(555) 123-4567',
                    email='jane.doe@example.com',
                )
            )
        )
        response = self.client.asset_report_create(request)
        asset_report_id = response['asset_report_id']
        asset_report_token = response['asset_report_token']
        return asset_report_id, asset_report_token

    def sync_transactions(self, access_token, account_id, account):
        # Retrieve the latest cursor from your PostgreSQL database
        with connection.cursor() as cursor:
            cursor.execute("SELECT latest_cursor FROM boltxplaid_plaidtransaction WHERE account_id = %s", [account_id])
            row = cursor.fetchone()
            cursor.close()
            latest_cursor = row[0] if row else None

        # New transaction updates since "latest_cursor"
        has_more = True


        # Iterate through each page of new transaction updates for item
        while has_more:
            request = TransactionsSyncRequest(
                access_token=access_token,
                cursor=latest_cursor or '',
            )
            response = self.client.transactions_sync(request)


            # Add this page of results to the database
            for added_transaction in response['added']:
                location_dict = {
                    'address': added_transaction['location']['address'],
                    'city': added_transaction['location']['city'],
                    'region': added_transaction['location']['region'],
                    'postal_code': added_transaction['location']['postal_code'],
                    'country': added_transaction['location']['country'],
                    'lat': added_transaction['location']['lat'],
                    'lon': added_transaction['location']['lon'],
                }
                payment_dict = {"by_order_of": added_transaction['payment_meta']['by_order_of'],
                  "payee": added_transaction['payment_meta']['payee'],
                  "payer": added_transaction['payment_meta']['payer'],
                  "payment_method": added_transaction['payment_meta']['payment_method'],
                  "payment_processor": added_transaction['payment_meta']['payment_processor'],
                  "ppd_id": added_transaction['payment_meta']['ppd_id'],
                  "reason": added_transaction['payment_meta']['reason'],
                  "reference_number": added_transaction['payment_meta']['reference_number']}
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

            has_more = response['has_more']

            # Update latest_cursor to the next cursor
            latest_cursor = response['next_cursor']

            with open('plaid_transactions', 'w') as f:
                f.write(str(response))

        # Update the latest_cursor in the database
        with connection.cursor() as cursor:
            cursor.execute("UPDATE boltxplaid_plaidtransaction SET latest_cursor = %s WHERE account_id = %s", [latest_cursor, account_id])
            cursor.close()

    def get_plaid_item(self, access_token):
        request = ItemGetRequest(access_token=access_token)
        response = self.client.item_get(request)
        return response['item']

    def get_plaid_accounts(self, access_token):
        request = AccountsGetRequest(access_token=access_token)
        response = self.client.accounts_get(request)
        return response['accounts']

    def remove_plaid_item(self, access_token):
        request = ItemRemoveRequest(access_token=access_token)
        response = self.client.item_remove(request)
        return response
    
    def get_liabilities(self, access_token):
        request = LiabilitiesGetRequest(access_token=access_token)
        response = self.client.liabilities_get(request)
        return response['liabilities'], response['request_id']