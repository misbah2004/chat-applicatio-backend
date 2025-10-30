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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let users = {}; // { socketId: username }

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  // Handle new user join
  socket.on("join", (username) => {
    users[socket.id] = username;
    console.log(`${username} joined!`);
    io.emit("user-list", users); // broadcast updated list
  });

  // Private message
  socket.on("private-message", ({ to, message }) => {
    const sender = users[socket.id];
    io.to(to).emit("receive-message", {
      message,
      sender,
      from: socket.id,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`${users[socket.id]} left`);
    delete users[socket.id];
    io.emit("user-list", users);
  });
});

server.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));

