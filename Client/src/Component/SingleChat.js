import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useColorMode, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import UserProfileModal from "./Misc/UserProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../Animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./Misc/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://localhost:8000"; //
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const { colorMode } = useColorMode();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    deletedChats,
  } = ChatState();

  // const decryptMessage = async (encryptedContent, key) => {
  //   try {
  //     const ivBase64 = encryptedContent.substr(0, 24);
  //     const encryptedData = encryptedContent.substr(24);
  //     const iv = new TextEncoder().encode(ivBase64);
  //     const encryptedDataArrayBuffer = Uint8Array.from(
  //       atob(encryptedData),
  //       (c) => c.charCodeAt(0)
  //     ).buffer;

  //     // Convert the key to ArrayBuffer
  //     const keyArrayBuffer = new TextEncoder().encode(key).buffer;

  //     // Ensure the key is 256 bits (32 bytes)
  //     if (keyArrayBuffer.byteLength !== 32) {
  //       console.error("Invalid key length");
  //       return "Invalid Key";
  //     }

  //     const cryptoKey = await crypto.subtle.importKey(
  //       "raw",
  //       keyArrayBuffer,
  //       { name: "AES-CBC", length: 256 },
  //       false,
  //       ["encrypt", "decrypt"]
  //     );

  //     const decryptedArrayBuffer = await crypto.subtle.decrypt(
  //       { name: "AES-CBC", iv },
  //       cryptoKey,
  //       encryptedDataArrayBuffer
  //     );

  //     const decryptedContent = new TextDecoder().decode(decryptedArrayBuffer);
  //     return decryptedContent;
  //   } catch (error) {
  //     console.error("Decryption error:", error);
  //     return "Decryption Error"; // Handle decryption error gracefully
  //   }
  // };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        console.log(data);
        if (!selectedChat) {
          setSelectedChat(data.chat);
        }
        socket.emit("new message", data);
        // console.log(atob(data.encryptionKey));
        // const encryptionKey = data.encryptionKey;
        // setMessages((prevMessages) => [
        //   ...prevMessages,
        //   {
        //     ...data,
        //     content: decryptMessage(data.encryptedContent, encryptionKey),
        //   },
        // ]);
        setMessages([...messages, data]);
        await fetchMessages();
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      fetchMessages();
      console.log("Deleted Chats are", deletedChats);
      const deletedChatsFromLocalStorage =
        JSON.parse(localStorage.getItem("deletedChats")) || [];
      const isChatDeleted =
        deletedChats &&
        (deletedChats.includes(newMessageRecieved.chat._id) ||
          deletedChatsFromLocalStorage.includes(newMessageRecieved.chat._id));
      console.log("Delete Chats:: ", isChatDeleted);
      if (!isChatDeleted) {
        if (
          !selectedChatCompare || // if chat is not selected or doesn't match current chat
          selectedChatCompare._id !== newMessageRecieved.chat._id
        ) {
          if (!notification.includes(newMessageRecieved)) {
            setNotification([newMessageRecieved, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          setMessages([...messages, newMessageRecieved]);
        }
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 1000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages && !selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <UserProfileModal
                  userProfile={getSenderFull(user, selectedChat.users)}
                />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            className="chats"
            // backgroundColor={colorMode === "dark" ? "#BEBEBE" : "#E8E8E8"}
            color={colorMode === "dark" ? "white" : "gray.800"}
            backgroundColor={colorMode === "dark" ? "#243b55" : "#f2fcfc"}
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="black"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
                backgroundColor={colorMode === "dark" ? "gray.800" : "#eaeaf9"}
                color={colorMode === "dark" ? "white" : "gray.800"}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
          // backgroundColor={colorMode === "dark" ? "black" : "#E8E8E8"}
          // color={colorMode === "dark" ? "black" : "gray.800"}
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
