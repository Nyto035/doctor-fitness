angular.module('app.services.businessInputs', [])

.service('app.services.businessProfile', businessProfile)

.service('app.services.businessInputs.form', businessInputs);
    
    function businessProfile() {
        var self = this;
        self.basicDetails = function basicFiels() {
            return [
                {
                    'label': 'Name',
                    'key': 'name',
                    'required': true,
                },
                {
                    'label': 'Agent Code',
                    'key': 'agent',
                },
                {
                    'label': 'Business PIN',
                    'key': 'pin'
                },
                {
                    'label': 'Currency Code',
                    'key': 'currency_name',
                },
                {
                    'label': 'Business Slogan',
                    'key': 'slogan',
                },
                {
                    'label': 'Receipt Footnote',
                    'key': 'receipt_footnote',
                },
                {
                    'label': 'Invoice Footnote',
                    'key': 'invoice_footnote',
                },
                {
                    'label': 'Quotation Footnote',
                    'key': 'quotation_footnote',
                },
            ];
        };
        self.contactDetails = function contFxn() {
            return [
                {
                    'label': 'Branch Name',
                    'key': 'name',
                },
                {
                    'label': 'Physical Address',
                    'key': 'physical_address',
                },
                {
                    'label': 'Postal Address',
                    'key': 'postal_address',
                },
                {
                    'label': 'Phone Number',
                    'key': 'phones',
                },
                {
                    'label': 'Email Address',
                    'key': 'emails',
                },
                {
                    'label': 'Websites',
                    'key': 'websites',
                },
                {
                    'label': 'Social Sites',
                    'key': 'socials',
                },
            ];
        };
    };

    businessInputs.$inject = [];
    function businessInputs() {
        const self = this;

        self.createSale = function saleFrm() {
            return [
                {
                    'name': 'client_id',
                    'type': 'select',
                    'verbous_name': 'Customer',
                },
            ];
        };

        self.createPurchase = function saleFrm() {
            return [
                {
                    'name': 'supplier_id',
                    'type': 'select',
                    'verbous_name': 'Supplier',
                },
            ];
        };

        self.addItem = function itemFxn(arg) {
            return [
                {
                    'name': 'id',
                    'type': 'select',
                    'verbous_name': 'Item',
                    'class': 'margin-b-10'
                },
                {
                    'name': 'qty',
                    'type': 'textarea',
                    'verbous_name': 'Quantity',
                    'class': 'col-12 inline-block margin-b-20 margin-t-20'
                },
                {
                    'name': 'price',
                    'type': 'number',
                    'verbous_name': 'Item Price',
                    'class': 'col-12 inline-block margin-b-20'
                },
                {
                    'name': 'discount',
                    'type': 'number',
                    'verbous_name': 'Discount',
                    'class': 'col-12 inline-block margin-b-20'
                },
                /*{
                    'name': 'total',
                    'type': 'number',
                    'readonly': true,
                    'verbous_name': 'Total Price',
                    'class': 'col-12 inline-block margin-b-20'
                },*/
            ];
        }

        self.createBusiness = function createInputs() {
            return [
                {
                    'name': 'new_business',
                    'type': 'text',
                    'verbous_name': 'Business Name',
                    'required': true,
                },
                {
                    'name': 'plan',
                    'type': 'select',
                    'verbous_name': 'Select Business Plan',
                    'options': 'plans',
                },
                {
                    'name': 'agent',
                    'type': 'text',
                    'verbous_name': 'Agent Code',
                },
                {
                    'name': 'pin',
                    'type': 'text',
                    'verbous_name': 'Business Pin',
                },
                /*{
                    'name': 'slogan',
                    'type': 'hidden',
                    'verbous_name': 'Business Pin',
                },
                {
                    'name': 'logo',
                    'type': 'hidden',
                    'verbous_name': 'Business Pin',
                },
                {
                    'name': 'invoice_footnote',
                    'type': 'hidden',
                    'verbous_name': 'Business Pin',
                },
                {
                    'name': 'receipt_footnote',
                    'type': 'hidden',
                    'verbous_name': 'Business Pin',
                },
                {
                    'name': 'quotation_footnote',
                    'type': 'hidden',
                    'verbous_name': 'Business Pin',
                },
                {
                    'name': 'main_branch_name',
                    'type': 'hidden',
                    'verbous_name': 'Main Branch Name',
                },*/
                {
                    'name': 'currency_id',
                    'type': 'select',
                    'verbous_name': 'Business Currency',
                    'options': 'currencies',
                },
                {
                    'name': 'phone_number',
                    'type': 'text',
                    'verbous_name': 'Phone Number',
                    'required': true,
                },
                {
                    'name': 'email_address',
                    'type': 'email',
                    'verbous_name': 'Email Address',
                    'required': true,
                },
                {
                    'name': 'postal_address',
                    'type': 'text',
                    'verbous_name': 'Postal Address',
                    'required': true,
                },
                {
                    'name': 'physical_address',
                    'type': 'text',
                    'verbous_name': 'Physical Address',
                    'required': true,
                },
            ];
        };

        self.addExpense = function itemFxn(arg) {
            return [
                {
                    'name': 'expense_name',
                    'type': 'text',
                    'verbous_name': 'Expense',
                    'class': 'margin-b-10'
                },
                {
                    'name': 'transaction_date',
                    'type': 'date',
                    'verbous_name': 'Transaction Date',
                    'class': 'col-12 inline-block margin-b-20 margin-t-20'
                },
                {
                    'name': 'payment_account_id',
                    'type': 'select',
                    'verbous_name': 'Payment Account',
                    'class': 'col-12 inline-block margin-b-20'
                },
                {
                    'name': 'amount',
                    'type': 'number',
                    'verbous_name': 'Expense Amount',
                    'class': 'col-12 inline-block margin-b-20'
                },
                /*{
                    'name': 'notes',
                    'type': 'text',
                    'verbous_name': 'Expense Notes',
                    'class': 'col-12 inline-block margin-b-20'
                },*/
            ];
        }
    };
