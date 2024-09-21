const express = require('express');
const { registerUser, authUser, allUsers,updateProfile,forgotPassword,resetPassword,getUserProfile } = require('../contorllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router()

router.route('/').post(registerUser).get(protect,allUsers)
router.post('/login', authUser)
router.get('/profile/:id',protect,getUserProfile);
router.put('/update',updateProfile)
router.post('/forgotPassword',forgotPassword)
router.post('/resetPassword',resetPassword)

//admin Routes

module.exports = router;