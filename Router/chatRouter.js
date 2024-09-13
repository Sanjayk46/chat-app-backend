const express = require("express");
const router = express.Router();
const handler = require('express-async-handler');
const {chatModel} = require('../model/chatModel');
const {userModel} = require('../model/userModel');
const auth = require('../middleware/user')
router.post('/accessChats ',auth,handler(async(req,res)=>{
    const { userId } = req.body;
  if (!userId) res.send({ message: "Provide User's Id" });
  let chatExists = await chatModel.find({
    isGroup: false,
    $and: [
      { users: { $elemMatch: { $eq: userId } } },
      { users: { $elemMatch: { $eq: req.rootUserId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');
  chatExists = await userModel.populate(chatExists, {
    path: 'latestMessage.sender',
    select: 'name email profilePic',
  });
  if (chatExists.length > 0) {
    res.status(200).send(chatExists[0]);
  } else {
    let data = {
      chatName: 'sender',
      users: [userId, req.rootUserId],
      isGroup: false,
    };
    try {
      const newChat = await chatModel.create(data);
      const chat = await chatModel.find({ _id: newChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(chat);
    } catch (error) {
      res.status(500).send(error);
    }
  }
}))

//fetch all the chats
router.get('/fetch',auth,handler(async(req,res)=>{
  try {
    const chats = await chatModel.find({
      users: { $elemMatch: { $eq: req.rootUserId } },
    })
      .populate('users')
      .populate('latestMessage')
      .populate('groupAdmin')
      .sort({ updatedAt: -1 });
    const finalChats = await userModel.populate(chats, {
      path: 'latestMessage.sender',
      select: 'name email profilePic',
    });
    res.status(200).json(finalChats);
  } catch (error) {
    res.status(500).send({
      message:"internal server error",
      error:error.message
    });
  }
}))

//create group
router.patch('/group',auth,handler(async(req,res)=>{
  const { chatName, users } = req.body;
  if (!chatName || !users) {
    res.status(400).json({ message: 'Please fill the fields' });
  }
  const parsedUsers = JSON.parse(users);
  if (parsedUsers.length < 2)
    res.send(400).send('Group should contain more than 2 users');
  parsedUsers.push(req.rootUser);
  try {
    const chat = await chatModel.create({
      chatName: chatName,
      users: parsedUsers,
      isGroup: true,
      groupAdmin: req.rootUserId,
    });
    const createdChat = await chatModel.findOne({ _id: chat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    res.status(200).send({
      message:"group created successfully",
      createdChat});
  } catch (error) {
    res.status(500).send({
      message:"internal server error",
      error:error.message
    });
  }
}))
//rename group
router.patch('/group/rename',auth,handler(async(req,res)=>{
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName)
    res.status(400).send('Provide Chat id and Chat name');
  try {
    const chat = await chatModel.findByIdAndUpdate(chatId, {
      $set: { chatName },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    if (!chat) res.status(404);
    res.status(200).send(chat);
  } catch (error) {
    res.status(500).send({
      message:"internal server error",
      error:error.message
    });
  }
}))

//add group

router.patch('/groupAdd',auth,handler(async(req,res)=>{
  const { userId, chatId } = req.body;
  const existing = await chatModel.findOne({ _id: chatId });
try{
  if (!existing.users.includes(userId)) {
    const chat = await chatModel.findByIdAndUpdate(chatId, {
      $push: { users: userId },
    })
      .populate('groupAdmin', '-password')
      .populate('users', '-password');
    if (!chat) res.status(404);
    res.status(200).send(chat);
  } else {
    res.status(200).send('user already exists');
  }
}catch(error){
  res.status(500).send({
    message:"internal server error",
    error:error.message
  })
}
}))

//remove user from group
router.delete('/removeuser',auth,handler(async(req,res)=>{
  const { userId, chatId } = req.body;
  const existing = await chatModel.findOne({ _id: chatId });
  try{
    if (existing.users.includes(userId)) {
      Chat.findByIdAndUpdate(chatId, {
        $pull: { users: userId },
      })
        .populate('groupAdmin', '-password')
        .populate('users', '-password')
        .then((e) => res.status(200).send(e))
        .catch((e) => res.status(404));
    } else {
      res.status(200).send('user doesnt exists');
    }
  }catch(error){
    res.status(500).send({
      message:"internal server error",
      error:error.message
    })
  }
 
}))
module.exports =router;
