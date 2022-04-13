
const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const auth = require('../middleware/auth')

//user related
router.post('/register', userController.register)
router.post('/login', userController.useLogin)
router.get('/user/:userId/user',auth.auth ,userController.getUserById)
router.put('/user/:userId/profile',auth.auth,userController.updateProfile)

//products related
router.post('/products',productController.createProduct)
router.get('/products/:productId',productController.getProductById)
router.delete('/products/:productId',productController.deleteProductById)






module.exports = router
