from rest_framework.serializers import ModelSerializer , CharField, CurrentUserDefault, JSONField, HiddenField, ListField, URLField, DateTimeField, DecimalField, DateField, BooleanField, Serializer

from .models import CustomUser, Item, Account, Transaction


class PlaidItemSerializer(ModelSerializer):
    institution_id = CharField(required=False)
    institution_name = CharField(required=False)
    available_products = ListField(required=False)
    billed_products = ListField(required=False)
    products = ListField(required=False)
    update_type = CharField(required=False)
    webhook = URLField(required=False)
    item_id = CharField(required=False)
    last_successful_update = DateTimeField(required=False)
    class Meta:
        model = Item
        fields = '__all__'

class PlaidAccountSerializer(ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class PlaidTransactionSerializer(ModelSerializer):
    location = JSONField()
    payment_meta = JSONField()
    account = CharField(source='plaid_account.name')
    class Meta:
        model = Transaction
        fields = '__all__'
  
class CreateAccountSerializer(ModelSerializer):
    institution = CharField(required=False)

    class Meta:
        model = Account
        fields = '__all__'

class ViewPlaidAccountSerializer(ModelSerializer):
    institution = CharField(source='item.institution_name',required=False)
    class Meta:
        model = Account
        fields = '__all__'
