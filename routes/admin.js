//import
const express = require('express')
const router = express.Router()
const {authCheck} = require('../Middleware/authCheck')
//import controller
const{getOrderAdmin,changeOrderStatus} = require('../Controllers/admin')


router.put('/admin/order-status',authCheck,changeOrderStatus)
router.get('/admin/orders',authCheck,getOrderAdmin)


module.exports = router