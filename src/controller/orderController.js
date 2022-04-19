const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const validators = require('../validator/validators')
const orderModel = require('../models/orderModel')

const createOrder = async (req, res) => {


    userId = req.params.userId.trim()
    if (!validators.isValidObjectId(userId)) {
        return res
            .status(400)
            .send({ status: false, Message: `${userId} is Not A Valid User Id` })
    }

    const isUserExist = await userModel.findById(userId)
    if (!isUserExist) {
        return res.status(404).send({ status: false, Message: `userNot Found Please Check User Id` })
    }
    //Authorization
    if (isUserExist._id != req.userId) {
        return res.status(403).send({ status: false, Message: `Unauthorized Request !` })
    }

    if (!validators.isValidRequestBody(req.body)) {
        return res.status(400).send({ status: false, message: `Invalid Input Parameters` })
    }

    let { items, totalPrice, totalItems, totalQuantity } = req.body

    if (!req.body.hasOwnProperty('items')) {
        return res
            .status(400)
            .send({ status: false, Message: `Items Should Be present in request body` })
    }

    if (!Array.isArray(items) || items.length == 0) {
        return res
            .status(400)
            .send({ status: false, message: ` invalid input - Items` })
    }

    if (!req.body.hasOwnProperty('totalPrice')) {
        return res
            .status(400)
            .send({ status: false, Message: `total Price Should Be Presemt In Request Body` })
    }

    if (!validators.isValidNumber(totalPrice)) {
        return res
            .status(400)
            .send({ status: false, Message: `Total Price Should Be A Number` })
    }


    if (!req.body.hasOwnProperty('totalItems')) {
        return res
            .status(400)
            .send({ status: false, Message: `total Price Should Be Present In Request Body` })
    }

    if (!validators.isValidNumber(totalItems)) {
        return res
            .status(400)
            .send({ status: false, Message: `Total items Should Be A Number` })
    }

    if (!req.body.hasOwnProperty('totalQuantity')) {
        return res
            .status(400)
            .send({ status: false, Message: `total Quantity Should Be Present In Request Body` })
    }

    if (!validators.isValidNumber(totalQuantity)) {
        return res
            .status(400)
            .send({ status: false, Message: `Total quantity Should Be A Number` })
    }


    const newOrderData = {

        userId,
        items,
        totalPrice,
        totalItems,
        totalQuantity

    }

    const newOrder = await orderModel.create(newOrderData)
    res.status(201).send({ status: true, Message: `Success`, Data: newOrder })

}
module.exports.createOrder = createOrder

//......................................................................//

const updateOrder = async (req, res) => {

    try {
        let userId = req.params.userId.trim()
        if (!validators.isValidObjectId(userId)) {
            return res
                .status(400)
                .send({ status: false, Message: `${userId} is Not A Valid User Id` })
        }

        const isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(404).send({ status: false, Message: `userNot Found Please Check User Id` })
        }
        //Authorization
        if (isUserExist._id != req.userId) {
            return res.status(403).send({ status: false, Message: `Unauthorized Request !` })
        }

        if (!validators.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: `Invalid Input Parameters` })
        }

        let { orderId, status } = req.body

        if (!req.body.hasOwnProperty('orderId')) {
            return res
                .status(400)
                .send({ status: false, Message: `Order Id Should Be Present In RequestBody` })
        }

        if (!validators.isValid(orderId)) {
            return res.status(400).send({ Status: false, msg: "Order id should be a valid string" })
        }

        orderId = orderId.trim()

        if (!validators.isValidObjectId(orderId)) {
            return res
                .status(400)
                .send({ status: false, Message: `${orderId} is Not A Valid Object Id` })
        }


        const isValidOrder = await orderModel.findById(orderId)
        if (!isValidOrder) {
            return res
                .status(404)
                .send({ status: false, Message: `No Order Found By This ${orderId} id` })
        }

        if (isValidOrder.userId != userId) {
            return res
                .status(403)
                .send({ status: false, Message: `order ${orderId} Does Not Belongs To ${userId} user` })
        }

        if (!req.body.hasOwnProperty('status')) {
            return res
                .status(400)
                .send({ status: false, Message: `Status Should Be Present In Request Body` })
        }

        if (!validators.isValid(status)) {
            return res
                .status(400)
                .send({ status: false, Message: `Status should be a valid string` })
        }
        status = status.trim()

        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400)
                .send({ status: false, message: `Status Should Be from [pending, completed, cancelled]` })
        }

        if (isValidOrder.cancellable == false || isValidOrder.status == "cancelled") {
            return res
                .status(400)
                .send({ status: false, Message: `Order cannot Be canceled or its Already cancelled ` })
        }

        const updatedOrder = await orderModel.findByIdAndUpdate({ _id: orderId },
            { $set: { status: status } }, { new: true })

        return res.status(200).send({ status: false, message: 'Success', Data: updatedOrder })

    } catch (err) {
        return res
            .status(500)
            .send({ Status: false, msg: err.message })
    }




}

module.exports.updateOrder = updateOrder