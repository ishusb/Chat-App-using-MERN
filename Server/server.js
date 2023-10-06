const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./Routes/userRoutes");
const { notFound, errorHandler } = require("./Middleware/errorMiddleware");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const User = require("./Models/userModel");
// const passwordResetRoutes = require("./Routes/passwordResetRoutes");

const app = express();
dotenv.config();
connectDB();
const connectedUsers = {};

app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Running");
// });

app.use("/api/user", userRoutes);
// app.use("/api/passwordreset", passwordResetRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, console.log(`Server running`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    if (userData._id != null && Boolean(userData._id)) {
      try {
        console.log("HELLO");
        User.findByIdAndUpdate(userData._id, {
          socket_id: socket.id,
          status: "Online",
        });
        console.log("User logged in");
        console.log(userData.status);
      } catch (e) {
        console.log(e);
      }
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("logout", (userData) => {
    console.log(userData._id);
    if (userData._id) {
      User.findByIdAndUpdate(userData._id, { status: "Offline" });
    }
    console.log("closing connection");
    socket.disconnect(0);
  });

  // socket.on("disconnect", () => {
  //   // if (connectedUsers[socket.id]) {
  //   console.log("User is logged out");
  //   delete connectedUsers[socket.id];
  //   // }
  // });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
    console.log("User is logged out");
  });
});
