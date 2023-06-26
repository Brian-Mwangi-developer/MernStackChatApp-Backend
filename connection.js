const mongoose = require('mongoose');
require('dotenv').config();

async function connectToMongoDB(){
    try{
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@myatlasclusteredu.lkdai4s.mongodb.net/mernchatApp?retryWrites=true&w=majority`);
        console.log('Connected to MongoDB');
    }catch(error){
        console.error("Error connecting to MongoDB", error);
    }
}
connectToMongoDB();

