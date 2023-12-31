import db from "../../models/index.js";
import UserProfileFullResource from "../user/userprofilefullresource.js";
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
    const u = await UserProfileFullResource(user);
    const LoanResource = {
        id: loan.id,
        amount_requested: loan.amount_requested,
        loan_status: loan.loan_status,
        created_at: loan.created_at,
        state: user ? user.state: '',
        user: u
    }


    return LoanResource;
}

export default UserLoanFullResource;