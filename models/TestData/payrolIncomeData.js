let data = {
    "items": [
      {
        "item_id": "eVBnVMp7zdTJLkRNr33Rs6zr7KNJqBFL9DrE6",
        "institution_id": "ins_92",
        "institution_name": "ADP",
        "accounts": [
          {
            "account_id": "GeooLPBGDEunl54q7N3ZcyD5aLPLEai1nkzM9",
            "rate_of_pay": {
              "pay_amount": 100000,
              "pay_rate": "ANNUAL"
            },
            "pay_frequency": "BIWEEKLY"
          }
        ],
        "payroll_income": [
          {
            "account_id": "GeooLPBGDEunl54q7N3ZcyD5aLPLEai1nkzM9",
            "pay_stubs": [
              {
                "deductions": {
                  "breakdown": [
                    {
                      "current_amount": 123.45,
                      "description": "taxes",
                      "iso_currency_code": "USD",
                      "unofficial_currency_code": null,
                      "ytd_amount": 246.9
                    }
                  ],
                  "total": {
                    "current_amount": 123.45,
                    "iso_currency_code": "USD",
                    "unofficial_currency_code": null,
                    "ytd_amount": 246.9
                  }
                },
                "document_metadata": {
                  "document_type": "PAYSTUB",
                  "name": "paystub.pdf",
                  "status": "PROCESSING_COMPLETE",
                  "download_url": null
                },
                "document_id": "2jkflanbd",
                "earnings": {
                  "breakdown": [
                    {
                      "canonical_description": "REGULAR_PAY",
                      "current_amount": 200.22,
                      "description": "salary earned",
                      "hours": 80,
                      "iso_currency_code": "USD",
                      "rate": null,
                      "unofficial_currency_code": null,
                      "ytd_amount": 400.44
                    },
                    {
                      "canonical_description": "BONUS",
                      "current_amount": 100,
                      "description": "bonus earned",
                      "hours": null,
                      "iso_currency_code": "USD",
                      "rate": null,
                      "unofficial_currency_code": null,
                      "ytd_amount": 100
                    }
                  ],
                  "total": {
                    "current_amount": 300.22,
                    "hours": 160,
                    "iso_currency_code": "USD",
                    "unofficial_currency_code": null,
                    "ytd_amount": 500.44
                  }
                },
                "employee": {
                  "address": {
                    "city": "SAN FRANCISCO",
                    "country": "US",
                    "postal_code": "94133",
                    "region": "CA",
                    "street": "2140 TAYLOR ST"
                  },
                  "name": "ANNA CHARLESTON",
                  "marital_status": "SINGLE",
                  "taxpayer_id": {
                    "id_type": "SSN",
                    "id_mask": "3333"
                  }
                },
                "employer": {
                  "name": "PLAID INC",
                  "address": {
                    "city": "SAN FRANCISCO",
                    "country": "US",
                    "postal_code": "94111",
                    "region": "CA",
                    "street": "1098 HARRISON ST"
                  }
                },
                "net_pay": {
                  "current_amount": 123.34,
                  "description": "TOTAL NET PAY",
                  "iso_currency_code": "USD",
                  "unofficial_currency_code": null,
                  "ytd_amount": 253.54
                },
                "pay_period_details": {
                  "distribution_breakdown": [
                    {
                      "account_name": "Big time checking",
                      "bank_name": "bank of plaid",
                      "current_amount": 176.77,
                      "iso_currency_code": "USD",
                      "mask": "1223",
                      "type": "checking",
                      "unofficial_currency_code": null
                    }
                  ],
                  "end_date": "2020-12-15",
                  "gross_earnings": 4500,
                  "iso_currency_code": "USD",
                  "pay_amount": 1490.21,
                  "pay_date": "2020-12-15",
                  "pay_frequency": "BIWEEKLY",
                  "start_date": "2020-12-01",
                  "unofficial_currency_code": null
                }
              }
            ],
            "w2s": [
              {
                "allocated_tips": "1000",
                "box_12": [
                  {
                    "amount": "200",
                    "code": "AA"
                  }
                ],
                "box_9": "box9",
                "dependent_care_benefits": "1000",
                "document_metadata": {
                  "document_type": "US_TAX_W2",
                  "download_url": null,
                  "name": "w_2.pdf",
                  "status": "PROCESSING_COMPLETE"
                },
                "document_id": "1pkflebk4",
                "employee": {
                  "address": {
                    "city": "San Francisco",
                    "country": "US",
                    "postal_code": "94103",
                    "region": "CA",
                    "street": "1234 Grand St"
                  },
                  "name": "Josie Georgia Harrison",
                  "marital_status": "SINGLE",
                  "taxpayer_id": {
                    "id_type": "SSN",
                    "id_mask": "1234"
                  }
                },
                "employer": {
                  "address": {
                    "city": "New York",
                    "country": "US",
                    "postal_code": "10010",
                    "region": "NY",
                    "street": "456 Main St"
                  },
                  "name": "Acme Inc"
                },
                "employer_id_number": "12-1234567",
                "federal_income_tax_withheld": "1000",
                "medicare_tax_withheld": "1000",
                "medicare_wages_and_tips": "1000",
                "nonqualified_plans": "1000",
                "other": "other",
                "retirement_plan": "CHECKED",
                "social_security_tax_withheld": "1000",
                "social_security_tips": "1000",
                "social_security_wages": "1000",
                "state_and_local_wages": [
                  {
                    "employer_state_id_number": "11111111111AAA",
                    "local_income_tax": "200",
                    "local_wages_and_tips": "200",
                    "locality_name": "local",
                    "state": "UT",
                    "state_income_tax": "200",
                    "state_wages_tips": "200"
                  }
                ],
                "statutory_employee": "CHECKED",
                "tax_year": "2020",
                "third_party_sick_pay": "CHECKED",
                "wages_tips_other_comp": "1000"
              }
            ],
            "form1099s": [
              {
                "april_amount": null,
                "august_amount": null,
                "card_not_present_transaction": null,
                "crop_insurance_proceeds": 1000,
                "december_amount": null,
                "document_id": "mvMZ59Z2a5",
                "document_metadata": {
                  "document_type": "US_TAX_1099_MISC",
                  "download_url": null,
                  "name": "form_1099_misc.pdf",
                  "status": "PROCESSING_COMPLETE"
                },
                "excess_golden_parachute_payments": 1000,
                "feburary_amount": null,
                "federal_income_tax_withheld": 1000,
                "filer": {
                  "address": {
                    "city": null,
                    "country": null,
                    "postal_code": null,
                    "region": null,
                    "street": null
                  },
                  "name": null,
                  "tin": null,
                  "type": null
                },
                "fishing_boat_proceeds": 1000,
                "form_1099_type": "FORM_1099_TYPE_MISC",
                "gross_amount": 1000,
                "gross_proceeds_paid_to_an_attorney": 1000,
                "january_amount": null,
                "july_amount": null,
                "june_amount": null,
                "march_amount": null,
                "may_amount": null,
                "medical_and_healthcare_payments": 1000,
                "merchant_category_code": null,
                "nonemployee_compensation": 1000,
                "november_amount": null,
                "number_of_payment_transactions": null,
                "october_amount": null,
                "other_income": 1000,
                "payer": {
                  "address": {
                    "city": "SAN FRANCISCO",
                    "country": "US",
                    "postal_code": "94111",
                    "region": "CA",
                    "street": "1098 HARRISON ST"
                  },
                  "name": "PLAID INC",
                  "telephone_number": "(123)456-7890",
                  "tin": "12-3456789"
                },
                "payer_made_direct_sales_of_500_or_more_of_consumer_products_to_buyer": null,
                "payer_state_number": "CA 12345",
                "payer_state_number_lower": null,
                "primary_state": null,
                "primary_state_id": "CA 12345",
                "primary_state_income_tax": 1000,
                "pse_name": null,
                "pse_telephone_number": null,
                "recipient": {
                  "account_number": "45678",
                  "address": {
                    "city": "SAN FRANCISCO",
                    "country": "US",
                    "postal_code": "94133",
                    "region": "CA",
                    "street": "2140 TAYLOR ST"
                  },
                  "facta_filing_requirement": "CHECKED",
                  "name": "Josie Georgia Harrison",
                  "second_tin_exists": "NOT CHECKED",
                  "tin": "12-3456789"
                },
                "rents": 1000,
                "royalties": 1000,
                "secondary_state": null,
                "secondary_state_id": null,
                "secondary_state_income_tax": null,
                "section_409a_deferrals": 1000,
                "section_409a_income": 1000,
                "september_amount": null,
                "state_income": 1000,
                "state_income_lower": null,
                "state_tax_withheld": 1000,
                "state_tax_withheld_lower": null,
                "substitute_payments_in_lieu_of_dividends_or_interest": null,
                "tax_year": "2022",
                "transactions_reported": null
              }
            ]
          }
        ],
        "status": {
          "processing_status": "PROCESSING_COMPLETE"
        },
        "updated_at": "2022-08-02T21:14:54Z"
      }
    ],
    "request_id": "2pxQ59buGdsHRef"
  }