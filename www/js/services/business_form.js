angular.module('app.services.businessInputs', [])

.service('app.services.workoutProfile', workoutProfile)

.service('app.services.businessInputs.form', businessInputs);
    
    function workoutProfile() {
        var self = this;
        var short_desc = 'Get down on all fours and position your' +
            ' hands under your shoulders and your knees under your hips.';
        var long_desc = 'Get down on all fours and position your' +
            ' hands under your shoulders and your knees under your hips.' +
            ' Kick back with onee leg and squeeze the glutes.' +
            ' Switch legs';
        self.exerciseetails = function basicFiels() {
            return [
                {
                    'label': 'Glute Kickback',
                    'key': 'name',
                    'duration': '00:15',
                    'short_description': 'Get down on all fours and position your' +
                        ' hands under your shoulders and your knees under your hips.',
                    'long_description': 'Get down on all fours and position your ' +
                        'hands under your shoulders and your knees under your hips.' +
                        ' Kick back with onee leg and squeeze the glutes.' +
                        ' Switch legs',
                },
                {
                    'label': 'Single Leg Kickbacks ',
                    'key': 'agent',
                    'duration': '00:15',
                    'short_description': short_desc,
                    'long_description': long_desc,
                },
                {
                    'label': 'Squats',
                    'key': 'pin',
                    'duration': '00:15',
                    'short_description': short_desc,
                    'long_description': long_desc,
                },
                {
                    'label': 'Plunk Crunches',
                    'key': 'currency_name',
                    'duration': '00:15',
                    'short_description': short_desc,
                    'long_description': long_desc,
                },
                {
                    'label': 'Knee to elbows',
                    'key': 'slogan',
                    'duration': '00:15',
                    'short_description': short_desc,
                    'long_description': long_desc,
                },
                {
                    'label': 'Star Plunks',
                    'key': 'receipt_footnote',
                    'duration': '00:15',
                    'short_description': short_desc,
                    'long_description': long_desc,
                },
                {
                    'label': 'Side Plunk Crunches',
                    'key': 'invoice_footnote',
                    'duration': '00:15',
                    'short_description': short_desc,
                    'long_description': long_desc,
                },
                {
                    'label': 'Situps',
                    'key': 'quotation_footnote',
                    'duration': '00:15',
                    'short_description': short_desc,
                    'long_description': long_desc,
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
