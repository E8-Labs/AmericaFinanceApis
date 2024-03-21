import db from "../../models/index.js";
import LoanStatus from "../../models/loanstatus.js";
import PlaidTokenTypes from "../../models/plaidtokentypes.js";
import UserLoanFullResource from "../loan/loan.resource.js";
const Op = db.Sequelize.Op;

const UserProfileFullResource = async (user, currentUser = null) =>{
    if(!Array.isArray(user)){
        //console.log("Not array")
        return await getUserData(user, currentUser);
    }
    else{
        //console.log("Is array")
        const data = []
        for (let i = 0; i < user.length; i++) { 
            const p = await getUserData(user[i], currentUser)
            //console.log("Adding to index " + i)
            data.push(p);
          }

        return data;
    }
}

async function  getUserData(user, currentUser = null) {
    
    //console.log("Making resource of " + user.name)
    // const followers = await db.following.count({
    //     where: {
    //       followed: user.id
    //     }
    //   });
    let token = await db.PlaidTokens.findOne({where: {
        UserId: user.id,
        plaid_token_type: PlaidTokenTypes.TokenAuth
    }});

    let houses = await db.HouseModel.findOne({where: {
        UserId: user.id,
    }});

    
    let currentAciveLoan = await db.LoanModel.findOne({where: {
        loan_status:{
            [Op.or]: [LoanStatus.StatusApproved, LoanStatus.StatusPending]
        },
        UserId: user.id
    }})
    let loanRes = null
    if(currentAciveLoan){
        loanRes = await UserLoanFullResource(currentAciveLoan)
    }
   

    let verData = await db.userVerificationModel.findOne({
        where: {
            UserId: user.id
        }
    })
    let identity_connected = 'pending'
    if(verData){
        if(verData.kyc_check_status === 'success' && verData.documentary_verification_status === 'success' && verData.risk_check_status === 'success'){
            identity_connected = "success"
        }
        else if(verData.kyc_check_status === 'failed' || verData.documentary_verification_status === 'failed' || verData.risk_check_status === 'failed'){
            identity_connected = "failed"
        }
    }

    let paymentSourceAdded = false;
    let banks = await db.UserPaymentSourceModel.findAll({
        where: {
            UserId: user.id
        }
    })
    if(banks && banks.length > 0){
        paymentSourceAdded = true;
    }
    
    const UserFullResource = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        middlename: user.middlename,
        profile_image: user.profile_image,
        email: user.email,
        bank_connected: token ? true : false,
        houses_connected: houses ? true : false,
        identity_connected: identity_connected,
        liabilities_added: user.liabilities_added,
        state: user.state,
        role: user.role,
        tier: user.tier,
        bankruptcy_status: user.bankruptcy_status,
        active_payday_loan: user.active_payday_loan,
        active_loan: loanRes,
        active_duty_manual: user.active_duty_manual,
        identity_data: verData,
        payment_source_added: paymentSourceAdded,

    }


    return UserFullResource;
}

export default UserProfileFullResource;