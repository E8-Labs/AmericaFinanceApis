import db from "../../models/index.js";
import UserProfileFullResource from "../user/userprofilefullresource.js";
// import PlaidTokenTypes from "../../models/plaidtokentypes.js";

const HouseFullResource = async (loan, currentUser = null) =>{
    if(!Array.isArray(loan)){
        console.log("Not array")
        return await getHouseData(loan, currentUser);
    }
    else{
        console.log("Is array")
        const data = []
        for (let i = 0; i < loan.length; i++) { 
            const p = await getHouseData(loan[i], currentUser)
            // console.log("Adding to index " + i)
            data.push(p);
          }

        return data;
    }
}

async function  getHouseData(loan, currentUser = null) {
    
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
        ownership_status: loan.ownership_status	,
        onwership_status_other: loan.onwership_status_other,
        rent_paid: loan.rent_paid,
        min_living_year: loan.min_living_year,
        max_living_year: loan.max_living_year,
        address: loan.address,
        zipcode: loan.zipcode,
        from_year: loan.from_year,
        to_year: loan.to_year,
        landlord_name: loan.landlord_name,
        contact_number: loan.contact_number,
        state: user ? user.state: '',
        user: u
    }


    return LoanResource;
}

export default HouseFullResource;