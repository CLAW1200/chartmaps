import crypto from "crypto";

/**
 * Hash a string into a normalized float [0, 1].
 */
const stringToNumber = (str: string): number => {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  const number = parseInt(hash.substring(0, 8), 16); // Use a portion of the hash
  return number / 0xffffffff; // Normalize to [0, 1]
};

/**
 * Generate a hex color based on an array of strings.
 */
export const generateColor = (strings: string[]): string => {
  // Convert each string to a number with positional influence
  const numbers = strings.map((str, index) => {
    const baseHash = stringToNumber(str);
    const positionHash = stringToNumber(index.toString());
    // Add more variation by using multiplication instead of addition
    return (baseHash * (positionHash + 1.5)) % 1;
  });

  // Use prime numbers for weight distribution to reduce patterns
  const aggregatedValue = numbers.reduce(
    (sum, num, index) => sum + num * (prime(index + 1)),
    0
  ) / numbers.reduce((sum, _, index) => sum + prime(index + 1), 0);

  // Convert to HSL for better color distribution
  const hue = (aggregatedValue * 360) % 360;
  const saturation = 65 + (aggregatedValue * 25); // 65-90% saturation
  const lightness = 45 + (stringToNumber(strings.join()) * 20); // 45-65% lightness

  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness / 100 - c / 2;

  let r, g, b;
  if (hue < 60) { [r, g, b] = [c, x, 0]; }
  else if (hue < 120) { [r, g, b] = [x, c, 0]; }
  else if (hue < 180) { [r, g, b] = [0, c, x]; }
  else if (hue < 240) { [r, g, b] = [0, x, c]; }
  else if (hue < 300) { [r, g, b] = [x, 0, c]; }
  else { [r, g, b] = [c, 0, x]; }

  // Convert to RGB values
  const rgb = [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];

  // Return the hex color
  return `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
};

// Helper function to generate nth prime number
const prime = (n: number): number => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  return primes[Math.min(n - 1, primes.length - 1)];
};
