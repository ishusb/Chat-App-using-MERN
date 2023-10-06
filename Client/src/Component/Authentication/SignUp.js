import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router";
import "../styles.css";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const history = useHistory();

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);
  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [valid, setValid] = useState(false);

  // const [error1, setError1] = useState({});
  // const [msg, setMsg] = useState("");

  const checkUserExists = async (email) => {
    try {
      const response = await axios.get(`/api/user/${email}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (e.target.value === "") {
      setErrorName("Name is Required");
    } else if (e.target.value.length < 3) {
      setErrorName("Name should be more than three characters");
    } else if (!/^[A-Za-z0-9\s]+$/.test(e.target.value)) {
      setErrorName("Name shouldn't include any special character!");
    } else {
      setValid(true);
      setErrorName("");
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
      if (userExists) {
        setErrorEmail("User already exists");
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
    } else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
        e.target.value
      )
    ) {
      setErrorPassword(
        "Password should have atleast 8 characters and must include at least one letter, one number, and one special character"
      );
    } else {
      setValid(true);
      setErrorPassword("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmpassword(e.target.value);
    if (e.target.value === "") {
      setErrorConfirmPassword("Password is Required");
    } else if (e.target.value !== password) {
      setErrorConfirmPassword("Password doesn't match");
    } else {
      setValid(true);
      setErrorConfirmPassword("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      submitHandler();
    }
  };

  const submitHandler = async () => {
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 1000,
        isClosable: true,
        position: "bottom",
        colorScheme: "gray",
      });
      setPicLoading(false);
      return;
    }
    if (valid) {
      setPicLoading(true);
      if (password !== confirmpassword) {
        toast({
          title: "Passwords Do Not Match",
          status: "warning",
          duration: 1000,
          isClosable: true,
          position: "bottom",
          colorScheme: "gray",
        });
        setPicLoading(false);
        return;
      }
      console.log(name, email, password, pic);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
          },
        };
        const { data } = await axios.post(
          "/api/user",
          {
            name,
            email,
            password,
            pic,
          },
          config
        );
        // setMsg(data.message);
        toast({
          title: "Registration Successful",
          status: "success",
          duration: 1000,
          isClosable: true,
          position: "bottom",
        });
        localStorage.setItem("userInfo", JSON.stringify(data));
        setPicLoading(false);
        history.push("/chats");
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setPicLoading(false);
      }
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 1000,
        isClosable: true,
        position: "bottom",
        colorScheme: "gray",
      });
      return;
    }
    console.log(pics);
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "piyushproj");
      fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          console.log(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 1000,
        isClosable: true,
        position: "bottom",
        colorScheme: "gray",
      });
      setPicLoading(false);
      return;
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onClick={handleNameChange}
          onChange={handleNameChange}
          color="teal"
          _placeholder={{ color: "inherit" }}
          onKeyDown={handleKeyPress}
          pattern="^[A-Za-z0-9]{3,16}$"
        />
        <span className="authError">{errorName}</span>
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email Address"
          onClick={handleEmailChange}
          onChange={handleEmailChange}
          color="teal"
          _placeholder={{ color: "inherit" }}
          onKeyDown={handleKeyPress}
        />
        <span className="authError">{errorEmail}</span>
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            onClick={handlePasswordChange}
            onChange={handlePasswordChange}
            color="teal"
            _placeholder={{ color: "inherit" }}
            onKeyDown={handleKeyPress}
            pattern="^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <span className="authError">{errorPassword}</span>
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            onClick={handleConfirmPasswordChange}
            onChange={handleConfirmPasswordChange}
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
        <span className="authError">{errorConfirmPassword}</span>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
          color="teal"
          onKeyDown={handleKeyPress}
        />
      </FormControl>
      {/* {error && <div>{error}</div>}
      {msg && <div>{msg}</div>} */}
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
