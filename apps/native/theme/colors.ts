const COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  badge: 'rgb(255, 63, 63)',
  red: 'rgb(235, 80, 80)',

  light: {
    grey: 'rgb(24, 28, 35)',
    background: 'rgb(249, 249, 255)',
    backgroundGrey: 'rgb(249, 249, 255)',
    primary: 'rgb(0, 112, 233)',
    text: 'rgb(0, 0, 0)',
    icon: 'rgb(0, 0, 0)',
    button: 'rgb(78, 19, 245)',
    buttonLight: 'rgb(213, 199, 255)',
    subButton: 'rgb(57, 56, 61)',
    checkbox: 'rgb(78, 19, 245)',
    input: 'rgb(249, 249, 255)',
    error: 'rgb(253, 76, 76)',
    boxShadow: '0 8px 20px rgba(0,0,0,.5),0 0 1px rgba(0,0,0,.7)',

    foreground: 'rgb(0, 0, 0)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
  },
  dark: {
    grey: 'rgb(155, 153, 167)',
    background: 'rgb(16, 16, 17)',
    backgroundGrey: 'rgb(36, 36, 39)',
    primary: 'rgb(3, 133, 255)',
    text: 'rgb(223, 223, 223)',
    icon: 'rgb(255, 255, 255)',
    button: 'rgb(78, 19, 245)',
    buttonLight: 'rgb(213, 199, 255)',
    subButton: 'rgb(57, 56, 61)',
    checkbox: 'rgb(78, 19, 245)',
    input: 'rgb(61, 61, 64)',
    error: 'rgb(253, 76, 76)',
    boxShadow: '0px 0 5px 0px rgba(0,0,0,0.15)',

    foreground: 'rgb(255, 255, 255)',
    root: 'rgb(0, 0, 0)',
    card: 'rgb(16, 19, 27)',
  },
} as const;

export { COLORS };
