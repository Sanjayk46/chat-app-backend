const  mongoose =require( 'mongoose');
const bcrypt =require( 'bcryptjs');
const jwt = require( 'jsonwebtoken');

const dbConnection = async ()=>{
    try {
        await mongoose.connect(
  //          "mongodb+srv://sanjayks8046:Iahdd45uAymNkIEM@zendb.kv2hnw1.mongodb.net/"
            "mongodb://localhost:27017",{
              useNewUrlParser: true,
              useUnifiedTopology: true,
            });
        console.log("DB Connected successfully");
        
    } catch (error) {
        console.log(error.message," error in connecting db");
    }
  }
const userSchema = mongoose.Schema(

{
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: 'Available',
    },
    profilePic: {
      type: String,
      default:
        'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign(
      { id: this._id, email: this.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );
    return token;
  } catch (error) {
    console.log('error while generating token');
  }
};

const userModel = mongoose.model('User', userSchema);
module.exports = {dbConnection,userModel};