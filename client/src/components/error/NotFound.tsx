import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const NotFound: React.FC = () => {
  return (
    <Container>
      <GlitchText data-text="404">404</GlitchText>
      <Message>Oops! Page not found</Message>
      <Description>
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </Description>
      <HomeButton to="/">Go to Homepage</HomeButton>
    </Container>
  );
};

export default NotFound;

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  font-family: "Arial", sans-serif;
  text-align: center;
  padding: 0 20px;
`;

const glitchAnimation = keyframes`
  0% {
    text-shadow: 0.05em 0 0 #00fffc, -0.05em -0.025em 0 #fc00ff,
      0.025em 0.05em 0 #fffc00;
  }
  14% {
    text-shadow: 0.05em 0 0 #00fffc, -0.05em -0.025em 0 #fc00ff,
      0.025em 0.05em 0 #fffc00;
  }
  15% {
    text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.025em 0 #fc00ff,
      -0.05em -0.05em 0 #fffc00;
  }
  49% {
    text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.025em 0 #fc00ff,
      -0.05em -0.05em 0 #fffc00;
  }
  50% {
    text-shadow: 0.025em 0.05em 0 #00fffc, 0.05em 0 0 #fc00ff,
      0 -0.05em 0 #fffc00;
  }
  99% {
    text-shadow: 0.025em 0.05em 0 #00fffc, 0.05em 0 0 #fc00ff,
      0 -0.05em 0 #fffc00;
  }
  100% {
    text-shadow: -0.025em 0 0 #00fffc, -0.025em -0.025em 0 #fc00ff,
      -0.025em -0.05em 0 #fffc00;
  }
`;

const GlitchText = styled.h1`
  font-size: 8rem;
  font-weight: bold;
  position: relative;
  animation: ${glitchAnimation} 2s infinite linear alternate-reverse;

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &::before {
    left: 2px;
    text-shadow: -2px 0 #ff00c1;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 5s infinite linear alternate-reverse;
  }

  &::after {
    left: -2px;
    text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
    animation: glitch-anim2 1s infinite linear alternate-reverse;
  }
`;

const Message = styled.h2`
  font-size: 2rem;
  margin: 20px 0;
`;

const Description = styled.p`
  font-size: 1rem;
  max-width: 600px;
  margin-bottom: 30px;
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
`;

const HomeButton = styled(Link)`
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 25px;
  transition: background-color 0.3s ease;
  animation: ${pulse} 2s infinite;

  &:hover {
    background-color: #45a049;
  }
`;
