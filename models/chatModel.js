const mongoose = require('mongoose')

const chatModel = mongoose.Schema(
    {
        chatName:{type:String, trim:true},
        isGroupChat: {type: Boolean, default:false},
        users:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        }],
        latestMessage:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Message"
        },
        groupAdmin:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        isActive: { type: Boolean, default: true }, // New field to check if the group is active
    },
    {
        timestamps: true
    }
)

const Chat = mongoose.model("Chat",chatModel)

module.exports = Chat;