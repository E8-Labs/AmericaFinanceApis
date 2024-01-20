import db from "../../models/index.js";
import UserProfileFullResource from "../user/userprofilefullresource.js";
import { addDays, currentDate, dateToString } from "../../config/utility.js";
// import PlaidTokenTypes from "../../models/plaidtokentypes.js";

const UserDebtFullResource = async (loan, currentUser = null) =>{
    if(!Array.isArray(loan)){
        //console.log("Not array")
        return await getUserLoanData(loan, currentUser);
    }
    else{
        //console.log("Is array")
        const data = []
        for (let i = 0; i < loan.length; i++) { 
            const p = await getUserLoanData(loan[i], currentUser)
            // //console.log("Adding to index " + i)
            data.push(p);
          }

        return data;
    }
}

async function  getUserLoanData(loan, currentUser = null) {
    
    //console.log("Making resource of loan " + loan.id)
    // const followers = await db.following.count({
    //     where: {
    //       followed: user.id
    //     }
    //   });
    // let token = await db.PlaidTokens.findOne({where: {
    //     UserId: user.id,
    //     plaid_token_type: PlaidTokenTypes.TokenAuth
    // }});
   
    let data = loan
    const user = await db.user.findOne({where:{
        id: loan.UserId
    }})
    // let calc = Calculations(loan, user)
    const u = await UserProfileFullResource(user);
    data.user = u;
    let debt = {
        id: loan.id,
        debt_type: loan.debt_type,
        monthly_debt_obligation: loan.monthly_debt_obligation,
        active_pay_day_loan: loan.active_pay_day_loan,
        active_duty_force: loan.active_duty_force,
        bankruptcy_min_year: loan.bankruptcy_min_year,
        bankruptcy_max_year: loan.bankruptcy_max_year,
        outstanding_debt_type: loan.outstanding_debt_type,
        lender_name: loan.lender_name,
        account_number: loan.account_number,
        monthly_payment: loan.monthly_payment,
        due_date: loan.due_date,
        total_balance_amount: loan.total_balance_amount,
        user: u,
    }
//console.log("Returning data in debt is ", debt)

    return debt;
}


export default UserDebtFullResource;