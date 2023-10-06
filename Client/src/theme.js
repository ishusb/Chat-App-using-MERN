import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg:
          props.colorMode === "dark"
            ? "linear-gradient(#243b55, #141e30 )"
            : "linear-gradient(#ffffff, #e4f9fa  , #f1dcf9)",
        color: props.colorMode === "dark" ? "white" : "gray.800",
      },
    }),
  },
});

export default theme;
