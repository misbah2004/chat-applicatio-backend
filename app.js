// import express from "express";
// import { Server } from "socket.io";
// import { createServer } from "http";

// const port = 3000;

// const app = express();
// const server = new createServer(app);
// const io = new Server(server,{
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//         credentials: true,
//     }
// });

// app.get("/", (req, res) => {
//   res.send("Hello, World!");
// });

// io.on("connection", (socket) => {
//     console.log("user connected" , socket.id);

//     socket.on("message", ({room , message})=>{
//         console.log("message received: ", room , message);
//         io.to(room).emit("recived-message", message);
//     })

//     socket.on("disconnect", () => {
//         console.log("user disconnected", socket.id);
//     });
    
// });

// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://chat-frontend-two-black.vercel.app/"], // Change to your frontend domain when live
    methods: ["GET", "POST"],
  },
});

let users = {}; // socket.id -> username

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with username
  socket.on("join", (username) => {
    users[socket.id] = username;
    console.log(`${username} joined as ${socket.id}`);

    // Notify all users of new list
    io.emit("user-list", users);
  });

  // Private messaging
  socket.on("private-message", ({ to, message }) => {
    const senderName = users[socket.id];
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    io.to(to).emit("receive-message", {
      message,
      from: socket.id,
      sender: senderName,
      time,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
    io.emit("user-list", users); // Update user list for everyone
  });
});

app.get("/", (req, res) => {
  res.send("Socket.io Chat Server Running 🚀");
});

server.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});

