from django.contrib import admin
from . models import Item, Account, Transaction, Request, CreditLine, MortgageLoan, StudentLoan, APR, PropertyAddress

# Register your models here.

admin.site.register(Item)
admin.site.register(Account)
admin.site.register(Transaction)
admin.site.register(Request)
admin.site.register(CreditLine)
admin.site.register(MortgageLoan)
admin.site.register(StudentLoan)
admin.site.register(APR)
admin.site.register(PropertyAddress)
