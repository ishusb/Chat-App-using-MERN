import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);

  const history = useHistory();
  const { setUser } = ChatState();

  const checkUserExists = async (email) => {
    try {
      const response = await axios.get(`/api/user/${email}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  const handleEmailChange = async (e) => {
    setEmail(e.target.value);
    if (e.target.value === "") {
      setErrorEmail("Email is Required");
    } else if (
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(e.target.value)
    ) {
      setErrorEmail("Enter a valid Email address");
    } else {
      const userExists = await checkUserExists(e.target.value);
      if (!userExists) {
        setErrorEmail("User does not exists");
      } else {
        setValid(true);
        setErrorEmail("");
      }
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value === "") {
      setErrorPassword("Password is Required");
    } else {
      setErrorPassword("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      submitHandler();
    }
  };

  const submitHandler = async () => {
    if (!email || !password) {
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
    if (valid) {
      setLoading(true);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
          },
        };

        const { data } = await axios.post(
          "/api/user/login",
          { email, password },
          config
        );

        toast({
          title: "Login Successful",
          status: "success",
          duration: 1000,
          isClosable: true,
          position: "bottom",
        });
        setUser(data);
        localStorage.setItem("userInfo", JSON.stringify(data));
        setLoading(false);
        history.push("/chats");
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
    }
  };
  // const reset = () => {
  //   history.push("/resetPassword");
  // };

  return (
    <VStack spacing="10px">
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="Enter Your Email Address"
          onClick={handleEmailChange}
          onChange={handleEmailChange}
          color="teal"
          onKeyDown={handleKeyPress}
          _placeholder={{ color: "inherit" }}
        />
        <span className="authError">{errorEmail}</span>
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            // value={password}
            onClick={handlePasswordChange}
            onChange={handlePasswordChange}
            type={show ? "text" : "password"}
            placeholder="Enter password"
            color="teal"
            _placeholder={{ color: "inherit" }}
            onKeyDown={handleKeyPress}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <span className="authError">{errorPassword}</span>
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>
      {/* <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        isLoading={loading}
        onClick={reset}
      >
        Reset Password
      </Button> */}
    </VStack>
  );
};

export default Login;
