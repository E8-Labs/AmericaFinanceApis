import db from "../../models/index.js";
import UserProfileFullResource from "../user/userprofilefullresource.js";
import { addDays, currentDate, dateToString } from "../../config/utility.js";
// import PlaidTokenTypes from "../../models/plaidtokentypes.js";

const UserLoanFullResource = async (loan, currentUser = null) =>{
    if(!Array.isArray(loan)){
        console.log("Not array")
        return await getUserLoanData(loan, currentUser);
    }
    else{
        console.log("Is array")
        const data = []
        for (let i = 0; i < loan.length; i++) { 
            const p = await getUserLoanData(loan[i], currentUser)
            // console.log("Adding to index " + i)
            data.push(p);
          }

        return data;
    }
}

async function  getUserLoanData(loan, currentUser = null) {
    
    console.log("Making resource of loan " + loan.id)
    // const followers = await db.following.count({
    //     where: {
    //       followed: user.id
    //     }
    //   });
    // let token = await db.PlaidTokens.findOne({where: {
    //     UserId: user.id,
    //     plaid_token_type: PlaidTokenTypes.TokenAuth
    // }});
   

    const user = await db.user.findOne({where:{
        id: loan.UserId
    }})
    let calc = Calculations(loan, user)
    const u = await UserProfileFullResource(user);
    const LoanResource = {
        id: loan.id,
        amount_requested: loan.amount_requested,
        loan_status: loan.loan_status,
        created_at: loan.created_at,
        state: user ? user.state: '',
        user: u,
        calculations: calc,
    }


    return LoanResource;
}


//considering the starting date today, 
 const Calculations = (loan, user) => {

    let loanTerm = 14; //days
    var today = currentDate()
                var loan_due_date = addDays(today, 14)

                var todayString = dateToString(today)
                var loan_due_date_string = dateToString(loan_due_date)


                let amount = loan.amount_requested;
                console.log("Loan amount is ", amount);
                console.log("User state is ", user.state);
                let financeFee = 17.5; // percent for AL and MS
                if (user.state == "CA" || user.state == "California") {
                    financeFee = 15.0; // percent
                }

                let financeFeeAmount = financeFee * amount / 100;

                let apr = (financeFeeAmount / amount) / loanTerm * 365 * 100;

                let data = {
                    apr: apr, principal_amount: amount, finance_fee: financeFeeAmount,
                    finance_fee_percentage: financeFee, duration: loanTerm,
                    total_due: amount + financeFeeAmount,
                    current_date: todayString, estimated_due_date: loan_due_date_string
                }
                return data;
}

export default UserLoanFullResource;