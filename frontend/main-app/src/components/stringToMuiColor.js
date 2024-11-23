import { red, pink, purple, indigo, cyan, teal, lightGreen, orange, grey, brown } from '@mui/material/colors';

const MUI_COLORS = [
  cyan[500],
  lightGreen[500],
  red[500],
  purple[500],
  orange[500],
  teal[500],
  pink[500],
  indigo[500],
  grey[500],
  brown[500]
];

// Function to map strings to consistent MUI colors
export function stringToMuiColor(input) {
  const hash = [...input].reduce((acc, char) => char.charCodeAt(0) + acc, 0); // Hash based on input string
  return MUI_COLORS[hash % MUI_COLORS.length]; // Pick a color based on hash
}