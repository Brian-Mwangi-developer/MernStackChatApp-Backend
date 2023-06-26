const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Can't be blank"]
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "Can't be blank"],
        index: true,
        validate: [isEmail, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Can't be blank"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    picture:{
        type:String,
    },
    newMessage:{
        type:Object,
        default:{}
    },
    status:{
        type:String,
        default:"online"
    }
},{minimize:false});
//if user password is changed then hash the update pasword
UserSchema.pre('save',function(next){
    const user =this;
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(10,  function(err,salt){
        if(err) return next(err);
        bcrypt.hash(user.password,salt,function(err,hash){
            if(err) return next(err);

            user.password = hash
            next();
        })
    })
})
//if returning a json create a new constant copy info, delete the password and return the rest.
UserSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}
//check if email exists and password matches if not through error
UserSchema.statics.findByCredentials = async function(email,password){
    let User =this;
    const user = await User.findOne({email});
    if(!user) throw new Error("invalid email or password");

    const isMatch =await bcrypt.compare(password,user.password);
    if(!isMatch) throw new Error("invalid email or password")
    return user;
}

const User = mongoose.model("User",UserSchema);

module.exports = User;