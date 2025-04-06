const User = require("../../models/userSchema");



// const customerInfo = async (req,res)=>{
//     try {
       
//         //for  implementing search button
//         let search ="";
//         if(req.query.search){
//             search = req.query.search;
//         }

//         //pagination from backend
//         let page =1;
//         if(req.query.page){
//             page = req.query.page
//         }
//         const limit = 3
//         const userData = await User.find({
//             isAdmin:false,  //display all user with admin is false
//             //search using email and name that why using the array two consdition
//             $or:[

//                 {name:{$regex:".*"+search+".*"}},
//                 {email:{$regex:".*"+search+".*"}},
//             ],
//         })
//             .limit(limit*1)
//             .skip((page-1)*limit)
//             .exec();
       
//             const count = await User.find({
//                 isAdmin:false,  //display all user with admin is false
//                 //search using email and name that why using the array two consdition
//                 $or:[
    
//                     {name:{$regex:".*"+search+".*"}},
//                     {email:{$regex:".*"+search+".*"}},
//                 ],
                
//             }).countDocuments();
           
//             res.render('customers')
            

//     } catch (error) {
        
//     }
// }



// module.exports = {
//     customerInfo,
// }
const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isBlocked = !user.isBlocked; // Toggle status
        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


//search bar

const getUsers = async (req, res) => {
    try {
        const searchQuery = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const skip = (page - 1) * limit;

        const query = searchQuery
            ? {
                  $or: [
                      { name: { $regex: searchQuery, $options: "i" } },
                      { email: { $regex: searchQuery, $options: "i" } }
                  ]
              }
            : {};

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        const users = await User.find(query)
            .sort({ createdAt: -1 }) // Latest first
            .skip(skip)
            .limit(limit);

        res.render("customers", {
            users,
            currentPage: page,
            totalPages,
            searchQuery
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Server error");
    }
};


const toggleBlockUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ success: true, message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully` });
    } catch (err) {
        console.error("Error toggling user block status:", err);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};


module.exports = {
    toggleUserStatus,
    getUsers,
    toggleBlockUser,
};