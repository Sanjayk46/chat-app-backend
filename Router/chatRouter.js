const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { accessChat, fetchChat, createGroup, renameGroup, addToGroup, removeFromGroup,accessGroupChat,leaveGroupChat } = require("../contorllers/chatControllers");

const router = express.Router();

router.route('/').post(protect,accessChat);
router.route('/').get(protect,fetchChat);
router.route('/group').post(protect,createGroup);
router.route('/rename').put(protect,renameGroup);
router.route('/groupadd').put(protect,addToGroup);
router.route('/groupremove').put(protect,removeFromGroup);
router.route('/group/:chatId').get(protect,accessGroupChat)
router.route('/group/leave').get(protect,leaveGroupChat);
module.exports = router;