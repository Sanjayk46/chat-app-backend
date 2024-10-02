const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const nodemailer = require('nodemailer');
const bcrypt =require ('bcryptjs');
const cloudinary = require('./cloudinaryConfig');
const PASSWORD_HASH_SALT_ROUNDS=10
const registerUser = asyncHandler(async (req,res) =>{
   const {firstName,lastName, email, password, pic} = req.body;

   if(!firstName||!lastName || !email || !password){
      res.status(400);
      throw new Error('Please enter all the fields');
   }

   const userExists = await User.findOne({email});

   if(userExists){
      res.status(400);
      throw new Error('User already exists');
   }

   const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      pic
   });

   if(user){
      res.status(201).json({
         _id: user._id,
         name: user.name,
         email: user.email,
         pic:user.pic,
         token: generateToken(user._id)
      })

   }else{
      res.status(400);
      throw new Error('User not found');
   }
});

const authUser = asyncHandler(async (req, res) =>{
   const {email, password} = req.body;

   const user = await User.findOne({email});

   if(user && (await user.matchPassword(password))){
      res.json({
         _id: user._id,
         name: user.name,
         email: user.email,
         pic:user.pic,
         token: generateToken(user._id)
      })
   }else{
      res.status(400);
      throw new Error('Invalid email or password');
   }
})

// .api/user
const allUsers = asyncHandler(async (req,res)=>{
   const keyword = req.query.search ? {
      $or:[
        {name:{$regex: req.query.search, $options:"i"}},
        {email:{$regex: req.query.search, $options:"i"}}
      ]
   }:{

   }
   const users = await User.find(keyword).find({_id:{$ne:req.user._id}});
   res.send(users);
})

const updateProfile = asyncHandler(async(req,res)=>{
   const { name,email,address } = req.body;
   const user = await User.findByIdAndUpdate(
     req.user.id,
     { firstName, lastName, address },
     { new: true }
   )
});

//forgot password

const forgotPassword = asyncHandler(async(req,res)=>{
   const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const generateOTP = () => {
      const characters = "0123456789";
      return Array.from(
        { length: 6 },
        () => characters[Math.floor(Math.random() * characters.length)]
      ).join("");
    };

    const OTP = generateOTP();
    user.resetPasswordOtp = OTP;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_MAILER,
        pass: process.env.USER_PASS,
      },
    });
    //${user.firstName} ${user.lastName},
    const mailOptions = {
      from: "noreplychatapp2024@gmail.com",
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>We received a request to reset your password. Here is your One-Time Password (OTP): <strong>${OTP}</strong></p>
        <p>Please click the following link to reset your password:</p>
        <a href="http://localhost:3000/reset-password">Reset Password</a>
        <p>If you did not make this request, please ignore this email.</p>
        <p>Thank you,</p>
        <p>From Validation</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
})

const resetPassword = asyncHandler(async(req,res)=>{
   try {
      const { OTP, password } = req.body;
  
      const user = await User.findOne({
        resetPasswordOtp: OTP,
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      if (!user) {
        const message = user ? "OTP has expired" : "Invalid OTP";
        return res.status(404).json({ message });
      }
      const expirationTime = Date.now() + (5 * 60 * 1000); // 5 minutes in milliseconds
        
      // Update the user's resetPasswordExpires field with the new expiration time
      user.resetPasswordExpires = expirationTime;
      const hashedPassword = await bcrypt.hash(
        password,
        PASSWORD_HASH_SALT_ROUNDS
      );
      user.password = hashedPassword;
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
  
      await user.save();
  
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
})
const validUser = async (req, res,next) => {
  try {
    const validuser = await User.findById(req.user.id)
    if (!validuser) {
      return res.json({ message: 'user is not valid' });  // Add a return statement to stop execution
    }
    
    res.status(201).json({
      user: validuser,
      token: req.token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });  // Include error message
    console.log(error);
  }
};
const updateUserProfile = async(req,res,next)=>{
  let {firstName,lastName,profilePic} = req.body
    const user = await User.findByIdAndUpdate(req.user.id,
      {firstName,lastName,profilePic},
      {new:true},
    );
    res.status(200).send({
      message:"user detdails updated",
      user
    });
}





module.exports = {registerUser, authUser, allUsers,updateProfile,forgotPassword,resetPassword,validUser,updateUserProfile}
