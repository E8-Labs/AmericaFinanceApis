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
            let products = ['auth', 'assets', 'identity', 'liabilities', 'transactions', 'transfer', 'identity'];
            let income_verification_object = null;
            if (tokenType == PlaidTokenTypes.TokenIdentityVerification) {
                products = ['identity_verification'];
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
                    income_verification: income_verification_object

                },
                user_token: user.plaid_user_token,
                client_name: 'America Finance',
                products: products,//['auth', 'assets', 'identity', 'liabilities', 'transactions', 'transfer', 'identity'],//, 'income_verification'
                // products: ['income_verification'],
                // products: ['identity_verification'],
                android_package_name: "com.americafinance",
                language: 'en',
                // webhook: 'https://webhook.example.com',
                // redirect_uri: 'https://cdn-testing.plaid.com/link/v2/stable/sandbox-oauth-a2a-react-native-redirect.html',
                country_codes: ['US'],
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
            //console.log("Exchanging token for user " + userid)
            try {
                const exchangeResponse = await plaidClient.itemPublicTokenExchange({
                    public_token: req.body.public_token,
                });
                let tokenType = req.body.token_type;//PlaidTokenTypes.TokenAuth;

                let access_token = exchangeResponse.data.access_token;
                let user = authData.user;
                user.plaid_access_token = access_token;
                const tokenAdded = db.PlaidTokens.create({
                    plaid_access_token: access_token, plaid_token_type: tokenType,
                    UserId: userid
                })
                    .then(data => {
                        if (!data) {
                            res.send({
                                message: `Cannot update User with id=${userid}. Maybe User was not found!`, status: false, data: null
                            });
                        }
                        else {
                            res.send({ message: "Access Token Exchanged", status: true, data: null });
                        }
                    })
                    .catch(err => {
                        //console.log(err)
                        res.send({
                            message: "Error updating User with id=" + userid, status: false, data: null, error: err
                        });
                    });
            }
            catch (error) {
                //console.log(error)
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


const GetPayrolIncome = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let userid = authData.user.id;
            if (typeof req.query.userid !== 'undefined') {
                userid = req.query.userid;
            }
            try {
                const response = await plaidClient.creditPayrollIncomeGet({
                    user_token: authData.user.plaid_user_token,
                });
                res.send({ status: true, message: "Payrol Income", data: response.data })
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
                res.send({ status: false, message: error, data: { mortgages: liabilitiesdb, student_loans: studentLoansdb } })
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
    GetBalancesListUtility, GetUserAccounts
}