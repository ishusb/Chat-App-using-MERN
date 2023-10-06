import React from "react";
import {
  Box,
  Container,
  // Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useHistory } from "react-router";
import Login from "../Component/Authentication/Login";
import Signup from "../Component/Authentication/SignUp";
import ThemeToggle from "../Component/Misc/ThemeToggle";
import "../Component/styles.css";
import { useColorMode } from "@chakra-ui/react";

function Home() {
  const history = useHistory();
  const { colorMode } = useColorMode();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history.push("/chats");
  }, [history]);

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
            Pingg
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
          <Tabs isFitted variant="soft-rounded">
            <TabList mb="1em">
              <Tab color={colorMode === "dark" ? "white" : "gray.800"}>
                Login
              </Tab>
              <Tab color={colorMode === "dark" ? "white" : "gray.800"}>
                Sign Up
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
