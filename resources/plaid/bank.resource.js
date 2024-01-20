import db from "../../models/index.js";
import UserProfileFullResource from "../user/userprofilefullresource.js";

const UserBanksFullResource = async (loan, currentUser = null) =>{
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
    
   
    let data = loan
    const user = await db.user.findOne({where:{
        id: loan.UserId
    }})
    // let calc = Calculations(loan, user)
    const u = await UserProfileFullResource(user);
    data.user = u;
    let debt = {
        id: loan.id,
        account_id: loan.account_id,
        balances: {
            available: loan.balance_available,
            current: loan.balance_current
        },
        mask: loan.mask,
        name: loan.name,
        official_name: loan.official_name,
        type: loan.type,
        subtype: loan.subtype,
        user: u,
        createdAt: loan.createdAt,
        updatedAt: loan.updatedAt
    }
//console.log("Returning data in Bank Resource is ", debt)

    return debt;
}


export default UserBanksFullResource;