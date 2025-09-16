const express = require('express')
const router = express.Router()
//controller
const {createBanner,updateBanner,listBanner,deleteBanner,createImagesbanner,removeImagebanner, readBanner} = require('../Controllers/banner')

const {adminCheck,authCheck} = require('../Middleware/authCheck')


router.post('/banner',authCheck,adminCheck,createBanner)
router.get('/banners',listBanner)
router.get('/banner/:id',readBanner)
router.put('/banner/:id',authCheck,adminCheck,updateBanner)
router.delete('/banner/:id',authCheck,adminCheck,deleteBanner)

router.post('/imgbanner',authCheck,adminCheck,createImagesbanner)
router.post('/removeimgbanner',authCheck,adminCheck,removeImagebanner)

module.exports = router