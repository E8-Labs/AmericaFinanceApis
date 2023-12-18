const db = require("../../models");

module.exports = async (user, currentUser = null) =>{
    if(!Array.isArray(user)){
        console.log("Not array")
        return await getUserData(user, currentUser);
    }
    else{
        console.log("Is array")
        const data = []
        for (let i = 0; i < user.length; i++) { 
            const p = await getUserData(user[i], currentUser)
            console.log("Adding to index " + i)
            data.push(p);
          }

        return data;
    }
}

async function  getUserData(user, currentUser = null) {
    
    console.log("Making resource of " + user.name)
    // const followers = await db.following.count({
    //     where: {
    //       followed: user.id
    //     }
    //   });

   
    const UserFullResource = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        middlename: user.middlename,
        profile_image: user.profile_image,
        email: user.email,

    }


    return UserFullResource;
}