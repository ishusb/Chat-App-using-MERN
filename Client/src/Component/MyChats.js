import React from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
// import ChatLoading from "./ChatLoading";
import GroupChatModal from "./Misc/GroupChatModal";
import { Button, Spinner, useColorMode } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    deletedChats,
    setDeletedChats,
  } = ChatState();

  const toast = useToast();
  const { colorMode } = useColorMode();

  useEffect(() => {
    const storedDeletedChats =
      JSON.parse(localStorage.getItem("deletedChats")) || [];
    setDeletedChats(storedDeletedChats);
    // eslint-disable-next-line
  }, []);

  const handleStartChatAgain = (chat) => {
    const updatedDeletedChats = deletedChats.filter(
      (chatId) => chatId !== chat._id
    );
    setDeletedChats(updatedDeletedChats);
  };

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    const storedChats = JSON.parse(localStorage.getItem("chats"));
    if (storedChats) {
      setChats(storedChats);
    }
    // eslint-disable-next-line
  }, [fetchAgain]);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  return (
    <Box
      className="chatsComp"
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      w={{ base: "100%", md: "31%" }}
      backgroundColor={colorMode === "dark" ? "#19283d" : "#FDF4FE"}
      color={colorMode === "dark" ? "white" : "gray.800"}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        borderRadius="10px"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor={colorMode === "dark" ? "#19283d" : "#FDF4FE"}
        color={colorMode === "dark" ? "white" : "gray.800"}
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            backgroundColor={colorMode === "dark" ? "#243b55" : "#E8E8E8"}
            color={colorMode === "dark" ? "white" : "gray.800"}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
        backgroundColor={colorMode === "dark" ? "#19283d" : "#FDF4FE"}
        color={colorMode === "dark" ? "white" : "gray.800"}
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map(
              (chat) =>
                !deletedChats.includes(chat._id) && (
                  <Box
                    className="chatTag"
                    onClick={() => {
                      setSelectedChat(chat);
                      handleStartChatAgain(chat); // Call the function here
                    }}
                    cursor="pointer"
                    bg={
                      selectedChat === chat
                        ? colorMode === "dark"
                          ? "#38B2AC"
                          : "#38B2AC"
                        : colorMode === "dark"
                        ? "#BEBEBE"
                        : "#E8E8E8"
                    }
                    color={selectedChat === chat ? "white" : "black"}
                    px={3}
                    py={2}
                    borderRadius="lg"
                    key={chat._id}
                  >
                    <Text>
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </Text>
                  </Box>
                )
            )}
          </Stack>
        ) : (
          <>
            <Spinner
              size="xl"
              w={20}
              h={20}
              alignSelf="center"
              margin="auto"
              color="black"
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
