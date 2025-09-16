const jwt = require('jsonwebtoken')
const prisma = require('../Config/prisma')

exports.authCheck = async(req,res,next)=>{
    try{
        //code
        const headerToken = req.headers.authorization
        
        if(!headerToken){
            return res.status(401).json({message:"No Token,Authorization"})
        }

        const token = headerToken.split(" ")[1]
        
        const decode = jwt.verify(token,process.env.SECRET)
        req.user = decode //ข้อมูลภายในtoken
        
        const user = await prisma.user.findFirst({
            where:{
                email: req.user.email
            }
               
    })
        
       if(!user.enable){
        return res.status(400).json({message:'This account cannot access'})
       }


       

        console.log(user)
        next()

    }catch(err){
        console.log(err)
        res.status(500).json({message:"Token Invalid!!!"})
    }
}

exports.adminCheck = async(req,res,next)=>{
    try{
        //code
        const {email} = req.user
        
        const adminUser = await prisma.user.findFirst({
            where:{
                email:email
            }
        })
        
        if(!adminUser || adminUser.role !== 'admin'){
            return res.status(403).json({message:'Access denied: Admin Only'})
        }
        next()
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Error Admin access denied!!'})
    }
}