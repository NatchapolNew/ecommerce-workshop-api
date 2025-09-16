//Step import...
const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs') //คือการอ่านdirectoryแล้วให้Import auto
const cors = require('cors')
//const authRouter = require('./routes/auth')
//const categoryRouter = require('./routes/category')


//middle ware
app.use(morgan('dev'))
app.use(express.json({limit:'20mb'}))
app.use(cors())
//app.use('/api',authRouter)
//app.use('/api',categoryRouter)
readdirSync('./routes')
.map((c)=> app.use('/api', require('./routes/'+c)))


//Step 2 Start server
app.listen(5001,()=>console.log('server is running on port5001'))




//step 3 router
//app.post('/api',(req,res)=>{
    //code
  //  const { username,password } = req.body
    //console.log(username,password)
    //res.send('Jukkru')

//})

