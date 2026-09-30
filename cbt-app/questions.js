// CBT Questions Bank for Days 1-5
// Topics: reversestring, palindrome, reverseint, maxchar, fizzbuzz

const CBT_QUESTIONS = [
  {
    id: "q1",
    day: 1,
    topic: "String Reversal",
    type: "code",
    title: "Reverse a String (Manual Loop / Accumulator)",
    difficulty: "Easy",
    severity: "Low",
    points: 15,
    prompt: `Write a function \`reverseString(str)\` that takes a string and returns a new string with the reversed order of characters.
    
**Constraint:** Do NOT use the built-in \`Array.prototype.reverse()\` method! Practice using a loop (\`for...of\`) or \`reduce()\`.`,
    starterCode: `function reverseString(str) {
  // Your code here (do not use .reverse())
  
}`,
    tests: [
      { name: "Reverses standard word 'hello'", input: ["hello"], expected: "olleh" },
      { name: "Reverses string with spaces 'apple pie'", input: ["apple pie"], expected: "eip elppa" },
      { name: "Preserves leading & trailing whitespace '  abc  '", input: ["  abc  "], expected: "  cba  " },
      { name: "Handles single character 'z'", input: ["z"], expected: "z" },
      { name: "Handles empty string ''", input: [""], expected: "" }
    ],
    validationCheck: (code) => {
      if (/\.reverse\s*\(/.test(code)) {
        return { allowed: false, reason: "Constraint violated: Do not use .reverse()!" };
      }
      return { allowed: true };
    },
    solution: `function reverseString(str) {
  let reversed = "";
  for (let char of str) {
    reversed = char + reversed;
  }
  return reversed;
}`,
    explanation: "Iterate through each character using `for (let char of str)` and prepend `char + reversed`. Alternatively, use `str.split('').reduce((rev, char) => char + rev, '')`."
  },
  {
    id: "q2",
    day: 1,
    topic: "String Reversal",
    type: "conceptual",
    title: "Array.prototype.reduce for Reversal",
    difficulty: "Medium",
    severity: "Medium",
    points: 10,
    prompt: `In JavaScript, when using \`reduce\` to reverse a string \`str.split('').reduce((rev, char) => ...)\`, what expression should go in place of \`...\` and what should the initial value be?`,
    options: [
      { id: "A", text: "rev + char, with initial value ''" },
      { id: "B", text: "char + rev, with initial value ''" },
      { id: "C", text: "char + rev, with initial value []" },
      { id: "D", text: "rev.concat(char), with initial value ''" }
    ],
    correctAnswer: "B",
    explanation: "`char + rev` prepends the current character to the accumulated reversed string. If you did `rev + char`, you would simply reconstruct the original string."
  },
  {
    id: "q3",
    day: 2,
    topic: "Palindrome",
    type: "code",
    title: "Palindrome Verification",
    difficulty: "Easy",
    severity: "Low",
    points: 15,
    prompt: `Write a function \`palindrome(str)\` that returns \`true\` if the string is a palindrome (reads identically forwards and backwards), and \`false\` otherwise. Include punctuation and whitespace as literal characters.`,
    starterCode: `function palindrome(str) {
  // Return true if str is palindrome, false otherwise
  
}`,
    tests: [
      { name: "Checks 'abba' is a palindrome", input: ["abba"], expected: true },
      { name: "Checks 'abcdefg' is not a palindrome", input: ["abcdefg"], expected: false },
      { name: "Checks '1000000001' with numbers", input: ["1000000001"], expected: true },
      { name: "Checks 'Fish hsif' (case sensitive)", input: ["Fish hsif"], expected: false },
      { name: "Single character 'x'", input: ["x"], expected: true },
      { name: "Palindrome with space ' racecar '", input: [" racecar "], expected: true }
    ],
    solution: `function palindrome(str) {
  const reversed = str.split('').reverse().join('');
  return str === reversed;
}`,
    explanation: "Reversing the string and comparing it with strict equality `str === reversed` runs in O(N) time and is the most clean and readable solution."
  },
  {
    id: "q4",
    day: 2,
    topic: "Palindrome",
    type: "conceptual",
    title: "Double-Work in Array.prototype.every()",
    difficulty: "Medium",
    severity: "Medium",
    points: 10,
    prompt: `If you use \`str.split('').every((char, i) => char === str[str.length - i - 1])\` to check for a palindrome, why is this technically doing twice as much comparison work as strictly necessary?`,
    options: [
      { id: "A", text: "Because .every() creates two copies of the array in memory." },
      { id: "B", text: "Because it compares every character from both ends, continuing past the halfway midpoint." },
      { id: "C", text: "Because string indexing in JavaScript is O(N) rather than O(1)." },
      { id: "D", text: "Because .every() always iterates through the entire array even if a match fails." }
    ],
    correctAnswer: "B",
    explanation: "Comparing from both ends means once index `i` reaches the midpoint `Math.floor(str.length / 2)`, all mirror characters have already been compared. Continuing past the halfway point re-checks the exact same pairs."
  },
  {
    id: "q5",
    day: 3,
    topic: "Integer Reversal",
    type: "code",
    title: "Reverse Integer with Sign Preservation",
    difficulty: "Medium",
    severity: "Medium",
    points: 20,
    prompt: `Write a function \`reverseInt(n)\` that takes an integer and returns an integer that has the reversed ordering of numbers, maintaining the sign (+ or -) and properly dropping leading zeros.
    
**Examples:**
- \`reverseInt(15) === 51\`
- \`reverseInt(-90) === -9\`
- \`reverseInt(500) === 5\``,
    starterCode: `function reverseInt(n) {
  // Your code here
  
}`,
    tests: [
      { name: "Handles 0", input: [0], expected: 0 },
      { name: "Reverses positive number 15 -> 51", input: [15], expected: 51 },
      { name: "Reverses 981 -> 189", input: [981], expected: 189 },
      { name: "Reverses 500 -> 5 (strips leading zeroes)", input: [500], expected: 5 },
      { name: "Reverses negative number -15 -> -51", input: [-15], expected: -51 },
      { name: "Reverses negative number with zero -90 -> -9", input: [-90], expected: -9 }
    ],
    solution: `function reverseInt(n) {
  const reversed = n.toString().split('').reverse().join('');
  return parseInt(reversed) * Math.sign(n);
}`,
    explanation: "Convert `n` to string, reverse it, convert back via `parseInt()` (which turns '005' into 5), and multiply by `Math.sign(n)` to preserve polarity."
  },
  {
    id: "q6",
    day: 3,
    topic: "Integer Reversal",
    type: "conceptual",
    title: "Behavior of Math.sign() & parseInt()",
    difficulty: "Easy",
    severity: "Low",
    points: 10,
    prompt: `What are the return values of \`Math.sign(-42)\`, \`Math.sign(0)\`, and \`parseInt("007")\` respectively?`,
    options: [
      { id: "A", text: "-1, 0, and 7" },
      { id: "B", text: "-42, 0, and 7" },
      { id: "C", text: "-1, 1, and '7'" },
      { id: "D", text: "false, true, and 7" }
    ],
    correctAnswer: "A",
    explanation: "`Math.sign()` returns `1` for positive numbers, `-1` for negative numbers, and `0` for `0`. `parseInt('007')` parses base-10 digits and returns the number `7`."
  },
  {
    id: "q7",
    day: 4,
    topic: "Max Character",
    type: "code",
    title: "Find the Most Frequently Used Character",
    difficulty: "Hard",
    severity: "High",
    points: 20,
    prompt: `Given a string, write a function \`maxChar(str)\` that returns the character that is most commonly used in the string.
    
**Examples:**
- \`maxChar("abcccccccd") === "c"\`
- \`maxChar("apple 1231111") === "1"\``,
    starterCode: `function maxChar(str) {
  // Your code here
  
}`,
    tests: [
      { name: "Finds most frequent letter 'c' in 'abcccccccd'", input: ["abcccccccd"], expected: "c" },
      { name: "Finds most frequent number '1' in 'apple 1231111'", input: ["apple 1231111"], expected: "1" },
      { name: "Handles single character 'a'", input: ["a"], expected: "a" },
      { name: "Handles repeated spaces 'a b c   d'", input: ["a b c   d"], expected: " " },
      { name: "Finds winner in 'abbba'", input: ["abbba"], expected: "b" }
    ],
    solution: `function maxChar(str) {
  const charMap = {};
  let max = 0;
  let maxChar = '';

  for (let char of str) {
    charMap[char] = (charMap[char] || 0) + 1;
  }

  for (let char in charMap) {
    if (charMap[char] > max) {
      max = charMap[char];
      maxChar = char;
    }
  }

  return maxChar;
}`,
    explanation: "Build a frequency table `{ [char]: count }` using `for...of`, then iterate through the object keys using `for...in` to find the character with the maximum count."
  },
  {
    id: "q8",
    day: 4,
    topic: "Max Character",
    type: "conceptual",
    title: "Loop Selection: for...of vs for...in",
    difficulty: "Medium",
    severity: "Medium",
    points: 10,
    prompt: `In JavaScript, what is the key difference between \`for...of\` and \`for...in\` when working with strings and character maps?`,
    options: [
      { id: "A", text: "`for...of` iterates over object properties/keys, while `for...in` iterates over iterable values (like string characters)." },
      { id: "B", text: "`for...of` iterates over iterable values (e.g. characters in a string or array elements), while `for...in` iterates over the enumerable keys/properties of an object." },
      { id: "C", text: "Both loops are identical and can be used interchangeably on any object or string." },
      { id: "D", text: "`for...in` runs faster than `for...of` for string operations." }
    ],
    correctAnswer: "B",
    explanation: "`for...of` is used on iterables (arrays, strings, sets) to access each value directly (`char of str`). `for...in` iterates over the keys/property names of an object (`char in charMap`)."
  },
  {
    id: "q9", day: 1, topic: "String Reversal", type: "conceptual",
    title: "String Immutability and Memory", difficulty: "Easy", severity: "Low", points: 10,
    prompt: "Why can an array in JavaScript be reversed in-place with O(1) auxiliary space, whereas reversing a primitive string always requires allocating a new string (O(n) auxiliary space)?",
    options: [
      { id: "A", text: "Arrays are allocated on the call stack, while strings are placed on disk." },
      { id: "B", text: "Primitive strings in JavaScript are immutable; individual character indices cannot be reassigned in-place." },
      { id: "C", text: "JavaScript engines automatically clone strings whenever accessed by loops." },
      { id: "D", text: "The garbage collector prevents mutating any variable with length greater than 1." }
    ],
    correctAnswer: "B",
    explanation: "Strings in JavaScript are immutable primitives (e.g. `str[0] = 'x'` has no effect). Any reversal must construct and allocate a brand new string in memory, taking O(n) auxiliary space."
  },
  {
    id: "q10", day: 1, topic: "String Reversal", type: "conceptual",
    title: "Strings Are Not Mutated", difficulty: "Easy", severity: "Low", points: 10,
    prompt: "When a reversal function returns a reversed string, what happens to the original string argument?",
    options: [{ id: "A", text: "It is changed in place." }, { id: "B", text: "It becomes an array." }, { id: "C", text: "It stays unchanged because strings are immutable." }, { id: "D", text: "It is deleted." }],
    correctAnswer: "C", explanation: "JavaScript strings are immutable; reversal code returns a new string."
  },
  {
    id: "q11", day: 2, topic: "Palindrome", type: "conceptual",
    title: "Single-Character Palindrome", difficulty: "Easy", severity: "Low", points: 10,
    prompt: "Is the string `x` a palindrome?",
    options: [{ id: "A", text: "Yes, it reads the same forwards and backwards." }, { id: "B", text: "No, it needs at least two characters." }, { id: "C", text: "Only if it is uppercase." }, { id: "D", text: "Only if it is a number." }],
    correctAnswer: "A", explanation: "A single character has the same order in either direction."
  },
  {
    id: "q12", day: 2, topic: "Palindrome", type: "conceptual",
    title: "Case-Sensitive Comparison", difficulty: "Medium", severity: "Medium", points: 10,
    prompt: "With the app's case-sensitive palindrome rule, is `Level` a palindrome?",
    options: [{ id: "A", text: "Yes" }, { id: "B", text: "No, because `L` and `l` are different characters." }, { id: "C", text: "Only in a browser." }, { id: "D", text: "Only if spaces are removed." }],
    correctAnswer: "B", explanation: "Strict string comparison treats uppercase and lowercase characters as different."
  },
  {
    id: "q13", day: 3, topic: "Integer Reversal", type: "conceptual",
    title: "Trailing Zeroes After Reversal", difficulty: "Medium", severity: "Medium", points: 10,
    prompt: "What should `reverseInt(1200)` return?",
    options: [{ id: "A", text: "0021" }, { id: "B", text: "21" }, { id: "C", text: "1200" }, { id: "D", text: "-21" }],
    correctAnswer: "B", explanation: "Leading zeroes are dropped when the reversed value is converted back to a number."
  },
  {
    id: "q14", day: 4, topic: "Max Character", type: "conceptual",
    title: "Frequency Map Purpose", difficulty: "Medium", severity: "Medium", points: 10,
    prompt: "Why does `maxChar` use an object such as `charMap`?",
    options: [{ id: "A", text: "To sort the string alphabetically." }, { id: "B", text: "To count how many times each character appears." }, { id: "C", text: "To remove spaces." }, { id: "D", text: "To reverse the string." }],
    correctAnswer: "B", explanation: "The map stores each character as a key and its frequency as the value."
  },
  {
    id: "q15", day: 1, topic: "String Reversal", type: "conceptual",
    title: "Reversal Time Complexity", difficulty: "Hard", severity: "High", points: 15,
    prompt: "A loop visits every character once to reverse a string of length `n`. What is its time complexity?",
    options: [{ id: "A", text: "O(1)" }, { id: "B", text: "O(log n)" }, { id: "C", text: "O(n)" }, { id: "D", text: "O(n²)" }],
    correctAnswer: "C", explanation: "Each character is processed once, so the work grows linearly with the input length."
  },
  {
    id: "q16", day: 2, topic: "Palindrome", type: "conceptual",
    title: "Mirror Index Calculation", difficulty: "Hard", severity: "High", points: 15,
    prompt: "For a string with length `n`, which expression gives the mirror index for position `i`?",
    options: [{ id: "A", text: "n + i" }, { id: "B", text: "n - i - 1" }, { id: "C", text: "i - n" }, { id: "D", text: "n * i" }],
    correctAnswer: "B", explanation: "Index `0` mirrors `n - 1`, index `1` mirrors `n - 2`, and so on."
  },
  {
    id: "q17", day: 3, topic: "Integer Reversal", type: "conceptual",
    title: "Sign Preservation", difficulty: "Hard", severity: "High", points: 15,
    prompt: "Which expression correctly keeps the sign when reversing an integer?",
    options: [{ id: "A", text: "parseInt(reversed) + Math.sign(n)" }, { id: "B", text: "parseInt(reversed) * Math.sign(n)" }, { id: "C", text: "Math.sign(reversed)" }, { id: "D", text: "n * reversed" }],
    correctAnswer: "B", explanation: "Multiplying the reversed magnitude by `Math.sign(n)` restores its positive or negative sign."
  },
  {
    id: "q18", day: 4, topic: "Max Character", type: "conceptual",
    title: "Finding the Current Maximum", difficulty: "Hard", severity: "High", points: 15,
    prompt: "While reading a frequency map, when should `maxChar` be updated?",
    options: [{ id: "A", text: "Whenever a character count is greater than the current maximum." }, { id: "B", text: "Only on the first character." }, { id: "C", text: "Whenever a space appears." }, { id: "D", text: "After reversing the map." }],
    correctAnswer: "A", explanation: "Updating only when a larger count is found leaves the most frequent character as the result."
  },
  {
    id: "q19", day: 4, topic: "Max Character", type: "conceptual",
    title: "Tie-Breaking in Character Map", difficulty: "Medium", severity: "Medium", points: 10,
    prompt: "In the standard `maxChar` algorithm using `if (charMap[char] > max)`, which character is returned if there is a tie between two characters with the same highest frequency (e.g. `'aabb'`)?",
    options: [
      { id: "A", text: "The character encountered first during object key iteration, because `>` is strictly greater than." },
      { id: "B", text: "The character encountered last during object key iteration." },
      { id: "C", text: "JavaScript throws a runtime error because ties must be explicitly handled." },
      { id: "D", text: "Both characters concatenated together as a string." }
    ],
    correctAnswer: "A",
    explanation: "Because the comparison condition `charMap[char] > max` uses strict inequality, when a second character ties with the current maximum count (e.g. 2 > 2), the condition evaluates to `false`. Therefore, the first character to reach that maximum count is retained."
  },
  {
    id: "q20", day: 3, topic: "Integer Reversal", type: "conceptual",
    title: "32-Bit Signed Integer Overflow (LeetCode #7)", difficulty: "Hard", severity: "High", points: 15,
    prompt: "In technical interviews (such as LeetCode 7: Reverse Integer), what standard edge case must you guard against when reversing large numbers on a system with 32-bit signed integers (range: [-2³¹, 2³¹ - 1])?",
    options: [
      { id: "A", text: "Numbers with trailing zeroes will crash the execution stack." },
      { id: "B", text: "Reversing large integers (e.g. `1534236469`) can overflow the 32-bit signed integer boundary, requiring the function to return `0`." },
      { id: "C", text: "Negative integers cannot be converted to strings in 32-bit mode." },
      { id: "D", text: "`Math.sign()` returns `NaN` for numbers with more than 9 digits." }
    ],
    correctAnswer: "B",
    explanation: "32-bit signed integers range from -2,147,483,648 to 2,147,483,647. Reversing a valid input like 1,534,236,469 yields 9,646,324,351, which overflows 32 bits. The standard interview contract requires checking for this overflow and returning 0."
  },
  {
    id: "q21", day: 4, topic: "Max Character", type: "conceptual",
    title: "Character Map Initialization", difficulty: "Easy", severity: "Low", points: 10,
    prompt: "When building a character map object `charMap`, what common idiom is used in JavaScript to increment an existing count or initialize it to 1?",
    options: [
      { id: "A", text: "charMap[char] = (charMap[char] || 0) + 1;" },
      { id: "B", text: "charMap[char] += null;" },
      { id: "C", text: "charMap.push(char);" },
      { id: "D", text: "charMap[char] = charMap[char] ? 0 : 1;" }
    ],
    correctAnswer: "A",
    explanation: "`charMap[char] || 0` falls back to 0 if `charMap[char]` is `undefined`, allowing clean `+ 1` incrementation without explicit if-else statements."
  },
  {
    id: "q22",
    day: 5,
    topic: "FizzBuzz",
    type: "conceptual",
    title: "The Modulo Operator in JavaScript",
    difficulty: "Easy",
    severity: "Low",
    points: 10,
    prompt: "In JavaScript, what does the expression `n % 3 === 0` evaluate to, and what does it mean mathematically?",
    options: [
      { id: "A", text: "It returns true if n divided by 3 has a remainder of 0, meaning n is an exact multiple of 3." },
      { id: "B", text: "It returns true if n is strictly greater than 3." },
      { id: "C", text: "It divides n by 3 and rounds down to the nearest integer." },
      { id: "D", text: "It checks whether n has exactly 3 digits." }
    ],
    correctAnswer: "A",
    explanation: "The `%` (remainder/modulo) operator returns the integer remainder of division. When `n % 3 === 0`, the remainder is zero, confirming that `n` is an exact multiple of 3."
  },
  {
    id: "q23",
    day: 5,
    topic: "FizzBuzz",
    type: "code",
    title: "FizzBuzz Array Generator (LeetCode #412)",
    difficulty: "Easy",
    severity: "Low",
    points: 15,
    prompt: `Write a function \`fizzBuzz(n)\` that returns an array of string representations of numbers from \`1\` to \`n\`.
- For multiples of 3, output \`"fizz"\`
- For multiples of 5, output \`"buzz"\`
- For multiples of both 3 and 5, output \`"fizzbuzz"\`
- Otherwise, output the number as a string (e.g., \`"1"\`, \`"2"\`)

**Examples:**
- \`fizzBuzz(5)\` returns \`["1", "2", "fizz", "4", "buzz"]\``,
    starterCode: `function fizzBuzz(n) {
  // Return an array of strings from 1 to n
  
}`,
    tests: [
      { name: "Handles n = 1", input: [1], expected: ["1"] },
      { name: "Handles n = 5 (fizz and buzz)", input: [5], expected: ["1", "2", "fizz", "4", "buzz"] },
      { name: "Handles n = 15 (fizzbuzz on 15)", input: [15], expected: ["1", "2", "fizz", "4", "buzz", "fizz", "7", "8", "fizz", "buzz", "11", "fizz", "13", "14", "fizzbuzz"] }
    ],
    solution: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      result.push("fizzbuzz");
    } else if (i % 3 === 0) {
      result.push("fizz");
    } else if (i % 5 === 0) {
      result.push("buzz");
    } else {
      result.push(i.toString());
    }
  }
  return result;
}`,
    explanation: "Iterate from 1 up to `n`. Always check the combined condition `i % 3 === 0 && i % 5 === 0` (or `i % 15 === 0`) first before testing individual divisors."
  },
  {
    id: "q24",
    day: 5,
    topic: "FizzBuzz",
    type: "conceptual",
    title: "Fall-through Bug in Conditional Flow",
    difficulty: "Medium",
    severity: "Medium",
    points: 10,
    prompt: `Consider the following implementation of FizzBuzz:
\`\`\`javascript
for (let i = 1; i <= n; i++) {
  if (i % 3 === 0) console.log('fizz');
  else if (i % 5 === 0) console.log('buzz');
  else if (i % 15 === 0) console.log('fizzbuzz');
  else console.log(i);
}
\`\`\`
What will be output when \`i = 15\`, and why?`,
    options: [
      { id: "A", text: "'fizz' is printed, because 15 % 3 === 0 evaluates to true first and prevents reaching the 15 check." },
      { id: "B", text: "'fizzbuzz' is printed, because JavaScript prioritizes the most restrictive condition." },
      { id: "C", text: "'fizz' and 'buzz' and 'fizzbuzz' are all printed." },
      { id: "D", text: "15 is printed because conflicting branches cancel each other out." }
    ],
    correctAnswer: "A",
    explanation: "In an `if ... else if` chain, execution stops at the FIRST branch that evaluates to true. Because 15 is divisible by 3, `i % 3 === 0` triggers and logs `'fizz'`, skipping the `i % 15 === 0` branch entirely."
  },
  {
    id: "q25",
    day: 5,
    topic: "FizzBuzz",
    type: "conceptual",
    title: "String Concatenation & Falsy Fallback Pattern",
    difficulty: "Medium",
    severity: "Medium",
    points: 15,
    prompt: `Another popular pattern to avoid checking \`i % 15 === 0\` is string concatenation:
\`\`\`javascript
let str = '';
if (i % 3 === 0) str += 'fizz';
if (i % 5 === 0) str += 'buzz';
return str || i.toString();
\`\`\`
Why does \`return str || i.toString()\` work when \`i\` is neither a multiple of 3 nor 5?`,
    options: [
      { id: "A", text: "An empty string '' is falsy in JavaScript, so the logical OR (||) evaluates and returns the right-hand operand." },
      { id: "B", text: "The || operator converts numbers to strings automatically." },
      { id: "C", text: "JavaScript strings have a default truthiness fallback of 0." },
      { id: "D", text: "It only works if i is an even number." }
    ],
    correctAnswer: "A",
    explanation: "When `i` is not divisible by 3 or 5, `str` remains `''`. In JavaScript, `''` is falsy, so `str || i.toString()` short-circuits to `i.toString()`, cleanly returning the number without an explicit else branch."
  },
  {
    id: "q26",
    day: 5,
    topic: "FizzBuzz",
    type: "conceptual",
    title: "Extensibility & Open-Closed Principle (The K-Divisors Problem)",
    difficulty: "Hard",
    severity: "High",
    points: 15,
    prompt: "In senior engineering interviews, interviewers often extend FizzBuzz: 'What if we have 5 additional divisors: 7 -> jazz, 11 -> fuzz, 13 -> bizz?' Writing chained `if-else` branches creates combinatorial $O(2^k)$ conditions. What is the cleanest, extensible pattern to solve this in $O(k)$ per number?",
    options: [
      { id: "A", text: "Use a mapping list of [{ div: 3, word: 'fizz' }, ...] and iterate over the rules, concatenating matched words." },
      { id: "B", text: "Use nested ternary operators." },
      { id: "C", text: "Pre-calculate the Least Common Multiple (LCM) of all subsets of divisors." },
      { id: "D", text: "Use bitwise shift operators to simulate parallel divisions." }
    ],
    correctAnswer: "A",
    explanation: "Storing divisors and words in a data structure (e.g. array of rule objects or map) decouples the logic from hardcoded divisors. You simply iterate over the rules and append matching words, keeping the code $O(k)$ and open for extension without modifying conditional trees."
  },
  {
    id: "q27",
    day: 5,
    topic: "FizzBuzz",
    type: "code",
    title: "Dynamic Extensible FizzBuzz Engine",
    difficulty: "Hard",
    severity: "High",
    points: 20,
    prompt: `Implement a flexible mapping function \`customFizzBuzz(n, rules)\`:
- \`rules\` is an array of objects: \`[{ div: 3, word: "fizz" }, { div: 5, word: "buzz" }]\`
- For each integer from \`1\` to \`n\`, check the rules in the order given.
- If the integer is divisible by multiple rule divisors, concatenate their corresponding words (e.g., \`"fizzbuzz"\` or \`"fizzjazz"\`).
- If it is divisible by none of the rule divisors, output the number as a string (e.g. \`"1"\`).
- Return an array of these strings from \`1\` to \`n\`.

**Example:**
\`customFizzBuzz(15, [{ div: 3, word: "fizz" }, { div: 5, word: "buzz" }])\`
returns \`["1", "2", "fizz", "4", "buzz", "fizz", "7", "8", "fizz", "buzz", "11", "fizz", "13", "14", "fizzbuzz"]\``,
    starterCode: `function customFizzBuzz(n, rules) {
  // Your code here
  
}`,
    tests: [
      {
        name: "Standard 3 and 5 up to 6",
        input: [6, [{ div: 3, word: "fizz" }, { div: 5, word: "buzz" }]],
        expected: ["1", "2", "fizz", "4", "buzz", "fizz"]
      },
      {
        name: "Three rules with 3, 5, 7 up to 15",
        input: [15, [{ div: 3, word: "fizz" }, { div: 5, word: "buzz" }, { div: 7, word: "jazz" }]],
        expected: ["1", "2", "fizz", "4", "buzz", "fizz", "jazz", "8", "fizz", "buzz", "11", "fizz", "13", "jazz", "fizzbuzz"]
      },
      {
        name: "Combines 3 and 7 on 21 ('fizzjazz')",
        input: [21, [{ div: 3, word: "fizz" }, { div: 5, word: "buzz" }, { div: 7, word: "jazz" }]],
        expected: ["1", "2", "fizz", "4", "buzz", "fizz", "jazz", "8", "fizz", "buzz", "11", "fizz", "13", "jazz", "fizzbuzz", "16", "17", "fizz", "19", "buzz", "fizzjazz"]
      }
    ],
    solution: `function customFizzBuzz(n, rules) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    let str = "";
    for (let rule of rules) {
      if (i % rule.div === 0) {
        str += rule.word;
      }
    }
    result.push(str || i.toString());
  }
  return result;
}`,
    explanation: "Iterate from 1 to `n`. For each number, iterate through `rules` and accumulate `rule.word` whenever `i % rule.div === 0`. If `str` is empty, fallback to `i.toString()` using `str || i.toString()`."
  },
  {
    id: "q28",
    day: 6,
    topic: "Array Chunk",
    type: "conceptual",
    title: "Recognising the Final Partial Chunk",
    difficulty: "Easy",
    severity: "Low",
    points: 10,
    prompt: "What should `chunk([1, 2, 3, 4, 5], 2)` return?",
    options: [
      { id: "A", text: "`[[1, 2], [3, 4]]`" },
      { id: "B", text: "`[[1, 2], [3, 4], [5]]`" },
      { id: "C", text: "`[[1, 2, 3], [4, 5]]`" },
      { id: "D", text: "`[1, 2, 3, 4, 5]`" }
    ],
    correctAnswer: "B",
    explanation: "A chunk can be shorter than `size` at the end. The last item still belongs in its own final chunk."
  },
  {
    id: "q29",
    day: 6,
    topic: "Array Chunk",
    type: "code",
    title: "Split an Array into Fixed-Size Chunks",
    difficulty: "Easy",
    severity: "Low",
    points: 15,
    prompt: "Write `chunk(array, size)` to return a new array of sub-arrays, where every sub-array has up to `size` items. Keep a final partial chunk if needed.",
    starterCode: `function chunk(array, size) {
  // Your code here
}`,
    tests: [
      { name: "Splits five items into chunks of two", input: [[1, 2, 3, 4, 5], 2], expected: [[1, 2], [3, 4], [5]] },
      { name: "Handles a chunk size of one", input: [["a", "b", "c"], 1], expected: [["a"], ["b"], ["c"]] },
      { name: "Handles a chunk size larger than the array", input: [[1, 2, 3], 10], expected: [[1, 2, 3]] }
    ],
    solution: `function chunk(array, size) {
  const result = [];
  for (let index = 0; index < array.length; index += size) {
    result.push(array.slice(index, index + size));
  }
  return result;
}`,
    explanation: "Advance the index by `size` and use `slice(index, index + size)` to create each new chunk."
  },
  {
    id: "q30",
    day: 6,
    topic: "Array Chunk",
    type: "conceptual",
    title: "How Many Chunks Are Needed?",
    difficulty: "Medium",
    severity: "Medium",
    points: 10,
    prompt: "If an array has `8` items and each chunk holds `3` items, which expression correctly calculates the number of chunks, including the final partial chunk?",
    options: [
      { id: "A", text: "`Math.floor(array.length / size)`" },
      { id: "B", text: "`Math.ceil(array.length / size)`" },
      { id: "C", text: "`array.length * size`" },
      { id: "D", text: "`array.length - size`" }
    ],
    correctAnswer: "B",
    explanation: "`8 / 3` is about `2.67`; rounding up gives `3`, which includes the chunk containing the final two items."
  },
  {
    id: "q31",
    day: 6,
    topic: "Array Chunk",
    type: "code",
    title: "Chunk Using a Chunk Counter",
    difficulty: "Medium",
    severity: "Medium",
    points: 15,
    prompt: "Write `chunkByCount(array, size)`. Use a chunk counter with `Math.ceil(array.length / size)` and return a new nested array. Do not modify the input array.",
    starterCode: `function chunkByCount(array, size) {
  // Your code here
}`,
    tests: [
      { name: "Creates three chunks from eight numbers", input: [[1, 2, 3, 4, 5, 6, 7, 8], 3], expected: [[1, 2, 3], [4, 5, 6], [7, 8]] },
      { name: "Keeps an exact final chunk", input: [[1, 2, 3, 4], 2], expected: [[1, 2], [3, 4]] },
      { name: "Returns an empty array for empty input", input: [[], 3], expected: [] }
    ],
    solution: `function chunkByCount(array, size) {
  const result = [];
  const numberOfChunks = Math.ceil(array.length / size);
  for (let i = 0; i < numberOfChunks; i++) {
    result.push(array.slice(i * size, size * (i + 1)));
  }
  return result;
}`,
    explanation: "Here `i` represents the chunk number, so multiply it by `size` to calculate the start and end index for that chunk."
  },
  {
    id: "q32",
    day: 6,
    topic: "Array Chunk",
    type: "conceptual",
    title: "Avoiding Input Mutation",
    difficulty: "Hard",
    severity: "High",
    points: 15,
    prompt: "In an interview, why is `slice()` usually safer than repeatedly using `splice()` on the source array for chunking?",
    options: [
      { id: "A", text: "`slice()` returns a new array section without changing the source; `splice()` changes the source array." },
      { id: "B", text: "`slice()` can only be used with numbers, while `splice()` cannot." },
      { id: "C", text: "`splice()` always returns an empty array." },
      { id: "D", text: "They are identical except for spelling." }
    ],
    correctAnswer: "A",
    explanation: "Mutation can surprise callers and makes indexing harder as items are removed. `slice()` leaves the original array unchanged."
  },
  {
    id: "q33",
    day: 6,
    topic: "Array Chunk",
    type: "code",
    title: "Interview Chunk: Preserve the Source Array",
    difficulty: "Hard",
    severity: "High",
    points: 20,
    prompt: "Implement `chunkSafe(array, size)` for an interview. Return chunks without mutating `array`, and support arrays containing strings or objects.",
    starterCode: `function chunkSafe(array, size) {
  // Your code here
}`,
    tests: [
      { name: "Chunks strings without changing their order", input: [["a", "b", "c", "d"], 3], expected: [["a", "b", "c"], ["d"]] },
      { name: "Chunks object values", input: [[{ id: 1 }, { id: 2 }, { id: 3 }], 2], expected: [[{ id: 1 }, { id: 2 }], [{ id: 3 }]] },
      { name: "Handles an array evenly divisible by size", input: [[10, 20, 30, 40, 50, 60], 3], expected: [[10, 20, 30], [40, 50, 60]] }
    ],
    solution: `function chunkSafe(array, size) {
  const chunks = [];
  for (let start = 0; start < array.length; start += size) {
    chunks.push(array.slice(start, start + size));
  }
  return chunks;
}`,
    explanation: "The loop advances by a full chunk each time. `slice()` creates each chunk while preserving the original source array."
  }
];

// Question sets are derived from one bank.
const CBT_QUESTION_SETS = {
  All: CBT_QUESTIONS,
  Low: CBT_QUESTIONS.filter((question) => question.severity === "Low"),
  Medium: CBT_QUESTIONS.filter((question) => question.severity === "Medium"),
  High: CBT_QUESTIONS.filter((question) => question.severity === "High")
};

// Provide helper to get questions or reset
if (typeof window !== "undefined") {
  window.CBT_QUESTIONS = CBT_QUESTIONS;
  window.CBT_QUESTION_SETS = CBT_QUESTION_SETS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CBT_QUESTIONS, CBT_QUESTION_SETS };
}
