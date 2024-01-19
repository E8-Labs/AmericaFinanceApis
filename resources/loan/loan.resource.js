import db from "../../models/index.js";
import UserProfileFullResource from "../user/userprofilefullresource.js";
import { addDays, currentDate, dateToString } from "../../config/utility.js";
import { GetLoanCalculationsObject } from "../../controllers/loan.controller.js";
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
    let calc = await Calculations(loan, user)
    let dueDates = await db.UserLoanDueDateModel.findAll({
        where: {
            LoanModelId: loan.id
        }
    })
    const u = await UserProfileFullResource(user);
    const LoanResource = {
        id: loan.id,
        amount_requested: loan.amount_requested,
        loan_status: loan.loan_status,
        created_at: loan.created_at,
        state: user ? user.state: '',
        user: u,
        calculations: calc,
        due_dates: dueDates
    }


    return LoanResource;
}


//considering the starting date today, 
 const Calculations = async (loan, user) => {
    
    let d = await GetLoanCalculationsObject(loan.amount_requested, user);
    console.log("Calculating loan calcs ", d)
    return d
}

export default UserLoanFullResource;