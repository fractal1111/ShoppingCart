
const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const auth = require('../middleware/auth')


router.post('/register', userController.register)
router.post('/login', userController.useLogin)
router.get('/user/:userId/user',auth.auth ,userController.getUserById)
router.put('/user/:userId/profile',auth.auth,userController.updateProfile)
module.exports = router
