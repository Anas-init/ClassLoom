import { red, pink, purple, indigo, cyan, teal, lightGreen, orange, grey, brown } from '@mui/material/colors';

const STR = 500;

const MUI_COLORS = [
  cyan[STR],
  lightGreen[STR],
  red[STR],
  purple[STR],
  orange[STR],
  teal[STR],
  pink[STR],
  indigo[STR],
  grey[STR],
  brown[STR]
];

// Function to map strings to consistent MUI colors
export function stringToMuiColor(input) {
  const hash = [...input].reduce((acc, char) => char.charCodeAt(0) + acc, 0); // Hash based on input string
  return MUI_COLORS[hash % MUI_COLORS.length]; // Pick a color based on hash
}