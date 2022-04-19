const productModel = require('../models/productModel')
const validate = require('../validator/validators')
const aws = require('../validator/awsS3')

const createProduct = async (req, res) => {
    try {


        if (!validate.isValidRequestBody(req.body)) {
            return res
                .status(400)
                .send({ status: false, message: `invalid request params` })
        }

        let files = req.files
        if (files && files.length > 0) {                  //also can use isValidFiles
            if (!validate.isValidImage(files[0])) {
                return res
                    .status(400)
                    .send({ status: false, message: `invalid image type` })
            }

        }
        else {
            return res
                .status(400)
                .send({ status: false, msg: "No file to write" });
        }

        let {
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            style,
            availableSizes,
            installments
        } = req.body


        if (!validate.isValid(title)) {
            return res
                .status(400)
                .send({ status: false, message: `title is required` })//
        }

        let dupliTitle = await productModel.findOne({ title: title }) //, isDeleted:False

        if (dupliTitle) { return res.status(400).send({ Status: false, msg: "product with this title already exists" }) }

        if (!validate.isValid(description)) {
            return res
                .status(400)
                .send({ status: false, message: `invalid Discription` })//
        }

        
        if (!validate.isValid(price)) {
            return res
                .status(400)
                .send({ msg: "Pleae provide price field" })
        }



        if (!validate.isValidNumber(parseInt(price))) {
            return res
                .status(400)
                .send({ status: false, message: `price attribute should be Number/ decimal Number Only` })
        }


        if (!validate.isValid(currencyId)) {
            return res
                .status(400)
                .send({ status: false, message: `please Provide Currency Id Field` })
        }

        if (currencyId != 'INR') {
            return res
                .status(400)
                .send({ status: false, message: `${currencyId} is Not A Valid Currency Id` })
        }

        if (!validate.isValid(currencyFormat)) {
            return res
                .status(400)
                .send({ status: false, message: `please Provide CurrencyFormat Field` })
        }

        if (currencyFormat != '₹') {
            return res
                .status(400)
                .send({ status: false, message: `${currencyFormat} Is Not A Valid Curency Format` })
        }




if(isFreeShipping){


        if (!validate.isValidBoolean((isFreeShipping))) {
            return res
                .status(400)
                .send({ status: false, message: `is Free Shipping Should Be a Boolean value` })
        }
    }


        
        if (!validate.isValid(availableSizes)) {
             return res
             .status(400)
             .send({ Staus: false, msg: "Please provide AvailableSizes field" }) }


        availableSizesArr = JSON.parse(availableSizes)

        if (availableSizesArr.length == 0) {
            return res
                .status(400)
                .send({ status: false, message: `please Provide Avilable Sizes` })
        }


        let newArr = []

        for (let i = 0; i < availableSizesArr.length; i++) {

            if (!(['S', "XS", "M", "X", 'L', "XXL", "XL"].includes(availableSizesArr[i].toUpperCase()))) {
                return res
                    .status(400)
                    .send({ status: false, message: `please Provide Available Size from ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
            }
            newArr.push(availableSizesArr[i].toUpperCase())
        }



        if (installments) {

            if (!validate.isValidNumber(parseInt(installments))) {
                return res.status(400).send({ status: false, message: `Invalid installments. should be Number only` })
            }
        }


        if (style) {
            if (!validate.isValid(style)) { return res.status(400).send({ Status: false, msg: "Please input style" }) }
        }





        let uploadedFileURL = await aws.uploadFile(files[0])
        /// if(!uploadedFileURL){return res.status(400)}


        let finalData = {
            title: title.trim(),
            description: description.trim(),
            price,
            currencyId: currencyId.trim(),
            currencyFormat: currencyFormat.trim(),
            isFreeShipping: isFreeShipping.trim(),
            productImage: uploadedFileURL,
            style,
            availableSizes: newArr,
            installments
        }

        const newProduct = await productModel.create(finalData)
        return res
            .status(201)
            .send({ status: false, mesage: 'Success', Data: newProduct })

    } catch (err) {
        res
            .status(500)
            .send({ status: false, message: err.message })
    }
}






module.exports.createProduct = createProduct

const getProduct = async (req, res) => {

    let { size, name, priceGreaterThan, priceLessThan } = req.query
    console.log(req.query)
    let filters = { isDeleted: false, deletedAt: null }


    if (req.query.hasOwnProperty('size')) {

        let validSizes = validate.isValidSize(JSON.parse(req.query.size))

        if (!validSizes) {
            return res
                .status(400)
                .send({ status: false, message: `please Provide Available Size from ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
        }
        filters['size'] = { $in: validSizes }
    }

    if ('name' in req.query) {

        if (!validate.isValid(name)) {
            return res
                .status(400)
                .send({ status: false, message: `invalid Input - Name` })
        }
        filters['title'] = { $regex: name }

    }

    if ('priceGreaterThan' in req.query && 'priceLessThan' in req.query) {

        if (!validate.isValidNumber(parseInt(priceGreaterThan))) {
            return res
                .status(400)
                .send({ status: false, message: `invalid price - Enterd` })
        }

        if (!validate.isValidNumber(parseInt(priceLessThan))) {
            return res
                .status(400)
                .send({ status: false, message: `invalid price - Enterd` })
        }

        filters['price'] = { $gt: priceGreaterThan, $lt: priceLessThan }

    } else if ('priceGreaterThan' in req.query) {

        if (!validate.isValidNumber(parseInt(priceGreaterThan))) {
            return res
                .status(400)
                .send({ status: false, message: `invalid price - Enterd` })
        }

        filters['price'] = { $gt: priceGreaterThan }

    } else if ('priceLessThan' in req.query) {

        if (!validate.isValidNumber(parseInt(priceLessThan))) {
            return res
                .status(400)
                .send({ status: false, message: `invalid price - Enterd` })
        }

        filters['price'] = { $lt: priceLessThan }

    }

    // console.log(filters)

    const dataByFilters = await productModel.find(filters) // sort
    
    if(dataByFilters.length == 0){
        return res
        .status(404)
        .send({Status:false , msg:"no products wiht the given queries were found"})
    
    
    }
    
    return res
        .status(200)
        .send({ status: true, message: `Success`, Data: dataByFilters })

}

module.exports.getProduct = getProduct

//...............................................................................

const updateProductById = async (req, res) => {
    try {

        let requestBody = JSON.parse(JSON.stringify(req.body));
        let productId = req.params.productId;
        let files = req.files;
    
        


        
      if(!(validate.isValidRequestBody(requestBody)||req.hasOwnProperty('files'))){
          return res
          .status(400)
          .send({Statuss:false , msg:"Please give input in request "})}
      
        
          if (!validate.isValidObjectId(productId)) {
            return res
                .status(404)
                .send({ status: false, msg: "productId not found" });
        }
        let product = await productModel.findOne({ _id:productId, isDeleted:false });

        if (!product) {
            return res
                .status(404)
                .send({ status: false, msg: "product not found or has been deleted" });
        }

        let {
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            style,
            availableSizes,
            installments

        } = requestBody;



        let updatedproductData = {};

        if (requestBody.hasOwnProperty('style')) {
            if (!validate.isValid(style)) {
                return res
                    .status(400)
                    .send({ Status: false, msg: "Please provide the style of product" })
            }


            if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
                updatedproductData["$set"] = {};

            updatedproductData["$set"]["style"] = style.trim();

        }

        if (requestBody.hasOwnProperty("price")) {
            if (!validate.isValid(price)) {
                return res
                    .status(400)
                    .send({ msg: "Please enter price" })
            }

            if (!validate.isValidNumber(parseInt(price))) {
                return res
                    .status(400)
                    .send({ status: false, message: `price attribute should be Number/ decimal Number Only` })
            }

            if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
                updatedproductData["$set"] = {};

            updatedproductData["$set"]["price"] = price;
        }



        if (requestBody.hasOwnProperty('title')) {
            if (!validate.isValid(title)) {
                return res
                    .status(400)
                    .send({ status: false, message: `title is required` })
            }

            let dupliTitle = await productModel.findOne({ title: title })
            if (dupliTitle) { return res.status(400).send({ Status: false, msg: "Title already exists" }) }

            if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
                updatedproductData["$set"] = {};



            updatedproductData["$set"]["title"] = title.trim();
        }




        if (requestBody.hasOwnProperty('description')) {

            if (!validate.isValid(description)) {
                return res
                    .status(400)
                    .send({ Status: false, msg: "Please provide description" })
            }
            if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
                updatedproductData["$set"] = {};

            updatedproductData["$set"]["description"] = description.trim();
        }

        // if (validate.isValid('currencyFormat')) {
        //     if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        //         updatedproductData["$set"] = {};

        //     updatedproductData["$set"]["currencyFormat"] = currencyFormat;
        // }

        // if (validate.isValid('currencyId')) {
        //     if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        //         updatedproductData["$set"] = {};

        //     updatedproductData["$set"]["currencyId"] = currencyId;
        // }


        if (requestBody.hasOwnProperty('isFreeShipping')) {
           
            if (!validate.isValid(isFreeShipping)) {
                return res
                    .status(400)
                    .send({ msg: "Pleae enter isFreeShipping" })
            }
           
            if (!validate.isValidBoolean(isFreeShipping)) {
                return res
                    .status(400)
                    .send({ Status: false, msg: "Please provide a valid boolean value" })

            }


            if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
                updatedproductData["$set"] = {};

            updatedproductData["$set"]["isFreeShipping"] = isFreeShipping;
        }

        
        
        if (requestBody.hasOwnProperty('availableSizes')) {

          if(!validate.isValid(availableSizes)){
              return res
              .status(400)
              .send({Status:false , msg : "Please provide available sizes"})}
           
              if (!validate.isValidSize(JSON.parse(availableSizes))) {
                return res
                    .status(400)
                    .send({ Status: false, msg: `please Provide Available Size from ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
            }


            if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
                updatedproductData["$set"] = {};

            updatedproductData["$set"]["availableSizes"] = validate.isValidSize(JSON.parse(availableSizes))



        }


        if (requestBody.hasOwnProperty('installments')) {
            if (!validate.isValidNumber(parseInt(installments))) {
                return res
                    .status(400)
                    .send({ status: false, msg: "Please provide validd installments as Number" })
            }



            if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
                updatedproductData["$set"] = {};

            updatedproductData["$set"]["installments"] = installments;
        }


      
        if (validate.isValidFiles(files)) {
            
            if (!validate.isValidImage(files[0])) {
                return res
                    .status(400)
                    .send({ Status: false, msg: "please provide  valid image " })
            }

            let productImageLink = await aws.uploadFile(files[0]);

            if (!productImageLink) {
                return res
                    .status(400)
                    .send({ status: false, msg: "error in uploading the files" });

            }

            if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
                updatedproductData["$set"] = {};

            updatedproductData["$set"]["productImage"] = productImageLink;
        
        }

      
        if(Object.keys(updatedproductData).length==0){return res.status(400).send({Status:false , msg:"no data to update"})}
        
        let upadatedProduct = await productModel.findOneAndUpdate(
            { _id: productId },
            updatedproductData,
            { new: true }
        )

        return res
            .status(200)
            .send({ status: true, msg: "Product updated successfully", data: upadatedProduct });

    } catch (err) {
       
        res.status(500)
            .send({ status: false, msg: err.message })
    }
}

module.exports.updateProductById = updateProductById

//.........................................................................

const getProductById = async function (req, res) {
    try {
        let pid = req.params.productId

        if (!validate.isValidObjectId(pid)) {
            return res
                .status(400)
                .send({ Status: false, msg: "Please provide valid Product id" })

        }

        let product = await productModel.findById(pid)
        if (!product) {
            return res
                .status(404)
                .send({ Status: false, msg: "No product with this id exists" })
        }

        if (product.isDeleted === true) { return res.status(400).send({ Status: false, msg: "Product is deleted" }) }


        return res.status(200).send({ Status: true, message: "Success", Data: product })



    } catch (err) { return res.status(500).send({ Status: false, msg: err.message }) }

}

module.exports.getProductById = getProductById

//.....................................................................

const deleteProductById = async function (req, res) {
    try {
        let pid = req.params.productId
        if (!validate.isValidObjectId(pid)) {
            return res
                .status(400)
                .send({ Status: false, msg: "Please provide valid Product id" })
        }


        let product = await productModel.findById(pid)

        if (!product) {
            return res
                .status(404)
                .send({ Status: false, msg: "Product not found" })
        }

        if (product.isDeleted === true) {
            return res
                .status(400)
                .send({ Status: false, msg: "Product already deleted" })
        }


        let deletedProduct = await productModel.findByIdAndUpdate(pid, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

        return res.status(200).send({ Status: true, message: "Success", Data: deletedProduct })


    } catch (err) { return res.status(500).send({ Status: false, msg: err.message }) }

}

module.exports.deleteProductById = deleteProductById