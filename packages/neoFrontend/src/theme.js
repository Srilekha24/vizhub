import React from 'react';
import styled, { ThemeProvider } from 'styled-components';

const theme = {
  dark: '#161514',
  attentionGrabber: '#f0353d',
  shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)',
  bannerBackground: 'transparent',
  bannerHeight: 100,
  bannerPadding: 6,
  navbarLogoColor: 'currentcolor',
  navbarItemHeight: 40,
  navbarAvatarBorderColor: 'transparent'
};

export const darkNavbarTheme = {
  ...theme,
  bannerBackground: theme.dark,
  bannerHeight: 40,
  bannerPadding: 20,
  navbarLogoColor: '#ffffff',
  navbarItemHeight: 20,
  navbarAvatarBorderColor: '#ffffff'
};

const Wrapper = styled.div`
  color: ${props => props.theme.dark};
`;

export const Themed = ({ children }) => (
  <ThemeProvider theme={theme}>
    <Wrapper>{children}</Wrapper>
  </ThemeProvider>
);
