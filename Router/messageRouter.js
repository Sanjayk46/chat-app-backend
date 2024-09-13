const {userModel} = require('../model/userModel');
const {chatModel} = require('../model/chatModel');
const {messageModel} = require('../model/messageModel');
const express = require("express");
const router = express.Router();
const handler = require('express-async-handler');
const auth = require('../middleware/user');
router.post('/send',auth,handler(async(req,res)=>{
    const { chatId, message } = req.body;
    try {
      let msg = await messageModel.create({ sender: req.rootUserId, message, chatId });
      msg = await (
        await msg.populate('sender', 'name profilePic email')
      ).populate({
        path: 'chatId',
        select: 'chatName isGroup users',
        model: 'Chat',
        populate: {
          path: 'userModel',
          select: 'name email profilePic',
          model: 'User',
        },
      });
      await chatModel.findByIdAndUpdate(chatId, {
        latestMessage: msg,
      });
      res.status(200).send(msg);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
}))

router.get('/:chatId',auth,handler(async(req,res)=>{
    const { chatId } = req.params;
  try {
    let messages = await messageModel.find({ chatId })
      .populate({
        path: 'sender',
        model: 'User',
        select: 'name profilePic email',
      })
      .populate({
        path: 'chatId',
        model: 'Chat',
      });

    res.status(200).json(messages);
  } catch (error) {
    res.sendStatus(500).json({ error: error });
    console.log(error);
  }
}))

module.exports = router;