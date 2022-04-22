
const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const auth = require('../middleware/auth')

//user related
router.post('/register', userController.register)
router.post('/login', userController.useLogin)
router.get('/user/:userId/profile', auth.auth, userController.getUserById)
router.put('/user/:userId/profile', auth.auth, userController.updateProfile)

//products related

router.post('/products', productController.createProduct)
router.get('/products', productController.getProduct)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProductById)
router.delete('/products/:productId', productController.deleteProductById)




//cart related
router.post('/users/:userId/cart', auth.auth, cartController.createCart)
router.put('/users/:userId/cart', auth.auth, cartController.updateCart)
router.get('/users/:userId/cart', auth.auth, cartController.getById)
router.delete('/users/:userId/cart', auth.auth, cartController.deleteCart)

// Order related
router.post('/users/:userId/orders', auth.auth, orderController.createOrder)
router.put('/users/:userId/orders', auth.auth, orderController.updateOrder)





module.exports = router
