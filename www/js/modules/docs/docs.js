(function(){
    var documentation = {
        noToken : [
            {
                request: "Get available business plans",
                params: ["get_plans"],
                deprecated : false,
                successDetails : "Data contains an array of available business plans.",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "{id : '', name : '', price : '', currency : '', text : ''}",
                onError: "Error message"
            },
            {
                request: "Send email to Eko Biashara inbox. i.e. From a contacts form",
                params: ["process_contact_form_email", "subject", "message"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Register new system user",
                params: ["register_user_by_email", "phone", "password", "password_confirm"],
                deprecated : false,
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Activate system user account",
                params: ["activate_user_account"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Recover forgot password",
                params: ["forgot_password_email"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Recover forgot password. Change password",
                params: ["password_change", "password", "password_confirm"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Login user with email and password. Returns session token",
                params: ["login_email", "password"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Login user with email and password. Returns session details",
                params: ["login_email_session", "password"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            }
        ],
        token : [
            {
                request: "Check locked session token user details",
                params: ["token", "get_locked_user"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get session token session details",
                params: ["token", "get_session"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system accounts categories. i.e. Assets, Liabilities etc.",
                params: ["token", "get_account_categories"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get a sample list of banks for cash account suggestions",
                params: ["token", "get_sample_bank_providers"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system cash account types",
                params: ["token", "get_cash_account_types"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system currencies",
                params: ["token", "get_currencies"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system input, output types. i.e. Product, Service etc.",
                params: ["token", "get_input_output_types"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system journal entries types. i.e. Debit, Credit",
                params: ["token", "get_journal_types"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get a sample list of mobile money providers. i.e. M-Pesa, Airtel Money...",
                params: ["token", "get_sample_mobile_money_providers"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system permissions list",
                params: ["token", "get_permissions"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system tax statuses. i.e. Tax Not Included, Tax Included...",
                params: ["token", "get_tax_statuses"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system products tracked statuses. i.e. Tracked, Not Tracked...",
                params: ["token", "get_tracked_statuses"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system transaction types. i.e. Sale Transaction, Expense Transaction...",
                params: ["token", "get_transaction_types"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get system expense types. i.e. Salaries... (Deprecated)",
                params: ["token", "get_expense_types"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get session token user logs",
                params: ["token", "get_user_logs"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get session token user's profile",
                params: ["token", "get_user_profile"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get session token user's active sessions",
                params: ["token", "get_user_sessions"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get session token user's businesses",
                params: ["token", "get_user_businesses"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "Get session token user's business dashboard details...",
                params: ["token", "get_business_dashboard"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_details"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_accounts"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_transactions_audit"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_account_groups"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_branches_detailed"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_branch_details"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_cash_accounts"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_payment_accounts"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_customers"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_inputs"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_inputs"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_logs"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_outputs"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_sales_list"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_purchases_list"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_quotations_list"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_expenses_list"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_other_revenues_list"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_capital_injection_list"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_inter_account_transfer_list"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_drawings_list"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_sale_transaction_document"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_sale_items"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_suppliers"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_taxes"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_users"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_business_user_groups"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_trial_balance", "expanded", "date"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_income_statement", "start_date", "end_date"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_balance_sheet", "date"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "get_account_statement", "account_id", "start_date", "end_date"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "unlock_session"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "lock_session"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "logout_session"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "change_login_email"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "change_login_password", "password_confirm"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_profile_names"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_profile_avatar"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "new_business", "plan", "pin", "currency_id", "logo", "slogan", "receipt_footnote", "invoice_footnote", "quotation_footnote", "main_branch_name", "physical_address", "postal_address", "phones", "emails"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business", "name", "pin", "currency_id", "logo", "slogan", "receipt_footnote", "invoice_footnote", "quotation_footnote"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "change_business_logo", "business"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business_branch", "branch_id", "name", "physical_address", "postal_address", "phones", "emails"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business_branch"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business_branch"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business_cash_account", "account_id", "type", "account_provider", "account_holder", "account_number"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business_cash_account"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business_cash_account"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business_customer", "customer", "name", "phone", "email", "website", "physical_address", "postal_address"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business_customer"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business_customer"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business_supplier", "supplier", "name", "phone", "email", "website", "physical_address", "postal_address"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business_supplier"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business_supplier"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business_input", "inputid", "type", "name", "code", "buying_price", "opening_stock", "supplier", "taxid", "taxstatus", "tracked"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "use_business_input", "inputid", "qty"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business_input"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business_input"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business_output", "output", "type", "name", "code", "buying_price", "opening_stock", "selling_price", "supplier", "taxid", "taxstatus", "tracked"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business_output"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business_output"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business_tax", "id", "name", "rate"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business_tax"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business_tax"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business_user", "id", "groups", "branches", "status"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business_user"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business_user"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "edit_business_user_group", "id", "name", "permissions"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "delete_business_user_group"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_delete_business_user_group"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "business_sale", "client_id", "client_name", "transaction_date", "items", "payments", "branch_id", "notes"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "business_quotation", "client_id", "client_name", "transaction_date", "items", "payments", "branch_id", "notes"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "business_purchases", "client_id", "client_name", "transaction_date", "items", "payments", "branch_id", "notes"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "business_expense", "expense_type", "expense_name", "transaction_date", "payment_account_id", "amount"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "business_other_revenue", "revenue_source_name", "transaction_date", "payment_account_id", "amount"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "business_inject_capital", "capital_source_name", "transaction_date", "payment_account_id", "amount"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "business_inter_account_transfer", "transaction_date", "account_from_id", "account_to_id", "amount", "reason"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "business_drawings", "beneficiary_name", "transaction_date", "source_account_id", "amount", "reason"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "reverse_journal"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            },
            {
                request: "",
                params: ["token", "undo_reverse_journal"],
                deprecated : false,
                successDetails : "",
                errorDetails: "Data contains a string describing the error in detail",
                onSuccess: "",
                onError: "Error message"
            }
        ]
    };
})();