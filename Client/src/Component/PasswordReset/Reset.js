import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import React from "react";
import { Box, Container, Text } from "@chakra-ui/react";
import ThemeToggle from "../Misc/ThemeToggle";
import "../styles.css";
import { useColorMode } from "@chakra-ui/react";

const Reset = () => {
  const toast = useToast();
  const [email, setEmail] = useState();
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { setUser } = ChatState();
  const { colorMode } = useColorMode();

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      submitHandler();
    }
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!email) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 1000,
        isClosable: true,
        position: "bottom",
        colorScheme: "gray",
      });
      setLoading(false);
      return;
    }
    history.push("/");

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.put(
        "/api/user/resetPassword",
        { email },
        config
      );

      toast({
        title: "Password Reset Successful",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "bottom",
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 1000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <Box
      width="100%"
      bg={
        colorMode === "dark"
          ? "linear-gradient(#243b55, #141e30 )"
          : "linear-gradient(#ffffff, #e4f9fa  , #f1dcf9)"
      }
      color={colorMode === "dark" ? "white" : "gray.800"}
    >
      <Container maxW="xl">
        <div className="loginToggle">
          <ThemeToggle />
        </div>
        <Box
          display="flex"
          justifyContent="center"
          p={3}
          bg="#B4B4B4"
          w="100%"
          m="40px 0 15px 0"
          borderRadius="lg"
          borderWidth="1px"
          backgroundColor={colorMode === "dark" ? "#243b55" : "#B4B4B4"}
          color={colorMode === "dark" ? "white" : "gray.800"}
        >
          <Text fontSize="4xl" fontFamily="Roboto Condensed" align="center">
            Reset Password
          </Text>
        </Box>
        <Box
          bg="#B4B4B4"
          w="100%"
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          backgroundColor={colorMode === "dark" ? "#243b55" : "#B4B4B4"}
          color={colorMode === "dark" ? "white" : "gray.800"}
        >
          <VStack spacing="10px">
            <FormControl id="email" isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                value={email}
                type="email"
                placeholder="Enter Your Email Address"
                onChange={(e) => setEmail(e.target.value)}
                color="teal"
                _placeholder={{ color: "inherit" }}
                onKeyDown={handleKeyPress}
              />
            </FormControl>
            <Button
              colorScheme="blue"
              width="100%"
              style={{ marginTop: 15 }}
              isLoading={loading}
              onClick={submitHandler}
            >
              Reset Password
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Reset;
