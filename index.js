const express = require('express');
const dotenv = require("dotenv");
const cors = require ("cors");
const {dbConnection} = require("./model/userModel");
const userRouter = require("./Router/userRouter");
const messageRouter = require('./Router/messageRouter');
const chatRouter = require('./Router/chatRouter');
const PORT=8001;
const app = express();

app.use(cors());
app.use(express.json());
dotenv.config();
dbConnection();
app.get("/", (req, res) => {
    try {
      res.status(200).send({
        message:"working"
       });
      
    } catch (error) {
      res.status(500).send({
        message:"Internal Server Error",
        error:error.message
    })
    }
});
app.use('/user',userRouter);
app.use('/chat',chatRouter);
app.use('/message',messageRouter);
  app.listen(PORT,()=>console.log("app is running successfully"))
    