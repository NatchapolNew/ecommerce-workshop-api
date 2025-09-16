//import
const express = require('express')
const router = express.Router()
const {authCheck} = require('../Middleware/authCheck')

//import controller
const { payment } = require ('../Controllers/Stripe')

router.post('/user/create-payment-intent',authCheck,payment)


module.exports = router