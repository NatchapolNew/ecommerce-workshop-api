const prisma = require('../Config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
exports.register = async(req,res)=>{
    try{
        //code
        const {email,password,name} = req.body
        if(!email){
            //step1 Validate body
            return res.status(400).json({message:"Email is require!!"})
        }
        if(!password){
            return res.status(400).json({message:"Password is require!!"})
        }

        //Step 2 Check email in DB already?
        const user = await prisma.user.findFirst({
            where:{
                email: email
            }
        })

        if(user){
            return res.status(400).json({message:"Email already exits!!"})
        }
        //Step 3 HashPassword
        const hashPassword = await bcrypt.hash(password,10) //ตัวแปร,อักขระที่จะมาปนกับพาสเวิร์ด
        
        //Step 4 Register
        await prisma.user.create({
            data:{
                email: email,
                password: hashPassword,
                name:name
            }
        })

        
        res.send('Register success')
    }catch(err){
        //err
        console.log('error')
        res.status(500).json({message:"Server Error"})
    }

}

exports.login = async(req,res)=>{
    try{
        //code
        const {email,password} = req.body

        //Step 1 Check Email
        const user = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(!user || !user.enable){
            return res.status(400).json({message:'user Not found or Enable'})
        }
        

        //Step 2 Check Password
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:'Password Invalid!!!'})
        }


        //Step 3 Create Payload
        const payload = {
            id: user.id,
            email : user.email,
            name : user.name,
            role: user.role,
            createdAt: user.createdAt
            

        }

        //Step 4 Generate Token
        jwt.sign(payload,process.env.SECRET,{ expiresIn:'1d' },(err,token)=>{
            if(err){
                return res.status(500).json({message: 'Server Error'})
            }
            res.json({payload,token})
        })
        

    }catch(err){
        //err
        console.log('error')
        res.status(500).json({message:"Server Error"})
    }
}

exports.currentUser = async(req,res)=>{
    try{
        //codes
        const user = await prisma.user.findFirst({
            where:{
                email:req.user.email
            },
            select:{
                id:true,
                email:true,
                name:true,
                role:true,
                createdAt:true,
            }
        })
        res.json({user})
    }catch(err){
        //err
        console.log(err)
        res.status(500).json({message:"Server Error"})
    }

}
