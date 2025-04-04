const Users = require("../../models/userSchema");



const customerInfo = async (req,res)=>{
    try {
       
        //for  implementing search button
        let search ="";
        if(req.query.search){
            search = req.query.search;
        }

        //pagination from backend
        let page =1;
        if(req.query.page){
            page = req.query.page
        }
        const limit = 3
        const userData = await User.find({
            isAdmin:false,  //display all user with admin is false
            //search using email and name that why using the array two consdition
            $or:[

                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}},
            ],
        })
            .limit(limit*1)
            .skip((page-1)*limit)
            .exec();
       
            const count = await User.find({
                isAdmin:false,  //display all user with admin is false
                //search using email and name that why using the array two consdition
                $or:[
    
                    {name:{$regex:".*"+search+".*"}},
                    {email:{$regex:".*"+search+".*"}},
                ],
                
            }).countDocuments();
           
            res.render('customers')
            

    } catch (error) {
        
    }
}



module.exports = {
    customerInfo,
}