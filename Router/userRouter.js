const express = require("express");
const router = express.Router();
const {userModel} = require("../model/userModel");
const handler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const {OAuth2Client} = require('google-auth-library');
const auth = require('../middleware/user');

router.post('/register',handler(async(req,res)=>{
    const{firstName,lastName,email,password}= req.body;
    try{
    const user = await userModel.findOne({email})
    if(user){
        res.status(200).send({
            message:"user is already exist"
        })
    }else{
        const fullName = firstName + ' ' +lastName
        const newuser =new userModel({email, password, name: fullName});
        const token =newuser.generateAuthToken(newuser);
        await newuser.save();
        res.status(200).send({ 
            message: ' user register successfully',
            token: token
        });
  }
 } catch (error) {
    console.log('Error in register ' + error);
    res.status(500).send({
        message:"Internal Server error",
        error:error.message
    });
  }
    }
))

router.post('/login', handler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const valid = await userModel.findOne({ email }); // Make sure to use the correct model reference
    if (!valid) {
      return res.status(200).json({ message: 'User does not exist' });
    }

    const validPassword = await bcrypt.compare(password, valid.password);
    if (!validPassword) {
      return res.status(200).json({ message: 'Invalid Credentials' });
    } else {
      const token = await valid.generateAuthToken();
      await valid.save();
      res.cookie('userToken', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      return res.status(200).json({ 
        message:"user login successful",
        token: token});
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}));

router.get('/valid',auth,handler(async(req,res)=>{
  try {
    const validuser = await userModel
      .findOne({ _id: req.rootUserId })
      .select('-password');
    if (!validuser) res.json({ message: 'user is not valid' });
    res.status(201).json({
      user: validuser,
      token: req.token,
    });
  } catch (error) {
    res.status(500).json({ error: error });
    console.log(error);
  }
}))

router.post('/google/auth',handler(async(req,res)=>{
  try {
    const { tokenId } = req.body;
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.CLIENT_ID,
    });
    const { email_verified, email, name, picture } = verify.payload;
    if (!email_verified) res.json({ message: 'Email Not Verified' });
    const userExist = await userModel.findOne({ email }).select('-password');
    if (userExist) {
      res.cookie('userToken', tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ token: tokenId, user: userExist });
    } else {
      const password = email + process.env.CLIENT_ID;
      const newUser = await user({
        name: name,
        profilePic: picture,
        password,
        email,
      });
      await newUser.save();
      res.cookie('userToken', tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res
        .status(200)
        .json({ message: 'User registered Successfully', token: tokenId });
    }
  } catch (error) {
    res.status(500).json({ error: error });
    console.log('error in googleAuth backend' + error);
  }
}))

router.post('/logout',auth,handler(async(req,res)=>{
  req.rootUser.tokens = req.rootUser.tokens.filter((e) => e.token != req.token);
}));

router.put('/update/:id',auth,handler(async(req,res)=>{
  const { id } = req.params;
  const { bio, name } = req.body;
  const updatedUser = await userModel.findByIdAndUpdate(id, { name, bio });
  return updatedUser;
}))
router.post('/:id',auth,handler(async(req,res)=>{
  const { id } = req.params;
  try {
    const selectedUser = await userModel.findOne({ _id: id }).select('-password');
    res.status(200).send({
      message:"success",
      selectedUser});
  } catch (error) {
    res.status(500).send({
      message:"internal sever error", 
      error: error.message });
  }
}));
router.post('/serach?',auth,handler(async(req,res)=>{
  const search = req.query.search
  ? {
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ],
    }
  : {};

const users = await userModel.find(search).find({ _id: { $ne: req.rootUserId } });
res.status(200).send(users);
}))
module.exports = router;