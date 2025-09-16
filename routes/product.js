const express = require('express')
const router = express.Router()
//controller
const {create,
    list,
    listby,
    remove,
    searchFilter,
    update,
    createImages,
    removeImage,
    read,
    soldByCategory,
    soldTotal} = require('../Controllers/product')
const {adminCheck,authCheck} = require('../Middleware/authCheck')
const { listProductoncategory } = require('../Controllers/category')


//@endpoint http://localhost:5001/api/product
router.post('/product',create)
router.get('/products/:count',list)
router.put('/product/:id', update)
router.get('/product/:id', read)
router.delete('/product/:id',remove)
router.post('/productby',listby)
router.post('/search/filters',searchFilter)
router.get('/soldbycategory',soldByCategory)
router.get('/listproductoncategory',listProductoncategory)

router.get('/soldtotal',authCheck,adminCheck,soldTotal)
router.post('/images',authCheck,adminCheck,createImages)
router.post('/removeimages',authCheck,adminCheck,removeImage)






module.exports = router