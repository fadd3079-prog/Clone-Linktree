import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
body.dark-mode {
  --img: invert(1);
  --avatar-shadow: rgba(0,0,0,.45);
}

body.light-mode {
  --img: invert(0);
  --avatar-shadow: rgba(0,0,0,.08);
} 

* {
  margin: 0;
  padding: 0;
  border: 0;
  list-style: none;
  text-decoration: none;
  box-sizing: border-box;
  line-height: normal;
  -webkit-tap-highlight-color: transparent;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: inherit;
}

.main {
  min-height: 100vh;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.nft-clipped {
  clip-path: url(#hex);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.oval-clipped {
  clip-path: url(#oval);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
`;

export default GlobalStyle;