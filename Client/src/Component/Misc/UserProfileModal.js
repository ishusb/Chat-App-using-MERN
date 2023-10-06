import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  useColorMode,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { ChatState } from "../../Context/ChatProvider";
// import { useState } from "react";

const ProfileModal = ({ userProfile, children }) => {
  // console.log("token is ", user.token);
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const [leaveLoading, setLeaveLoading] = useState(false);
  const {
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    deletedChats,
    setDeletedChats,
    setNotification,
  } = ChatState();
  const toast = useToast();
  const { colorMode } = useColorMode();

  // const [isBlocked, setIsBlocked] = useState(false);

  // const clearDeletedChats = () => {
  //   try {
  //     localStorage.setItem("deletedChats", JSON.stringify([]));
  //   } catch (error) {
  //     // Handle error if needed
  //   }
  // };

  const Block = async () => {
    try {
      const deletedChats = new Set(
        JSON.parse(localStorage.getItem("deletedChats")) || []
      );
      deletedChats.add(selectedChat._id);
      // Convert the Set back to an array
      const updatedDeletedChats = Array.from(deletedChats);
      localStorage.setItem("deletedChats", JSON.stringify(updatedDeletedChats));
      setChats(chats.filter((chat) => chat._id !== selectedChat._id));
      // setIsBlocked(true);
      setSelectedChat(null);
      setDeletedChats(updatedDeletedChats);
      setNotification([]);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const UnBlock = () => {
    const updatedDeletedChats = deletedChats.filter(
      (chatId) => chatId !== selectedChat._id
    );
    setDeletedChats(updatedDeletedChats);
    localStorage.setItem("deletedChats", JSON.stringify(updatedDeletedChats));
    // setIsBlocked(false);
  };

  // const handleToggle = () => {
  //   if (isBlocked) {
  //     UnBlock();
  //   } else {
  //     Block();
  //   }
  // };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<HamburgerIcon />}
          onClick={onOpen}
        />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {userProfile.name}
            {/* {userProfile.name} */}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={userProfile.pic}
              alt={userProfile.name}
            />
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
            >
              Email: {userProfile.email}
            </Text>
          </ModalBody>
          <ModalFooter
            className="modal"
            backgroundColor={colorMode === "dark" ? "#2d3748" : "white"}
            color={colorMode === "dark" ? "white" : "gray.800"}
          >
            {/* <Button onClick={clearDeletedChats}>Clear</Button> */}
            <Button onClick={Block}>Block</Button>
            <Button onClick={UnBlock}>Unblock</Button>
            {/* <Button onClick={handleToggle}>
              {isBlocked ? "Unblock" : "Block"}
            </Button> */}
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
