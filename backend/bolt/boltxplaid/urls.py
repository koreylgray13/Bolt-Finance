from django.urls import path, include
from . import views


urlpatterns = [
    # Plaid Link
    path('link/create/', views.request_link_token),
    path('wallet/add/', views.wallet_connect),
    
    # User Items

    path('item/create/', views.create_plaid_item),

    # User Accounts
    path('accounts/', views.get_accounts),
    path('accounts/update/', views.update_accounts),
    path('accounts/overview/', views.get_account_totals),
    path('accounts/delete/', views.delete_account),

    path('liabilities/update/', views.update_liabilities),

    # User Transactions
    path('transactions/', views.get_transactions),
    path('transactions/update/', views.plaid_sync_transactions),
]