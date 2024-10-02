const express = require('express');
const { registerUser, authUser, allUsers,forgotPassword,resetPassword,validUser,updateUserProfile } = require('../contorllers/userControllers');
const { protect } = require('../middleware/authMiddleware');
const Imgurl =require('../contorllers/upload');

const router = express.Router()

router.route('/').post(registerUser).get(protect,allUsers)
router.post('/login', authUser)
router.get('/profile',protect,validUser);
router.put('/updateUserProfile',protect,updateUserProfile)
router.post('/forgotPassword',forgotPassword)
router.get('/',protect,Imgurl)
router.post('/resetPassword',resetPassword)

//admin Routes

module.exports = router;