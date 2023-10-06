const asyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const crypto = require("crypto");

const encryptionKey = "64c3a7e09c0c6abc2090b3ea";
// const encryptionKey = crypto.randomBytes(32);
const encryptMessage = (message, key) => {
  try {
    const iv = crypto.randomBytes(16); // Generate an IV
    const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);
    cipher.setAutoPadding(true);
    let encryptedContent = cipher.update(message, "utf8", "base64");
    encryptedContent += cipher.final("base64");
    return iv.toString("base64") + encryptedContent;
  } catch (error) {
    console.error(" Encryption error:", error);
    return null;
  }
};

const decryptMessage = (encryptedContent, key) => {
  try {
    const ivBase64 = encryptedContent.substr(0, 24); // Extract IV from the encrypted content
    const encryptedData = encryptedContent.substr(24);
    const iv = Buffer.from(ivBase64, "base64");
    const decipher = crypto.createDecipheriv("aes-192-cbc", key, iv);
    decipher.setAutoPadding(true);
    let decryptedContent = decipher.update(encryptedData, "base64", "utf8");
    decryptedContent += decipher.final("utf8");
    return decryptedContent;
  } catch (error) {
    console.error("Decryption error:", error);
    return null; // Handle decryption error gracefully
  }
};

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    const decryptedMessages = messages.map((message) => {
      try {
        const decryptedContent = decryptMessage(
          message.encryptedContent,
          encryptionKey
        );

        return {
          ...message.toObject(),
          content: decryptedContent,
        };
      } catch (error) {
        console.error("Decryption error within map:", error);
        return {
          ...message.toObject(),
          content: "Decryption Error",
        };
      }
    });
    res.json(decryptedMessages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const encryptedContent = encryptMessage(content, encryptionKey);

  var newMessage = {
    sender: req.user._id,
    // content: content,
    encryptedContent: encryptedContent,
    // encryptionKey: encryptionKey,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
