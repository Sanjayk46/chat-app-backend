const jwt = require('jsonwebtoken')
const {userModel} = require('../model/userModel')

const auth = async(req,res,next)=>{
    try {
        let token = req.headers.authorization.split(' ')[0];
        if (token.length < 500) {
            const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
            const rootUser = await userModel
              .findOne({ _id: verifiedUser.id })
              .select('-password');
            req.token = token;
            req.rootUser = rootUser;
            req.rootUserId = rootUser._id;
          } else {
            let data = jwt.decode(token);
            req.rootUserEmail = data.email;
            const googleUser = await userModel
              .findOne({ email: req.rootUserEmail })
              .select('-password');
            req.rootUser = googleUser;
            req.token = token;
            req.rootUserId = googleUser._id;
          }
          next();
}catch(error){
    res.status(500).send({
        message:"internal server error",
        error:error.message
      })
}
}

module.exports = auth;