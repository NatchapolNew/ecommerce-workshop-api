const prisma = require("../Config/prisma")

exports.changeOrderStatus = async(req,res)=>{
    try{
        const { orderId,orderStatus} = req.body
        const orderUpdate = await prisma.order.update({
            where:{id:orderId},
            data:{orderStatus:orderStatus}
        })
    
        res.json(orderUpdate)
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Server Error"})
    }
}

exports.getOrderAdmin = async(req,res)=>{
    try{
        const orders = await prisma.order.findMany({
            include:{
                products:{
                    include:{
                        product:true
                    }
                },
                orderedBy:{
                    select:{
                        id:true,
                        email:true,
                        address:true
                    }
                }
            }
        })

        res.json(orders)
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Server Error"})
    }
}