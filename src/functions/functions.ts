/**
 * Adds two numbers.
 * @customfunction
 * @param first First number
 * @param second Second number
 * @returns The sum of the two numbers.
 */
export function add(first: number, second: number): number {
  return first + second + 10;
}

/**
 * Multiplies two numbers.
 * @customfunction
 * @param first First number
 * @param second Second number
 * @returns The product of the two numbers.
 */
export function multiply(first: number, second: number): number {
  return first * second;
}

CustomFunctions.associate("ADD", add);
CustomFunctions.associate("MULTIPLY", multiply);
