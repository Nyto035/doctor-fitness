angular.module('app.services.businessInputs', [])

.service('app.services.businessProfile', businessProfile)

.service('app.services.businessInputs.form', businessInputs);

    function businessProfile() {
        var self = this;
        self.expenseDetails = function basicFiels() {
            return [
                {
                    'label': 'Name',
                    'key': 'name',
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

        self.addItem = function itemFxn() {
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

        self.expenseDetails = function createInputs() {
            return [
                {
                    'name': 'business_name',
                    'type': 'text',
                    'verbous_name': 'Expense',
                },
                {
                    'name': 'transaction_date',
                    'type': 'date',
                    'verbous_name': 'Transaction Date',
                },
                {
                    'name': 'amount',
                    'type': 'number',
                    'verbous_name': 'Amount',
                },
                {
                    'name': 'Phone Number',
                    'type': 'text',
                    'verbous_name': 'Phone Number',
                },
                {
                    'name': 'Email Address',
                    'type': 'email',
                    'verbous_name': 'Email Address',
                },
                {
                    'name': 'Postal Address',
                    'type': 'text',
                    'verbous_name': 'Postal Address',
                },
                {
                    'name': 'notes',
                    'type': 'text',
                    'verbous_name': 'Notes',
                },
            ];
        };
    };
