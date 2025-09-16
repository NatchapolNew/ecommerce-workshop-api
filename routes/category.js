const express = require('express')
const router = express.Router()
const{ create,list,remove } = require('../Controllers/category')
const { authCheck,adminCheck } = require('../Middleware/authCheck')

router.post('/category',authCheck,adminCheck,create)
router.get('/category',list)
router.delete('/category/:id',authCheck,adminCheck,remove)

module.exports = router