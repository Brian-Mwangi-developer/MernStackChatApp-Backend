const express =require('express');
const app = express();
const userRoutes =require('./routes/userRoutes');
const User =require("./models/User")
const Message =require("./models/Messages");

const rooms =["general","Finance","Medical"];
const cors = require ('cors');
// const { socket } = require('socket.io');


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

app.use('/users',userRoutes)
require('./connection')

const server = require("http").createServer(app);
const PORT = 8000;
const io = require("socket.io")(server,{
    cors:{
        origin:'http://localhost:5173',
        methods:['GET','POST']
    }
})

app.get('/rooms', (req,res)=> {
    res.json(rooms);
})

//get previous rooms message
async function getLastMessagesFromRooms(room){
    let roomMessages = await Message.aggregate([
        {$match:{to:room}},
        {$group:{_id:'$date',messageByDate:{$push: '$$ROOT'}}}
    ])
    return roomMessages; 
}
//sort messages by date

function sortRoomMessagesByDate(messages){
    return messages.sort(function(a, b){
        let date1 =a._id.split('/');
        let date2 =b._id.split('/');
        //month/date/year changed to year/month/date
        date1 =date1[1] +date1[2] +date1[0]
        date2 =date2[1] +date2[2] + date2[0];

        return date1 < date2 ? -1 : 1; 
    })
}
//socket connection socket io works with event listeners
io.on('connection',(socket) =>{
    socket.on('new-user',async ()=>{
        const members = await User.find();
        //inform all users of a new member use io.emit() for all
        io.emit('new-user',members)
    })

    socket.on('join-room',async(room)=>{
        socket.join(room);
        let roomMessages =await getLastMessagesFromRooms(room);
        roomMessages =sortRoomMessagesByDate(roomMessages);
        //use socket.emit() for only one user// below send previous messages to specific user
        socket.emit('room-messages',roomMessages)
    })
    //sending messages
    socket.on('message-room',async(room,content,sender,time,date) =>{
        console.log("new Message",content);
        const newMessage = await Message.create({content,from: sender, time, date, to:room})
        let roomMessages = await getLastMessagesFromRooms(room);
        roomMessages =sortRoomMessagesByDate(roomMessages);
        //sending message to room
        io.to(room).emit('room-messages',roomMessages);
    
        socket.broadcast.emit('notifications',room)
    })
    app.delete("/logout", async(req,res)=>{
        try{
            const {_id,newMessages} =req.body;
            const user = await User.findById(_id);
            user.status ="offline"; 
            user.newMessages =newMessages;
            await user.save();
            const members = await User.find();
            socket.broadcast.emit('new-user',members);
            res.status(200).send();
        } catch(e){
            console.log(e);
            res.status(400).send();
        }
    })
})


server.listen(PORT,()=>{
    console.log('listening on port',PORT);
})