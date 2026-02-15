const COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  badge: 'rgb(255, 63, 63)',
  red: 'rgb(235, 80, 80)',
  checkPoint: '#00ffdd',

  light: {
    grey: '#636e72',
    background: '#F5F7FA', // Solid Off-White
    backgroundGrey: '#FFFFFF',
    primary: '#0984e3',
    text: '#2D3436',
    textSecondary: '#636e72',
    icon: '#2D3436',
    button: '#0984e3',
    buttonLight: '#FFFFFF',
    subButton: '#b2bec3',
    checkbox: '#0984e3',
    input: '#F5F7FA',
    error: '#d63031',
    success: '#00b894',
    warning: '#fdcb6e',
    info: '#0984e3',
    border: '#2D3436',
    boxShadow: '0 4px 0 rgba(45, 52, 54, 0.5)',

    foreground: '#2D3436',
    root: '#F5F7FA',
    card: '#FFFFFF',
  },
  dark: {
    grey: '#b2bec3',
    background: '#1e272e', // Solid Deep Navy
    backgroundGrey: '#2f3640',
    primary: '#0984e3',
    text: '#d2dae2',
    textSecondary: '#a4b0be',
    icon: '#d2dae2',
    button: '#0984e3',
    buttonLight: '#2f3640',
    subButton: '#485460',
    checkbox: '#0984e3',
    input: '#1e272e',
    error: '#d63031',
    success: '#00b894',
    warning: '#fdcb6e',
    info: '#0984e3',
    border: '#d2dae2',
    boxShadow: '0 4px 0 rgba(0,0,0,0.5)',

    foreground: '#d2dae2',
    root: '#1e272e',
    card: '#2f3640',
  },
} as const;

export { COLORS };
