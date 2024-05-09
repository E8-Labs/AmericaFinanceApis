import AccountsGetRequest, { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import JWT from "jsonwebtoken";
import db from "../models/index.js";
import PlaidTokenTypes from '../models/plaidtokentypes.js';
import UserBanksFullResource from '../resources/plaid/bank.resource.js';
import BankAccountModel from '../models/bankaccount.model.js';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);



//Utility Functions Used By Other Controllers
const GetBalancesListUtility = async (user) => {
  let plaidToken = await db.PlaidTokens.findOne({
    where: {
      UserId: user.id,
      plaid_token_type: PlaidTokenTypes.TokenAuth
    }
  });
  if (plaidToken) {
    try {
      const request = {
        access_token: plaidToken.plaid_access_token
      }
      const response = await plaidClient.accountsBalanceGet(request);
      const accounts = response.data.accounts;
      return accounts;
    }
    catch (error) {
      return null
    }
  }
  else {
    return null
  }
}

//Utility Functions Used By Other Controllers
const GetAccountsListUtility = async (user) => {
  let plaidToken = await db.PlaidTokens.findOne({
    where: {
      UserId: user.id,
      plaid_token_type: PlaidTokenTypes.TokenAuth
    }
  });
  if (plaidToken) {
    try {
      const request = {
        access_token: plaidToken.plaid_access_token
      }
      const response = await plaidClient.accountsGet(request);
      const accounts = response.data.accounts;
      return accounts;
    }
    catch (error) {
      return null
    }
  }
  else {
    return null
  }
}


const GetTransferAuthorization = async (user, amount, account_id, charge_type) => {
  //console.log("Request Auth For ", (Math.round(amount * 100) / 100).toFixed(2))
  let plaidToken = await db.PlaidTokens.findOne({
    where: {
      UserId: user.id,
      plaid_token_type: PlaidTokenTypes.TokenAuth
    }
  });
  //console.log(`Using ${plaidToken.plaid_access_token} for authorization ${amount}`)
  if (plaidToken) {
    //make the authorization request
    const request = {
      access_token: plaidToken.plaid_access_token,
      account_id: account_id,//'3gE5gnRzNyfXpBK5wEEKcymJ5albGVUqg77gr',
      type: charge_type, // credit or debit
      network: 'ach',
      amount: `${(Math.round(amount * 100) / 100).toFixed(2)}`,
      ach_class: 'ppd',
      user: {
        legal_name: `${user.firstname} ${user.middlename} ${user.lastname}`,
      },
    };
    try {
      const response = await plaidClient.transferAuthorizationCreate(request);
      const authorizationId = response.data.authorization.id;
      return response.data.authorization;
      // res.send({ status: true, message: "Authorization", data: response.data })
    } catch (error) {
      // handle error
      //console.log(error)
      return null
      // res.send({ status: false, message: error.message, data: null, errors: error })
    }
  }
  else {
    res.send({ status: false, message: "User not authorized to make transfers ", data: null })
  }
}


const MakeTransferUtility = async (user, loan, account_id, authorization_id) => {
  let am = (Math.round(loan.amount_requested * 100) / 100).toFixed(2)
  let plaidToken = await db.PlaidTokens.findOne({
    where: {
      UserId: user.id,
      plaid_token_type: PlaidTokenTypes.TokenAuth
    }
  });
  //console.log(`Using ${plaidToken.plaid_access_token} for authorization ${am}`)
  if (plaidToken) {
    try {
      const request = {
        access_token: plaidToken.plaid_access_token,
        account_id: account_id,
        description: 'payment for loan ' + loan.id + " amount " + am,
        authorization_id: authorization_id,
      };
      try {
        const response = await plaidClient.transferCreate(request);
        const transfer = response.data.transfer;
        const request_id = response.data.request_id;
        let createdTransfer = await db.Transfer.create({
          request_id: request_id,
          UserId: user.id,
          account_id: transfer.account_id,
          amount: transfer.amount,
          authorization_id: transfer.authorization_id,
          created: transfer.created,
          description: transfer.description,
          failure_reason: transfer.failure_reason,
          funding_account_id: transfer.funding_account_id,
          transfer_id: transfer.id,
          status: transfer.status,
          sweep_status: transfer.sweep_status,
          type: transfer.type,
          legal_name: transfer.user.legal_name,
          phone_number: transfer.user.phone_number,
          email_address: transfer.user.email_address,
        })
        return createdTransfer;
      } catch (error) {
        // handle error
        //console.log(error)
        return null
        // res.send({ status: false, message: error.message, data: null, errors: error })
      }
    } catch (error) {
      return null
      // res.send({ status: false, message: error, data: null })
    }
  }
  else {
    return null
    // res.send({ status: false, message: "User not authorized to make transfers ", data: null })
  }
}


const CreateLinkToken = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      console.log("Auth data ", authData.user)
      console.log("Client Id ", process.env.PLAID_CLIENT_ID);

      let tokenType = req.body.token_type;//PlaidTokenTypes.TokenAuth;
      console.log("Token Type ", tokenType)
      let products = ['auth', 'assets', 'identity', 'liabilities', 'transactions', 'transfer', 'identity']//, 'income'];
      let income_verification_object = null;
      let identity_verification = null


      if (tokenType == PlaidTokenTypes.TokenIdentityVerification) {
        products = ['identity_verification'];
        identity_verification = {
          template_id: "flwtmp_7txmNPo9aeCqHK",
          gave_consent: true,

        }
      }
      else if (tokenType == PlaidTokenTypes.TokenDocVerification) {
        products = ['identity_verification'];
        identity_verification = {
          template_id: "idvtmp_5puuqsbf7TQ9cj",
          gave_consent: true,

        }
      }
      else if (tokenType == PlaidTokenTypes.TokenIncomeVerification) {
        products = ['income_verification']
        income_verification_object = { income_source_types: ["payroll"] }
        //   : {
        //       income_source_types: ["bank"],
        //       bank_income: { days_requested: 60 },
        //     };
      }

      console.log("Products", products)

      let user = authData.user;
      let userid = authData.user.id;
      const clientUserId = userid;
      //console.log("Client User Id ", clientUserId)
      let request = {
        user: {
          // This should correspond to a unique id for the current user.
          client_user_id: `${clientUserId}`,
          legal_name: user.firstname + " " + user.middlename + " " + user.lastname,
          email_address: user.email,
          phone_number: user.phone,



        },
        income_verification: income_verification_object,
        user_token: user.plaid_user_token,
        client_name: 'America Finance',
        products: products,//['auth', 'assets', 'identity', 'liabilities', 'transactions', 'transfer', 'identity'],//, 'income_verification'
        // products: ['income_verification'],
        // products: ['identity_verification'],
        // android_package_name: "com.americafinance",
        language: 'en',
        // webhook: 'https://webhook.example.com',
        // redirect_uri: 'https://cdn-testing.plaid.com/link/v2/stable/sandbox-oauth-a2a-react-native-redirect.html',
        country_codes: ['US'],
        identity_verification: identity_verification
      };

      if (req.body.platform == "android") {
        request.android_package_name = "com.americafinance"
      }
      else {
        request.redirect_uri = 'https://cdn-testing.plaid.com/link/v2/stable/sandbox-oauth-a2a-react-native-redirect.html';
      }
      try {
        const createTokenResponse = await plaidClient.linkTokenCreate(request);
        res.send({ data: createTokenResponse.data, status: true, message: "Token obtained", products: products, token_type: tokenType });
      } catch (error) {
        // handle error
        console.log("Exception Plaid", error)
        const err = error.response.data;

        // Indicates plaid API error
        console.error('/exchange token returned an error', {
          error_type: err.error_type,
          error_code: err.error_code,
          error_message: err.error_message,
          display_message: err.display_message,
          documentation_url: err.documentation_url,
          request_id: err.request_id,
        });

        // Inspect error_type to handle the error in your application
        switch (err.error_type) {
          case 'INVALID_REQUEST':
            // ...
            break;
          case 'INVALID_INPUT':
            // ...
            break;
          case 'RATE_LIMIT_EXCEEDED':
            // ...
            break;
          case 'API_ERROR':
            // ...
            break;
          case 'ITEM_ERROR':
            // ...
            break;
          default:
          // fallthrough
        }
        res.send({
          data: {
            error_type: err.error_type,
            error_code: err.error_code,
            error_message: err.error_message,
            display_message: err.display_message,
            documentation_url: err.documentation_url,
            request_id: err.request_id,
          }, status: false, message: "Token error"
        });
      }

    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })
}

const ExchangePublicToken = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      let userid = authData.user.id;
      console.log("Exchanging token for user " + userid)
      try {
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
          public_token: req.body.public_token,
        });
        let tokenType = req.body.token_type;//PlaidTokenTypes.TokenAuth;
        console.log("Token type ", tokenType);
        let access_token = exchangeResponse.data.access_token;
        let user = authData.user;
        user.plaid_access_token = access_token;
        const tokenAdded = db.PlaidTokens.create({
          plaid_access_token: access_token, plaid_token_type: tokenType,
          UserId: userid
        })
          .then( async data => {
            if (!data) {
              let savedData = null;
              if (tokenType === PlaidTokenTypes.TokenAuth) {
                //get bank data and save 
                console.log("loading banks");
                savedData = await getBankDataAndSave(user)
              }
              res.send({
                message: `Cannot update User with id=${userid}. Maybe User was not found!`, status: false, data: null
              });
            }
            else {
              res.send({ message: "Access Token Exchanged", status: true, data: savedData });
            }
          })
          .catch(err => {
            console.log(err)
            res.send({
              message: "Error updating User with id=" + userid, status: false, data: null, error: err
            });
          });
      }
      catch (error) {
        console.log(error)
        res.send({
          message: error.message, status: false, data: null, error: error
        });
      }


    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })
}

async function getBankDataAndSave(user) {
  const accounts = await GetAccountsListUtility(user);
  console.log("Usre accounts list", accounts)
  const savedaccounts = []
  if (accounts) {
    // save the accounts
    for (let i = 0; i < accounts.length; i++) {
      let item = accounts[i];
      let data = {
        account_id: item.account_id,
        name: item.name,
        official_name: item.official_name,
        balance_available: item.balances.available,
        balance_current: item.balances.current,
        type: item.type,
        subtype: item.subtype,
        mask: item.mask,
        UserId: user.id
      }
      let account = await db.BankAccountModel.create(data);
      if (account) {
        savedaccounts.push(account)
        console.log("Account created", savedaccounts.length)

      }
      else {
        console.log("Account not created")
      }

    }
    let dbaccounts = await db.BankAccountModel.findAll({
      where: {
        UserId: user.id
      }
    })
    console.log("sending back response")
    let list = await UserBanksFullResource(dbaccounts)
    return list

  }
}




const GetUserBalance = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      let userid = authData.user.id;

      // if (typeof req.query.userid !== 'undefined') {
      //     userid = req.query.userid;
      // }
      const user = await db.user.findByPk(userid);
      //console.log("Getting user details with access token ", user)

      // check if user has accounts in db
      // let dbaccounts = await db.BankAccountModel.findAll({
      //     where: {
      //         UserId: userid
      //     }
      // })
      // if(dbaccounts && dbaccounts.length > 0){
      //     let list = await UserBanksFullResource(dbaccounts)
      //     res.send({ message: "Accounts with balance from db", status: true, data: list});
      // }
      // else{
      try {

        const accounts = await GetBalancesListUtility(user);
        res.send({ message: "Accounts with balance plaid", status: true, data: accounts });

      }
      catch (err) {
        // //console.log(err)
        res.send({
          data: {
            error_type: err.error_type,
            error_code: err.error_code,
            error_message: err.error_message,
            display_message: err.display_message,
            documentation_url: err.documentation_url,
            request_id: err.request_id,
          }, status: false, message: "Token error"
        });
      }
      // }



    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })
}

const GetUserAccounts = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      let userid = authData.user.id;

      if (typeof req.query.userid !== 'undefined') {
        userid = req.query.userid;
      }
      const user = await db.user.findByPk(userid);
      //console.log("Getting user details with access token ", user)

      // check if user has accounts in db
      let dbaccounts = await db.BankAccountModel.findAll({
        where: {
          UserId: userid
        }
      })
      if (dbaccounts && dbaccounts.length > 0) {
        let list = await UserBanksFullResource(dbaccounts)
        res.send({ message: "Accounts with balance from db", status: true, data: list });
      }
      else {
        try {

          const accounts = await GetAccountsListUtility(user);
          //console.log("Usre accounts list", accounts)
          const savedaccounts = []
          if (accounts) {
            // save the accounts
            for (let i = 0; i < accounts.length; i++) {
              let item = accounts[i];
              let data = {
                account_id: item.account_id,
                name: item.name,
                official_name: item.official_name,
                balance_available: item.balances.available,
                balance_current: item.balances.current,
                type: item.type,
                subtype: item.subtype,
                mask: item.mask,
                UserId: user.id
              }
              let account = await db.BankAccountModel.create(data);
              if (account) {
                savedaccounts.push(account)
                //console.log("Account created", savedaccounts.length)

              }
              else {
                //console.log("Account not created")
              }

            }
            let dbaccounts = await db.BankAccountModel.findAll({
              where: {
                UserId: userid
              }
            })
            //console.log("sending back response")
            let list = await UserBanksFullResource(dbaccounts)
            res.send({ message: "Accounts with balance from db plaid", status: true, data: list });

          }
          else {
            res.send({ status: false, message: "No accounts connected", data: null })
          }

        }
        catch (err) {
          //console.log(err)
          res.send({
            data: {
              error_type: err.error_type,
              error_code: err.error_code,
              error_message: err.error_message,
              display_message: err.display_message,
              documentation_url: err.documentation_url,
              request_id: err.request_id,
            }, status: false, message: "Token error"
          });
        }
      }



    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })
}


//Income related apis start here
const GetEmploymentDetails = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      let userid = authData.user.id;
      let user = await db.user.findOne({
        where: {
          id: userid
        }
      })
      if (typeof req.query.userid !== 'undefined') {
        userid = req.query.userid;
      }
      try {

        let dbPayrollIncome = await db.employmentDetailModel.findOne({
          where: {
            UserId: userid
          }
        })
        if (dbPayrollIncome) {
          let data = { UserId: dbPayrollIncome.UserId, id: dbPayrollIncome.id, data: JSON.parse(dbPayrollIncome.data), createdAt: dbPayrollIncome.createdAt, updatedAt: dbPayrollIncome.updatedAt }
          res.send({ status: true, message: "Employment Detail DB", data: data })
        }
        else {

          console.log("User token ", authData.user.plaid_user_token)

          //When we have access to the product then we will execute this.
          //Untill then it will be commented out
          // const response = await plaidClient.creditEmploymentGet({
          //     user_token: user.plaid_user_token,
          //     options: {
          //         count: 1,
          //       },
          // });
          // let data = response.data

          //Use this while we don't have access to income product
          let data = {
            "items": [
              {
                "item_id": "eVBnVMp7zdTJLkRNr33Rs6zr7KNJqBFL9DrE6",
                "employments": [
                  {
                    "account_id": "GeooLPBGDEunl54q7N3ZcyD5aLPLEai1nkzM9",
                    "status": "ACTIVE",
                    "start_date": "2020-01-01",
                    "end_date": null,
                    "employer": {
                      "name": "Plaid Inc"
                    },
                    "title": "Software Engineer",
                    "platform_ids": {
                      "employee_id": "1234567",
                      "position_id": "8888",
                      "payroll_id": "1234567"
                    },
                    "employee_type": "FULL_TIME",
                    "last_paystub_date": "2022-01-15"
                  }
                ]
              }
            ],
            "request_id": "LhQf0THi8SH1yJm"
          }

          let dbData = JSON.stringify(data)
          let deleted = await db.employmentDetailModel.destroy({
            where: {
              UserId: userid
            }
          })
          let saved = await db.employmentDetailModel.create({
            data: dbData,
            UserId: userid
          })
          let savedData = { UserId: saved.UserId, id: saved.id, data: JSON.parse(saved.data), createdAt: saved.createdAt, updatedAt: saved.updatedAt }
          res.send({ status: true, message: "Employment Detail", data: savedData })
        }


      } catch (error) {
        //console.log(error)
        res.send({ status: false, message: error, data: null })
      }


    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })
}

const GetBankIncome = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      let userid = authData.user.id;
      let user = await db.user.findOne({
        where: {
          id: userid
        }
      })
      if (typeof req.query.userid !== 'undefined') {
        userid = req.query.userid;
      }
      try {

        let dbPayrollIncome = await db.plaidBankIncomeModel.findOne({
          where: {
            UserId: userid
          }
        })
        if (dbPayrollIncome) {
          let data = { UserId: dbPayrollIncome.UserId, id: dbPayrollIncome.id, data: JSON.parse(dbPayrollIncome.data), createdAt: dbPayrollIncome.createdAt, updatedAt: dbPayrollIncome.updatedAt }
          res.send({ status: true, message: "Bank Income DB", data: data })
        }
        else {
          console.log("User token ", authData.user.plaid_user_token)

          //When we have access to the product then we will execute this.
          //Untill then it will be commented out
          // const response = await plaidClient.creditBankIncomeGet({
          //     user_token: user.plaid_user_token,
          //     options: {
          //         count: 1,
          //       },
          // });
          // let data = response.data

          //Use this while we don't have access to income product
          let data = {
            "request_id": "LhQf0THi8SH1yJm",
            "bank_income": [
              {
                "bank_income_id": "abc123",
                "generated_time": "2022-01-31T22:47:53Z",
                "days_requested": 90,
                "items": [
                  {
                    "last_updated_time": "2022-01-31T22:47:53Z",
                    "institution_id": "ins_0",
                    "institution_name": "Plaid Bank",
                    "item_id": "“eVBnVMp7zdTJLkRNr33Rs6zr7KNJqBFL9DrE6”",
                    "bank_income_accounts": [
                      {
                        "account_id": "“GeooLPBGDEunl54q7N3ZcyD5aLPLEai1nkzM9”",
                        "mask": "8888",
                        "name": "Plaid Checking Account",
                        "official_name": "Plaid Checking Account",
                        "type": "depository",
                        "subtype": "checking",
                        "owners": [
                          {
                            "addresses": [
                              {
                                "data": {
                                  "city": "Malakoff",
                                  "country": "US",
                                  "postal_code": "14236",
                                  "region": "NY",
                                  "street": "2992 Cameron Road"
                                },
                                "primary": true
                              },
                              {
                                "data": {
                                  "city": "San Matias",
                                  "country": "US",
                                  "postal_code": "93405-2255",
                                  "region": "CA",
                                  "street": "2493 Leisure Lane"
                                },
                                "primary": false
                              }
                            ],
                            "emails": [
                              {
                                "data": "accountholder0@example.com",
                                "primary": true,
                                "type": "primary"
                              },
                              {
                                "data": "accountholder1@example.com",
                                "primary": false,
                                "type": "secondary"
                              },
                              {
                                "data": "extraordinarily.long.email.username.123456@reallylonghostname.com",
                                "primary": false,
                                "type": "other"
                              }
                            ],
                            "names": [
                              "Alberta Bobbeth Charleson"
                            ],
                            "phone_numbers": [
                              {
                                "data": "1112223333",
                                "primary": false,
                                "type": "home"
                              },
                              {
                                "data": "1112224444",
                                "primary": false,
                                "type": "work"
                              },
                              {
                                "data": "1112225555",
                                "primary": false,
                                "type": "mobile"
                              }
                            ]
                          }
                        ]
                      }
                    ],
                    "bank_income_sources": [
                      {
                        "account_id": "GeooLPBGDEunl54q7N3ZcyD5aLPLEai1nkzM9",
                        "income_source_id": "“f17efbdd-caab-4278-8ece-963511cd3d51”",
                        "income_description": "“PLAID_INC_DIRECT_DEP_PPD”",
                        "income_category": "SALARY",
                        "start_date": "2021-11-15",
                        "end_date": "2022-01-15",
                        "pay_frequency": "MONTHLY",
                        "total_amount": 300,
                        "transaction_count": 1,
                        "historical_summary": [
                          {
                            "start_date": "2021-11-02",
                            "end_date": "2021-11-30",
                            "total_amount": 100,
                            "iso_currency_code": "USD",
                            "unofficial_currency_code": null,
                            "total_amounts": [
                              {
                                "amount": 100,
                                "iso_currency_code": "USD",
                                "unofficial_currency_code": null
                              }
                            ],
                            "transactions": [
                              {
                                "amount": -100,
                                "date": "2021-11-15",
                                "name": "“PLAID_INC_DIRECT_DEP_PPD”",
                                "original_description": "PLAID_INC_DIRECT_DEP_PPD 123",
                                "pending": false,
                                "transaction_id": "6RddrWNwE1uM63Ex5GKLhzlBl76aAZfgzlQNm",
                                "check_number": null,
                                "iso_currency_code": "USD",
                                "unofficial_currency_code": null
                              }
                            ]
                          },
                          {
                            "start_date": "2021-12-01",
                            "end_date": "2021-12-31",
                            "total_amount": 100,
                            "iso_currency_code": "USD",
                            "unofficial_currency_code": null,
                            "total_amounts": [
                              {
                                "amount": 100,
                                "iso_currency_code": "USD",
                                "unofficial_currency_code": null
                              }
                            ],
                            "transactions": [
                              {
                                "amount": -100,
                                "date": "2021-12-15",
                                "name": "“PLAID_INC_DIRECT_DEP_PPD”",
                                "original_description": "PLAID_INC_DIRECT_DEP_PPD 123",
                                "pending": false,
                                "transaction_id": "7BddrWNwE1uM63Ex5GKLhzlBl82aAZfgzlCBl",
                                "check_number": null,
                                "iso_currency_code": "USD",
                                "unofficial_currency_code": null
                              }
                            ]
                          },
                          {
                            "start_date": "2022-01-01",
                            "end_date": "2021-01-31",
                            "total_amount": 100,
                            "iso_currency_code": "USD",
                            "unofficial_currency_code": null,
                            "total_amounts": [
                              {
                                "amount": 100,
                                "iso_currency_code": "USD",
                                "unofficial_currency_code": null
                              }
                            ],
                            "transactions": [
                              {
                                "amount": -100,
                                "date": "2022-01-31",
                                "name": "“PLAID_INC_DIRECT_DEP_PPD”",
                                "original_description": "PLAID_INC_DIRECT_DEP_PPD 123",
                                "pending": false,
                                "transaction_id": "9FddrWNwE1uM95Ex5GKLhzlBl76aAZfgzlNQr",
                                "check_number": null,
                                "iso_currency_code": "USD",
                                "unofficial_currency_code": null
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ],
                "bank_income_summary": {
                  "total_amount": 300,
                  "iso_currency_code": "USD",
                  "unofficial_currency_code": null,
                  "total_amounts": [
                    {
                      "amount": 300,
                      "iso_currency_code": "USD",
                      "unofficial_currency_code": null
                    }
                  ],
                  "start_date": "2021-11-15",
                  "end_date": "2022-01-15",
                  "income_sources_count": 1,
                  "income_categories_count": 1,
                  "income_transactions_count": 1,
                  "historical_summary": [
                    {
                      "start_date": "2021-11-02",
                      "end_date": "2021-11-30",
                      "total_amount": 100,
                      "iso_currency_code": "USD",
                      "unofficial_currency_code": null,
                      "total_amounts": [
                        {
                          "amount": 100,
                          "iso_currency_code": "USD",
                          "unofficial_currency_code": null
                        }
                      ],
                      "transactions": [
                        {
                          "amount": -100,
                          "date": "2021-11-15",
                          "name": "“PLAID_INC_DIRECT_DEP_PPD”",
                          "original_description": "PLAID_INC_DIRECT_DEP_PPD 123",
                          "pending": false,
                          "transaction_id": "6RddrWNwE1uM63Ex5GKLhzlBl76aAZfgzlQNm",
                          "check_number": null,
                          "iso_currency_code": "USD",
                          "unofficial_currency_code": null
                        }
                      ]
                    },
                    {
                      "start_date": "2021-12-01",
                      "end_date": "2021-12-31",
                      "total_amount": 100,
                      "iso_currency_code": "USD",
                      "unofficial_currency_code": null,
                      "total_amounts": [
                        {
                          "amount": 100,
                          "iso_currency_code": "USD",
                          "unofficial_currency_code": null
                        }
                      ],
                      "transactions": [
                        {
                          "amount": -100,
                          "date": "2021-12-15",
                          "name": "“PLAID_INC_DIRECT_DEP_PPD”",
                          "original_description": "PLAID_INC_DIRECT_DEP_PPD 123",
                          "pending": false,
                          "transaction_id": "7BddrWNwE1uM63Ex5GKLhzlBl82aAZfgzlCBl",
                          "check_number": null,
                          "iso_currency_code": "USD",
                          "unofficial_currency_code": null
                        }
                      ]
                    },
                    {
                      "start_date": "2022-01-01",
                      "end_date": "2021-01-31",
                      "total_amount": 100,
                      "iso_currency_code": "USD",
                      "unofficial_currency_code": null,
                      "total_amounts": [
                        {
                          "amount": 100,
                          "iso_currency_code": "USD",
                          "unofficial_currency_code": null
                        }
                      ],
                      "transactions": [
                        {
                          "amount": -100,
                          "date": "2022-01-31",
                          "name": "“PLAID_INC_DIRECT_DEP_PPD”",
                          "original_description": "PLAID_INC_DIRECT_DEP_PPD 123",
                          "pending": false,
                          "transaction_id": "9FddrWNwE1uM95Ex5GKLhzlBl76aAZfgzlNQr",
                          "check_number": null,
                          "iso_currency_code": "USD",
                          "unofficial_currency_code": null
                        }
                      ]
                    }
                  ]
                },
                "warnings": []
              }
            ]
          }

          let dbData = JSON.stringify(data)
          let deleted = await db.plaidBankIncomeModel.destroy({
            where: {
              UserId: userid
            }
          })
          let saved = await db.plaidBankIncomeModel.create({
            data: dbData,
            UserId: userid
          })
          let savedData = { UserId: saved.UserId, id: saved.id, data: JSON.parse(saved.data), createdAt: saved.createdAt, updatedAt: saved.updatedAt }
          res.send({ status: true, message: "Bank Income", data: savedData })
        }


      } catch (error) {
        //console.log(error)
        res.send({ status: false, message: error, data: null })
      }


    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })
}


const GetPayrolIncome = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      let userid = authData.user.id;
      if (typeof req.query.userid !== 'undefined') {
        userid = req.query.userid;
      }
      try {

        let dbPayrollIncome = await db.payrollIncomeModel.findOne({
          where: {
            UserId: userid
          }
        })
        if (dbPayrollIncome) {
          let data = { UserId: dbPayrollIncome.UserId, id: dbPayrollIncome.id, data: JSON.parse(dbPayrollIncome.data), createdAt: dbPayrollIncome.createdAt, updatedAt: dbPayrollIncome.updatedAt }
          res.send({ status: true, message: "Payrol Income DB", data: data })
        }
        else {
          //comment the below data while testing. This we will uncomment when we have 
          //access to the income product
          // const response = await plaidClient.creditPayrollIncomeGet({
          //     user_token: authData.user.plaid_user_token,
          // });

          // let data = response.data


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
          let dbData = JSON.stringify(data)


          let deleted = await db.payrollIncomeModel.destroy({
            where: {
              UserId: userid
            }
          })
          let saved = await db.payrollIncomeModel.create({
            data: dbData,
            UserId: userid
          })
          let savedData = { UserId: saved.UserId, id: saved.id, data: JSON.parse(saved.data), createdAt: saved.createdAt, updatedAt: saved.updatedAt }
          res.send({ status: true, message: "Payrol Income", data: savedData })
        }


      } catch (error) {
        //console.log(error)
        res.send({ status: false, message: error, data: null })
      }


    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })
}
//Income related apis end here


//Liabilities Apis Start Here
const AddMortgages = async (mortgages, user) => {
  let liabilities = []
  for (let i = 0; i < mortgages.length; i++) {
    let item = mortgages[i];
    item.interest_rate = item.interest_rate.percentage;
    item.type = item.interest_rate.type;
    item.city = item.property_address.city;
    item.street = item.property_address.street;
    item.region = item.property_address.region;
    item.country = item.property_address.country;
    item.postal_code = item.property_address.postal_code;
    item.UserId = user.id;

    let mortgage = await db.MortgageLoanModel.create(item);
    if (mortgage) {
      liabilities.push(mortgage)
      //console.log("Mortgage created", liabilities.length)

    }
    else {
      //console.log("Mortgage not created")
    }

  }
  return liabilities
}

const AddStudentLoans = async (studentLoans, user) => {
  let liabilities = []
  for (let i = 0; i < studentLoans.length; i++) {
    let item = studentLoans[i];
    item.loan_status = item.loan_status.type;

    item.pslf_estimated_eligibility_date = item.pslf_status.estimated_eligibility_date;
    item.pslf_payments_made = item.pslf_status.payments_made;
    item.pslf_payments_remaining = item.pslf_status.payments_remaining;

    item.repayment_plan = item.repayment_plan.type;

    item.city = item.servicer_address.city;
    item.street = item.servicer_address.street;
    item.region = item.servicer_address.region;
    item.country = item.servicer_address.country;
    item.postal_code = item.servicer_address.postal_code;
    item.UserId = user.id;

    let mortgage = await db.StudentLoanModel.create(item);
    if (mortgage) {
      liabilities.push(mortgage)
      //console.log("Student Loan created", liabilities.length)

    }
    else {
      //console.log("StudentLoan not created")
    }

  }
  return liabilities
}

const GetLiabilities = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      let userid = authData.user.id;
      if (typeof req.query.userid !== 'undefined') {
        userid = req.query.userid;
      }
      const user = await db.user.findByPk(userid);
      //console.log("Getting user details with access token ", user)


      let liabilitiesdb = await db.MortgageLoanModel.findAll({
        where: {
          UserId: user.id
        }
      })

      let studentLoansdb = await db.StudentLoanModel.findAll({
        where: {
          UserId: user.id
        }
      })
      if ((liabilitiesdb && liabilitiesdb.length > 0) || (studentLoansdb && studentLoansdb.length > 0)) {
        //console.log("Liabilities from database")
        res.send({ status: true, message: error, data: { mortgages: liabilitiesdb, student_loans: studentLoansdb } })
      }
      else {
        let plaidToken = await db.PlaidTokens.findOne({
          where: {
            UserId: user.id,
            plaid_token_type: PlaidTokenTypes.TokenAuth
          }
        });
        if (plaidToken) {
          try {
            let response = await plaidClient.liabilitiesGet({
              access_token: plaidToken.plaid_access_token,
            });
            //console.log("Liabilities from plaid", response)
            // res.send({ status: false, message: error, data: response })
            // return
            response = response.data
            let liabilities = []
            if (response) {
              // save the accounts
              //console.log("Liabilities ", response.liabilities)
              let mortgages = await AddMortgages(response.liabilities.mortgage, user)
              let studentLoans = await AddStudentLoans(response.liabilities.student, user);
              // let mortgages = await db.MortgageLoanModel.findAll({
              //     where: {
              //         UserId: userid
              //     }
              // })
              //console.log("sending back response")
              user.liabilities_added = true;
              await user.save(); // set the liabilites list obtained
              // let list = await UserBanksFullResource(dbaccounts)
              res.send({ message: "Mortgages from db plaid", status: true, data: { mortgages: mortgages, student_loans: studentLoans } });

            }
            else {
              res.send({ status: false, message: "No Liabilities available", data: null })
            }




            // res.send({ status: true, message: "Liabilities", data: response.data })
          } catch (error) {
            //console.log("Error in catch", error)
            res.send({ status: false, message: error, data: null })
          }
        }
        else {
          res.send({ status: false, message: "Bank not connected", data: null })
        }
      }

    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })

}
//Liabilities Apis End Here

const GetIdentity = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      const user = authData.user;
      try {
        const response = await plaidClient.identityGet({
          access_token: user.plaid_access_token,
        });
        res.send({ status: true, message: "Identify", data: response.data })
      } catch (error) {
        res.send({ status: false, message: error, data: null })
      }
    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })

}


//Transfer
const CreateTransferAuthorizeRequest = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      const userid = authData.user.id;
      const user = await db.user.findByPk(userid)
      // Get the Auth Code from plaid user tokens table
      let plaidToken = await db.PlaidTokens.findOne({
        where: {
          UserId: userid,
          plaid_token_type: PlaidTokenTypes.TokenAuth
        }
      });
      //console.log(`Using ${plaidToken.plaid_access_token} for authorization ${req.body.amount}`)
      if (plaidToken) {
        //make the authorization request
        const request = {
          access_token: plaidToken.plaid_access_token,
          account_id: req.body.account_id,//'3gE5gnRzNyfXpBK5wEEKcymJ5albGVUqg77gr',
          type: req.body.charge_type, // credit or debit
          network: 'ach',
          amount: `${req.body.amount}`,
          ach_class: 'ppd',
          user: {
            legal_name: `${user.firstname} ${user.middlename} ${user.lastname}`,
          },
        };
        try {
          const response = await plaidClient.transferAuthorizationCreate(request);
          const authorizationId = response.data.authorization.id;
          res.send({ status: true, message: "Authorization", data: response.data })
        } catch (error) {
          // handle error
          //console.log(error)
          res.send({ status: false, message: error.message, data: null, errors: error })
        }
      }
      else {
        res.send({ status: false, message: "User not authorized to make transfers ", data: null })
      }


    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })
}

const CreateTransfer = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      const userid = authData.user.id;
      const user = await db.user.findByPk(userid)
      // Get the Auth Code from plaid user tokens table
      let plaidToken = await db.PlaidTokens.findOne({
        where: {
          UserId: userid,
          plaid_token_type: PlaidTokenTypes.TokenAuth
        }
      });
      //console.log(`Using ${plaidToken.plaid_access_token} for authorization ${req.body.amount}`)
      if (plaidToken) {
        try {
          const request = {
            access_token: plaidToken.plaid_access_token,
            account_id: req.body.account_id,
            description: 'payment',
            authorization_id: req.body.authorization_id,
          };
          try {
            const response = await plaidClient.transferCreate(request);
            const transfer = response.data.transfer;
            const request_id = response.data.request_id;
            let createdTransfer = await db.Transfer.create({
              request_id: request_id,
              UserId: userid,
              account_id: transfer.account_id,
              amount: transfer.amount,
              authorization_id: transfer.authorization_id,
              created: transfer.created,
              description: transfer.description,
              failure_reason: transfer.failure_reason,
              funding_account_id: transfer.funding_account_id,
              transfer_id: transfer.id,
              status: transfer.status,
              sweep_status: transfer.sweep_status,
              type: transfer.type,
              legal_name: transfer.user.legal_name,
              phone_number: transfer.user.phone_number,
              email_address: transfer.user.email_address,
            })
            res.send({ status: true, message: "Transfer in progress", data: response.data, transfer: createdTransfer });
          } catch (error) {
            // handle error
            //console.log(error)
            res.send({ status: false, message: error.message, data: null, errors: error })
          }
        } catch (error) {
          res.send({ status: false, message: error, data: null })
        }
      }
      else {
        res.send({ status: false, message: "User not authorized to make transfers ", data: null })
      }

    }
    else {
      res.send({ status: false, message: "Unauthenticated user", data: null })
    }
  })
}


const updateUserToken = async (userid, token) => {
  db.user.update({ plaid_user_token: token }, {
    where: {
      id: userid
    }
  }).then(data => {
    if (!data) {
      return false;
    }
    else {
      return true
    }
  })
    .catch(err => {
      //console.log("User Token not created : ", err)
      return false;
    });
}

const fetchOrCreateUserToken = async (userRecord) => {
  const userToken = userRecord.plaid_user_token;

  if (userToken == null || userToken === "") {
    // We're gonna need to generate one!
    const userId = userRecord.id;
    //console.log(`Got a user ID of ${userId}`);
    const response = await plaidClient.userCreate({
      client_user_id: `${userId}`,
    });
    //console.log(`New user token is  ${JSON.stringify(response.data)}`);
    const newUserToken = response.data.user_token;

    // We'll save this because this can only be done once per user
    const created = updateUserToken(userRecord.id, newUserToken);
    if (!created) {
      return false;
    }
    else {
      // This other user_id that gets returned is used by Plaid's webhooks to
      // identify a specific user. In a real application, you would use this to
      // know when it's safe to fetch income for a user who uploaded documents
      // to Plaid for processing.
      return newUserToken;
    }
  } else {
    return userToken;
  }
};






// JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
//     if (authData) {
//     }
//     else{
//         res.send({ status: false, message: "Unauthenticated user", data: null })
//     }
// })

// const accounts_response = await plaidClient.accountsGet({ access_token });
// const accounts = accounts_response.data.accounts;

// const response = await plaidClient.transactionsSync({
//     access_token
//   });
//   const transactions = response.data.transactions;
//   );

// Retrieve the transactions for a transactions user for the last thirty days (using the older method):
// const now = moment();
// const today = now.format('YYYY-MM-DD');
// const thirtyDaysAgo = now.subtract(30, 'days').format('YYYY-MM-DD');

// const response = await plaidClient.transactionsGet({
//   access_token,
//   start_date: thirtyDaysAgo,
//   end_date: today,
// });
// const transactions = response.data.transactions;
// //console.log(
//   `You have ${transactions.length} transactions from the last thirty days.`,
// );

export {
  CreateLinkToken, ExchangePublicToken, GetPayrolIncome, GetLiabilities, fetchOrCreateUserToken, GetUserBalance,
  CreateTransferAuthorizeRequest, CreateTransfer, GetAccountsListUtility, GetTransferAuthorization, MakeTransferUtility, GetIdentity,
  GetBalancesListUtility, GetUserAccounts, GetBankIncome, GetEmploymentDetails
}