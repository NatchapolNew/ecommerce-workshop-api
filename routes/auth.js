//import


const express = require('express')
const router = express.Router()
const { register,login,currentUser } = require('../Controllers/auth')
const {authCheck, adminCheck} = require('../Middleware/authCheck')


router.post('/register',register)
router.post('/login',login)
router.post('/current-user',authCheck,currentUser)
router.post('/current-admin',authCheck,adminCheck,currentUser)

module.exports = router