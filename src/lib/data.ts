import { parse } from "yaml";
import { link } from "./util.js";

export const codepage =
    "\u03bb\u019b\u00ac\u2227\u27d1\u2228\u27c7\u00f7\u00d7\u00ab\n\u00bb\u00b0\u2022\u00df\u2020\u20ac\u00bd\u2206\u00f8\u2194\u00a2\u2310\u00e6\u0280\u0281\u027e\u027d\u00de\u0188\u221e\u00a8 !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]`^_abcdefghijklmnopqrstuvwxyz{|}~\u2191\u2193\u2234\u2235\u203a\u2039\u2237\u00a4\u00f0\u2192\u2190\u03b2\u03c4\u0227\u1e03\u010b\u1e0b\u0117\u1e1f\u0121\u1e23\u1e2d\u0140\u1e41\u1e45\u022f\u1e57\u1e59\u1e61\u1e6b\u1e87\u1e8b\u1e8f\u017c\u221a\u27e8\u27e9\u201b\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u00b6\u204b\u00a7\u03b5\u00a1\u2211\u00a6\u2248\u00b5\u0226\u1e02\u010a\u1e0a\u0116\u1e1e\u0120\u1e22\u0130\u013f\u1e40\u1e44\u022e\u1e56\u1e58\u1e60\u1e6a\u1e86\u1e8a\u1e8e\u017b\u208c\u208d\u2070\u00b9\u00b2\u2207\u2308\u230a\u00af\u00b1\u20b4\u2026\u25a1\u21b3\u21b2\u22cf\u22ce\ua60d\ua71d\u2105\u2264\u2265\u2260\u207c\u0192\u0256\u222a\u2229\u228d\u00a3\u00a5\u21e7\u21e9\u01cd\u01ce\u01cf\u01d0\u01d1\u01d2\u01d3\u01d4\u207d\u2021\u226c\u207a\u21b5\u215b\u00bc\u00be\u03a0\u201e\u201f";

export const elements = [
    { element: "λ", name: "Lambda", arity: "*", description: "Open a lambda - λ...;" },
    { element: "ƛ", name: "Lambda Map", arity: 1, description: "Open a mapping lambda - ƛ" },
    {
        element: "¬",
        name: "Logical Not",
        arity: 1,
        description: "Return the inverse (negation) of the truthiness of an item.",
        overloads: { num: "not a", str: 'a != "" | len(a) > 0', lst: "a != [] | len(a) > 0" },
        vectorise: false,
        tests: ["[1] : 0", "[0] : 1", '["abc"] : 0', '[""] : 1', "[[1,2,3]] : 0", "[[]] : 1"]
    },
    {
        element: "∧",
        name: "Logical And",
        arity: 2,
        description:
            "Returns the first truthy argument if both are truthy, otherwise returns the first falsy argument.",
        overloads: { "any-any": "a and b" },
        vectorise: false,
        tests: ["[0, 0] : 0", '["", 1] : ""', "[[1,2,3], 0] : 0", "[2, 1] : 2"]
    },
    {
        element: "⟑",
        name: "Apply Lambda",
        arity: 1,
        description:
            "Like a mapping lambda, but the results are evaluated immediately, instead of being lazily evaluated"
    },
    {
        element: "∨",
        name: "Logical Or",
        arity: 2,
        description: "Returns the first truthy argument, otherwise the first falsy argument.",
        overloads: { "any-any": "a or b" },
        vectorise: false,
        tests: ["[0, 0] : 0", '["", 1] : 1', "[[1,2,3], 0] : [1,2,3]", "[2, 1] : 1"]
    },
    {
        element: "⟇",
        name: "Remove at Index",
        arity: 2,
        description: "Returns every item in a list except the item at the given index.",
        overloads: { "any-num": "Remove item b of a", "num-any": "Remove item a of b" },
        vectorise: false,
        tests: [
            "[[1,2,3], 0] : [2,3]",
            "[[1,2,3], 1] : [1,3]",
            "[3, [1,2,3,1]] : [1,2,3]",
            "[0, [1,2,3,1]] : [2,3,1]"
        ]
    },
    {
        element: "÷",
        name: "Item Split",
        arity: 1,
        description: "Pushes each item of the top of the stack onto the stack.",
        overloads: {
            num: "Push each digit of a",
            str: "Push each character of a",
            lst: "Push each item of a"
        },
        vectorise: false,
        tests: ["[123456] : 6", '["abc"] : "c"', "[[1,2,3]] : 3", '[42, ""] : 42', "[42, []] : 42"]
    },
    {
        element: "×",
        name: "Asterisk Literal",
        arity: 0,
        description: 'the string "*" (asterisk)',
        vectorise: false,
        tests: ['[] : "*"']
    },
    {
        element: "«",
        name: "Base Compressed String",
        arity: 0,
        description: "Open/close a bijective base-255 compressed string - «...«"
    },
    { element: "␤", name: "Newline", arity: "NA", description: "NOP" },
    {
        element: "»",
        name: "Base Compressed Number",
        arity: 0,
        description: "Open/close a bijective base-255 compressed number - »...»"
    },
    {
        element: "°",
        name: "Complex Number Separator",
        description: "Separates the real and imaginary parts of a complex number",
        arity: "NA"
    },
    {
        element: "•",
        name: "MultiCommand",
        arity: 2,
        description: "Logarithm / Repeat Character / Capitalisation transfer",
        overloads: {
            "num-num": "log_a(b)",
            "num-str": "[char * a for char in b]",
            "str-num": "[char * b for char in a]",
            "str-str": "a.with_capitalisation_of(b)",
            "lst-lst": "a molded  to  the shape of b"
        },
        vectorise: true,
        tests: [
            "[8, 2] : 3.0",
            '["abcde", 4] : "aaaabbbbccccddddeeee"',
            '["abcde", "FgHIj"] : "AbCDe"',
            "[[1,2,3,4,5,6,7], [[8, 9], 10, 11, 12, [13, 14]]] : [[1, 2], 3, 4, 5, [6, 7]]",
            "[[1,2,3], [[4], [], [6]]] : [[1], [], [2]]",
            "[[1,2,3], [4,5,6,7,8,9,10]] : [1,2,3,1,2,3,1]"
        ]
    },
    {
        modifier: "ß",
        name: "Conditional Execute",
        arity: "1 + *",
        usage: "ß<element>",
        description: "Executes element A if the top of the stack is truthy"
    },
    {
        element: "†",
        name: "Function Call",
        arity: 1,
        description:
            "Calls a function / executes as python / number of distinct prime factors / vectorised not",
        overloads: {
            fun: "a()",
            num: "len(prime_factors(a))",
            str: "exec as python",
            lst: "vectorised not"
        },
        vectorise: false,
        tests: ["[12] : 2", "[[1, 0, 1]] : [0, 1, 0]"]
    },
    {
        element: "€",
        name: "Split On / Fill By Coordinates",
        arity: 2,
        description:
            "Split a on b (works on lists and numbers as well) / Fill a matrix by calling a function with the lists of coordinates in the matrix.",
        overloads: {
            "any-any": "a split on b",
            "any-fun":
                "for each value of a (all the way down) call b with the coordinates of that value and put that at the appropriate position in a"
        },
        vectorise: false,
        tests: [
            "[-1231234.5, 6] : [-24, 24, 4.5]",
            '["abc3def", 3] : ["abc", "def"]',
            '["abcd333", "d"] : ["abc", "333"]',
            "[[1, 2, 3, 4, 3, 2, 1], 4] : [[1, 2, 3], [3, 2, 1]]",
            "[[1, 2, 3, 4], 4] : [[1, 2, 3], []]",
            "[[], 4] : [[]]"
        ]
    },
    {
        element: "½",
        name: "Halve",
        arity: 1,
        description: "Halves an item",
        overloads: {
            num: "a / 2",
            str: "a split into two strings of equal lengths (as close as possible)"
        },
        vectorise: true,
        tests: [
            "[8] : 4",
            '["FizzBuzz"] : ["Fizz", "Buzz"]',
            '[""] : ["", ""]',
            '["a"] : ["a", ""]',
            "[[2, 4, 6, 8]] : [1, 2, 3, 4]",
            '["abc"] : ["ab", "c"]'
        ]
    },
    {
        element: "∆",
        name: "Mathematical Digraph",
        arity: "NA",
        description: "Used for mathematical digraphs"
    },
    {
        element: "ø",
        name: "String Digraph",
        arity: "NA",
        description: "Used for string-based digraphs"
    },
    {
        element: "↔",
        name: "Combinations/Remove/Fixed Point Collection",
        arity: 2,
        description:
            "Does either combinations_with_replacement, removes items from a not in b, or applies a on b until the result stops changing (including the initial value).",
        overloads: {
            "any-num": "combinations_with_replacement(a, length=b)",
            "fun-any":
                "Apply a on b until the result does not change, yielding intermediate values. Includes the initial value.",
            "any-str": "remove elements from a that are not in b",
            "any-lst": "remove elements from a that are not in b"
        },
        vectorise: false,
        tests: [
            '["cabbage", "abcde"] : "cabbae"',
            "[[1,3,5,6,7,7,1],[1,3,5]] : [1,3,5,1]",
            "[[1,2],2] : [[1,1],[1,2],[2,1],[2,2]]"
        ]
    },
    {
        element: "¢",
        name: "Infinite Replacement / Apply at Indices",
        arity: 3,
        description:
            "Replace b in a with c until a does not change / Call a function on all elements at specified indices together and put that back in the list",
        overloads: {
            "any-any-any": "replace b in a with c until a does not change",
            "lst-fun-lst": "apply function b to items in c at indices in a",
            "lst-lst-fun": "apply function c to items in a at indices in b",
            "fun-lst-lst": "apply function a to items in b at indices in c"
        },
        vectorise: false,
        tests: ['["{[[[]]]}","[]",""] : "{}"', "[1444,44,34] : 1334"]
    },
    {
        element: "⌐",
        name: "Complement / Comma Split",
        description: "1 - a if number, split by commas if string.",
        arity: 1,
        overloads: { num: "1 - a", str: 'a.split(",")' },
        vectorise: true,
        tests: ["[5] : -4", "[-5] : 6", '["a,b,c"] : ["a","b","c"]']
    },
    {
        element: "æ",
        name: "Is Prime / Case Check",
        description: "(a is prime) if a is a number, else check which case a is",
        arity: 1,
        overloads: {
            num: "is a prime?",
            str: "caseof(a) (1 if all letters in a are uppercase, 0 if all letters in a are lowercase, -1 if mixed case)"
        },
        vectorise: true,
        tests: ["[2] : 1", "[4] : 0", '["a"] : 0', '["A"] : 1', '["!"] : -1']
    },
    {
        element: "ʀ",
        name: "Inclusive Zero Range",
        description: "Inclusive range or whether each character is alphabetical",
        arity: 1,
        overloads: {
            num: "range(0,a + 1) (inclusive range from 0)",
            str: "[is v alphabetical? for v in a]"
        },
        vectorise: true,
        tests: ['["a$c"] : [1, 0, 1]', "[[1]] : [[0, 1]]", "[3] : [0,1,2,3]"]
    },
    {
        element: "ʁ",
        name: "Exclusive Zero Range",
        description: "Exclusive range or palindromise",
        arity: 1,
        overloads: {
            num: "range(0,a) (exclusive range from 0)",
            str: "palindromise(a) (a + a[:-1:-1])"
        },
        vectorise: true,
        tests: ['["1234"] : "1234321"', "[[1]] : [[0]]", "[3] : [0,1,2]"]
    },
    {
        element: "ɾ",
        name: "Inclusive One Range",
        description: "Inclusive range or uppercase",
        arity: 1,
        overloads: { num: "range(1,a+1) (inclusive range from 1)", str: "a.uppercase()" },
        vectorise: true,
        tests: ['["abc"] : "ABC"', "[[4, 5]] : [[1, 2, 3, 4], [1, 2, 3, 4, 5]]", "[3] : [1,2,3]"]
    },
    {
        element: "ɽ",
        name: "Exclusive One Range / Lowercase",
        description: "Exclusive range or lowercase",
        arity: 1,
        overloads: { num: "range(1,a) (exclusive range from 0)", str: "a.lowercase()" },
        vectorise: true,
        tests: ['["1aBC"] : "1abc"', "[[0]] : [[]]", "[3] : [1,2]"]
    },
    {
        element: "Þ",
        name: "List Digraph",
        arity: "NA",
        description: "Used for list-related digraphs"
    },
    {
        element: "ƈ",
        name: "Choose / random choice / set same / drop while",
        description:
            "Binomial coefficient / choose a random items from b / same except duplicates / drop while",
        arity: 2,
        overloads: {
            "num-num": "a choose b (binomial coefficient)",
            "num-str": "choose a random items from b",
            "str-num": "choose b random items from a",
            "str-str": "are the set of characters in the strings the same?",
            "any-fun": "remove each item x from the beginning of a until b(x) returns false",
            "fun-any": "remove each item x from the beginning of b until a(x) returns false"
        },
        vectorise: true,
        tests: [
            "[5,3] : 10",
            '["abc","aaccb"] : 1',
            '["abc","abcd"] : 0',
            '["a",3] : ["a","a","a"]',
            '[0,"b"] : []'
        ]
    },
    {
        element: "∞",
        name: "Palindromise",
        description: "Palindromise a",
        arity: 1,
        overloads: { any: "palindromise a (a + a[:-1:-1])" },
        vectorise: false,
        tests: [
            "[[1,2,3]] : [1,2,3,2,1]",
            "[[1,2,3,4]] : [1,2,3,4,3,2,1]",
            "[[1,2,3,4,5]] : [1,2,3,4,5,4,3,2,1]",
            "[[1,2,3,4,5,6]] : [1,2,3,4,5,6,5,4,3,2,1]",
            '["hello"] : "hellolleh"'
        ]
    },
    {
        element: "¨",
        name: "Other Digraphs",
        arity: "NA",
        description: "Used for various random digraphs"
    },
    { element: " ", name: "Space", arity: "NA", description: "NOP" },
    {
        element: "!",
        name: "Stack Length",
        description: "Push the length of the stack",
        arity: 0,
        tests: ["[0,1,2] : 3", "[1,1,1,1,1] : 5", "[] : 0"]
    },
    {
        element: '"',
        name: "Pair",
        arity: 2,
        description: "Place the top two items into a single list",
        overloads: { "any-any": "[a, b]" },
        vectorise: false,
        tests: ["[1, 2] : [1, 2]", "[1, 2, 3] : [2, 3]", '[[1, 2, 3], "abc", 3] : ["abc", 3]']
    },
    {
        element: "#",
        name: "Comment",
        description: "The characters until the next newline are commented out",
        arity: "NA"
    },
    {
        element: "#{",
        name: "Multiline Comment",
        description: "The characters until the next `}#` are commented out. Nestable.",
        arity: "NA"
    },
    {
        element: "$",
        name: "Swap",
        arity: 2,
        description: "Swap the top two items",
        overloads: { "any-any": "b, a" },
        vectorise: false,
        tests: ["[1, 2] : 1", "[1, 2, 3] : 2", '[[1, 2, 3], "abc", 3] : "abc"']
    },
    {
        element: "%",
        name: "Modulo / Format",
        description: "Modulo two numbers / format two strings",
        arity: 2,
        overloads: {
            "num-num": "a % b",
            "num-str": "b.format(a) (replace % in b with a)",
            "str-num": "a.format(b) (replace % in a with b)",
            "str-str": "a.format(b) (replace % in a with b)",
            "str-lst": "a.format(b) (replace % in a with each item of b)"
        },
        vectorise: true,
        tests: [
            "[5,3] : 2",
            "[5,0] : 0",
            '["hello %!",3] : "hello 3!"',
            '["Hel%ld!","lo, Wor"] : "Hello, World!"',
            '["% and % and %",[1,2,3]] : "1 and 2 and 3"',
            '["% and % and %",[1,2,3,4,5]] : "1 and 2 and 3"',
            '["% and % and %",[1,2]] : "1 and 2 and 1"'
        ]
    },
    {
        modifier: "&",
        name: "Apply To Register",
        arity: "*",
        description: "Apply the next element to the register",
        usage: "&<element>"
    },
    { element: "'", name: "Lambda Filter", arity: 1, description: "Open a filter lambda - '...;" },
    {
        element: "(",
        name: "Open For Loop",
        arity: 1,
        description: "Start a for loop, iterating over the popped top of stack."
    },
    { element: ")", name: "Close For loop", description: "Close a for loop", arity: "NA" },
    {
        element: "*",
        name: "Multiplication / Arity Change",
        description: "Multiply two numbers or strings / Change the arity of a function",
        arity: 2,
        overloads: {
            "num-num": "a * b",
            "num-str": "b repeated a times",
            "str-num": "a repeated b times",
            "str-str":
                "ring translate a according to b (in a, replace b[0] with b[1], b[1] with b[2], ..., and b[-1] with b[0])",
            "fun-num": "change the arity of function a to b",
            "num-fun": "change the arity of function b to a"
        },
        vectorise: true,
        tests: [
            "[3,5] : 15",
            "[4,-2] : -8",
            '[4,"*"] : "****"',
            '["x",5] : "xxxxx"',
            '["aeiou","hello"] : "alihu"',
            "[-4+9j, 2+2j] : -26+10j"
        ]
    },
    {
        element: "+",
        name: "Addition",
        arity: 2,
        description: "Adds the top two items on the stack",
        overloads: {
            "num-num": "a + b",
            "num-str": "str(a) + b",
            "str-num": "a + str(b)",
            "str-str": "a + b"
        },
        vectorise: true,
        tests: [
            "[1, 1] : 2",
            "[0, -5] : -5",
            '["abc", 5] : "abc5"',
            '[5, "abc"] : "5abc"',
            '["Hello, ", "World!"] : "Hello, World!"',
            "[[1,2,3], 4] : [5, 6, 7]",
            "[[1,2,3], [4,5,6]] : [5, 7, 9]"
        ]
    },
    {
        element: ",",
        name: "Print",
        description: "Print a with trailing newline",
        arity: 1,
        overloads: { any: "print(a)" },
        vectorise: false
    },
    {
        element: "-",
        name: "Subtract",
        arity: 2,
        description: "Subtracts the top two items on the stack",
        overloads: {
            "num-num": "a - b",
            "num-str": '("-" * a) + b',
            "str-num": 'a + ("-" * b)',
            "str-str": "a.replace(b, '')"
        },
        vectorise: true,
        tests: [
            "[5, 4] : 1",
            "[0, -5] : 5",
            '["|", 5] : "|-----"',
            '[3, "> arrow"] : "---> arrow"',
            '["abcbde", "b"] : "acde"',
            '["aaa", "a"] : ""',
            '["asdf", ""] : "asdf"',
            "[[1, 2, 3], [1, 2, 3]] : [0, 0, 0]",
            "[[10, 20, 30], 5] : [5, 15, 25]"
        ]
    },
    { element: ".", name: "Decimal Separator", description: "Decimal separator", arity: "NA" },
    {
        element: "/",
        name: "Divide / Split",
        description: "Divide two numbers or split strings",
        arity: 2,
        overloads: {
            "num-num": "a / b",
            "num-str": "b split into a pieces",
            "str-num": "a split into b pieces",
            "str-str": "a.split(b)"
        },
        vectorise: true,
        tests: [
            "[4,2] : 2",
            "[4,0] : 0",
            "[0,0] : 0",
            '["abcdef",3] : ["ab","cd","ef"]',
            '["abcde",3] : ["ab", "cd", "e"]',
            '["abcd",3] : ["ab","c","d"]',
            '["a",3] : ["a","",""]',
            '["",3] : ["","",""]',
            '["1,2,3",","] : ["1","2","3"]'
        ]
    },
    { element: "0", name: "Literal digit 0", description: "Literal digit 0", arity: 0 },
    { element: "1", name: "Literal digit 1", description: "Literal digit 1", arity: 0 },
    { element: "2", name: "Literal digit 2", description: "Literal digit 2", arity: 0 },
    { element: "3", name: "Literal digit 3", description: "Literal digit 3", arity: 0 },
    { element: "4", name: "Literal digit 4", description: "Literal digit 4", arity: 0 },
    { element: "5", name: "Literal digit 5", description: "Literal digit 5", arity: 0 },
    { element: "6", name: "Literal digit 6", description: "Literal digit 6", arity: 0 },
    { element: "7", name: "Literal digit 7", description: "Literal digit 7", arity: 0 },
    { element: "8", name: "Literal digit 8", description: "Literal digit 8", arity: 0 },
    { element: "9", name: "Literal digit 9", description: "Literal digit 9", arity: 0 },
    {
        element: ":",
        name: "Duplicate",
        description: "Push a twice",
        arity: 1,
        overloads: { any: "a,a" },
        vectorise: false
    },
    {
        element: ";",
        name: "Close Structure",
        description: "Close a lambda / map lambda / sort lambda / function",
        arity: "NA"
    },
    {
        element: "<",
        name: "Less Than",
        description: "Basic comparison - less than",
        arity: 2,
        overloads: {
            "num-num": "a < b",
            "num-str": "str(a) < b",
            "str-num": "a < str(b)",
            "str-str": "a < b",
            "any-fun": "decrement a until b returns false",
            "fun-any": "decrement b until a returns false"
        },
        vectorise: true,
        tests: [
            "[1, 2] : 1",
            "[2, 1] : 0",
            '[2, "1"] : 0',
            '["2", 1] : 0',
            '["a","b"] : 1',
            '["10",2] : 1',
            "[-5,2] : 1",
            "[[1,2,3],2] : [1,0,0]"
        ]
    },
    {
        element: "=",
        name: "Equals",
        description: "Basic comparison - equals",
        arity: 2,
        overloads: {
            "num-num": "a == b",
            "num-str": "str(a) == b",
            "str-num": "a == str(b)",
            "str-str": "a == b"
        },
        vectorise: true,
        tests: [
            "[1, 1] : 1",
            "[2, 1] : 0",
            '["a","b"] : 0',
            '["xyz","xyz"] : 1',
            "[[1,2,3],2] : [0,1,0]",
            '[1,"1"] : 1'
        ]
    },
    {
        element: ">",
        name: "Greater Than",
        description: "Basic comparison - greater than",
        arity: 2,
        overloads: {
            "num-num": "a > b",
            "num-str": "str(a) > b",
            "str-num": "a > str(b)",
            "str-str": "a > b",
            "any-fun": "increment a until b returns false",
            "fun-any": "increment b until a returns false"
        },
        vectorise: true,
        tests: [
            "[1, 2] : 0",
            "[2, 1] : 1",
            '[2, "1"] : 1',
            '["2", 1] : 1',
            '["a","b"] : 0',
            '["10",2] : 0',
            "[2,-5] : 1",
            "[[1,2,3],2] : [0,0,1]",
            '["5",10] : 1'
        ]
    },
    {
        element: "?",
        name: "Input",
        arity: 0,
        description: "Get the next input from the input source",
        vectorise: false
    },
    {
        element: "@",
        name: "Function Call / Declaration",
        description: "Call / declare function (@name; / @name|code;)",
        arity: "* / NA"
    },
    {
        element: "A",
        name: "All",
        description: "Check if all items in a list are truthy / check if a character is a vowel",
        arity: 1,
        overloads: {
            str: "is_vowel(a) if a.length == 1 else [is_vowel(z) for z in a]",
            any: "all(a)"
        },
        vectorise: false,
        tests: [
            "[[1,2,3]] : 1",
            "[[0,1,2]] : 0",
            '[["",1,2]] : 0',
            "[[]] : 1",
            '[""] : []',
            "[0] : 0",
            '["a"] : 1',
            '["y"] : 0',
            '["hi"] : [0,1]'
        ]
    },
    {
        element: "B",
        name: "Binary To Decimal",
        description: "Convert a binary string or list to base 10",
        arity: 1,
        overloads: { any: "int(a,2) (convert from base 2 to base 10)" },
        vectorise: false,
        tests: [
            "[[1,0,1]] : 5",
            "[[1,1,1]] : 7",
            "[[-1,0,-1,0]] : -10",
            "[[-1,0,1,0]] : -6",
            '["1011"] : 11',
            '["-1011"] : -11',
            "[[]] : 0"
        ]
    },
    {
        element: "C",
        name: "Chr / Ord",
        description: "Convert between characters and ordinals",
        arity: 1,
        overloads: { num: "chr(a)", str: "ord(a) if length 1 else list of ordinals" },
        vectorise: true,
        tests: [
            '[65] : "A"',
            '[8482] : "™"',
            '["Z"] : 90',
            '["ABC"] : [65,66,67]',
            '[[123,124,125]] : ["{","|","}"]',
            '[""] : []'
        ]
    },
    {
        element: "D",
        name: "Triplicate",
        description: "Push three copies of a to stack",
        arity: 1,
        vectorise: false
    },
    {
        element: "E",
        name: "Two Power / Python Eval",
        description: "2 ** a, or eval(a)",
        arity: 1,
        overloads: { num: "2 ** a", str: "eval(a) (safe-eval as python)" },
        vectorise: true,
        tests: ["[0] : 1", "[2] : 4", '["[1,2,3]"] : [1,2,3]']
    },
    {
        element: "F",
        name: "Filter",
        description: "Filter a list by another list or function.",
        arity: 2,
        overloads: {
            "any-fun": "filter(b,a) (filter a by the ones that b returns a truthy result for)",
            "any-any": "remove elements of a that are in b"
        },
        vectorise: false,
        tests: [
            "[[1, 2, 3, 4, 5, 6], 5] : [1, 2, 3, 4, 6]",
            "[[1, 2, 3, 4, 5, 6], 7] : [1, 2, 3, 4, 5, 6]",
            '["abcdef", "b"] : "acdef"',
            "[[1,2,3],[2,4,6]] : [1,3]",
            '["abcdef","daffodil"] : "bce"',
            '["12345",["2","4","5"]] : "13"',
            '[["1","2","3","4","5"],"245"] : ["1","3"]',
            "[123, 246] : 13"
        ]
    },
    {
        element: "G",
        name: "Max",
        description: "Maximum value or a",
        arity: 1,
        overloads: { any: "max(a)" },
        vectorise: false,
        tests: ["[[1,3,2]] : 3", '["python"] : "y"', "[[]] : []", '[""] : []']
    },
    {
        element: "H",
        name: "Hex To Decimal",
        description: "Convert hexadecimal to decimal",
        arity: 1,
        overloads: { any: "int(a,16) (from hexadecimal)" },
        vectorise: false,
        tests: ["[32] : '20'", '["b"] : 11', '["beedab"] : 12512683', '["bEeDaB"] : 12512683']
    },
    {
        element: "I",
        name: "Into Two Pieces",
        description: "Push n spaces / quine cheese / into two pieces",
        arity: 1,
        overloads: {
            num: "push a spaces",
            str: "equivalent to `qp`",
            lst: "split a list into two halves"
        },
        vectorise: false,
        tests: [
            '[6] : "      "',
            '[":I"] : "`:I`:I"',
            "[[1, 2, 3, 4]] : [[1, 2], [3, 4]]",
            "[[1]] : [[1], []]",
            "[[]] : [[], []]"
        ]
    },
    {
        element: "J",
        name: "Merge",
        description: "Join two lists or items",
        arity: 2,
        overloads: {
            "lst-str": "a.append(b) (append)",
            "lst-num": "a.append(b) (append)",
            "str-lst": "b.prepend(a) (prepend)",
            "num-lst": "b.prepend(a) (prepend)",
            "lst-lst": "merged(a,b) (merge)",
            "any-any": "a + b (concatenate)"
        },
        vectorise: false,
        tests: [
            "[[1,2,3],4] : [1,2,3,4]",
            '["abc","def"] : "abcdef"',
            "[1,[2,3,4]] : [1,2,3,4]",
            "[[1,2],[3,4]] : [1,2,3,4]",
            "[123,456] : 123456",
            '[123,"456"] : "123456"',
            '["123",456] : "123456"'
        ]
    },
    {
        element: "K",
        name: "Factors / Substrings / Prefixes",
        description:
            "Get either the factors of a, substrings that occur more than once, or prefixes",
        arity: 1,
        overloads: {
            num: "divisors(a) (positive integer factors)",
            str: "all non-empty substrings of a that occur more than once in a",
            lst: "prefixes(a) (prefixes)"
        },
        vectorise: false,
        tests: [
            "[20] : [1,2,4,5,10,20]",
            "[1] : [1]",
            "[-1] : [-1]",
            "[-12] : [-1, -2, -3, -4, -6, -12]",
            "[0] : []",
            '["adbcdbcd"] : ["d", "db", "dbc", "b", "bc", "bcd", "c", "cd"]',
            "[[1,2,3]] : [[1],[1,2],[1,2,3]]"
        ]
    },
    {
        element: "L",
        name: "Length",
        description: "Get length of a",
        arity: 1,
        overloads: { any: "len(a)" },
        vectorise: false,
        tests: [
            '["abc"] : 3',
            "[[1,2,3]] : 3",
            '[[1,2,"wrfwerfgbr",6]] : 4',
            "[0] : 1",
            "[-0.25] : 4"
        ]
    },
    {
        element: "M",
        name: "Map Function",
        description: "Map function object b over a",
        arity: 2,
        vectorise: false,
        overloads: {
            "any-fun": "map(b,a) (apply function b to each of a)",
            "any-any": "pair each item of b with a ([[a, i] for i in b])"
        },
        tests: [
            "[5,[1,2,3]] : [[5,1],[5,2],[5,3]]",
            '["z","hi"] : [["z","h"],["z","i"]]',
            "[[1,2],[1,2]] : [[[1,2],1],[[1,2],2]]",
            '["hi",3] : [["hi",1],["hi",2],["hi",3]]'
        ]
    },
    {
        element: "N",
        name: "Negate / Swap Case / First Integer Where Truthy",
        description:
            "Negate a number / swap case of a string / first integer where a function truthy",
        arity: 1,
        overloads: {
            num: "-a  (negate)",
            str: "swap_case(a) (toggle case)",
            fun: "first integer where a(n) is true"
        },
        vectorise: true,
        tests: ["[5] : -5", "[-1] : 1", '["a"] : "A"', '["aBc"] : "AbC"']
    },
    {
        element: "O",
        name: "Count / Maximums-by",
        description: "Count number of times b occurs in a / Maximums-by",
        arity: 2,
        overloads: {
            "any-any": "a.count(b)",
            "any-fun": "all elements in a where the result of b(x) is highest"
        },
        vectorise: false,
        tests: [
            "[[1,2,3,4,5,4,3], 4] : 2",
            '["abcdbacsabdcabca","a"] : 5',
            "[1213121, 1] : 4",
            '[1213121, "1"] : 4',
            '["1213121", 1] : 4'
        ]
    },
    {
        element: "P",
        name: "Strip / Minimums-by",
        description: "Remove the set of elements in b from both ends of a / Minimums-by",
        arity: 2,
        overloads: {
            "any-any": "a.strip(b)",
            "any-fun": "all elements in a where the result of b(x) is lowest"
        },
        vectorise: false,
        tests: [
            "[[1, 2, 3, 4, 5, 4, 3, 2, 1], [1, 2]] : [3, 4, 5, 4, 3]",
            "[[1, 2, 3, 4, 5, 6, 7, 8, 2], [1, 2]] : [3, 4, 5, 6, 7, 8]",
            "[[0, 0, 0, 0, 0, 2, 3, 0, 9, 0, 0, 0, 0, 0], 0] : [2, 3, 0, 9]",
            '["    Hello, World!    ", " "] : "Hello, World!"',
            "[1213121, 1] : 21312",
            '[1213121, "1"] : 21312',
            '["1213121", 1] : "21312"'
        ]
    },
    { element: "Q", name: "Quit", description: "Quit the program", arity: "NA" },
    {
        element: "R",
        name: "Reduce",
        description: "Reduce a by b, or reverse each item of b",
        arity: 2,
        overloads: {
            "num-num": "a in base b, using a default alphabet 0-9A-Z",
            "any-fun": "reduce(b,a) (Reduce a by b)",
            "any-any": "a, vectorised_reverse(b)"
        },
        vectorise: false,
        tests: [
            "[[[1,2],[3,4]]] : [[2,1],[4,3]]",
            "[[[1,2]]] : [[2,1]]",
            "[5, 2] : '101'",
            "[5, 3] : '12'",
            "[69, 10] : '69'",
            "[69, 16] : '45'",
            "[69, 36] : '1X'",
            "[123, 62] : '1z'"
        ]
    },
    {
        element: "S",
        name: "Stringify",
        description: "Stringify a list or number",
        arity: 1,
        overloads: { any: "str(a) (Stringify)" },
        vectorise: false,
        tests: ['[5] : "5"', '[[1,2,3]] : "⟨ 1 | 2 | 3 ⟩"', '["X"] : "X"']
    },
    {
        element: "T",
        name: "Truthy Indices / Triple / Triadify",
        description: "Get indices of truthy elements, triple, or make the arity of a function 3",
        arity: 1,
        overloads: {
            num: "a * 3",
            any: "truthy_indices(a)",
            fun: "set the arity of function a to 3"
        },
        vectorise: false,
        tests: [
            "[1] : 3",
            "[-4] : -12",
            "[[0,1,0,2]] : [1,3]",
            "[[1,2,3,4]] : [0,1,2,3]",
            "[[0,0,0,0]] : []"
        ]
    },
    {
        element: "U",
        name: "Uniquify",
        description: "Remove duplicates",
        arity: 1,
        overloads: { any: "uniquify(a) (remove duplicates)" },
        vectorise: false,
        tests: [
            "[[1,3,5,5]] : [1,3,5]",
            '["abdbcdbch"] : "abdch"',
            "[] : []",
            '[["1",1]] : ["1",1]',
            "[1213121] : [1,2,3]"
        ]
    },
    {
        element: "V",
        name: "Replace / Map to Indices",
        description:
            "Replace b with c in a / Map a function at elements of a list whose indices are in another list",
        arity: 3,
        overloads: {
            "any-any-any":
                "a.replace(b,c) (replace). b can be a list of substrings to replace. If b is a list of substrings, so can c. If c is shorter, the extra strings in b will be replaced with the empty string, i.e., removed.",
            "lst-lst-fun":
                "for each i in b, change the ith element in a by applying the function, then return the new list",
            "lst-num-fun":
                "replace the bth element in a by applying the function, then return the new list"
        },
        vectorise: false,
        tests: [
            '["hela","a","lo"] : "hello"',
            '["banana","n","nan"] : "banananana"',
            "[[2,3,4],2,4] : [4,3,4]",
            "[234,2,4] : 434",
            '[234,2,"4"] : "434"',
            '[234,"2",4] : 434',
            '["234",2,4] : "434"',
            '["234","2",4] : "434"',
            '["abcdefabdee", ["abc","ab","e","d"], [1,2,3,"ab"]] : "1ab3f2ab33"',
            '["alice,bobabcfred", ["lice","bob","red"], "123"] : "a123,123abcf123"',
            '["abcdef", ["a","b","c","d"], ["1"]] : "1ef"'
        ]
    },
    {
        element: "W",
        name: "Wrap",
        description: "Stack wrapped into a list",
        arity: 0,
        vectorise: false,
        tests: ["[1,2,3] : [1,2,3]", "[] : []", '["hello",1,9] : ["hello",1,9]']
    },
    {
        element: "X",
        name: "Break",
        description: "Break out of the current loop or return early from a function.",
        arity: "NA"
    },
    {
        element: "Y",
        name: "Interleave",
        description: "Interleave two lists",
        arity: 2,
        overloads: { "any-any": "interleave(a,b) (a[0], b[0], a[1], b[1], ...)" },
        vectorise: false,
        tests: [
            "[[1,3,5],[2,4]] : [1,2,3,4,5]",
            '["srn","tig"] : "string"',
            '["aaaa",""] : "aaaa"',
            '["aaa",[1]] : ["a",1,"a","a"]',
            "[123,456] : [1,4,2,5,3,6]"
        ]
    },
    {
        element: "Z",
        name: "Zip",
        description: "Zip two lists or Zip a with b mapped over a. Fills with 0s if needed.",
        arity: 2,
        overloads: { "any-any": "zip(a,b)", "any-fun": "zip(a,map(b,a)) (zipmap, map and zip)" },
        vectorise: false,
        tests: [
            "[[1,2],[3,4]] : [[1,3],[2,4]]",
            '["abc",[1,2,3]] : [["a",1],["b",2],["c",3]]',
            '["abc","d"] : [["a","d"], ["b", 0], ["c", 0]]',
            '["d","abc"] : [["d", "a"], [0, "b"], [0, "c"]]',
            '[123,"45"] : [[1,"4"],[2,"5"],[3,0]]'
        ]
    },
    { element: "[", name: "Open If Statement", description: "Open an if Statement", arity: 1 },
    {
        element: "\\",
        name: "Single char Literal",
        description: "Pushes a single character",
        arity: 0
    },
    { element: "]", name: "Close If Statement", description: "Close an if Statement", arity: "NA" },
    { element: "`", name: "String Literal", description: "A string literal - `...`", arity: 0 },
    { element: "^", name: "Reverse Stack", description: "Reverse the stack.", arity: "NA" },
    {
        element: "_",
        name: "Pop",
        description: "Pop the top item of the stack",
        arity: 1,
        vectorise: false
    },
    {
        element: "a",
        name: "Any",
        description:
            "Check if any items of a list are truthy / Check if a character is an uppercase letter",
        arity: 1,
        overloads: {
            str: "is_uppercase(a) if a.length == 1 else [is_uppercase(z) for z in a]",
            lst: "any(a) (are any items truthy?)"
        },
        vectorise: false,
        tests: [
            "[[1,2,3]] : 1",
            "[[0,0,0]] : 0",
            "[[0,1,2]] : 1",
            '["A"] : 1',
            '["a"] : 0',
            '["Hi"] : [1,0]'
        ]
    },
    {
        element: "b",
        name: "Binary",
        description: "Convert a number or string to binary",
        arity: 1,
        overloads: {
            num: "bin(a) (list of binary digits of a)",
            str: "[bin(ord(char)) for char in a] (list of binary digits for each codepoint in a)"
        },
        vectorise: true,
        tests: [
            "[5] : [1,0,1]",
            '[" "] : [[1,0,0,0,0,0]]',
            "[[2,3]] : [[1,0],[1,1]]",
            "[-10] : [-1, 0, -1, 0]"
        ]
    },
    {
        element: "c",
        name: "Contains / First Truthy Item Under Function Application",
        description:
            "Check if one thing contains another / returns the first truthy item in a list after applying a function",
        arity: 2,
        overloads: {
            "any-fun": "first item of a where b(x) is truthy (shortcut for Fh)",
            "any-any": "b in a (does a contain b, membership, contains)"
        },
        vectorise: false,
        tests: [
            '["abcdef","a"] : 1',
            '["xyz","a"] : 0',
            "[[1,2,3],1] : 1",
            "[[1,2,3],0] : 0",
            "[123,1] : 1",
            "[123,0] : 0",
            '[123,"1"] : 1',
            '["123",1] : 1',
            '[123,""] : 1'
        ]
    },
    {
        element: "d",
        name: "Double / Dyadify",
        description: "Double a number or repeat a string twice / make a function dyadic",
        arity: 1,
        overloads: {
            num: "a * 2 (double)",
            str: "a * 2 (repeated twice)",
            fun: "change the arity of the function to 2"
        },
        vectorise: true,
        tests: ["[5] : 10", "[0] : 0", "[[1,2]] : [2,4]", '["x"] : "xx"', '["ha"] : "haha"']
    },
    {
        element: "e",
        name: "Exponentiation",
        description: "Exponentiate two numbers / extend string / get length of a regex match",
        arity: 2,
        overloads: {
            "num-num": "a ** b (exponentiation)",
            "str-num": "append a[0] until a is length b (spaces are used if a is empty)",
            "num-str": "append b[0] until b is length a (spaces are used if b is empty)",
            "str-str": "regex.search(pattern=a, string=b).span() (length of regex match)"
        },
        vectorise: true,
        tests: [
            "[5,3] : 125",
            "[0,0] : 1",
            "[4,0.5] : 2",
            '["hello",7] : "hellohh"',
            '["hello",3] : "hello"',
            '["hello","el"] : [1,3]',
            '["hellooo","e.*o"] : [1,7]'
        ]
    },
    {
        element: "f",
        name: "Flatten",
        description:
            "Turn a number into a list of digits, split a string into a list of characters, or flatten a list.",
        arity: 1,
        overloads: {
            num: "digits of a",
            str: "list of characters of a",
            lst: "flatten(a) (deep flatten)"
        },
        vectorise: false,
        tests: [
            "[135] : [1,3,5]",
            '["hi"] : ["h","i"]',
            "[[[[1,2],3,[[4,[5]],6],7],[8,[9]]]] : [1,2,3,4,5,6,7,8,9]",
            "[[[[],[]],[[[[]]]]]] : []",
            '[-1] : ["-",1]'
        ]
    },
    {
        element: "g",
        name: "Minimum",
        description: "Take the minimum of a list",
        arity: 1,
        overloads: { any: "min(a)" },
        vectorise: false,
        tests: ['["abc"] : "a"', "[[1,4,-2]] : -2", "[[5,3,9]] : 3", "[[]] : []", '[""] : []']
    },
    {
        element: "h",
        name: "Head",
        description: "First item of something",
        arity: 1,
        overloads: { any: "a[0] (first item)" },
        tests: ['["hello"] : "h"', "[[1,2,3]] : 1", '[""] : ""', "[[]] : 0"]
    },
    {
        element: "i",
        name: "Index",
        description: "Index into a list",
        arity: 2,
        overloads: {
            "any-num": "a[b] (index)",
            "num-any": "b[a] (index)",
            "str-str": "enclose b in a (b[0:len(b)//2] + a + b[len(b)//2:])",
            "any-[x]": "a[:b] (0 to bth item of a)",
            "any-[x,y]": "a[x:y] (x to yth item of a)",
            "any-[x,y,m]": "a[x:y:m] (x to yth item of a, taking every mth)"
        },
        vectorise: false,
        tests: [
            '["abc", [1,2]] : "b"',
            '["abc", 3] : "a"',
            "[[1, 2, 3], [4, 9]] : [2, 3, 1, 2, 3]",
            '["joemama","biden\'s"] : "joebiden\'smama"',
            "[[1,2,3], 0] : 1",
            "[[1,2,3], -1] : 3",
            "[[1,2,3], -0.1] : 1",
            "[[1,2,3], 1.9] : 2",
            "[[2,3,4,5], [2]] : [2,3]",
            "[[1,3,5,7],[1,3]] : [3,5]",
            "[4,[1,3,4]] : 3",
            "[[1,2,3,4,5,6,7,8,9,10],[1,8,2]] : [2,4,6,8]"
        ]
    },
    {
        element: "j",
        name: "Join",
        description: "Join a by b.",
        arity: 2,
        overloads: { "any-any": "a.join(b)" },
        vectorise: false,
        tests: [
            '[[1,2,3],"penguin"] : "1penguin2penguin3"',
            '[123,"penguin"] : "1penguin2penguin3"',
            '[123,4] : "14243"',
            '[["he","","o, wor","d!"], "l"] : "hello, world!"',
            '[[],"a"] : ""',
            "[[5,6,7,8],[1,2,3]] : [5,1,2,3,6,1,2,3,7,1,2,3,8]",
            "[[[4,5],[6,7]],[1,2,3]] : [4,5,1,2,3,6,7]",
            "[[[4,5],[6,7]],8] : [4,5,8,6,7]",
            "[[4,5,6,7],8] : [4,8,5,8,6,8,7]"
        ]
    },
    {
        element: "k",
        name: "Constant Digraph",
        description: "Used for constant digraphs.",
        arity: 0
    },
    {
        element: "l",
        name: "Cumulative Groups / First Non-Negative Truthy Integers",
        description: "Cumulative groups (overlapping groups, aperture) / Equal length",
        arity: 2,
        overloads: {
            "any-num": "[a[0:b], a[1:b+1], a[2:b+2], ..., a[-b:]]",
            "num-any": "[b[0:a], b[1:a+1], b[2:a+2], ..., b[-a:]]",
            "any-any": "length(a) == length(b)",
            "any-fun": "first a non-negative integers where b is truthy",
            "fun-any": "first b non-negative integers where a is truthy"
        },
        vectorise: false,
        tests: [
            '["hello",3] : ["hel","ell","llo"]',
            '["cake",2] : ["ca","ak","ke"]',
            '[2, "cake"] : ["ca","ak","ke"]',
            "[2, 123] : [[1,2],[2,3]]",
            "[123, 2] : []",
            "[[], 5] : []",
            "[[1,2,3], 2] : [[1,2],[2,3]]",
            "[[1,2,3], 4] : [[]]",
            "[[1,2,3], 0] : []",
            '["cheese","cake"] : 0',
            '["cheese","salads"] : 1'
        ]
    },
    {
        element: "m",
        name: "Mirror",
        description: "Append input reversed to itself.",
        arity: 1,
        overloads: {
            num: "a + reversed(a) (as number)",
            str: "a + reversed(a)",
            lst: "append reversed(a) to a"
        },
        vectorise: false,
        tests: ["[123] : 444", '["hi"] : "hiih"', "[[1,2,3]] : [1,2,3,3,2,1]"]
    },
    {
        element: "n",
        name: "Context",
        description: "Context variable, value of the current loop or function.",
        arity: 0
    },
    {
        element: "o",
        name: "Remove",
        description: "Remove instances of b in a",
        arity: 2,
        overloads: {
            "num-fun": "first a integers where b is truthy (0, 1, -1, ...)",
            "fun-num": "first b integers where a is truthy",
            "any-any": 'a.replace(b,"")'
        },
        vectorise: false,
        tests: [
            '["hello","l"] : "heo"',
            '["hello",""] : "hello"',
            '["hhhh","h"] : ""',
            "[[1,2,3,1,2],1] : [2,3,2]",
            "[12312,1] : [2,3,2]",
            '[12312,"1"] : [1,2,3,1,2]',
            '["12312",1] : "232"',
            '["bananas and naan","an"] : "bas d na"'
        ]
    },
    {
        element: "p",
        name: "Prepend",
        description: "Prepend b to a",
        overloads: { "any-any": "a.prepend(b) (prepend b to a)" },
        arity: 2,
        vectorise: false,
        tests: [
            '["ld","wor"] : "world"',
            "[[1,2,3],13] : [13,1,2,3]",
            '[[3,4,5],"23"] : ["23",3,4,5]',
            "[12,23] : 2312",
            '[0,23] : "230"',
            '[12,"23"] : "2312"',
            '["12",23] : "2312"',
            "[[1,2],[3,4]] : [[3,4],1,2]"
        ]
    },
    {
        element: "q",
        name: "Uneval",
        description: "Enclose in backticks, escape backslashes and backticks.",
        arity: 1,
        overloads: { any: "uneval(a) (enclose in backticks + escape)" },
        vectorise: false,
        tests: ['["\\\\"] : "`\\\\\\\\`"', '["`"] : "`\\\\``"', '["a"] : "`a`"']
    },
    {
        element: "r",
        name: "Range",
        description: "Range between two numbers, or cumulative reduce, or regex match",
        arity: 2,
        overloads: {
            "num-num": "range(a,b) (range from a to b)",
            "num-str": "append spaces to b to make it length a",
            "str-num": "prepend spaces to a to make it length b",
            "any-fun": "cumulative_reduce(a,function=b) (prefixes of a reduced by b)",
            "str-str": "regex.has_match(pattern=a,string= b) (does b match a)"
        },
        vectorise: true,
        tests: [
            "[3,6] : [3,4,5]",
            "[4,8] : [4,5,6,7]",
            '["abc",5] : "  abc"',
            '[5,"abc"] : "abc  "',
            '["abc",1] : "abc"',
            '["abc","bd*"] : 1',
            '["abc","bd+"] : 0'
        ]
    },
    {
        element: "s",
        name: "sort",
        description: "Sort a list or string",
        arity: 1,
        overloads: { any: "sorted(a) (sort)" },
        vectorise: false,
        tests: ["[[3,1,2]] : [1,2,3]", "[312] : 123", '["bca"] : "abc"', "[0] : 0"]
    },
    {
        element: "t",
        name: "Tail",
        description: "Last item",
        arity: 1,
        overloads: { any: "a[-1] (last item)" },
        vectorise: false,
        tests: ['["hello"] : "o"', "[[1,2,3]] : 3", '[""] : ""', "[[]] : 0"]
    },
    { element: "u", name: "Minus One", description: "Push -1", arity: 0, tests: ["[] : -1"] },
    {
        modifier: "v",
        name: "Vectorise",
        description: "Vectorise an element",
        arity: "*",
        usage: "v<element>"
    },
    {
        modifier: "¨v",
        name: "Simple vectorise",
        description:
            "Simple vectorise an element. Well, you'll have to look at the code to know what that means.",
        arity: "*",
        usage: "¨v<element>"
    },
    {
        modifier: "¨V",
        name: "Right vectorize",
        description:
            "Right vectorize an element. Like `v`, but vectorizes on the rightmost list instead of the leftmost list.",
        arity: "*",
        usage: "¨V<element>"
    },
    {
        element: "w",
        name: "Listify",
        description: "a wrapped in a singleton list",
        arity: 1,
        overloads: { any: "[a] (wrap in singleton list)" },
        vectorise: false,
        tests: ["[1] : [1]", '["hello"] : ["hello"]', "[[1,2,3]] : [[1,2,3]]"]
    },
    {
        element: "x",
        name: "Recurse / Continue / Print Stack",
        description:
            "Call current function (Functions/Lambdas) / Continue (For Loops) / Print the entire stack (otherwise)"
    },
    {
        element: "y",
        name: "Uninterleave",
        description: "Push every other item of a, and the rest.",
        arity: 1,
        overloads: { any: "a[::2], a[1::2] (every second item, the rest)" },
        vectorise: false,
        tests: ['["abcde"] : "bd"', "[[1,2,3,4]] : [2,4]", "[123] : [2]", '[""] : ""', "[[]] : []"]
    },
    {
        element: "z",
        name: "Zip-self",
        description: "Zip a with itself",
        arity: 1,
        overloads: { any: "zip(a,a)" },
        vectorise: false,
        tests: [
            "[[1,2,3]] : [[1,1],[2,2],[3,3]]",
            "[123] : [[1,1],[2,2],[3,3]]",
            '["zap"] : [["z","z"], ["a","a"],["p","p"]]',
            '[""] : []'
        ]
    },
    {
        element: "{",
        name: "Open While Loop",
        description: "Open a while loop - `{...}`",
        arity: "NA"
    },
    {
        element: "|",
        name: "Branch In Structure",
        description: "Branch the structure - means various things depending on context"
    },
    { element: "}", name: "Close While Loop", description: "Close a while loop" },
    {
        modifier: "~",
        name: "Filter / Execute Without Pop",
        description:
            "For monads, filter a list by that. For dyads, execute without popping from the stack.",
        usage: "~<element>"
    },
    {
        element: "↑",
        name: "Max by Tail",
        description: "Maximum by last item",
        arity: 1,
        overloads: { any: "max(a, key=lambda x: x[-1]) (maximum by last item)" },
        vectorise: false,
        tests: ["[[[3,4],[9,2]]] : [3,4]", "[[[1,2,3],[2,5]]] : [2,5]"]
    },
    {
        element: "↓",
        name: "Min by Tail",
        description: "Minimum by last item",
        arity: 1,
        overloads: { any: "min(a, key=lambda x: x[-1]) (minimum by last item)" },
        vectorise: false,
        tests: ["[[[3,4],[9,2]]] : [9,2]", "[[[1,2,3],[2,5]]] : [1,2,3]"]
    },
    {
        element: "∴",
        name: "Dyadic Maximum",
        description: "Maximum of two values / Maximum of a list by a function",
        arity: 2,
        overloads: { "any-any": "max(a,b)", "any-fun": "max(a,key=b)" },
        vectorise: false,
        tests: ["[5,3] : 5", '["hello","goodbye"] : "hello"', '[3,"(stuff)"] : 3']
    },
    {
        element: "∵",
        name: "Dyadic Minimum",
        description: "Minimum of two values / Minimum of a list by a function",
        arity: 2,
        overloads: { "any-any": "min(a,b)", "any-fun": "min(a,key=b)" },
        vectorise: false,
        tests: ["[5,3] : 3", '["hello","goodbye"] : "goodbye"', '[3,"(stuff)"] : "(stuff)"']
    },
    {
        element: "›",
        name: "Increment / Space Replace With 0",
        description: 'Add 1 to a number / replace all spaces in a string with "0"',
        arity: 1,
        overloads: { num: "a + 1", string: 'a.replace(" ","0")' },
        vectorise: true,
        tests: ["[5] : 6", "[[3,4]] : [4,5]", '["  101"] : "00101"']
    },
    {
        element: "‹",
        name: "Decrement",
        description: "Subtract 1 from a number",
        arity: 1,
        overloads: { num: "a - 1", str: 'a + "-"' },
        vectorise: true,
        tests: ["[5] : 4", "[[3,4]] : [2,3]", '["hello"] : "hello-"']
    },
    {
        element: "∷",
        name: "Parity",
        description: "A number modulo 2",
        arity: 1,
        overloads: { num: "a % 2 (odd?)", str: "second half of A" },
        vectorise: true,
        tests: [
            "[2] : 0",
            "[3] : 1",
            "[2.2] : 0.2",
            "[-3] : 1",
            '["hello!"] : "lo!"',
            '["hello"] : "lo"'
        ]
    },
    {
        element: "¤",
        name: "Empty String",
        description: "The empty string",
        arity: 0,
        tests: ['[] : ""']
    },
    { element: "ð", name: "Space", description: "A Space", arity: 0, tests: ['[] : " "'] },
    { element: "→", name: "Variable Set", description: "Set variable (→name)", arity: 1 },
    {
        element: "←",
        name: "Variable Get",
        description: "Get the value of a variable (←name)",
        arity: 0
    },
    {
        element: "β",
        name: "To Base Ten / From Custom Base",
        description: "Convert a number from a custom base to base 10",
        arity: 2,
        overloads: {
            "any-num":
                "a to base 10 from number base b, treating list items / string items as digits",
            "str-str":
                "a to base 10 from custom string base b, replacing values in a with their index in b and converting to base 10"
        },
        vectorise: false,
        tests: [
            "[43,5] : 23",
            '["43",5] : 23',
            '["43",5] : 23',
            '["acv",36] : 13423',
            '["1b2",12] : 278',
            '["banana","nab"] : 577',
            "[[15,23,9],31] : 15137"
        ]
    },
    {
        element: "τ",
        name: "From Base Ten / To Custom Base",
        description: "Convert a number to a different base from base 10.",
        arity: 2,
        overloads: {
            "num-num": "list of digits of a in base b",
            "num-str": "a converted into a string of characters of b",
            "num-lst": "a converted into a list of arbitrary values from b"
        },
        vectorise: false,
        tests: [
            '[1234567,"abc"] : "cacccabbbbcab"',
            "[1234567,5] : [3,0,4,0,0,1,2,3,2]",
            "[8163,-10] : [1,2,2,4,3]",
            '[928343,["he","ll","o"]] : ["ll","o","he","o","he","ll","ll","ll","ll","he","he","he","o"]',
            "[[10, 12, 6, 2, 8, 145], 2] : [[1, 0, 1, 0], [1, 1, 0, 0], [1, 1, 0], [1, 0], [1, 0, 0, 0], [1, 0, 0, 1, 0, 0, 0, 1]]",
            "[0,0] : 0",
            "[0,1] : [0]",
            "[0,[]] : 0",
            '[0,["a"]] : ["a"]',
            "[3,-2] : [1, 1, 1]",
            "[3,-1] : [1, 0, 1, 0, 1]",
            "[-3,-1] : [1, 0, 1, 0, 1, 0]"
        ]
    },
    {
        element: "ȧ",
        name: "Absolute value",
        description: "Take the absolute value of a number, or remove whitespace from a string",
        arity: 1,
        overloads: { num: "abs(a) (absolute value)", str: "remove whitespace from a" },
        vectorise: true,
        tests: ["[1] : 1", "[-1] : 1", '[" ch ee s e "] : "cheese"', "[[-1,2,-5]] : [1,2,5]"]
    },
    {
        element: "ḃ",
        name: "Boolify",
        description:
            "Convert an arbitrary value into a truthy or falsy value, vectorises with flag t",
        arity: 1,
        overloads: { any: "bool(a) (booliify)" },
        vectorise: false,
        tests: ["[0] : 0", "[1] : 1", "[[69, 0]] : 1", '["x"] : 1', '[["", []]] : 1', "[[]] : 0"]
    },
    {
        element: "ċ",
        name: "Not One",
        description: "Check if something is not equal to 1",
        arity: 1,
        overloads: { any: "a != 1" },
        vectorise: true,
        tests: ["[[1, 0]] : [0, 1]", '["1"] : 0', "[5] : 1", "[1] : 0"]
    },
    {
        element: "ḋ",
        name: "Divmod",
        description: "Divmod / combinations / trim / chunk-while",
        arity: 2,
        overloads: {
            "num-num": "[a // b, a % b] (divmod - division and modulo)",
            "str-num": "combinations of a with length b",
            "lst-num": "combinations of a with length b",
            "str-str": "overwrite the start of a with b (b + a[len(b):])",
            "lst-fun": "group elements in a by elements that fulfil predicate b"
        },
        vectorise: false,
        tests: [
            "[5,3] : [1,2]",
            "[34, 0] : [0, 0]",
            '["abcd",3] : ["abc","abd","acd","bcd"]',
            "[[1,2,3],2] : [[1,2],[1,3],[2,3]]",
            '["abcdef", "Joe"] : "Joedef"',
            '["Joe", "abcdef"] : "abcdef"'
        ]
    },
    {
        element: "ė",
        name: "Enumerate",
        description: "Zip with a range of the same length",
        arity: 1,
        overloads: { any: "enumerate(a) (zip with 1...len(a))" },
        vectorise: false,
        tests: [
            '["abc"] : [[0,"a"],[1,"b"],[2,"c"]]',
            "[[1,2,3]] : [[0,1],[1,2],[2,3]]",
            "[123] : [[0,1],[1,2],[2,3]]"
        ]
    },
    {
        element: "ḟ",
        name: "Find",
        description: "Find a value in another",
        arity: 2,
        overloads: {
            "any-any": "a.find(b) (indexing, -1 if not found)",
            "any-fun": "truthy indices of mapping b over a"
        },
        vectorise: false,
        tests: [
            "[[1,2,3],2] : 1",
            "[123,2] : 1",
            '[123,"2"] : 1',
            '["123",2] : 1',
            "[123,0] : -1",
            '["hello","l"] : 2',
            "[[[1],[2],[3,4]],[3,4]] : 2"
        ]
    },
    {
        element: "ġ",
        name: "Gcd / Group by Function",
        description: "Greatest Common Denominator of a list or some numbers",
        arity: "*",
        overloads: {
            lst: "GCD(a) (gcd of whole list)",
            "num-num": "gcd(a,b) (dyadic gcd)",
            "str-str": "longest common suffix of a and b",
            "fun-any": "group b by the results of function a",
            "any-fun": "group a by the results of function b"
        },
        vectorise: false,
        tests: [
            "[[1,3,2]] : 1",
            "[[60,42,108]] : 6",
            "[50,35] : 5",
            "[0,0] : 0",
            "[-12,-20] : 4",
            '["laugh","cough"] : "ugh"',
            '["asdf","fdsa"] : ""'
        ]
    },
    {
        element: "ḣ",
        name: "Head Extract",
        description: "Separate the first item of something and push both to stack",
        arity: 1,
        overloads: { any: "a[0], a[1:] (head extract)" },
        vectorise: false,
        tests: ['["hello"] : "ello"', "[[1,2,3]] : [2,3]", "[123] : [2,3]", "[[]] : []"]
    },
    {
        element: "ḭ",
        name: "Floor Division",
        description: "Floor divide a by b",
        arity: 2,
        overloads: {
            "num-num": "a // b (floor division, floor(a / b))",
            "str-num": "(a divided into b pieces)[0]",
            "num-str": "(b divided into a pieces)[0]",
            "any-fun": "right reduce a by b (foldr)",
            "fun-any": "right reduce b by a (foldr)"
        },
        vectorise: false,
        tests: [
            "[5,3] : 1",
            "[5,-3] : -2",
            "[-5,3] : -2",
            "[5,0] : 0",
            "[0,0] : 0",
            '["hello!",3] : "he"',
            '[3,"hello!"] : "he"',
            '["abcde",3] : "ab"',
            '["abcd",3] : "ab"',
            '["a",3] : "a"',
            '["",3] : ""'
        ]
    },
    {
        element: "ŀ",
        name: "Left Justify / Gridify / Infinite Replace / Collect until false",
        description: "Find one value inside another, starting from a certain index.",
        arity: 3,
        overloads: {
            "num-num-num": "a <= c <= b",
            "num-num-str": "a by b grid of c",
            "num-str-num": "a by c grid of b",
            "num-str-str": "b.ljust(a,filler=c)",
            "str-num-num": "b by c grid of a",
            "str-num-str": "a.ljust(c,filler=b)",
            "str-str-num": "a.ljust(b,filler=c)",
            "str-str-str": "a.infinite_replace(b, c)",
            "fun-fun-any":
                "[c, a(c), a(a(c)), ...], stopping at the first element x such that b(x) is falsy"
        },
        vectorise: true,
        tests: [
            "[1, 3, 2] : 1",
            '[1, 2, "a"] : "a\\na"',
            '[1, "a", 2] : "a\\na"',
            '["a", 1, 2] : "a\\na"',
            '["a", 0, -1] : ""',
            '["", 1, 2] : "\\n"',
            '["vy", 5, "."] : "vy..."',
            '["vy", ".", 5] : "vy..."',
            '[5, "vy", "."] : "vy..."'
        ]
    },
    {
        element: "ṁ",
        name: "Mean",
        description: "Average of a list - sum / length",
        arity: 1,
        overloads: {
            str: "palindromise(a) (a + a[:-1:-1])",
            num: "random.randint(0, a)",
            lst: "mean(a)"
        },
        vectorise: false,
        tests: ['["asdf"] : "asdfdsa"', "[[]] : 0", "[[1,2,3]] : 2", "[[4,71,-63]] : 4"]
    },
    {
        element: "ṅ",
        name: "Join By Nothing",
        description: "Join a list by the empty string. Vectorises if the list contains lists.",
        arity: 1,
        overloads: {
            num: "abs(a) <= 1",
            str: "pad with 0s to nearest positive multiple of 8",
            lst: '"".join(a)',
            fun: "first integer x where a(x) is truthy"
        },
        vectorise: false,
        tests: [
            '[["a","b","c"]] : "abc"',
            "[[1,2,3]] : '123'",
            "[5] : 0",
            "[0.54] : 1",
            '[""] : "00000000"',
            '["asdf"] : "0000asdf"',
            '["asdfghjk"] : "asdfghjk"',
            '[[],[]] : ["", ""]',
            '[[1, ["abc", "def", "ghi"], [1, 2, 3], [0.5, 1.1, [1, 2, 3]]]] : [1, "abcdefghi", 123, [1, 0, 123]]'
        ]
    },
    {
        element: "ȯ",
        name: "Slice",
        description: "Slice from an index to the end",
        arity: 2,
        overloads: {
            "fun-num": "first b positive integers for which a(x) is truthy",
            "any-num": "a[b:] (slice from b to the end)",
            "str-str": "vertically merge a and b"
        },
        vectorise: false,
        tests: [
            '["hello",2] : "llo"',
            '["hello",-0.1] : "hello"',
            "[[1,2,3],1] : [2,3]",
            "[[1,2,3],-2] : [2,3]",
            "[123,1] : 23",
            "[123,-2] : 23",
            "[-123,1] : 123",
            "[-123,-2] : 23",
            "[5903432, 2] : 3432"
        ]
    },
    {
        element: "ṗ",
        name: "Powerset",
        description: "All possible combinations of a",
        arity: 1,
        overloads: { any: "all subsets of a (including the empty subset)" },
        vectorise: false,
        tests: [
            '["ab"] : ["","a","b","ab"]',
            "[[1,2,3]] : [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
            "[123] : [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
            "[[]] : [[]]"
        ]
    },
    {
        element: "ṙ",
        name: "Round",
        description:
            "Round a number to the nearest integer / real and imaginary part of complex number",
        arity: 1,
        overloads: {
            num: "round(a)",
            complex: "[real(a), imag(a)]",
            str: "quad palindromise with overlap"
        },
        vectorise: true,
        tests: [
            "[5.5] : 6",
            "[3.2] : 3",
            "[[5.5,3.2]] : [6,3]",
            "[-4.7] : -5",
            "[-4.5] : -4",
            "[5j+3] : [3,5]",
            '["ab"] : "abba\\nabba"'
        ]
    },
    {
        element: "ṡ",
        name: "Sort by Function",
        description: "Sort a list by a function / create a range / split on a regex",
        arity: 2,
        overloads: {
            "any-fun": "sorted(a, key=b) (sort by b)",
            "num-num": "range(a, b + 1) (inclusive range from a to b)",
            "str-str": "regex.split(pattern=b, string=a)"
        },
        vectorise: false,
        tests: [
            "[3,4] : [3,4]",
            "[1,5] : [1,2,3,4,5]",
            "[-1,-5] : [-1,-2,-3,-4,-5]",
            '["abc1def2ghi","\\\\d+"] : ["abc","def","ghi"]'
        ]
    },
    {
        element: "ṫ",
        name: "Tail Extract",
        description: "Remove the last item and push both onto the stack",
        arity: 1,
        overloads: { any: "a[:-1],a[-1]" },
        vectorise: false,
        tests: ['["abc"] : "c"', "[[1,2,3]] : 3", "[123] : 3", "[[]] : 0"]
    },
    {
        element: "ẇ",
        name: "Chunk Wrap",
        description:
            "Wrap a list in chunks of a certain length / apply a function to every second item of a list",
        arity: 2,
        overloads: {
            "any-num": "a wrapped in chunks of length b",
            "num-any": "b wrapped in chunks of length a",
            "any-lst": "wrap a into chunks with lengths given in b, repeating if necessary",
            "lst-any": "wrap b into chunks with lengths given in a, repeating if necessary",
            "any-fun": "apply b to every second item of a ([a[0], b(a[1]), a[2], ...])",
            "fun-any": "apply a to every second item of b ([b[0], a(b[1]), b[2], ...])",
            "str-str": "split a on first occurrence of b"
        },
        vectorise: false,
        tests: [
            '["abcdef",2] : ["ab","cd","ef"]',
            "[[1,2,3,4,5,6],3] : [[1,2,3],[4,5,6]]",
            '["abcdefghi",[2,3,4]] : ["ab","cde","fghi"]',
            "[[1,2,3,4,5], [2,3] ] : [[1,2],[3,4,5]]",
            "[[1,2,3,4,5], [2,3,4] ] : [[1,2],[3,4,5]]",
            "[[1,2,3,4,5, 6, 7, 8, 9, 10], [2,3] ] : [[1,2],[3,4,5],[6,7],[8,9,10]]",
            '[["abc","def","ghi", "jkl"], 2] : [["abc","def"],["ghi","jkl"]]',
            '[["abc","def","ghi", "jkl"], [2,3]] : [["abc","def"],["ghi","jkl"]]',
            '["abcdefg",2] : ["ab","cd","ef","g"]',
            '["abca", "a"] : ["","bca"]',
            '["defg", "g"] : ["def",""]',
            '["defg", "x"] : ["defg"]',
            "[[1, 2, 3, 4, 5, 6], [0, 0, 1, 2, 3]] : [[], [], [1], [2, 3], [4, 5, 6]]"
        ]
    },
    {
        element: "ẋ",
        name: "Repeat",
        description: "Repeat a value several times",
        arity: "*",
        overloads: {
            "str-num": "a * b",
            "num-str": "b * a",
            "any-num": "repeat a b times ([a, a, ...])",
            "str-str": 'a + " " + b',
            "fun-any":
                "repeat function a on b while results are not unique ([a(b), a(a(b)), a(a(a(b))), ...] stopping at the first element i such that i == a(i))",
            "any-fun":
                "repeat function a on b while results are not unique ([b(a), b(b(a)), b(b(b(a))), ...] stopping at the first element i such that i == b(i))"
        },
        vectorise: false,
        tests: [
            "[[1,2,3],3] : [[1,2,3],[1,2,3],[1,2,3]]",
            '["x",5] : "xxxxx"',
            '[0,"x"] : ""',
            '["x",-2.3] : "xx"',
            "[0, 4] : [0, 0, 0, 0]",
            "[4, 0] : []",
            '["a", "b"] : "a b"',
            '["", ""] : " "'
        ]
    },
    {
        element: "ẏ",
        name: "Exclusive Range Length",
        description: "Range from 0 to length of a",
        arity: 1,
        overloads: { any: "range(0, len(a)) (exclusive range from 0 to length of a)" },
        vectorise: false,
        tests: ['["abc"] : [0,1,2]', "[[1,2]] : [0,1]", "[12] : [0,1]", "[-0.25] : [0,1,2,3]"]
    },
    {
        element: "ż",
        name: "Inclusive Range Length",
        description: "Range from 1 to length of a inclusive",
        arity: 1,
        overloads: { any: "range(1, len(a)+1) (inclusive range from 1 to length of a)" },
        vectorise: false,
        tests: ['["abc"] : [1,2,3]', "[[1,2]] : [1,2]", "[12] : [1,2]", "[-0.25] : [1,2,3,4]"]
    },
    {
        element: "√",
        name: "Square Root",
        description: "Square root a number / every second character of a",
        arity: 1,
        overloads: {
            num: "sqrt(a) (square root)",
            str: "every second character of a (a[0] + a[2] + ...)"
        },
        vectorise: true,
        tests: ["[4] : 2", "[-4] : 2j", '["hello"] : "hlo"']
    },
    { element: "⟨", name: "Open List", description: "Open a list - ⟨...⟩", arity: 0 },
    { element: "⟩", name: "Close list", description: "Close a list - ⟨...⟩", arity: 1 },
    {
        element: "‛",
        name: "Two Character String",
        description: "Collect the next two characters as a string - ‛..",
        arity: 0
    },
    {
        element: "₀",
        name: "Ten",
        description: "Push 10 to the stack",
        arity: 0,
        tests: ["[] : 10"]
    },
    {
        element: "₁",
        name: "Hundred",
        description: "Push 100 to the stack",
        arity: 0,
        tests: ["[] : 100"]
    },
    {
        element: "₂",
        name: "Is Even",
        description: "Check if a value is even",
        arity: 1,
        overloads: { num: "a % 2 == 0 (even?)", any: "len(a) % 2 == 0 (length even?)" },
        vectorise: false,
        tests: ["[5] : 0", "[2] : 1", '["hello"] : 0', "[[1,2]] : 1"]
    },
    {
        element: "₃",
        name: "Divisible By Three",
        description: "Check if a is divisible by 3",
        arity: 1,
        overloads: { num: "a % 3 == 0 (divisible by 3?)", any: "len(a) == 1 (length is 1?)" },
        vectorise: false,
        tests: ["[5] : 0", "[6] : 1", '["hi"] : 0', "[[1]] : 1"]
    },
    {
        element: "₄",
        name: "Twenty Six",
        description: "Push 26 to the stack",
        arity: 0,
        tests: ["[] : 26"]
    },
    {
        element: "₅",
        name: "Divisible By Five",
        description: "Check if a is divisible by 5",
        arity: 1,
        overloads: { num: "a % 5 == 0", any: "a, len(a)" },
        vectorise: false,
        tests: ["[4] : 0", "[5] : 1", '["hello"] : 5', "[[1,2,3]] : 3"]
    },
    {
        element: "₆",
        name: "Sixty Four",
        description: "Push 64 to the stack",
        arity: 0,
        tests: ["[] : 64"]
    },
    {
        element: "₇",
        name: "One Twenty Eight",
        description: "Push 128 to the stack",
        arity: 0,
        tests: ["[] : 128"]
    },
    {
        element: "₈",
        name: "Two Fifty Six",
        description: "Push 256 to the stack",
        arity: 0,
        tests: ["[] : 256"]
    },
    {
        element: "¶",
        name: "Newline",
        description: "Push a newline to the stack",
        arity: 0,
        tests: ['[] : "\\n"']
    },
    {
        element: "⁋",
        name: "Join On Newlines",
        description: 'Join the top of the stack on newlines (insert "\\n" between items)',
        arity: 1,
        overloads: { any: '"\\\\n".join(a)' },
        tests: [
            '[[1, 2, 3, 4, 5, 6]] : "1\\n2\\n3\\n4\\n5\\n6"',
            '[["Hello", "World!"]] : "Hello\\nWorld!"',
            '[123456] : "1\\n2\\n3\\n4\\n5\\n6"',
            '[[]] : ""'
        ]
    },
    {
        element: "§",
        name: "Vertical Join",
        arity: 1,
        description: "Transpose (filling with spaces) and then join on newlines",
        overloads: { any: "transpose a, join on newlines" },
        vectorise: false,
        tests: [
            '[["abc", "def", "ghi"]] : "adg\\nbeh\\ncfi"',
            '[["***", "****", "*****"]] : "  *\\n **\\n***\\n***\\n***"',
            '[[1, 22, 333]] : "  3\\n 23\\n123"',
            '[[]] : ""'
        ]
    },
    {
        element: "ε",
        name: "Absolute Difference / Repeat / Regex match",
        arity: 2,
        description:
            "Returns the absolute difference / Fills an array of a certain length / Does a regex match",
        overloads: {
            "num-num": "abs(a - b)",
            "num-str": "[b] * a",
            "str-num": "[a] * b",
            "str-str": "regex.match(b, a) (first match of regex b on a)"
        },
        vectorise: false,
        tests: [
            "[5, 1] : 4",
            "[1, 5] : 4",
            "[3, 3] : 0",
            "[[1, 2, 3], 4] : [3, 2, 1]",
            '["hello", 2] : ["hello", "hello"]',
            '[3, "goodbye"] : ["goodbye", "goodbye", "goodbye"]',
            '[["ab", "cd"], 2] : [["ab", "ab"], ["cd", "cd"]]',
            '["abcd", ".*"] : "abcd"',
            '["abcd", "a.."] : "abc"',
            '["abcd", "efg"] : ""'
        ]
    },
    {
        element: "¡",
        name: "Factorial",
        arity: 1,
        description: "Returns the factorial of the top of the stack",
        overloads: { num: "factorial(a) (math.gamma(a + 1))", str: "a.sentence_case()" },
        vectorise: true,
        tests: [
            "[5] : 120",
            '["hello my name jeff. ur sussy baka"] : "Hello my name jeff. Ur sussy baka"',
            "[[1, 2, 3, 4, 5]] : [1, 2, 6, 24, 120]"
        ]
    },
    {
        element: "∑",
        name: "Summate",
        arity: 1,
        description: "Returns the sum of the top of the stack (reduce by addition)",
        overloads: { num: "sum(digits of a)", str: "a", lst: "sum(a)" },
        vectorise: false,
        tests: [
            "[[1, 2, 3, 4, 5]] : 15",
            '[["abc", "def", 10]] : "abcdef10"',
            "[12345] : 15",
            "[-12345] : -15",
            '["id"] : "id"',
            "[1.414213562] : 29"
        ]
    },
    {
        element: "¦",
        name: "Cumulative Sum",
        arity: 1,
        description:
            "Returns the sums of the prefixes of the top of the stack (cumulatively reduce by addition)",
        overloads: { any: "cumulative_sum(a) ([a[0], a[0]+a[1], a[0]+a[1]+a[2], ...])" },
        vectorise: false,
        tests: [
            "[12345] : [1, 3, 6, 10, 15]",
            '["abcdef"] : ["a", "ab", "abc", "abcd", "abcde", "abcdef"]',
            '[""] : []',
            "[[1, 2, 3, 4, 5]] : [1, 3, 6, 10, 15]",
            "[[]] : []"
        ]
    },
    {
        element: "≈",
        name: "All Equal",
        arity: 1,
        description: "Returns whether all items are equal",
        overloads: { any: "are all items in a equal?" },
        vectorise: false,
        tests: [
            "[1111] : 1",
            "[-1111] : 0",
            '["acc"] : 0',
            '["aaa"] : 1',
            "[[1, 2, 2, 1]] : 0",
            "[[]] : 1"
        ]
    },
    {
        element: "µ",
        name: "Sorting Lambda",
        arity: "NA",
        description: "Sort the top of the stack by the function µ...;"
    },
    {
        element: "Ȧ",
        name: "Assign",
        arity: 3,
        description: "The equivalent of a[b] = c",
        overloads: { "any-num-any": "a but item b (0-indexed) is set to c" },
        vectorise: false,
        tests: [
            "[[1, 2, 3, 4], 1, 0] : [1, 0, 3, 4]",
            '["Hello ", 5, ", World!"] : "Hello, World!"',
            "[69320, 2, 4] : [6, 9, 4, 2, 0]",
            "[[1, 2, 3, 4], -1, 5] : [1, 2, 3, 5]",
            "[[1, 2, 3, 4], -2, 5] : [1, 2, 5, 4]",
            "[[1, 2, 3, 4], -5, 5] : [5, 1, 2, 3, 4]",
            "[[], [1, 2], 2] : [0, 2, 2]"
        ]
    },
    {
        element: "Ḃ",
        name: "Bifurcate",
        arity: 1,
        description:
            "Pushes the top of the stack then its reverse. Literally duplicate and reverse",
        overloads: { any: "a, reversed(a)" },
        vectorise: false,
        tests: ["[203] : 302", '["abc"] : "cba"', "[[1, 2, 3, 4]] : [4, 3, 2, 1]"]
    },
    {
        element: "Ċ",
        name: "Counts",
        arity: 1,
        description: "Returns a list of [item, count of item in the top of stack]",
        overloads: { any: "[[x, a.count(x)] for x in a]" },
        vectorise: false,
        tests: [
            "[[1, 2, 2, 3, 3, 3, 3]] : [[1, 1], [2, 2], [3, 4]]",
            "[1232333] : [[1, 1], [2, 2], [3, 4]]",
            '["Hello, World!"] : [["H", 1], ["e", 1], ["l", 3], ["o", 2], [",", 1], [" ", 1], ["W", 1], ["r", 1], ["d", 1], ["!", 1]]'
        ]
    },
    {
        element: "Ḋ",
        name: "Is Divisible / Arbitrary Duplicate / Ordered Group By",
        arity: 2,
        description:
            "Returns whether two items are divisible / numerous copies of the top of the stack / groups by results of function preserving order (adjacent group-by)",
        overloads: {
            "num-num": "a % b == 0",
            "num-str": "a copies of b",
            "str-num": "b copies of a",
            "str-str": 'b + " " + a',
            "any-fun": "group a by the results of b, order is preserved (adjacent group-by)",
            "fun-any": "group b by the results of a, order is preserved (adjacent group-by)"
        },
        vectorise: true,
        tests: [
            "[15, 5] : 1",
            "[15, 0] : 0",
            '["abc", 3] : "abc"',
            "[[5, 13, 29, 48, 12], 2] : [0, 0, 0, 1, 1]"
        ]
    },
    {
        element: "Ė",
        name: "Vyxal Exec / Reciprocal",
        arity: 1,
        description: "Executes as Vyxal / Reciprocal of number",
        overloads: { str: "vy_exec(a)", num: "1 / a" },
        vectorise: true,
        tests: ["[[2, 3, -1]] : [0.5, 1/3, -1]", '["kH"] : "Hello, World!"', "[0] : 0"]
    },
    {
        element: "Ḟ",
        name: "Generator / Modulo Index / Format",
        arity: 2,
        description:
            "Make a generator from function a with initial vector b, or get every nth item or format numbers as decimals.",
        overloads: {
            "num-num": "sympy.N(a, b) (evaluate a to b decimal places)",
            "str-num": "every bth letter of a (a[::b])",
            "num-str": "every ath letter of b (b[::a])",
            "str-str": "replace spaces in a with b",
            "lst-num": "every bth item of a (a[::b])",
            "num-lst": "every ath item of b (b[::a])",
            "fun-lst": "generator from function a with initial vector b"
        },
        vectorise: false,
        tests: [
            '[4.51, 3] : "4.51"',
            '[1.69, 10] : "1.690000000"',
            '[19.6, 2] : "20."',
            '["Hello, World!", 3] : "Hl r!"',
            '["LQYWXUAOL", 2] : "LYXAL"',
            '["LQYWXUAOL", -2] : "LAXYL"',
            "[[1, 2, 3, 4, 5, 6, 7, 8, 9], 4] : [1, 5, 9]",
            '[["Hello", "World!", "Gaming", "Pogchamp", "A"], 2] : ["Hello", "Gaming", "A"]',
            '["    1111", "0"] : "00001111"',
            '["But who was phone?", "!"] : "But!who!was!phone?"'
        ]
    },
    {
        element: "Ġ",
        name: "Group consecutive",
        arity: 1,
        description: "Group consecutive identical items",
        overloads: {
            lst: "group consecutive identical items",
            str: "group consecutive identical characters",
            num: "group consecutive identical digits"
        },
        vectorise: false,
        tests: [
            "[[1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 5, 5]] : [[1, 1, 1], [2, 2, 2, 2, 2, 2], [3, 3, 3, 3, 3], [4, 4], [5, 5]]",
            "[111222222333334455] : [[1, 1, 1], [2, 2, 2, 2, 2, 2], [3, 3, 3, 3, 3], [4, 4], [5, 5]]",
            '["Hello, World!"] : [["H"], ["e"], ["l", "l"], ["o"], [","], [" "], ["W"], ["o"], ["r"], ["l"], ["d"], ["!"]]',
            '[""] : []'
        ]
    },
    {
        element: "Ḣ",
        name: "Head Remove / Behead",
        arity: 1,
        description: "All but the first item of a list / Drop 1",
        overloads: {
            lst: "a[1:] or [] if empty",
            str: "a[1:] or '' if empty",
            num: "range(2, a + 1)"
        },
        vectorise: false,
        tests: [
            '[[0, [43, 69], "foo"]] : [[43, 69], "foo"]',
            "[[]] : []",
            '["foo"] : "oo"',
            '[""] : ""',
            "[12.34] : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]",
            "[0.2] : []",
            "[-123] : []"
        ]
    },
    {
        element: "İ",
        name: "Index into / Collect while unique / Complex Number",
        arity: 1,
        description:
            "Index into list at indices / Collect values while values are unique (not including the initial value)",
        overloads: {
            "num-num": "a + b * i",
            "any-lst": "[a[item] for item in b]",
            "any-fun": "Apply b on a and collect unique values. Does not include the initial value."
        },
        vectorise: false,
        tests: [
            "[6, 2] : [6 + 2j]",
            "[3, -7] : [3 - 7j]",
            '[["foo", "bar", -69, 420, "baz"], [0, 2, 4]] : ["foo", -69, "baz"]',
            "[[3, 4, 5, 6, 7, 8, 9, 10], [0, 2, 4, 6, 8]] : [3, 5, 7, 9, 3]",
            "[[1, 4, 9, 16], [[0, 1], [2, 3]]] : [[1, 4], [9, 16]]",
            '["Hello, World!", [0, 2, 4, 6, 8]] : ["H", "l", "o", " ", "o"]',
            '[[0, 2, 4, 6, 8], "Hello, World!"] : ["H", "l", "o", " ", "o"]',
            '[[1,2,3], [-1,0.1,1.9,"0"]] : [3,1,2,1]',
            '[123, [-1,0.1,1.9,"0"]] : [3,1,2,1]'
        ]
    },
    {
        element: "Ŀ",
        name: "Transliterate",
        description:
            "Replace each item of one value in another value with the corresponding element from a third value",
        arity: 3,
        overloads: {
            "any-any-any":
                "transliterate(a,b,c) (in a, replace b[0] with c[0], b[1] with c[1], b[2] with c[2], ...)",
            "fun-fun-any": "call b on c until a(c) is falsy"
        },
        vectorise: false,
        tests: [
            '["abcdefcba","abc","123"] : "123def321"',
            "[[1,2,0], [2], [5]] : [1,5,0]",
            '["120", [2], "5"] : "150"',
            "[-120, [2], [5]] : [-150]",
            '["abc","ab",["bb","cc"]] : ["bb","cc","c"]',
            "[431, 1234, 4321] : 124",
            "[-234, 1234, 4321] : -321"
        ]
    },
    {
        element: "Ṁ",
        name: "Insert",
        description:
            "Insert a value at a specified index / Map a function over every nth item of a list",
        arity: 3,
        overloads: {
            "any-num-any": "a.insert(b,c) (insert c at position b in a)",
            "any-num-fun":
                "c mapped over every bth item of a ([c(v) if i%b==0 else v for i,v in enumerate(a)])"
        },
        vectorise: false,
        tests: [
            "[[1,3,4],1,2] : [1,2,3,4]",
            "[134,1,2] : 1234",
            "[[1,3,4],-1,2] : [1,3,4,2]",
            "[[1,3,4],1.9,2] : [1,2,3,4]",
            '["wyz",1,"x"] : "wxyz"',
            '["jknop",2,"lm"] : "jklmnop"'
        ]
    },
    {
        element: "Ṅ",
        name: "Integer partitions / First Truthy Non-Negative Integer",
        description: "Integer partitions / join by space",
        arity: 1,
        overloads: {
            num: "integer_partitions(a) (integer partitions)",
            any: '" ".join(a) (join by space)',
            fun: "first truthy non-negative integer where a is truthy"
        },
        vectorise: false,
        tests: [
            "[5] : [[1,1,1,1,1],[2,1,1,1],[3,1,1],[2,2,1],[4,1],[3,2],[5]]",
            '["hello"] : "h e l l o"',
            '[[1,2,3]] : "1 2 3"'
        ]
    },
    {
        element: "Ȯ",
        name: "Over",
        description: "Push the second-last item of stack to the top",
        arity: 0,
        vectorise: false,
        tests: ["[4,5] : 4", '["hi","bye"] : "hi"']
    },
    {
        element: "Ṗ",
        name: "Permutations",
        description: "Get all permutations of a value",
        arity: 1,
        overloads: { any: "permutations(a) (get all permutations)" },
        tests: [
            '["abc"] : ["abc","acb","bac","bca","cab","cba"]',
            "[[1,2]] : [[1,2],[2,1]]",
            "[12] : [[1,2],[2,1]]",
            '[["abc", "def", "ghi"]] : [["abc", "def", "ghi"], ["abc", "ghi", "def"], ["def", "abc", "ghi"], ["def", "ghi", "abc"], ["ghi", "abc", "def"], ["ghi", "def", "abc"]]'
        ]
    },
    {
        element: "Ṙ",
        name: "Reverse",
        description: "Reverse a value",
        arity: 1,
        overloads: { any: "reversed(a)" },
        vectorise: false,
        tests: ["[203] : 302", "[-203] : -302", '["abc"] : "cba"', "[[1, 2, 3, 4]] : [4, 3, 2, 1]"]
    },
    {
        element: "Ṡ",
        name: "Vectorised sums / Strip whitespace from both sides / Is positive",
        description: "Sum of each item in a list",
        arity: 1,
        overloads: { lst: "vectorising_sum(a)", str: "a.strip()", num: "is_positive(a)" },
        tests: [
            "[[[1 ,2, 3], [4, 5, 6]]] : [6, 15]",
            "[[3, 4, 5]] : [3, 4, 5]",
            "[[[1, 2, 3], [1, 2, 3, 4]]] : [6, 10]",
            "[' abc  '] : 'abc'",
            "['abc     '] : 'abc'",
            "[3] : 1",
            "[0] : 0",
            "[-5] : 0"
        ]
    },
    {
        element: "Ṫ",
        name: "Tail Remove / Truthy Under",
        description: "Cut off the last item of a list / push 1 under the top of the stack",
        arity: 1,
        overloads: { num: "push 1 then the popped item", any: "a[:-1] (all but the last item)" },
        vectorise: false,
        tests: [
            '["1234"] : "123"',
            "[[1,2,3]] : [1,2]",
            "[[]] : []",
            '[""] : ""',
            "[-1234.56] : -1234.56"
        ]
    },
    {
        element: "Ẇ",
        name: "Split And Keep Delimiter",
        description: "Split a value and keep the delimiter",
        arity: 2,
        overloads: {
            "any-any": "a.split_and_keep_delimiter(b) (split and keep the delimiter)",
            "fun-any": "apply a to every second item of b starting on the first item"
        },
        vectorise: false,
        tests: [
            '["a b c"," "] : ["a"," ","b"," ","c"]',
            '["xyzabc123abc","b"] : ["xyza","b","c123a","b","c"]',
            "[-1231234.5, 4] : [2, 4, 62, 4, 34.5]",
            "[-1231234.5, 2] : ['', 2.0, 46.0, 2.0, '469/', 2.0]",
            "[[1, 2, 3, 4, 3, 2, 1, 4], 4] : [[1, 2, 3], [4], [3, 2, 1], [4], []]",
            "[[], 4] : [[]]"
        ]
    },
    {
        element: "Ẋ",
        name: "Cartesian Product / Fixpoint",
        description:
            "Take the Cartesian Product of two values, or apply a function until there is no change. If arguments are numbers, turns them into ranges.\n",
        arity: 2,
        overloads: {
            "any-any": "cartesian-product(a,b)",
            "fun-any": "apply a on b until b does not change"
        },
        vectorise: false,
        tests: [
            '["ab","cd"] : ["ac","ad","bc","bd"]',
            '["ab",["c","d"]] : [["a","c"],["a","d"],["b","c"],["b","d"]]',
            "[[1,2],[3,4]] : [[1,3],[1,4],[2,3],[2,4]]",
            "[2,3] : [[1,1],[1,2],[2,1],[1,3],[2,2],[2,3]]"
        ]
    },
    {
        element: "Ẏ",
        name: "Slice Until",
        description: "Slice a list until a certain index / find all results for a regex match",
        arity: 2,
        overloads: {
            "any-num": "a[0:b] (slice until b)",
            "num-any": "b[0:a] (slice until a)",
            "str-str": "regex.findall(pattern=a,string=b) (find all matches for a regex)",
            "any-fun": "take results from a while b(x) is truthy",
            "fun-any": "take results from b while a(x) is truthy"
        },
        vectorise: true,
        tests: [
            '["abc",1] : "a"',
            "[[1,2,3],2] : [1,2]",
            "[123,2] : 12",
            '["abc","."] : ["a","b","c"]',
            '["abc","d"] : []',
            '["abc", 9] : "abcabcabc"'
        ]
    },
    {
        element: "Ż",
        name: "Slice From One Until",
        description: "Slice from index 1 until a number / get groups of a regex match",
        arity: 2,
        overloads: {
            "any-num": "a[1:b] (slice from 1 until b)",
            "num-any": "b[1:a] (slice from 1 until a)",
            "str-str": "regex.match(pattern=a,string=b).groups() (Get groups for a regex match)",
            "fun-any": "get all groups from b where a(x) is truthy"
        },
        vectorise: true,
        tests: [
            '["abc",2] : "b"',
            "[[1,2,3],3] : [2,3]",
            "[123,3] : 23",
            '["abc","."] : []',
            '["abc","d"] : []',
            '["abc", 9] : "bcabcabc"'
        ]
    },
    {
        modifier: "₌",
        name: "Parallel Apply",
        description: "Parallel apply two elements to the top of the stack",
        usage: "₌<element><element>"
    },
    {
        modifier: "₍",
        name: "Parallel Apply Wrap",
        description: "Parallel apply two elements and wrap the results in a list",
        usage: "₍<element><element>"
    },
    {
        element: "⁰",
        name: "Very Last Input",
        description: "Push the very last input (input[::-1][0]) to the stack",
        arity: 0
    },
    {
        element: "¹",
        name: "Second Last Input",
        description: "Push the very last input (input[::-1][1]) to the stack",
        arity: 0
    },
    {
        element: "²",
        name: "Square",
        description: "Square a number / Format a string into a square",
        arity: 1,
        overloads: {
            num: "a ** 2 (squared)",
            str: "a formatted as a square (list of sqrt(len(a)) strings, each sqrt(len(a)) long, such that joining the strings and removing spaces in the end gives a)"
        },
        vectorise: true,
        tests: [
            "[5] : 25",
            "[2j] : -4",
            '["hello"] : ["hel","lo ", "   "]',
            '["bye"] : ["by","e "]',
            "[[1,2,3]] : [1,4,9]"
        ]
    },
    {
        element: "∇",
        name: "Shift",
        description: "Shift the top of stack two values down",
        arity: 3,
        overloads: { "any-any-any": "c,a,b (shift)" },
        vectorise: false,
        tests: ["[1,4,5] : 4", '["my","hi","bye"] : "hi"']
    },
    {
        element: "⌈",
        name: "Ceiling",
        description:
            "Take the ceiling of a number / Imaginary part of complex number / split a string on spaces",
        arity: 1,
        overloads: {
            num: "ceil(a) (ceiling)",
            complex: "imaginary part of a",
            str: "split on spaces"
        },
        vectorise: true,
        tests: [
            "[5] : 5",
            "[4.5] : 5",
            "[[1.52,2.9,3.3]] : [2,3,4]",
            '["hello world"] : ["hello","world"]',
            "[2j+3] : 2"
        ]
    },
    {
        element: "⌊",
        name: "Floor",
        description:
            "Floor a number / real part of complex number / extract the integer part of a string",
        arity: 1,
        overloads: { num: "floor(a) (floor)", complex: "real part of a", str: "integer part of a" },
        vectorise: true,
        tests: [
            "[5.3] : 5",
            "[[5.3,4.7]] : [5, 4]",
            '["123abc"] : 123',
            "[2j+3] : 3",
            '[""] : 0',
            '["-123"] : -123',
            '["-00609"] : -609'
        ]
    },
    {
        element: "¯",
        name: "Deltas",
        description: "Deltas (consecutive differences)",
        arity: 1,
        overloads: { any: "deltas(a) ([a[1] - a[0], a[2] - a[1], ...])" },
        vectorise: true,
        tests: [
            "[[1,2,3]] : [1,1]",
            "[123] : [1,1]",
            "[[1,1,1]] : [0,0]",
            "[[40,61,3]] : [21,-58]",
            "[[]] : []",
            '["abaabb"] : ["b","a","","b",""]'
        ]
    },
    {
        element: "±",
        name: "Sign",
        description: "Get the sign of a number",
        arity: 1,
        overloads: { num: "sign_of(a) (positive = 1, 0 = 0; negative = -1)", str: "is a numeric" },
        vectorise: true,
        tests: ["[1] : 1", '["hi"] : 0', "[-5] : -1", "[0] : 0"]
    },
    {
        element: "₴",
        name: "Print Without Newline",
        description: "Print a value without a trailing newline",
        arity: 1
    },
    {
        element: "…",
        name: "Print Without Popping",
        description: "Print a value without popping the stack",
        arity: 0
    },
    { element: "□", name: "Input List", description: "All inputs wrapped in a list", arity: 0 },
    {
        element: "↳",
        name: "Right Bit Shift",
        description: "Right-bitshift a value / right-justify a string",
        arity: 2,
        overloads: {
            "num-num": "a << b",
            "num-str": "a.rjust(b)",
            "str-num": "b.rjust(a)",
            "str-str": "a.rjust(len(b)-len(a))"
        },
        vectorise: true,
        tests: [
            "[4,1] : 2",
            '[8,"green"] : "   green"',
            '["hello","cheeseburger"] : "       hello"'
        ]
    },
    {
        element: "↲",
        name: "Left Bit Shift",
        description: "Left-bitshift a value / left-justify a string",
        arity: 2,
        overloads: {
            "num-num": "a >> b",
            "num-str": "a.ljust(b)",
            "str-num": "b.ljust(a)",
            "str-str": "a.ljust(len(b)-len(a))"
        },
        vectorise: true,
        tests: [
            "[4,1] : 8",
            '[8,"green"] : "green   "',
            '["hello","cheeseburger"] : "hello       "'
        ]
    },
    {
        element: "⋏",
        name: "Bitwise And",
        arity: 2,
        description: "Performs bitwise and between two numbers / centre a string",
        overloads: {
            "num-num": "a & b",
            "num-str": "b.center(a)",
            "str-num": "a.center(b)",
            "str-str": "a.center(len(b) - len(a))"
        },
        vectorise: true,
        tests: ["[420, 69] : 4", '["abc", 10] : "   abc    "', '["no", "gamers"] : " no "']
    },
    {
        element: "⋎",
        name: "Bitwise Or",
        arity: 2,
        description:
            "Performs bitwise or between two numbers / Removes a character at nth index / Merges strings on longest common prefix and suffix",
        overloads: {
            "num-num": "a | b",
            "num-str": "b[:a]+b[a+1:]",
            "str-num": "a[:b]+a[b+1:]",
            "str-str": "merge_join(a,b)"
        },
        vectorise: true,
        tests: [
            "[420, 69] : 485",
            '[2, "abc"] : "ab"',
            '["abc", 2] : "ab"',
            '["Hello", "lower"] : "Hellower"'
        ]
    },
    {
        element: "꘍",
        name: "Bitwise Xor",
        arity: 2,
        description:
            "Performs bitwise xor between two numbers / appends n spaces to a string / prepends n characters to a string / Levenshtein Distance",
        overloads: {
            "num-num": "a ^ b",
            "num-str": '\\" \\" * a + b',
            "str-num": 'a + \\" \\" * b',
            "str-str": "levenshtein_distance(a,b)"
        },
        vectorise: true,
        tests: [
            "[420, 69] : 481",
            '[5, "ab"] : "     ab"',
            '["ab", 5] : "ab     "',
            '["atoll", "bowl"] : 3'
        ]
    },
    {
        element: "ꜝ",
        name: "Bitwise Not",
        arity: 1,
        description:
            "Performs bitwise not on a number / check if any letters are uppercase / keep only truthy elements of a list",
        overloads: { num: "~a", str: "any_upper(a)", lst: "keep truthy" },
        vectorise: false,
        tests: ["[220] : -221", '["Hello"] : 1', '[["", 0, "w", 3]] : ["w", 3]']
    },
    {
        element: "℅",
        name: "Random Choice",
        arity: 1,
        description: "Random choice of single item from array",
        overloads: { lst: "random.choice(a)", num: "Random integer from 1 to a" },
        vectorise: false,
        tests: ['[""] : ""', "[[]] : 0", "[[1]] : 1", "[1] : 1", '["a"] : "a"']
    },
    {
        element: "≤",
        name: "Lesser Than or Equal To",
        arity: 2,
        description: "a is lesser than or equal to b?",
        overloads: { "any-any": "a <= b" },
        vectorise: true,
        tests: ["[1,2] : 1", '[1,"1"] : 1']
    },
    {
        element: "≥",
        name: "Greater Than or Equal To",
        arity: 2,
        description: "a is greater than or equal to b?",
        overloads: { "any-any": "a >= b" },
        vectorise: true,
        tests: ["[1,2] : 0", '[1,"1"] : 1']
    },
    {
        element: "≠",
        name: "Not Equal To",
        arity: 2,
        description: "a is not equal to b?",
        overloads: { "any-any": "a != b" },
        vectorise: false,
        tests: ["[1,2] : 1", '[1,"1"] : 0']
    },
    {
        element: "⁼",
        name: "Exactly Equal To",
        arity: 2,
        description: "a equal to b? (non-vectorizing)",
        overloads: { "any-any": "a == b" },
        vectorise: false,
        tests: ["[1,2] : 0", '[1,"1"] : 1']
    },
    {
        modifier: "ƒ",
        name: "Reduce by",
        description: "Reduce by an element",
        arity: 2,
        usage: "ƒ<element>"
    },
    {
        modifier: "ɖ",
        name: "Scan by",
        description: "Cumulatively reduce by an element",
        arity: 2,
        usage: "ɖ<element>"
    },
    {
        element: "∪",
        name: "Set Union",
        arity: 2,
        description: "Merge two arrays without duplicates",
        overloads: { "any-any": "list(set(a).union(set(b)))" },
        vectorise: false,
        tests: [
            "[[1,2],[2,3,4]] : [1,2,3,4]",
            "[12,234] : [1,2,3,4]",
            '[12,"12"] : [1,2,"1","2"]',
            '["12",12] : ["1","2",1,2]'
        ]
    },
    {
        element: "∩",
        name: "Transpose",
        arity: 1,
        description: "Transpose an array",
        overloads: { any: "transposed array" },
        vectorise: false,
        tests: [
            "[[[1,2],[2,3,4]]] : [[1, 2], [2, 3], [4]]",
            "[[[1,2,3,4]]] : [[1], [2], [3], [4]]",
            "[[1,2,3,4]] : [[1, 2, 3, 4]]",
            "[1234] : [[1, 2, 3, 4]]",
            '[["abc", "def", "ghi"]] : ["adg", "beh", "cfi"]',
            '[["abcde", "fgh"]] : ["af", "bg", "ch", "d", "e"]'
        ]
    },
    {
        element: "⊍",
        name: "Symmetric Set difference",
        arity: 2,
        description: "Uncommon elements of two arrays",
        overloads: { "any-any": "list(set(a) ^ set(b))" },
        vectorise: false,
        tests: [
            "[[1,2],[2,3,4]] : [1,3,4]",
            "[12,234] : [1,3,4]",
            '[12,"12"] : []',
            '["12",12] : []'
        ]
    },
    {
        element: "£",
        name: "Set Register",
        arity: 1,
        description: "Set the register to argument value",
        overloads: { any: "set_register(a)" },
        vectorise: false
    },
    {
        element: "¥",
        name: "Push Register",
        arity: 0,
        description: "Push the current register value",
        vectorise: false
    },
    {
        element: "⇧",
        name: "Grade Up",
        arity: 1,
        description:
            "Indices of elements to sort in ascending order / uppercase / increment number twice",
        overloads: { lst: "graded_up(a)", str: "a.upper()", num: "a + 2" },
        vectorise: false,
        tests: [
            "[[420,69,1337]] : [1,0,2]",
            "[[[420],[69],[1337]]] : [1,0,2]",
            '["Heloo"] : "HELOO"',
            "[4] : 6"
        ]
    },
    {
        element: "⇩",
        name: "Grade Down",
        arity: 1,
        description:
            "Indices of elements to sort in descending order / lowercase / decrement number twice",
        overloads: { lst: "graded_down(a)", str: "a.lower()", num: "a - 2" },
        vectorise: false,
        tests: [
            "[[420,69,1337]] : [2,0,1]",
            "[[[420],[69],[1337]]] : [2,0,1]",
            '["Heloo"] : "heloo"',
            "[4] : 2"
        ]
    },
    {
        element: "Ǎ",
        name: "Remove non-alphabets",
        arity: 1,
        description: "Remove non-alphabetical characters / power with base 2",
        overloads: { str: "filter(isalpha, a)", num: "2 ** a" },
        vectorise: true,
        tests: ['["Helo1233adc__"] : "Heloadc"', "[8] : 256"]
    },
    {
        element: "ǎ",
        name: "Nth prime",
        arity: 1,
        description: "nth prime / all substrings",
        overloads: { str: "substrings(a)", num: "nth_prime(a)" },
        vectorise: true,
        tests: ["[3] : 7", '["abc"] : ["a","ab","abc","b","bc","c"]', '[""] : []']
    },
    {
        element: "Ǐ",
        name: "Prime factorization",
        arity: 1,
        description: "prime factorization / append first element",
        overloads: {
            num: "prime_factorization(a) (distinct prime factors)",
            str: "a + a[0]",
            lst: "a + [a[0]]"
        },
        vectorise: false,
        tests: ["[45] : [3,5]", '["abc"] : "abca"', "[[1, 2, 3]] : [1, 2, 3, 1]", "[[]] : []"]
    },
    {
        element: "ǐ",
        name: "Prime factors",
        arity: 1,
        description: "all prime factors / Title Case string",
        overloads: {
            num: "prime_factors(a) (prime factors possibly with repetition)",
            str: "title_case(a)"
        },
        vectorise: true,
        tests: ["[45] : [3, 3, 5]", '["abc def"] : "Abc Def"']
    },
    {
        element: "Ǒ",
        name: "Multiplicity / Remove Fixpoint / First Truthy Index Under Function",
        arity: 2,
        description:
            "Order, Multiplicity, Valuation / remove till fixpoint / First truthy index under function application",
        overloads: {
            "num-num": "multiplicity(a,b)",
            "str-str": "remove_till_fixpoint(a,b)",
            "fun-any": "first index in a where b(x) is truthy (shortcut for ḟh)"
        },
        vectorise: true,
        tests: [
            "[45, 3] : 2",
            "[1.125, 2] : 0",
            "[1.125, 3] : 0",
            "[0, 2] : 0",
            "[-3, 1] : 3",
            '["aaabbbc", "ab"] : "c"'
        ]
    },
    {
        element: "ǒ",
        name: "Modulo 3",
        arity: 1,
        description: "Modulo 3 / Split into Length 2",
        overloads: { num: "a % 3", str: "a split into chunks of length 2" },
        vectorise: true,
        tests: ["[45] : 0", '["abcdefghi"] : ["ab", "cd", "ef", "gh", "i"]', '[""] : []']
    },
    {
        element: "Ǔ",
        name: "Rotate Left",
        arity: 2,
        description: "Rotate Left / Rotate Left Once",
        overloads: { "any-num": "rotate_left(a,b)", "any-any": "a,(b[1:]+b[:1])" },
        vectorise: false,
        tests: [
            "[3, [4, 5, 5, 6]] : [5, 5, 6, 4]",
            "[3, [1, 2, 3, 4]] : [2, 3, 4, 1]",
            '[3, "abcd"] : "bcda"',
            '[3, "abcd", 4] : "abcd"',
            '[3, "abcd", -1] : "dabc"'
        ]
    },
    {
        element: "ǔ",
        name: "Rotate Right",
        arity: 2,
        description: "Rotate Right / Rotate Right Once",
        overloads: { "any-num": "rotate_right(a,b)", "any-any": "a,(b[-1:]+b[:-1])" },
        vectorise: false,
        tests: [
            "[3, [4, 5, 5, 6]] : [6, 4, 5, 5]",
            "[3, [1, 2, 3, 4]] : [4, 1, 2, 3]",
            '[3, "abcd"] : "dabc"',
            '[3, "abcd", 4] : "abcd"',
            '[3, "abcd", -1] : "bcda"'
        ]
    },
    {
        element: "⁽",
        name: "One Element Lambda",
        arity: 0,
        description: "One Element lambda function (prefix)",
        vectorise: false
    },
    {
        element: "‡",
        name: "Two Element Lambda",
        arity: 0,
        description: "Two Element lambda function (prefix)",
        vectorise: false
    },
    {
        element: "≬",
        name: "Three Element Lambda",
        arity: 0,
        description: "Three Element lambda function (prefix)",
        vectorise: false
    },
    {
        element: "⁺",
        name: "Index of next character in codepage",
        arity: 0,
        description: "Return the index of the next character in the vyxal code page + 101",
        vectorise: false
    },
    {
        element: "↵",
        name: "Split On newlines",
        arity: 1,
        description: "Split on newlines / Power with base 10",
        overloads: { str: 'a.split("\\n")', num: "10 ** a" },
        vectorise: true,
        tests: ['["a\\nb\\nc"] : ["a", "b", "c"]', "[3] : 1000"]
    },
    {
        element: "⅛",
        name: "Push To Global Array",
        arity: 1,
        description: "Push to global array (no popping)",
        vectorise: false
    },
    {
        element: "¼",
        name: "Pop From Global Array",
        arity: 0,
        description: "Pop from global array, push to stack",
        vectorise: false
    },
    {
        element: "¾",
        name: "Push Global Array",
        arity: 0,
        description: "Push global array, no modification of global array",
        vectorise: false
    },
    {
        element: "Π",
        name: "Product of Array / Cartesian product over list",
        arity: 1,
        description: "Product of Array / Cartesian product over a list of lists",
        overloads: {
            num: "binary representation of a (shortcut for bṅ)",
            "lst[num]": "reduce list by multiplication",
            "lst[str|lst]": "reduce list by Cartesian product"
        },
        vectorise: false,
        tests: [
            '[3] : "11"',
            '[30] : "11110"',
            "[[3,4,5]] : 60",
            "[[]] : 1",
            "[[[1, 2], [3], [4, 5]]] : [[1, 3, 4], [1, 3, 5], [2, 3, 4], [2, 3, 5]]",
            "[[[1, 2], [3, 4], []]] : []",
            '[["ab","cd"]] : ["ac","ad","bc","bd"]',
            '[["abc", "def", "ghi"]] : ["adg", "adh", "adi", "aeg", "aeh", "aei", "afg", "afh", "afi", "bdg", "bdh", "bdi", "beg", "beh", "bei", "bfg", "bfh", "bfi", "cdg", "cdh", "cdi", "ceg", "ceh", "cei", "cfg", "cfh", "cfi"]'
        ]
    },
    {
        element: "„",
        name: "Rotate Stack Left",
        arity: 0,
        description: "Rotate Stack Left",
        vectorise: false
    },
    {
        element: "‟",
        name: "Rotate Stack Right",
        arity: 0,
        description: "Rotate Stack Right",
        vectorise: false
    },
    {
        element: "🍪",
        name: "Cookie",
        description: 'print "cookie" forever',
        vectorise: false,
        arity: 0
    },
    {
        element: "ඞ",
        name: "sus",
        description: 'print "sus"',
        vectorise: false,
        arity: 0,
        tests: ['[] : "sus"']
    },
    {
        element: "kA",
        name: "Uppercase alphabet",
        arity: 0,
        description: '"ABCDEFGHIJKLMNOPQRSTUVWXYZ" (uppercase alphabet)',
        vectorise: false,
        tests: ['[] : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"']
    },
    {
        element: "ke",
        name: "e, Euler's number",
        arity: 0,
        description: "2.718281828459045 (math.e, Euler's number)",
        vectorise: false,
        tests: ["[] : 2.7182818284590452354"]
    },
    {
        element: "kf",
        name: "Fizz",
        arity: 0,
        description: "Fizz",
        vectorise: false,
        tests: ['[] : "Fizz"']
    },
    {
        element: "kb",
        name: "Buzz",
        arity: 0,
        description: "Buzz",
        vectorise: false,
        tests: ['[] : "Buzz"']
    },
    {
        element: "kF",
        name: "FizzBuzz",
        arity: 0,
        description: "FizzBuzz",
        vectorise: false,
        tests: ['[] : "FizzBuzz"']
    },
    {
        element: "kH",
        name: "Hello, World!",
        arity: 0,
        description: "Hello, World!",
        vectorise: false,
        tests: ['[] : "Hello, World!"']
    },
    {
        element: "kh",
        name: "Hello World (No Punctuation)",
        arity: 0,
        description: "Hello World",
        vectorise: false,
        tests: ['[] : "Hello World"']
    },
    {
        element: "k1",
        name: 1000,
        arity: 0,
        description: "10^3 / 1000",
        vectorise: false,
        tests: ["[] : 1000"]
    },
    {
        element: "k2",
        name: 10000,
        arity: 0,
        description: "10^4 / 10000",
        vectorise: false,
        tests: ["[] : 10000"]
    },
    {
        element: "k3",
        name: 100000,
        arity: 0,
        description: "10^5 / 100000",
        vectorise: false,
        tests: ["[] : 100000"]
    },
    {
        element: "k4",
        name: 1000000,
        arity: 0,
        description: "10^6 / 1000000",
        vectorise: false,
        tests: ["[] : 1000000"]
    },
    {
        element: "ka",
        name: "Lowercase alphabet",
        arity: 0,
        description: '"abcdefghijklmnopqrstuvwxyz" (lowercase alphabet)',
        vectorise: false,
        tests: ['[] : "abcdefghijklmnopqrstuvwxyz"']
    },
    {
        element: "kL",
        name: "Lowercase and uppercase alphabet",
        arity: 0,
        description:
            '"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" (uppercase+lowercase alphabet)',
        vectorise: false,
        tests: ['[] : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"']
    },
    {
        element: "kd",
        name: "Digits",
        arity: 0,
        description: '"0123456789" (Digits 0-9)',
        vectorise: false,
        tests: ['[] : "0123456789"']
    },
    {
        element: "k6",
        name: "Hex digits (lowercase)",
        arity: 0,
        description: '"0123456789abcdef" (Hex digits)',
        vectorise: false,
        tests: ['[] : "0123456789abcdef"']
    },
    {
        element: "k^",
        name: "Hex digits (uppercase)",
        arity: 0,
        description: '"0123456789ABCDEF" (Hex digits uppercase)',
        vectorise: false,
        tests: ['[] : "0123456789ABCDEF"']
    },
    {
        element: "ko",
        name: "Octal digits",
        arity: 0,
        description: '"01234567" (Octal digits)',
        vectorise: false,
        tests: ['[] : "01234567"']
    },
    {
        element: "kp",
        name: "Punctuation",
        arity: 0,
        description: "string.punctuation (Punctuations)",
        vectorise: false,
        tests: ["[] : string.punctuation"]
    },
    {
        element: "kP",
        name: "Printable ASCII Without Space",
        arity: 0,
        description: "printable ascii exluding space",
        vectorise: false,
        tests: [
            "[] : '!\"#$%&\\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'"
        ]
    },
    {
        element: "kQ",
        name: "Printable ASCII With Space",
        arity: 0,
        description: "printable ascii with space",
        vectorise: false,
        tests: [
            "[] : ' !\"#$%&\\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'"
        ]
    },
    {
        element: "kw",
        name: "ASCII Whitespace",
        arity: 0,
        description: "All ASCII whitespace",
        vectorise: false
    },
    {
        element: "kr",
        name: "Digits, lowercase alphabet, and uppercase alphabet",
        arity: 0,
        description: '"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" (0-9A-Za-z)',
        vectorise: false,
        tests: ['[] : "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"']
    },
    {
        element: "kB",
        name: "Uppercase and lowercase alphabet",
        arity: 0,
        description: '"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" (A-Za-z)',
        vectorise: false,
        tests: ['[] : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"']
    },
    {
        element: "kZ",
        name: "Uppercase alphabet reversed",
        arity: 0,
        description: '"ZYXWVUTSRQPONMLKJIHGFEDCBA" (uppercase alphabet reversed)',
        vectorise: false,
        tests: ['[] : "ZYXWVUTSRQPONMLKJIHGFEDCBA"']
    },
    {
        element: "kz",
        name: "Lowercase alphabet reversed",
        arity: 0,
        description: '"zyxwvutsrqponmlkjihgfedcba" (lowercase alphabet reversed)',
        vectorise: false,
        tests: ['[] : "zyxwvutsrqponmlkjihgfedcba"']
    },
    {
        element: "kl",
        name: "Uppercase and lowercase alphabet, reversed",
        arity: 0,
        description: '"ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba" (Z-Az-a)',
        vectorise: false,
        tests: ['[] : "ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba"']
    },
    {
        element: "ki",
        name: "Pi",
        arity: 0,
        description: "3.141592653589793 (Pi)",
        vectorise: false,
        tests: ["[] : 3.141592653589793"]
    },
    {
        element: "kg",
        name: "Golden ratio/phi",
        arity: 0,
        description: "1.618033988749895 (golden ratio/phi)",
        vectorise: false,
        tests: ["[] : 1.618033988749895"]
    },
    {
        element: "kD",
        name: "Current day in the format YYYY-MM-DD",
        arity: 0,
        description: "Current day in the format YYYY-MM-DD",
        vectorise: false
    },
    {
        element: "kN",
        name: "Current time as a list of ⟨hh|mm|ss⟩",
        arity: 0,
        description: "Current time as a list of ⟨hh|mm|ss⟩",
        vectorise: false
    },
    {
        element: "kḋ",
        name: "Current day in the format DD/MM/YYYY",
        arity: 0,
        description: "Current day in the format DD/MM/YYYY",
        vectorise: false
    },
    {
        element: "kḊ",
        name: "Current day in the format MM/DD/YYYY",
        arity: 0,
        description: "Current day in the format MM/DD/YYYY",
        vectorise: false
    },
    {
        element: "kð",
        name: "Current day in the format ⟨DD|MM|YYYY⟩",
        arity: 0,
        description: "Current day in the format ⟨DD|MM|YYYY⟩",
        vectorise: false
    },
    {
        element: "kβ",
        name: "Braces, square brackets, angle brackets, and parentheses",
        arity: 0,
        description: "{}[]<>()",
        vectorise: false,
        tests: ['[] : "{}[]<>()"']
    },
    {
        element: "kḂ",
        name: "Parentheses, square brackets, and braces",
        arity: 0,
        description: '"()[]{}" (Brackets)',
        vectorise: false,
        tests: ['[] : "()[]{}"']
    },
    {
        element: "kß",
        name: "Parentheses and square brackets",
        arity: 0,
        description: "()[]",
        vectorise: false,
        tests: ['[] : "()[]"']
    },
    {
        element: "kḃ",
        name: "Opening brackets",
        arity: 0,
        description: '"([{" (Open brackets)',
        vectorise: false,
        tests: ['[] : "([{"']
    },
    {
        element: "k≥",
        name: "Closing brackets",
        arity: 0,
        description: '")]}" (Close brackets)',
        vectorise: false,
        tests: ['[] : ")]}"']
    },
    {
        element: "k≤",
        name: "Opening brackets (with <)",
        arity: 0,
        description: '"([{<" (Fish bones :P)',
        vectorise: false,
        tests: ['[] : "([{<"']
    },
    {
        element: "kΠ",
        name: "Closing brackets (with >)",
        arity: 0,
        description: '")]}>" (Closing brackets)',
        vectorise: false,
        tests: ['[] : ")]}>"']
    },
    {
        element: "kv",
        name: "Lowercase vowels",
        arity: 0,
        description: '"aeiou" (Vowels lowercase)',
        vectorise: false,
        tests: ['[] : "aeiou"']
    },
    {
        element: "kV",
        name: "Upercase vowels",
        arity: 0,
        description: '"AEIOU" (Vowels uppercase)',
        vectorise: false,
        tests: ['[] : "AEIOU"']
    },
    {
        element: "k∨",
        name: "Lowercase and uppercase vowels",
        arity: 0,
        description: '"aeiouAEIOU" (vowelsVOWELS)',
        vectorise: false,
        tests: ['[] : "aeiouAEIOU"']
    },
    {
        element: "k⟇",
        name: "Vyxal codepage",
        arity: 0,
        description: "Yields the Vyxal codepage",
        vectorise: false
    },
    {
        element: "k½",
        name: "[1, 2]",
        arity: 0,
        description: "[1, 2]",
        vectorise: false,
        tests: ["[] : [1, 2]"]
    },
    {
        element: "kḭ",
        name: "4294967296",
        arity: 0,
        description: "2 ** 32, 2^32, 4294967296",
        vectorise: false,
        tests: ["[] : 4294967296"]
    },
    {
        element: "k+",
        name: "[1, -1]",
        arity: 0,
        description: "[1, -1]",
        vectorise: false,
        tests: ["[] : [1, -1]"]
    },
    {
        element: "k-",
        name: "[-1, 1]",
        arity: 0,
        description: "[-1, 1]",
        vectorise: false,
        tests: ["[] : [-1, 1]"]
    },
    {
        element: "k≈",
        name: "[0, 1]",
        arity: 0,
        description: "[0, 1]",
        vectorise: false,
        tests: ["[] : [0, 1]"]
    },
    {
        element: "k/",
        name: "Slashes",
        arity: 0,
        description: '"/\\\\" (Forwardslash, backslash)',
        vectorise: false,
        tests: ['[] : "/\\\\"']
    },
    {
        element: "kR",
        name: "360",
        arity: 0,
        description: "360",
        vectorise: false,
        tests: ["[] : 360"]
    },
    {
        element: "kW",
        name: "https://",
        arity: 0,
        description: "https://",
        vectorise: false,
        tests: ['[] : "https://"']
    },
    {
        element: "k℅",
        name: "http://",
        arity: 0,
        description: "http://",
        vectorise: false,
        tests: ['[] : "http://"']
    },
    {
        element: "k↳",
        name: "https://www.",
        arity: 0,
        description: "https://www.",
        vectorise: false,
        tests: ['[] : "https://www."']
    },
    {
        element: "k²",
        name: "http://www.",
        arity: 0,
        description: "http://www.",
        vectorise: false,
        tests: ['[] : "http://www."']
    },
    {
        element: "k¶",
        name: "512",
        arity: 0,
        description: "512",
        vectorise: false,
        tests: ["[] : 512"]
    },
    {
        element: "k⁋",
        name: "1024",
        arity: 0,
        description: "1024",
        vectorise: false,
        tests: ["[] : 1024"]
    },
    {
        element: "k¦",
        name: "2048",
        arity: 0,
        description: "2048",
        vectorise: false,
        tests: ["[] : 2048"]
    },
    {
        element: "kṄ",
        name: "4096",
        arity: 0,
        description: "4096",
        vectorise: false,
        tests: ["[] : 4096"]
    },
    {
        element: "kṅ",
        name: "8192",
        arity: 0,
        description: "8192",
        vectorise: false,
        tests: ["[] : 8192"]
    },
    {
        element: "k¡",
        name: "16384",
        arity: 0,
        description: "16384",
        vectorise: false,
        tests: ["[] : 16384"]
    },
    {
        element: "kε",
        name: "32768",
        arity: 0,
        description: "32768",
        vectorise: false,
        tests: ["[] : 32768"]
    },
    {
        element: "k₴",
        name: "65536",
        arity: 0,
        description: "65536",
        vectorise: false,
        tests: ["[] : 65536"]
    },
    {
        element: "k×",
        name: "2147483648",
        arity: 0,
        description: "2147483648",
        vectorise: false,
        tests: ["[] : 2147483648"]
    },
    {
        element: "k⁰",
        name: "Lowercase consonants with y",
        arity: 0,
        description: "bcdfghjklmnpqrstvwxyz",
        vectorise: false,
        tests: ['[] : "bcdfghjklmnpqrstvwxyz"']
    },
    {
        element: "k¹",
        name: "Lowercase consonants without y",
        arity: 0,
        description: "bcdfghjklmnpqrstvwxz",
        vectorise: false
    },
    {
        element: "kT",
        name: "BF command set",
        arity: 0,
        description: 'BF command set ("[]<>-+.,")',
        vectorise: false,
        tests: ['[] : "[]<>-+.,"']
    },
    {
        element: "kṗ",
        name: "Bracket pair list",
        arity: 0,
        description: 'List of bracket pairs ("[(),[],{},<>]")',
        vectorise: false,
        tests: ['[] : ["()","[]","{}","<>"]']
    },
    {
        element: "kṖ",
        name: "Nested brackets",
        arity: 0,
        description: 'String of all brackets nested ("([{<>}])")',
        vectorise: false,
        tests: ['[] : "([{<>}])"']
    },
    {
        element: "kS",
        name: "Amogus",
        arity: 0,
        description: 'Amogus ("ඞ")',
        vectorise: false,
        tests: ['[] : "ඞ"']
    },
    {
        element: "k₁",
        name: "[1, 1]",
        arity: 0,
        description: "The list [1, 1]",
        vectorise: false,
        tests: ["[] : [1, 1]"]
    },
    {
        element: "k₂",
        name: "2 ** 20",
        arity: 0,
        description: "2 to the power of 20, 1048576",
        vectorise: false,
        tests: ["[] : 1048576"]
    },
    {
        element: "k₃",
        name: "2 ** 30",
        arity: 0,
        description: "2 to the power of 30, 1073741824",
        vectorise: false,
        tests: ["[] : 1073741824"]
    },
    {
        element: "k∪",
        name: "Lowercase Vowels With Y",
        arity: 0,
        description: 'Lowercase vowels with y, "aeiouy"',
        vectorise: false,
        tests: ['[] : "aeiouy"']
    },
    {
        element: "k⊍",
        name: "Uppercase Vowels With Y",
        arity: 0,
        description: 'Uppercase vowels with y, "AEIOUY"',
        vectorise: false,
        tests: ['[] : "AEIOUY"']
    },
    {
        element: "k∩",
        name: "Vowels With Y",
        arity: 0,
        description: 'Vowels with y, "aeiouyAEIOUY"',
        vectorise: false,
        tests: ['[] : "aeiouyAEIOUY"']
    },
    {
        element: "k□",
        name: "Directions",
        arity: 0,
        description: "Cardinal directions, [[0,1],[1,0],[0,-1],[-1,0]]",
        vectorise: false,
        tests: ["[] : [[0,1],[1,0],[0,-1],[-1,0]]"]
    },
    {
        element: "kṘ",
        name: "Roman Numerals",
        arity: 0,
        description: "IVXLCDM",
        vectorise: false,
        tests: ['[] : "IVXLCDM"']
    },
    {
        element: "k•",
        name: "Qwerty Keyboard",
        arity: 0,
        description: 'The list ["qwertyuiop","asdfghjkl","zxcvbnm"]',
        vectorise: false,
        tests: ['[] : ["qwertyuiop","asdfghjkl","zxcvbnm"]']
    },
    {
        element: "∆b",
        name: "Binary String",
        arity: 1,
        description: "Get a binary string of a number",
        overloads: { num: 'bin(a).replace("0b", "")' },
        vectorise: true,
        tests: ['[-23] : "-10111"', '[45] : "101101"', '[[-2, 4]] : ["-10", "100"]']
    },
    {
        element: "∆c",
        name: "Cosine",
        arity: 1,
        description: "Get the cosine of an angle in radians",
        overloads: { num: "math.cos(a)" },
        vectorise: true,
        tests: ["[3.14159265358979] : -1", "[0] : 1", "[6.283185307] : 1"]
    },
    {
        element: "∆C",
        name: "Arc Cosine",
        arity: 1,
        description: "Get the arccosine of an angle in radians",
        overloads: { num: "math.arrcos(a)" },
        vectorise: true,
        tests: ["[-1] : 3.14159265358979", "[1] : 0"]
    },
    {
        element: "∆q",
        name: "Quadratic Solver",
        arity: 2,
        description: "Solve a quadratic equation of the form ax^2 + bx = 0",
        overloads: {
            "num-num": "x such that ax^2 + bx = 0",
            "num-str": "solve for x such that a = b(x)",
            "str-num": "solve for x such that a(x) = b",
            "str-str": "solve for x such that a(x) = b(x)"
        },
        vectorise: true,
        tests: ["[1, 2] : [-2, 0]", "[1, -2] : [0, 2]", "[69, 420] : [-140/23, 0.0]"]
    },
    {
        element: "∆Q",
        name: "General Quadratic Solver",
        arity: 2,
        description: "Solve a quadratic equation of the form x^2 + ax + b = 0",
        overloads: {
            "num-num": "roots(a, b) / x^2 + ax + b = 0",
            "num-str": "evaluate single variable expression b with x=a",
            "str-num": "evaluate single variable expression a with x=b",
            "str-str": "solve equations a and b simultaneously for x and y"
        },
        vectorise: true,
        tests: [
            "[1, -2] : [-2, 1]",
            "[29, -30] : [-30, 1]",
            "[69, 420] : [-62.2533781727558, -6.74662182724416]"
        ]
    },
    {
        element: "∆s",
        name: "Sine",
        arity: 1,
        description: "Get the sine of an angle in radians",
        overloads: { num: "math.sin(a)" },
        vectorise: true,
        tests: ["[3.14159265358979] : 0", "[0] : 0", "[6.28318530717959] : 0"]
    },
    {
        element: "∆S",
        name: "Arc Sine",
        arity: 1,
        description: "Get the arcsine of an angle in radians",
        overloads: { num: "math.arcsin(a)" },
        vectorise: true,
        tests: ["[-1] : -1.5707963267948966", "[1] : 1.5707963267948966"]
    },
    {
        element: "∆t",
        name: "Tangent",
        arity: 1,
        description: "Get the tangent of an angle in radians",
        overloads: { num: "math.tan(a)" },
        vectorise: true,
        tests: ["[3.1415926535897932385] : 0", "[0] : 0", "[6.2831853071795864769] : 0"]
    },
    {
        element: "∆T",
        name: "Arc Tangent",
        arity: 1,
        description: "Get the arctangent of an angle in radians",
        overloads: { num: "math.arctan(a)" },
        vectorise: true,
        tests: ["[-1] : -0.78539816339744830962", "[1] : 0.78539816339744830962"]
    },
    {
        element: "∆Ṫ",
        name: "Arc Tangent 2",
        arity: 2,
        description: "Get the arctangent of an angle in radians",
        overloads: { "num-num": "math.arctan2(a, b)" },
        vectorise: true,
        tests: [
            "[1, 1] : 0.78539816339744830962",
            "[1, -1] : 2.3561944901923449288",
            "[1, 0] : 1.5707963267948966192"
        ]
    },
    {
        element: "∆P",
        name: "Polynomial Solver",
        arity: 1,
        description: "Solve a polynomial of the form a[0]x^len(a) + a[1]x^len(a)-1 ... = 0",
        overloads: { lst: "roots(a)" },
        vectorise: false,
        tests: [
            "[[4, -1005, 3, 4]] : [(0.06460672339563445+4.263256414560601e-14j), (-0.061605771543874255-1.4210854715202004e-14j), (251.24699904814824-6.938893903907228e-18j)]",
            "[[69, 420, -1]] : [0.00238002178391728, -6.08933654352305]"
        ]
    },
    {
        element: "∆ƈ",
        name: "n Pick r (npr)",
        arity: 2,
        description: "Get the number of combinations of r items from a set of n items",
        overloads: {
            "num-num": "n_pick_r(a, b)",
            "num-str": "n_pick_r(a, len(b))",
            "str-num": "n_pick_r(len(a), b)",
            "str-str": "n_pick_r(len(a), len(b))"
        },
        vectorise: true,
        tests: [
            "[[3, 4, 5, 6], [1, 2, 3, 4]] : [3,12,60,360]",
            '[[3, 4, "12345", "123456"], [1, "12", 3, "1234"]] : [3,12,60,360]'
        ]
    },
    {
        element: "∆±",
        name: "Copy Sign",
        arity: 2,
        description: "Copy the sign of one number to the other",
        overloads: { "num-num": "math.copysign(a, b)" },
        vectorise: true,
        tests: ["[-1, 4] : 1", "[1, -69] : -1", "[-1, -420] : -1", "[1, 203] : 1"]
    },
    {
        element: "∆K",
        name: "Sum of Proper Divisors / Stationary Points",
        arity: 1,
        description:
            "Get the sum of all proper divisors of a number /  get the stationary points of a function",
        overloads: { num: "sum_of_proper_divisors(a)", str: "stationary_points(a)" },
        vectorise: true,
        tests: [
            "[43] : 1",
            "[12] : 16",
            "[97] : 1",
            "[34] : 20",
            "[18] : 21",
            "[1] : 0",
            "['(x**2 + x + 1) / x'] : [-1, 1]"
        ]
    },
    {
        element: "∆²",
        name: "Perfect Square? / Square Expression",
        arity: 1,
        description:
            "Is the number a perfect square? (1, 4, 9, 16, 25, 36) / Raise an algebraic expression to the power of 2",
        overloads: { num: "is_perfect_square(a)", str: "expr ** 2" },
        vectorise: true,
        tests: [
            "[1] : 1",
            "[4] : 1",
            "[9] : 1",
            "[16] : 1",
            "[25] : 1",
            "[36] : 1",
            "[37] : 0",
            "[-1] : 0",
            "[0] : 1",
            "[1.5] : 0",
            '["3x"] : "9*x**2"',
            '["2x + 3y - 1"] : "4*x**2 + 12*x*y - 4*x + 9*y**2 - 6*y + 1"',
            '["630"] : "396900"'
        ]
    },
    {
        element: "∆e",
        name: "Euler's Number (e) raised to power a",
        arity: 1,
        description: "Get the value of Euler's number (e) raised to the power of a",
        overloads: { num: "e ** a", str: "simplify expression a" },
        vectorise: true,
        tests: [
            "[0] : 1",
            "[1] : 2.718281828459045",
            "[2] : 7.38905609893065",
            "[3] : 20.085536923187668"
        ]
    },
    {
        element: "∆E",
        name: "(Euler's Number (e) Raised to Power a) - 1",
        arity: 1,
        description: "Get the value of Euler's number (e) raised to the power of a minus 1",
        overloads: { num: "(e ** a) - 1", str: "expand expression a" },
        vectorise: true,
        tests: [
            "[0] : 0",
            "[1] : 1.718281828459045",
            "[2] : 6.38905609893065",
            "[3] : 19.085536923187668",
            "['(x + 1)^2'] : 'x**2 + 2*x + 1'"
        ]
    },
    {
        element: "∆L",
        name: "Natural Logarithm",
        arity: 1,
        description: "Get the natural logarithm of a number",
        overloads: { num: "math.log(a)" },
        vectorise: true,
        tests: [
            "[1] : 0",
            "[2] : 0.6931471805599453",
            "[3] : 1.0986122886681098",
            "[4] : 1.3862943611198906",
            "[5] : 1.6094379124341003",
            "[6] : 1.791759469228055",
            "[7] : 1.9459101490553132",
            "[8] : 2.0794415416798357",
            "[9] : 2.1972245773362196",
            "[10] : 2.302585092994046"
        ]
    },
    {
        element: "∆l",
        name: "Logarithm (log_2)",
        arity: 1,
        description: "Get the logarithm of a number to base 2",
        overloads: { num: "math.log2(a)" },
        vectorise: true,
        tests: ["[1] : 0", "[2] : 1"]
    },
    {
        element: "∆τ",
        name: "Common Logarithm",
        arity: 1,
        description: "Get the common logarithm of a number",
        overloads: { num: "math.log10(a)" },
        vectorise: true,
        tests: [
            "[1] : 0",
            "[2] : 0.3010299956639812",
            "[3] : 0.47712125471966244",
            "[4] : 0.6020599913279624",
            "[5] : 0.6989700043360189",
            "[6] : 0.7781512503836436",
            "[7] : 0.8450980400142568",
            "[8] : 0.9030899869919435",
            "[9] : 0.9542425094393249",
            "[10] : 1"
        ]
    },
    {
        element: "∆d",
        name: "Straight Line Distance",
        arity: 2,
        description:
            "Get the straight line distance between two points (x1, x2, ..., xn) and (y1, y2, ..., yn)",
        overloads: { "lst-lst": "euclidean_distance(a, b)" },
        vectorise: false,
        tests: ["[[69, 420], [21, 42]] : 381.03543142337827"]
    },
    {
        element: "∆D",
        name: "To Degrees",
        arity: 1,
        description: "Convert an angle from radians to degrees",
        overloads: { num: "math.degrees(a)" },
        vectorise: true,
        tests: [
            "[0] : 0",
            "[1] : 57.29577951308232",
            "[1.5707963267948966] : 90",
            "[2] : 114.59155902616465",
            "[3] : 171.88733853924697"
        ]
    },
    {
        element: "∆R",
        name: "To Radians",
        arity: 1,
        description: "Convert an angle from degrees to radians",
        overloads: { num: "math.radians(a)" },
        vectorise: true,
        tests: [
            "[0] : 0",
            "[90] : 1.5707963267948966",
            "[180] : 3.141592653589793",
            "[270] : 4.71238898038469",
            "[360] : 6.283185307179586"
        ]
    },
    {
        element: "∆Ṗ",
        name: "Next Prime After a Number / Discriminant of Polynomial",
        arity: 1,
        description:
            "Get the next prime number after a given number / the discriminant of a polynomial",
        overloads: { num: "next_prime(a)", str: "discriminant(a)" },
        vectorise: true,
        tests: [
            "[1] : 2",
            "[2] : 3",
            "[3] : 5",
            "[4] : 5",
            "[5] : 7",
            "[69] : 71",
            "['3 * x ** 2 + 493 * x - 2319'] : 270877"
        ]
    },
    {
        element: "∆ṗ",
        name: "First Prime Before a Number / Factor Expression",
        arity: 1,
        description:
            "Get the first prime number before a given number / factor a mathematical expression",
        overloads: { num: "prev_prime(a)", str: "factorise(a)" },
        vectorise: true,
        tests: [
            "[1] : 1",
            "[2] : 1",
            "[3] : 2",
            "[4] : 3",
            "[5] : 3",
            "[69] : 67",
            "['x**2 - 1'] : '(x - 1)*(x + 1)'",
            "['x*3 + x**2'] : 'x*(x + 3)'"
        ]
    },
    {
        element: "∆p",
        name: "Nearest Prime to a Number / Python equivalent of an expression",
        arity: 1,
        description:
            "Get the prime number closest to a given number, get the greater to break ties / return the python equivalent of a mathematical expression - sympy's .pycode() function",
        overloads: { num: "nearest_prime(a)", str: "sympy.nsimplify(a).pycode()" },
        vectorise: true,
        tests: [
            "[1] : 2",
            "[2] : 2",
            "[3] : 3",
            "[4] : 5",
            "[5] : 5",
            "[38] : 37",
            "[40] : 41",
            "[69] : 71"
        ]
    },
    {
        element: "∆ṙ",
        name: "Polynomial from Roots",
        arity: 1,
        description: "Get the polynomial with coefficients from the roots of a polynomial",
        overloads: { list: "polynomial(a)" },
        vectorise: false,
        tests: [
            "[[1, 2, 3]] : [1, -6, 11, -6]",
            "[[19, 43, 12, 5, 129]] : [1, -208, 12122, -266708, 2320581, -6323580]"
        ]
    },
    {
        element: "∆W",
        name: "Round to n Decimal Places",
        arity: 2,
        description: "Round a number to n decimal places",
        overloads: { "num-num": "round(a, no_dec_places=b) (b significant digits)" },
        vectorise: true,
        tests: [
            "[1.2345, 2] : 1.23",
            "[1.2345, 3] : 1.234",
            "[1.2345, 4] : 1.2345",
            "[1.2345, 5] : 1.2345"
        ]
    },
    {
        element: "∆%",
        name: "Modular Exponentiation",
        arity: 3,
        description: "Get the modular exponentiation a**b mod c",
        overloads: { "any-any-any": "pow(a, b, c)" },
        vectorise: true,
        tests: ["[39, 79, 4] : 3", "[7, 9, [2, 3, 4, 5]] : [1, 1, 3, 2]"]
    },
    {
        element: "∆Ŀ",
        name: "Least Common Multiple",
        arity: "1 or 2",
        description: "Get the least common multiple of two numbers",
        overloads: { lst: "lcm(a)", "num-num": "lcm(a, b)" },
        vectorise: true,
        tests: ["[1, 2] : 2", "[69, 420] : 9660", "[[3,4,5,6]] : 60", "[0,0] : 0", "[-12,-20] : 60"]
    },
    {
        element: "∆i",
        name: "nth Digit of Pi / Integrate",
        arity: 1,
        description: "Get the nth digit of pi",
        overloads: { num: "nth_digit_of_pi(a)", str: "antiderivative of a" },
        vectorise: true,
        tests: [
            "[0] : 3",
            "[1] : 1",
            "[2] : 4",
            "[3] : 1",
            "[4] : 5",
            "[5] : 9",
            "[6] : 2",
            "[7] : 6",
            "[8] : 5",
            "[9] : 3"
        ]
    },
    {
        element: "∆I",
        name: "First N Digits of Pi",
        description: "Generate the first n digits of pi",
        arity: 1,
        overloads: { num: "the first (a + 1)th digits of pi" },
        vectorise: false,
        tests: [
            "[-1] : []",
            "[1] : [3, 1]",
            "[2] : [3, 1, 4]",
            "[3] : [3, 1, 4, 1]",
            "[4] : [3, 1, 4, 1, 5]",
            "[5] : [3, 1, 4, 1, 5, 9]"
        ]
    },
    {
        element: "∆Ė",
        name: "N Digits of Euler's Number (e) / Sympy Evaluate",
        arity: 1,
        description:
            "Get the first n digits of Euler's number (e) / evaluate an expression as sympy",
        overloads: { num: "first n digits of e", str: "evaluate(a)" },
        vectorise: true,
        tests: ["[[0, 1, 2, '5 ** 2']] : [[2], [2, 7], [2, 7, 1], '25']", "[-1] : [3]"]
    },
    {
        element: "∆ė",
        name: "Nth Digit of Euler's Number (e) / Differentiate",
        arity: 1,
        description: "Get the nth digit of Euler's number (e)",
        overloads: { num: "nth_digit_of_e(a)", str: "derivative(a)" },
        vectorise: true,
        tests: ["[0] : 2", "[1] : 7", "[2] : 1", "[3] : 8", "[4] : 2", "[5] : 8"]
    },
    {
        element: "∆f",
        name: "nth Fibonacci Number",
        arity: 1,
        description: "Get the nth fibonacci number, 1-indexed",
        overloads: { num: "nth_fibonacci(a) (0 -> 1, 1 -> 1, 2 -> 2, ...)" },
        vectorise: true,
        tests: [
            "[0] : 1",
            "[1] : 1",
            "[2] : 2",
            "[3] : 3",
            "[4] : 5",
            "[5] : 8",
            "[6] : 13",
            "[7] : 21",
            "[8] : 34",
            "[9] : 55",
            "[-5] : -3"
        ]
    },
    {
        element: "∆F",
        name: "nth Fibonacci Number, 0-indexed",
        arity: 1,
        description: "Get the nth fibonacci number, 0-indexed",
        overloads: { num: "nth_fibonacci(a) (0 -> 0, 1 -> 1, 2 -> 1, ...)" },
        vectorise: true,
        tests: [
            "[0] : 0",
            "[1] : 1",
            "[2] : 1",
            "[3] : 2",
            "[4] : 3",
            "[5] : 5",
            "[6] : 8",
            "[7] : 13",
            "[8] : 21",
            "[9] : 34",
            "[-5] : 5"
        ]
    },
    {
        element: "∆Ṙ",
        name: "Random Float",
        arity: 0,
        description: "Get a random float in the range [0, 1), pseudo random number",
        overloads: { num: "random.random()" },
        vectorise: true
    },
    {
        element: "∆ṫ",
        name: "Totient Function / Local Minima",
        arity: 1,
        description: "Get the totient function of a number / local minima of a function",
        overloads: { num: "totient(a)", str: "local_minima(a)" },
        vectorise: true,
        tests: [
            "[[23, 76, 1234, 68, 234, 87, 12, 567]] : [22, 36, 616, 32, 72, 56, 4, 324]",
            "['5*x**2 - 34*x + 213'] : [3.4]",
            "['(x**2 + x + 1) / x'] : [1]"
        ]
    },
    {
        element: "∆n",
        name: "Next Power",
        arity: 2,
        description: "Get the next power of b after a.",
        overloads: { "num-num": "b ** floor(log(a, b) + 1)" },
        vectorise: true,
        tests: [
            "[10, 10] : 100",
            "[9, 10] : 10",
            "[11, 10] : 100",
            "[4, 2] : 8",
            "[17, 3] : 27",
            "[7, 2] : 8"
        ]
    },
    {
        element: "∆ḟ",
        name: "Previous Power",
        arity: 2,
        description: "Get the previous power of b before a.",
        overloads: { "num-num": "b ** ceil(log(a, b) - 1)" },
        vectorise: true,
        tests: [
            "[10, 10] : 1",
            "[9, 10] : 1",
            "[11, 10] : 10",
            "[4, 2] : 2",
            "[17, 3] : 9",
            "[100, 10] : 10"
        ]
    },
    {
        element: "∆Z",
        name: "ZFill",
        arity: 2,
        description: "Pad a string with zeros to a given length",
        overloads: { "str, num": "zfill(a, b)" },
        vectorise: false,
        tests: ['["2", 3] : "002"', '["23", 1] : "23"']
    },
    {
        element: "∆ċ",
        name: "Nth Cardinal",
        arity: 1,
        description: "Get the nth cardinal / convert number to words",
        overloads: { num: "num_to_words(a)" },
        vectorise: true,
        tests: [
            "[[4324, -48294, 0.5, 93424, 2.3]] : ['four thousand, three hundred and twenty-four', 'minus forty-eight thousand, two hundred and ninety-four', 'zero point five', 'ninety-three thousand, four hundred and twenty-four', 'two point three']"
        ]
    },
    {
        element: "∆o",
        name: "Nth Ordinal",
        arity: 1,
        description: "Get the nth ordinal / convert number to wordth ordinal",
        overloads: { num: "num_to_ordinal(a)" },
        vectorise: true,
        tests: [
            "[0] : 'zeroth'",
            "[1] : 'first'",
            "[2] : 'second'",
            "[3] : 'third'",
            "[4] : 'fourth'",
            "[5] : 'fifth'",
            "[6] : 'sixth'",
            "[7] : 'seventh'"
        ]
    },
    {
        element: "∆M",
        name: "Mode",
        arity: 1,
        description: "Get the mode of a list",
        overloads: { lst: "mode(a)" },
        vectorise: false,
        tests: [
            "[[1, 1, 1, 1, 2, 2, 3, 3, 3, 4]] : [1]",
            "[[1, 1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4]] : [1]",
            "[[[1, 2, 3], [1, 2, 3], [1, 2, 3], [4, 5]]] : [1, 2, 3]",
            "[[[1,2,3], [4, 5,6]]] : [1, 2, 3]"
        ]
    },
    {
        element: "∆ṁ",
        name: "Median",
        arity: 1,
        description:
            "Get the median of a list - returns a list of the two middle items if even length list (use ṁ to average them)",
        overloads: { lst: "median(a)" },
        vectorise: false,
        tests: ["[[1, 2, 3, 4, 5]] : 3", "[[1, 2, 3, 4, 5, 6]] : [3, 4]"]
    },
    {
        element: "∆Ċ",
        name: "Polynomial Expression From Coefficients",
        arity: 1,
        description: "Get the polynomial expression from a list of coefficients",
        overloads: { num: "polynomial of degree n", str: "a", lst: "polynomial_expression(a)" },
        vectorise: false,
        tests: [
            "[[1,-12,45,8]] : 'x**3 - 12*x**2 + 45*x + 8'",
            "[[1,2,3,4,5]] : 'x**4 + 2*x**3 + 3*x**2 + 4*x + 5'",
            "[3] : 'x**3 + x**2 + x + 1'",
            "[[69, 420]] : '69*x + 420'"
        ]
    },
    {
        element: "∆¢",
        name: "Carmichael Function",
        arity: 1,
        description: "Get the Carmichael function of a number / Local Maxima",
        overloads: { num: "carmichael(a)", str: "local_maxima(a)" },
        vectorise: true,
        tests: [
            "[[3, 8, 12, 78, 234, 786, 1234]] : [2, 2, 2, 12, 12, 130, 616]",
            "['(x**2 + x + 1) / x'] : [-1]"
        ]
    },
    {
        element: "∆›",
        name: "Increment until false",
        description: "Increment a until b(a) is false (deprecated, use `>` instead)",
        arity: 2,
        overloads: { "any-fun": "while b(a): a += 1", "fun-any": "while a(b): b += 1" },
        vectorise: false
    },
    {
        element: "∆‹",
        name: "Decrement until false",
        description: "Decrement a until b(a) is false (deprecated, use `<` instead)",
        arity: 2,
        overloads: { "any-fun": "while b(a): a -= 1", "fun-any": "while a(b): b -= 1" },
        vectorise: false
    },
    {
        element: "∆ǐ",
        name: "Prime Exponents",
        arity: 1,
        description: "Get the exponents of prime factors of a number",
        overloads: { num: "prime_exponents(a) (in the order of prime_factors(a))" },
        vectorise: true,
        tests: ["[20] : [2, 1]", "[12] : [2, 1]", "[8] : [3]", "[6] : [1, 1]", "[4] : [2]"]
    },
    {
        element: "∆Ǐ",
        name: "All Prime Exponents",
        description: "Get all exponents of prime factors less than the maximum prime factor",
        arity: 1,
        overloads: { num: "prime_exponents(a) (includes 0s)" },
        vectorise: true,
        tests: [
            "[20] : [2, 0, 1]",
            "[28] : [2, 0, 0, 1]",
            "[12] : [2, 1]",
            "[8] : [3]",
            "[6] : [1, 1]",
            "[4] : [2]"
        ]
    },
    {
        element: "∆*",
        name: "Next Multiple",
        arity: 2,
        description: "Get the next multiple of a number greater than another number",
        overloads: { "num, num": "get the next multiple of b that is greater than a" },
        vectorise: true,
        tests: ["[6, 5] : 10", "[4, 5] : 5", "[5, 5] : 10", "[0, -1] : -1"]
    },
    {
        element: "∆ȯ",
        name: "Hyperbolic Cosine",
        arity: 1,
        description: "Get the hyperbolic cosine of a number in radians",
        overloads: { num: "cosh(a)" },
        vectorise: true,
        tests: [
            "[0.0] : 1.0",
            "[0.1] : 1.0050041680558035",
            "[0.5] : 1.1276259652063807",
            "[1.0] : 1.5430806348152437",
            "[2.0] : 3.7621956910836314",
            "[10.0] : 11013.232920103323"
        ]
    },
    {
        element: "∆Ȯ",
        name: "Hyperbolic Arccosine",
        arity: 1,
        description: "Get the hyperbolic arccosine of a number in radians",
        overloads: { num: "acosh(a)" },
        vectorise: true,
        tests: [
            "[1.0] : 0.0",
            "[1.0050041680558035] : 0.1",
            "[1.1276259652063807] : 0.5",
            "[1.5430806348152437] : 1.0",
            "[3.7621956910836314] : 2.0",
            "[11013.232920103323] : 10.0"
        ]
    },
    {
        element: "∆ṡ",
        name: "Hyperbolic Sine",
        arity: 1,
        description: "Get the hyperbolic sine of a number in radians",
        overloads: { num: "sinh(a)" },
        vectorise: true,
        tests: [
            "[0.0] : 0.0",
            "[0.1] : 0.10016675001984402",
            "[0.5] : 0.5210953054937474",
            "[1.0] : 1.1752011936438014",
            "[2.0] : 3.626860407847019",
            "[10.0] : 11013.232874703393"
        ]
    },
    {
        element: "∆Ṡ",
        name: "Hyperbolic Arcsine",
        arity: 1,
        description: "Get the hyperbolic arcsine of a number in radians",
        overloads: { num: "asinh(a)" },
        vectorise: true,
        tests: [
            "[0.0] : 0.0",
            "[0.10016675001984402] : 0.1",
            "[0.5210953054937474] : 0.5",
            "[1.1752011936438014] : 1.0",
            "[3.626860407847019] : 2.0",
            "[11013.232874703393] : 10.0"
        ]
    },
    {
        element: "∆ṅ",
        name: "Hyperbolic Tangent",
        arity: 1,
        description: "Get the hyperbolic tangent of a number in radians",
        overloads: { num: "tanh(a)" },
        vectorise: true,
        tests: [
            "[0.1] : 0.09966799462495582",
            "[0.2] : 0.197375320224904",
            "[0.3] : 0.2913126124515909"
        ]
    },
    {
        element: "∆Ṅ",
        name: "Hyperbolic Arctangent",
        arity: 1,
        description: "Get the hyperbolic arctangent of a number in radians",
        overloads: { num: "atanh(a)" },
        vectorise: true,
        tests: [
            "[0.1] : 0.10033534773107558",
            "[0.2] : 0.2027325540540822",
            "[0.3] : 0.3095196042031117"
        ]
    },
    {
        element: "∆/",
        name: "Hypotenuse",
        arity: 1,
        description: "Get the hypotenuse of a right-angled triangle - equivalent to `²∑√`",
        overloads: { lst: "sqrt(sum(x ** 2 for x in a))" },
        vectorise: false,
        tests: [
            "[[3, 4]] : 5.0",
            "[[5, 12]] : 13.0",
            "[[8, 15]] : 17.0",
            "[[7, 24]] : 25.0",
            "[[20, 21]] : 29.0",
            "[[12, 35]] : 37.0",
            "[[9, 40]] : 41.0",
            "[[28, 45]] : 53.0",
            "[[11, 60]] : 61.0",
            "[[16, 63]] : 65.0",
            "[[33, 56]] : 65.0",
            "[[48, 55]] : 73.0",
            "[[13, 84]] : 85.0",
            "[[36, 77]] : 85.0",
            "[[39, 80]] : 89.0",
            "[[65, 72]] : 97.0",
            "[[20, 21]] : 29.0",
            "[[24, 45]] : 51.0",
            "[[30, 40]] : 50.0"
        ]
    },
    {
        element: "∆r",
        name: "Reduced Echelon Form",
        arity: 1,
        description: "Get the reduced echelon form of a matrix",
        overloads: { lst: "reduced_echelon_form(a)" },
        vectorise: false,
        tests: [
            "[[[1, 3, -1], [0, 1, 7]]] : [[1, 0, -22], [0, 1, 7]]",
            "[[[5, 78, 165, -234, 23.2], [239, 78, 4, 86, 9], [78972, -213.1, 8, 349, 190], [0.222, 1.69, 69, 420, 13]]] : [[1, 0, 0, 0, 0.00258198934942578], [0, 1, 0, 0, 0.0886947247312697], [0, 0, 1, 0, 0.115157284075847], [0, 0, 0, 1, 0.0116754288388931]]"
        ]
    },
    {
        element: "øb",
        name: "Parenthesise",
        arity: 1,
        description: "Parenthesise a string",
        overloads: { any: '"("" + a + ")"' },
        vectorise: true,
        tests: ['["xyz"] : "(xyz)"', '[5] : "(5)"', '[[1,2,3]] : ["(1)","(2)","(3)"]']
    },
    {
        element: "øB",
        name: "Bracketify",
        arity: 1,
        description: "Enclose a string in brackets",
        overloads: { any: '"["" + a + "]"' },
        vectorise: true,
        tests: ['["xyz"] : "[xyz]"', '[5] : "[5]"', '[[1,2,3]] : ["[1]","[2]","[3]"]']
    },
    {
        element: "øḃ",
        name: "Curly Bracketify",
        arity: 1,
        description: "Enclose a string in curly brackets",
        overloads: { any: '"{"" + a + "}"' },
        vectorise: true,
        tests: ['["xyz"] : "{xyz}"', '[5] : "{5}"', '[[1,2,3]] : ["{1}","{2}","{3}"]']
    },
    {
        element: "øḂ",
        name: "Angle Bracketify",
        arity: 1,
        description: "Enclose a string in angle brackets",
        overloads: { any: '"<"" + a + ">"' },
        vectorise: true,
        tests: ['["xyz"] : "<xyz>"', '[5] : "<5>"', '[[1,2,3]] : ["<1>","<2>","<3>"]']
    },
    {
        element: "øβ",
        name: "Balanced Brackets",
        arity: 1,
        description: 'Check if brackets in a string ("{}()[]<>") are balanced',
        overloads: { any: "balanced_brackets(a)" },
        vectorise: true,
        tests: ['["xyz"] : 1', '["([)]"] : 0', '["({<[]>})"] : 1', '[")("] : 0']
    },
    {
        element: "ø↳",
        name: "Custom Pad Left",
        arity: 3,
        description: "Pad a string to the left with a certain character",
        overloads: {
            "any-str-num": "pad a to the left with c so a has length b",
            "any-num-str": "pad a to the left with b so a has length c"
        },
        vectorise: true,
        tests: [
            '["xyz","x",4] : "xxyz"',
            '["123","&",8] : "&&&&&123"',
            '["123",8,"&"] : "&&&&&123"',
            '["324"," ",2] : "324"'
        ]
    },
    {
        element: "ø↲",
        name: "Custom Pad Right",
        arity: 3,
        description: "Pad a string to the right with a certain character",
        overloads: {
            "any-str-num": "pad a to the right with c so a has length b",
            "any-num-str": "pad a to the right with b so a has length c"
        },
        vectorise: true,
        tests: [
            '["xyz","x",4] : "xyzx"',
            '["123","&",8] : "123&&&&&"',
            '["123",8,"&"] : "123&&&&&"',
            '["324"," ",2] : "324"'
        ]
    },
    {
        element: "øM",
        name: "Flip Brackets Vertical Palindromise",
        description:
            "Vertically palindromise and reverse brackets and slashes, without duplicating center",
        arity: 1,
        overloads: {
            any: "palindromise, without duplicating center, and flip brackets and slashes in the second half"
        },
        vectorise: true,
        tests: ['["(x"] : "(x)"', '["{] "] : "{] [}"', '["/*>X"] : "/*>X<*\\\\"']
    },
    {
        element: "øA",
        name: "Letter to Number",
        arity: 1,
        description: "Convert a letter to a number, or vice versa (1-indexed)",
        overloads: { str: "number_to_letter(a)", num: "letter_to_number(a)" },
        vectorise: true,
        tests: [
            '["a"] : 1',
            '["b"] : 2',
            '["c"] : 3',
            '[4] : "d"',
            '[[3, 4]] : ["c", "d"]',
            '["xyz"] : [24, 25, 26]',
            '[""] : []',
            '["A"] : 1',
            '["Z"] : 26'
        ]
    },
    {
        element: "øṗ",
        name: "Flip Brackets Vertical Palindromise, Center, Join on Newlines",
        description:
            "Vertically palindromise each and reverse brackets and slashes, without duplicating center, then center and join by newlines. Equivalent to `øMøĊ⁋`",
        arity: 1,
        overloads: {
            any: "palindromise each, without duplicating center, flip brackets and slashes in the second half, center by padding with spaces, and join by newlines"
        },
        vectorise: true,
        tests: ['[["/[hello", "/[world"]] : "/[hellolleh]\\\\\\n/[worldlrow]\\\\"']
    },
    {
        element: "øm",
        name: "Flip Brackets Vertical Mirror, Center, Join on Newlines",
        description:
            "Vertically mirror each and reverse brackets and slashes, then center and join by newlines. Equivalent to `øṀøĊ⁋`",
        arity: 1,
        overloads: {
            any: "mirror each, flip brackets and slashes in the second half, center by padding with spaces, and join by newlines"
        },
        vectorise: true,
        tests: ['[["/[hello", "/[world"]] : "/[helloolleh]\\\\\\n/[worlddlrow]\\\\"']
    },
    {
        element: "øo",
        name: "Remove Until No change",
        arity: 2,
        description: "Remove b from a until a does not change",
        overloads: {
            "str-str": "remove b from a until a does not change",
            "str-lst": "remove everything in b (in order) from a until a does not change"
        },
        vectorise: false,
        tests: ['["((()))","()"] : ""', '["--+--+-",["--","+-"]] : "+"']
    },
    {
        element: "øO",
        name: "Count Overlapping",
        arity: 2,
        description: "Count the number of overlapping occurances of b in a",
        overloads: { "any-any": "Count the number of overlapping occurances of b in a" },
        vectorise: false,
        tests: [
            '["ababa", "aba"] : 2',
            '["bbba", "ba"] : 1',
            "[[1, 2, 2, 1, 2, 1], [1, 2]] : 2",
            '[[3, "3", 3, "3", 3], [3, "3", 3]] : 2'
        ]
    },
    {
        element: "øV",
        name: "Replace Until No Change",
        arity: 3,
        description: "Replace b with c in a until a does not change",
        overloads: { "str-str-str": "a.replace_until_no_change(b,c)" },
        vectorise: false,
        tests: ['["xyzzzzz","yzz","yyyz"] : "xyyyyyyyyyz"', '["abb","ab","aa"] : "aaa"']
    },
    {
        element: "øc",
        name: "String Compress",
        arity: 1,
        description: "Compress a string of lowercase letters and spaces in base 255",
        overloads: { str: "base_255_string_compress(a)" },
        vectorise: false,
        tests: ['["hello"] : "«D\\n=«"', '["hello world"] : "«⟇%J^9vŀ«"']
    },
    {
        element: "øC",
        name: "Number Compress",
        arity: 1,
        description: "Compress a positive integer in base 255",
        overloads: { num: "base_255_number_compress(a)" },
        vectorise: false,
        tests: ['[234] : "»⇧»"', '[27914632409837421] : "»fðǐ4\'∞Ẏ»"']
    },
    {
        element: "øĊ",
        name: "Center",
        description: "Center a list of strings",
        arity: 1,
        overloads: {
            lst: "center(a) (pad each item with spaces so all are the same length and centered)"
        },
        vectorise: false,
        tests: [
            '[["ab","cdef"]] : [" ab ","cdef"]',
            '[["xyz","a","bcdef"]] : [" xyz ","  a  ","bcdef"]',
            '[[1, 333, 55555]] : ["  1  ", " 333 ", "55555"]'
        ]
    },
    {
        element: "øe",
        name: "Run Length Encoding",
        arity: 1,
        description:
            "Run length encoding, convert from string/list to list of items and amount repeated.",
        overloads: { str: "run_length_encoded(a)" },
        vectorise: false,
        tests: [
            '["abc"] : [["a",1],["b",1],["c",1]]',
            '["aaa"] : [["a",3]]',
            "[[1,1,2,2,2,3,3,3,3,3]] : [[1,2],[2,3],[3,5]]",
            "[1122233333] : [[1,2],[2,3],[3,5]]"
        ]
    },
    {
        element: "øĖ",
        name: "Separated Run Length Encoding",
        arity: 1,
        description:
            "Run length encoding, convert from string/list to list of items and list of amounts. Equivalent to `øe∩÷`",
        overloads: { str: "run length encode a and push items and lengths" },
        vectorise: false
    },
    {
        element: "ød",
        name: "Run Length Decoding",
        arity: 1,
        description:
            "Run length decoding, convert from list of characters and lengths to a string/list",
        overloads: { lst: "run_length_decoded(a)" },
        vectorise: false,
        tests: [
            '[[["x",3]]] : "xxx"',
            '[[["z",2],["a",3]]] : "zzaaa"',
            '[[[2,"z"],[3,"a"]]] : "zzaaa"',
            "[[[1,2],[2,3],[3,5]]] : [1,1,2,2,2,3,3,3,3,3]"
        ]
    },
    {
        element: "øḊ",
        name: "Dyadic Run Length Decode",
        arity: 2,
        description:
            "Run length decoding, convert list of characters and list of lengths to a string/list",
        overloads: { "lst-lst": "run length decode with items a and lengths b" },
        vectorise: false,
        tests: ['[["x"], [3]] : "xxx"', '[["z", "a"], [2, 3]] : "zzaaa"']
    },
    {
        element: "øD",
        name: "Dictionary Compression",
        description: "Optimally compress a string of English using words from the Vyxal dictionary",
        arity: 1,
        overloads: { str: "dictionary_compressed(a)" },
        vectorise: false,
        tests: [
            '["withree"] : "`wi∧ḭ`"',
            '["hello"] : "`ƈṙ`"',
            '["Vyxal"] : "`₴ŀ`"',
            '["abcdef`gh"] : "`ėġḣ²\\\\`gh`"',
            '["and [A-Za-z0-9] .* ?<! the"] : "`λ¬ ⟇ € › λλ`"',
            '["and [A-Za-z0-9] .* ?<! the"] : "`λ¬ ⟇ € › λλ`"',
            '["Anchorage"] : "`ε₈⟇§`"',
            '["memorabiliairplane"] : "`ḭ⌈irḋβ`"'
        ]
    },
    {
        element: "øW",
        name: "Group on words",
        description: "Group a string on words",
        arity: 1,
        overloads: {
            str: "Group a on words, leaving chunks of [a-zA-Z] together and having everything else as a single character"
        },
        vectorise: false,
        tests: ['["abc*xyz"] : ["abc","*","xyz"]', '["$$$"] : ["$","$","$"]']
    },
    {
        element: "øċ",
        name: "Semi Optimal number compress",
        description: "Semi-optimally compress a number",
        arity: 1,
        overloads: { num: "optimal_number_compress(a)" },
        vectorise: false,
        tests: [
            '[100] : "₁"',
            '[239] : "⁺β"',
            '[4294967296] : "kḭ"',
            '[4294967297] : "kḭ›"',
            '[4294967298] : "kḭ⇧"',
            '[1080] : "kRT"',
            '[324389523] : "»↔ė§Ṫ»"',
            '[-2] : "2N"'
        ]
    },
    {
        element: "øṙ",
        name: "Regex replace",
        description: "Replace matches of a with c in b",
        arity: 3,
        overloads: {
            "any-any-fun": "apply c to matches of a in b",
            "any-any-any": "replace matches of a with c in b"
        },
        vectorise: false,
        tests: ['[".{3}","hello","x"] : "xlo"', '["\\\\W","Hello, World!","E"] : "HelloEEWorldE"']
    },
    {
        element: "øp",
        name: "Starts With",
        arity: 2,
        description: "Check if one value starts with another",
        overloads: { "any-any": "a.startswith(b) (Starts with b?)" },
        vectorise: false,
        tests: [
            '["hello","h"] : 1',
            '["hello","hello"] : 1',
            '["hello","x"] : 0',
            '["hello",""] : 1',
            "[[5, 9, 3, 5, 2], 5] : 1",
            "[59352, 5] : 1",
            "[[8, 9, 3, 5, 2], 5] : 0",
            "[2, [2, 3, 4]] : 1"
        ]
    },
    {
        element: "øE",
        name: "Ends With",
        arity: 2,
        description: "Check if one value ends with another",
        overloads: { "any-any": "a.endswith(b) (ends with b?)" },
        vectorise: false,
        tests: [
            '["hello","hello"] : 1',
            '["hello","h"] : 0',
            '["hello",""] : 1',
            '["hello","o"] : 1',
            "[[5, 9, 3, 5, 2], 2] : 1",
            "[[8, 9, 3, 5, 2], 5] : 0",
            "[4, [2, 3, 4]] : 1"
        ]
    },
    {
        element: "øf",
        name: "Ends With Set",
        arity: 2,
        description: "Check if a value ends with others",
        overloads: { "any-any": "does a end with all of b?" },
        vectorise: false,
        tests: [
            "[[2, 3, 4, 5], [4, 5]] : 1",
            "[[2, 3, 4, 5], [3, 4]] : 0",
            "[[2, 3, 4, 5], []] : 1"
        ]
    },
    {
        element: "øs",
        name: "Starts With Set",
        arity: 2,
        description: "Check if a value starts with others",
        overloads: { "any-any": "does a start with all of b?" },
        vectorise: false,
        tests: [
            "[[2, 3, 4, 5], [2, 3]] : 1",
            "[[2, 3, 4, 5], [3, 4]] : 0",
            "[[2, 3, 4, 5], []] : 1"
        ]
    },
    {
        element: "øP",
        name: "Pluralise Count",
        description: "Create a sentence of the form 'a bs'",
        arity: 2,
        overloads: {
            "num-str":
                'a + " " + b + (s if a != 1 else "") (concatenate with space, append a s if not 1)'
        },
        vectorise: false,
        tests: ['[4,"hello"] : "4 hellos"', '[1,"hello"] : "1 hello"', '[0,"hello"] : "0 hellos"']
    },
    {
        element: "øṁ",
        name: "Vertical Mirror",
        description: "Vertical Mirror - Split by newlines, mirror each line, join by newlines",
        arity: 1,
        overloads: { str: "vertical_mirror(a)" },
        vectorise: true,
        tests: ['["abc"] : "abccba"', '["a\\nb\\nc"] : "aa\\nbb\\ncc"']
    },
    {
        element: "øṀ",
        name: "Flip Brackets Vertical Mirror",
        description: "Vertical mirror, and swap brackets and slashes in the second half.",
        arity: 1,
        overloads: { any: "vertical_mirror(a, mapping = flip brackets and slashes)" },
        vectorise: true,
        tests: ['["[}"] : "[}{]"', '[")X"] : ")XX("', '["</tag>"] : "</tag><gat\\\\>"']
    },
    {
        element: "øṖ",
        name: "String Partitions",
        description: "All partitions of a string/list",
        arity: 1,
        overloads: { any: "all_partitions(a)" },
        vectorise: false,
        tests: [
            '["ab"] : [["a", "b"], ["ab"]]',
            "[[1, 2, 3, 4]] : [[[1], [2], [3], [4]], [[1, 2], [3], [4]], [[1], [2], [3, 4]], [[1], [2, 3], [4]], [[1, 2, 3], [4]], [[1], [2, 3, 4]], [[1, 2], [3, 4]], [[1, 2, 3, 4]]]",
            '["abc"] : [["a", "b", "c"], ["ab", "c"], ["a", "bc"], ["abc"]]'
        ]
    },
    {
        element: "øḋ",
        name: "To Decimal",
        description: "Convert a rational to its decimal representation.",
        arity: 1,
        overloads: {
            num: "to_decimal(a)",
            str: "decimal representation of interpreting lhs as a fraction"
        },
        vectorise: true,
        tests: ['[-2.5] : "-2.5"', '["-5/2"] : "-2.5"']
    },
    {
        element: "ø⟇",
        name: "Get Codepage Character / Get Codepage Index",
        description:
            "Get the character at a certain index in the vyxal codepage / Get the index of a character in the vyxal codepage",
        arity: 1,
        overloads: { num: "vyxal_codepage[a]", str: "vyxal_codepage.index(a)" },
        vectorise: true,
        tests: [
            '[0] : "λ"',
            '["₁ƛ₍₃₅kF½*∑∴;⁋"] : [166, 1, 205, 168, 170, 107, 70, 17, 42, 179, 129, 59, 175]',
            '[[166, 1, 205, 168, 170, 107, 70, 17, 42, 179, 129, 59, 175]] : ["₁", "ƛ", "₍", "₃", "₅", "k", "F", "½", "*", "∑", "∴", ";", "⁋"]',
            '[["a", 244, "!", 90, "∑∑∑"]] : [97, "ǔ", 33, "Z", [179, 179, 179]]'
        ]
    },
    {
        element: "øṘ",
        name: "Roman Numeral",
        description:
            "Convert a decimal to its roman numeral representation / Convert a roman numeral to its decimal representation.",
        arity: 1,
        overloads: { num: "to_roman_numeral(a)", str: "from_roman_numeral(a)" },
        vectorise: true,
        tests: [
            '[1] : "I"',
            '[2] : "II"',
            '[3] : "III"',
            '[4] : "IV"',
            '[5] : "V"',
            '[6] : "VI"',
            '[10] : "X"',
            '[15] : "XV"',
            '[20] : "XX"',
            '[30] : "XXX"',
            '[40] : "XL"',
            '[50] : "L"',
            '[60] : "LX"',
            '[100] : "C"',
            '[400] : "CD"',
            '[500] : "D"',
            '[900] : "CM"',
            '[1000] : "M"',
            '[2000] : "MM"',
            '[3000] : "MMM"',
            '[["I", "II", "III"]] : [1, 2, 3]',
            '["IV"] : 4',
            '["V"] : 5',
            '["VI"] : 6',
            '["X"] : 10',
            '["XV"] : 15',
            '["XX"] : 20',
            '["XXX"] : 30',
            '["XL"] : 40',
            '["L"] : 50',
            '["LX"] : 60',
            '["C"] : 100',
            '["CD"] : 400',
            '["D"] : 500',
            '["CM"] : 900',
            '["M"] : 1000',
            '["MM"] : 2000',
            '["MMM"] : 3000',
            '["ICIV"] : 103',
            '["ID"] : 499',
            '[499] : "CDXCIX"',
            '["CDXCIX"] : 499',
            '["v"] : 5',
            '["x"] : 10',
            '["mmxxiii"] : 2023'
        ]
    },
    {
        element: "øJ",
        name: "Parse JSON",
        description: "Parse a JSON string into a Vyxal object",
        arity: 1,
        overloads: { str: "json.loads(a)" },
        vectorise: false,
        tests: ['["[1, 2, 3]"] : [1, 2, 3]', '["{\\"a\\": 1, \\"b\\": 2}"] : ["a", "b"]']
    },
    {
        element: "øḞ",
        name: "Replace First Occurrence",
        description: "Replace the first instance of an item with another item",
        arity: 3,
        overloads: { "any-any-any": 'a.replace(b, c, count=1). See "V" (Replace) for specifics.' },
        vectorise: false,
        tests: [
            '["abcabc", "c", "H"] : "abHabc"',
            "[[1, 2, 3, 4, 1, 2, 3, 4], 3, 6] : [1, 2, 6, 4, 1, 2, 3, 4]",
            "[[1, 1, 1, 1], 1, 3] : [3, 1, 1, 1]",
            '["aaaa", "G", "abc"] : "aaaa"',
            "[[2,3,4],2,4] : [4,3,4]",
            "[234,2,4] : 434",
            '[234,2,"4"] : "434"',
            '[234,"2",4] : 434',
            '["234",2,4] : "434"',
            '["234","2",4] : "434"'
        ]
    },
    {
        element: "øṄ",
        name: "Replace Nth Occurrence",
        description:
            "Replace the nth instance of an item with another item. If n is negative, then replaces the last nth instance.",
        arity: 4,
        overloads: { "any-any-any-any": "a.replace_nth_occurrence(b, c, d)" },
        vectorise: false,
        tests: [
            '["abcabc", "c", "H", 1] : "abHabc"',
            "[[1, 2, 3, 4, 1, 2, 3, 4], 3, 6, 1] : [1, 2, 6, 4, 1, 2, 3, 4]",
            "[[1, 1, 1, 1], 1, 4, 3] : [1, 1, 4, 1]",
            '["aaaa", "G", "w", 1] : "aaaa"',
            "[[1, 2, 3, 4], 5, 6, 2] : [1, 2, 3, 4]",
            '["abcaabc", "a", "d", -2] : "abcdabc"',
            "[[1, 2, 2, 3, 4, 2, 5, 3], 2, 8, -1] : [1, 2, 2, 3, 4, 8, 5, 3]",
            "[[2,3,4],2,4,1] : [4,3,4]",
            "[234,2,4,1] : 434",
            '[234,2,"4",1] : "434"',
            '[234,"2",4,1] : 434',
            '["234",2,4,1] : "434"',
            '["234","2",4,1] : "434"',
            '["abbbabbb", "bb", "c", 1] : "acbabbb"',
            '["abbbabbb", "bb", "c", 2] : "abcabbb"',
            '["abbbabbb", "bb", "c", 3] : "abbbacb"',
            '["abbbabbb", "bb", "c", 4] : "abbbabc"'
        ]
    },
    {
        element: "øS",
        name: "Strip whitespace from both sides",
        description:
            "Strip whitespace from both sides of a string / Remove trailing zeros from a number",
        arity: 1,
        overloads: { str: "a.strip()", num: "remove trailing zeros" },
        vectorise: true,
        tests: ['["  abc  "] : "abc"', '["     "] : ""', "[1.23] : 1.23", "[25000] : 25"]
    },
    {
        element: "øL",
        name: "Strip whitespace from the left side",
        description: "Strip whitespace from the left side of a string",
        arity: 1,
        overloads: { str: "a.lstrip()" },
        vectorise: true,
        tests: ['["  abc     "] : "abc     "', '["   "] : ""']
    },
    {
        element: "øR",
        name: "Strip whitespace from the right side",
        description: "Strip whitespace from the right side of a string",
        arity: 1,
        overloads: { str: "a.rstrip()" },
        vectorise: true,
        tests: ['["  abc     "] : "  abc"', '["   "] : ""']
    },
    {
        element: "øl",
        name: "Strip from the left side",
        description: "Strip from the left side of a string",
        arity: 2,
        overloads: { "str-num": "a.lstrip(b)" },
        vectorise: true,
        tests: [
            '["dddabcddd", "d"] : "abcddd"',
            '["dddd", "d"] : ""',
            "[[3, 3, 1, 2, 3, 3, 3], [3]] : [1, 2, 3, 3, 3]"
        ]
    },
    {
        element: "ør",
        name: "Strip from the right side",
        description: "Strip from the right side of a string",
        arity: 2,
        overloads: { "str-num": "a.rstrip(b)" },
        vectorise: true,
        tests: [
            '["dddabcddd", "d"] : "dddabc"',
            '["dddd", "d"] : ""',
            "[[3, 3, 1, 2, 3, 3, 3], [3]] : [3, 3, 1, 2]"
        ]
    },
    {
        element: "ø^",
        name: "Canvas Draw",
        description:
            "Draw on a canvas (see knowledge/spec/canvas.md for more details) and return it as a string",
        arity: 3,
        overloads: {
            "num-lst-str": "draw with a = length, b = dirs, c = text",
            "num-str-str": "draw with a = length, b/c dependent on dir validity",
            "any-num-any": "draw with b = length ^",
            "any-any-num": "draw with c = length ^",
            "str-any-any": "draw with a = text, b/c dependent on dir validity",
            "lst-str-any": "draw with b = text, ^",
            "lst-lst-str": "draw with c = text, ^"
        },
        vectorise: false
    },
    {
        element: "ø∧",
        name: "Global Canvas Draw",
        description:
            "Draw on the global canvas (see knowledge/spec/canvas.md for more details), which is implicitly printed.",
        arity: 3,
        overloads: {
            "num-lst-str": "draw with a = length, b = dirs, c = text",
            "num-str-str": "draw with a = length, b/c dependent on dir validity",
            "any-num-any": "draw with b = length ^",
            "any-any-num": "draw with c = length ^",
            "str-any-any": "draw with a = text, b/c dependent on dir validity",
            "lst-str-any": "draw with b = text, ^",
            "lst-lst-str": "draw with c = text, ^"
        },
        vectorise: false
    },
    {
        element: "ø.",
        name: "Surround",
        description: "Surround a value with another",
        arity: 2,
        overloads: {
            "str-str": "a.surround(b)",
            "lst-any": "a.surround(b)",
            "any-lst": "b.surround(a)"
        },
        vectorise: true,
        tests: [
            '["abc", "*"] : "*abc*"',
            "[[1, 2, 3], 4] : [4, 1, 2, 3, 4]",
            "[4, [1, 2, 3]] : [4, 1, 2, 3, 4]",
            "[123, 4] : 41234",
            '[123, "a"] : "a123a"',
            '["a23", 4] : "4a234"'
        ]
    },
    {
        element: "øŀ",
        name: "Left Align",
        description: "Left align a string/string list",
        arity: 1,
        overloads: { str: "justify to left", lst: "justify each to left" },
        vectorise: false,
        tests: [
            '[["a", "bc", "def"]] : ["a  ", "bc ", "def"]',
            '["a\\nbc\\ndef"] : ["a  \\nbc \\ndef"]',
            '[[1, 333, 55555]] : ["1    ", "333  ", "55555"]'
        ]
    },
    {
        element: "øɽ",
        name: "Right Align",
        description: "Right align a string/string list",
        arity: 1,
        overloads: { str: "justify to right", lst: "justify each to right" },
        vectorise: false,
        tests: [
            '[["a", "bc", "def"]] : ["  a", " bc", "def"]',
            '[[1, 333, 55555]] : ["    1", "  333", "55555"]'
        ]
    },
    {
        element: "Þ*",
        name: "Cartesian product over list",
        description: "Cartesian product over a list of lists",
        arity: 1,
        overloads: { lst: "itertools.product(*a)" },
        vectorise: false,
        tests: [
            "[[[1, 2], [3], [4, 5]]] : [[1, 3, 4], [1, 3, 5], [2, 3, 4], [2, 3, 5]]",
            "[[[1, 2], [3, 4], []]] : []"
        ]
    },
    {
        element: "Þa",
        name: "Adjacency matrix (Directed)",
        description: "Adjacency matrix of directed graph (nonzero A_ij denotes edge from i to j)",
        arity: 1,
        overloads: {
            lst: "adjacency matrix of directed graph (where a = [[i, j] for each edge i to j])"
        },
        vectorise: false,
        tests: [
            "[[[1,5],[2,4],[3,4],[4,4]]] : [[0,0,0,0,1],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,0,0]]",
            "[[]] : [[0]]"
        ]
    },
    {
        element: "Þn",
        name: "Infinite list of all integers",
        description: "All integers in an infinite list (0, 1, -1, 2, -2, ...)",
        arity: 0,
        vectorise: false
    },
    {
        element: "Þż",
        name: "Lift",
        description: "Multiply a numeric list by a range from 1 to its length",
        arity: 1,
        overloads: { lst: "lift" },
        vectorise: false,
        tests: [
            "[[1,2,3]] : [1, 4, 9]",
            "[[1,2,3,4]] : [1, 4, 9, 16]",
            "[[4, 3, 2, 1]] : [4, 6, 6, 4]",
            "[[]] : []"
        ]
    },
    {
        element: "ÞŻ",
        name: "Sort Every Level",
        description: "Sort every level of a multidimensional list",
        arity: 1,
        overloads: { lst: "sort every level" },
        vectorise: false,
        tests: [
            "[[[[2, 1], [3, 1]], [[1, 2], [3, 4]]]] : [[[1, 2], [1, 3]], [[1, 2], [3, 4]]]",
            "[[[[1, 2]], [[4, 3]]]] : [[[1, 2]], [[3, 4]]]"
        ]
    },
    {
        element: "ÞA",
        name: "Adjacency matrix (Undirected)",
        description: "Adjacency matrix of undirected graph",
        arity: 1,
        overloads: {
            lst: "adjacency matrix of undirected graph (where a = [[i, j] for each edge i to j])"
        },
        vectorise: false,
        tests: [
            "[[[1,5],[2,4],[3,4],[4,4]]] : [[0,0,0,0,1],[0,0,0,1,0],[0,0,0,1,0],[0,1,1,2,0],[1,0,0,0,0]]",
            "[[[1,3]]] : [[0,0,1],[0,0,0],[1,0,0]]",
            "[[]] : [[0]]"
        ]
    },
    {
        element: "Þo",
        name: "Ordinals",
        description: "An infinite list of first, second, third, fourth etc",
        arity: 0,
        vectorise: false
    },
    {
        element: "Þc",
        name: "Cardinals",
        description: "An infinite list of one, two, three, four etc",
        arity: 0,
        vectorise: false
    },
    {
        element: "Þp",
        name: "Primes",
        description: "An infinite list of primes",
        arity: 0,
        vectorise: false
    },
    {
        element: "Þu",
        name: "All Unique",
        description: "Are all elements of a list/string unique?",
        arity: 1,
        overloads: { any: "all_unique(a)" },
        vectorise: false,
        tests: [
            '["hello"] : 0',
            '["eeee"] : 0',
            '["Gaming"] : 1',
            "[[1,2,3]] : 1",
            "[[1,1,1]] : 0",
            "[123] : 1",
            "[111] : 0"
        ]
    },
    {
        element: "Þj",
        name: "Depth",
        description: "Depth of ragged list",
        arity: 1,
        overloads: { lst: "Depth" },
        vectorise: false,
        tests: [
            "[[1, 2, 7]] : 1",
            "[3] : 0",
            "[[1, [2, 3, [4]], [69]]] : 3",
            "[[]] : 1",
            "[[[],[[]],[[[]]]]] : 4"
        ]
    },
    {
        element: "ÞẊ",
        name: "Cartesian Power",
        description:
            "Cartesian power, cartesian product with self n times. If both arguments are numbers, turns the left into a range.\n",
        arity: 2,
        overloads: { "any-num": "cartesian_power(a, b)", "num-any": "cartesian_power(b, a)" },
        vectorise: false,
        tests: [
            '["ab",2] : ["aa","ab","ba","bb"]',
            "[[1,2],3] : [[1,1,1],[1,1,2],[1,2,1],[1,2,2],[2,1,1],[2,1,2],[2,2,1],[2,2,2]]",
            '["abc",3] : ["aaa","aab","aac","aba","abb","abc","aca","acb","acc","baa","bab","bac","bba","bbb","bbc","bca","bcb","bcc","caa","cab","cac","cba","cbb","cbc","cca","ccb","ccc"]',
            '["ab",0] : []',
            '["ab",1] : ["a","b"]',
            "[[], 2] : []",
            "[2,2] : [[1,1],[2,1],[1,2],[2,2]]"
        ]
    },
    {
        element: "Þf",
        name: "Flatten By depth",
        description: "Flatten a list by a certain depth (default 1)",
        arity: 2,
        overloads: { "lst-num": "flatten a by depth b", "any-lst": "a, flatten b by depth 1" },
        vectorise: false,
        tests: [
            "[[[[[[1]]]]],3] : [[1]]",
            '["xyz",[1,2,[3,4,[5,6]]]] : [1,2,3,4,[5,6]]',
            "[1,3] : 1",
            "[[[]],0] : [[]]"
        ]
    },
    {
        element: "ÞB",
        name: "Random Bits",
        description: "Fill a list with random bits",
        arity: 1,
        overloads: {
            num: "list of length a filled with random bits",
            any: "list of length n(a) filled with random bits"
        },
        vectorise: false,
        tests: ["[0] : []", '[""] : []']
    },
    {
        element: "Þ<",
        name: "All Less Than Increasing",
        description:
            "Find all numbers less than a certain value in a (potentially infinite) list assumed to be (non-strictly) increasing",
        arity: 2,
        overloads: {
            "any-num": "all values of a up to (not including) the first greater than or equal to b"
        },
        vectorise: false,
        tests: [
            "[[1,2,2,3,2,1,4,3,2,1], 3] : [1,2,2]",
            "[[1,1,2,3,3,2,4,5,6,7], 4] : [1,1,2,3,3,2]",
            "[1223214321, 3] : [1,2,2]"
        ]
    },
    {
        element: "Þǔ",
        name: "Untruth",
        description: "Return a list with 1s at the (0-indexed) indices in a, and 0s elsewhere",
        arity: 1,
        overloads: { any: "[int(x in a) for x in range(max(a))]" },
        vectorise: false,
        tests: [
            "[[1]] : [0,1]",
            "[[0,3,4,6]] : [1,0,0,1,1,0,1]",
            "[[[0,1,0],[2,0,3],[1,0,1]]] : [[[0, 0, 0, 0], [1, 0, 0, 0]], [[0, 1, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 1], [0, 0, 0, 0]]]",
            "[[]] : []",
            "[0] : [1]"
        ]
    },
    {
        element: "ÞǓ",
        name: "Connected Uniquify",
        description: "Remove occurences of adjacent duplicates in a list",
        arity: 1,
        overloads: { any: "connected uniquify a (`Ġvh`)" },
        vectorise: false,
        tests: ["[[1,2,2,2,3,4,3,3,4]] : [1,2,3,4,3,4]", '["aabccdbb"] : "abcdb"']
    },
    {
        element: "Þk",
        name: "2-dimensional Convolution",
        description: "Return two-dimensional convolution of matrices",
        arity: 2,
        overloads: { "lst-lst": "2D-Convolution of a and b" },
        vectorise: false,
        tests: [
            "[[[1,2],[3,4]], [[5,6],[7,8]]] : [[5,16,12],[22,60,40],[21,52,32]]",
            "[[[1,2]], [[5,6],[7,8]]] : [[5,16,12],[7,22,16]]"
        ]
    },
    {
        element: "Þi",
        name: "Multidimensional Indexing",
        description: "Index a list of coordinates into a value.",
        arity: 2,
        overloads: {
            "lst-lst": "reduce by indexing with a as initial value (a[b[0]][b[1]][b[2]]...)"
        },
        vectorise: false,
        tests: ["[[1,[2,3]],[1,0]] : 2", '[["xyzabc"], [0,4]] : "b"']
    },
    {
        element: "ÞI",
        name: "All Indices (Multidimensional)",
        description: "All multidimensional indices of element in list",
        arity: 2,
        overloads: {
            "lst-any": "all indices of b in a",
            "any-lst": "all indices of a in b",
            "any-any": "all indices of b in a"
        },
        vectorise: false,
        tests: ["[[[[3], [3,4], [[3]]], [3]], [3]] : [[0,0], [0,2,0], [1]]"]
    },
    {
        element: "Þḟ",
        name: "Multidimensional Search",
        description: "Find the first multidimensional index of a value in another",
        arity: 2,
        overloads: {
            "lst-any": "find the first occurrence of a in b and return as a multidimensional index"
        },
        vectorise: false,
        tests: [
            "[[[1,2,3],[4,5,6]], 5] : [1, 1]",
            '[["abc","def",["hij","klm","nop"]], "m"] : [2,1,2]'
        ]
    },
    {
        element: "ÞḞ",
        name: "Fill to make rectangular",
        description: "Fill a 2-D list to make it rectangular",
        arity: 2,
        overloads: {
            "lst-any": "fill a with b to make it rectangular",
            "any-lst": "fill b with a to make it rectangular"
        },
        vectorise: false,
        tests: [
            "[[[1,2,3],[4,5],[6]], 0] : [[1, 2, 3], [4, 5, 0], [6, 0, 0]]",
            "[[[],[],[]], 0] : [[], [], []]"
        ]
    },
    {
        element: "Þm",
        name: "Zero Matrix",
        description:
            "Given a list of dimensions, create a matrix with those dimensions, filled with zeroes",
        arity: 1,
        overloads: {
            lst: "matrix with dimensions each item of a, where the first is the innermost and the last is the outermost"
        },
        vectorise: false,
        tests: [
            "[[3,4]] : [[0,0,0],[0,0,0],[0,0,0],[0,0,0]]",
            "[[2,3,2]] : [[[0,0],[0,0],[0,0]], [[0,0],[0,0],[0,0]]]",
            "[[0,0,0]] : [[[]]]"
        ]
    },
    {
        element: "ÞṄ",
        name: "Infinite Integer Partitions",
        description: "Infinite list of sets of positive integers (equivalent to Þ∞vṄÞf)",
        arity: 0,
        vectorise: false
    },
    {
        element: "Þ÷",
        name: "Divide List Into N Equal Length Parts",
        description: "Divide a list into n equal length parts",
        arity: 2,
        overloads: {
            "any-num": "divide a into b equal length parts",
            "num-any": "divide b into a equal length parts"
        },
        vectorise: false,
        tests: [
            "[[1,2,3,4,5,6,7,8], 3] : [[1,2,3],[4,5,6],[7,8]]",
            "[[1,2,3,4,5,6,7,8,9], 3] : [[1,2,3],[4,5,6],[7,8,9]]"
        ]
    },
    {
        element: "ÞZ",
        name: "Fill By Coordinates",
        description:
            "Fill a matrix by calling a function with the lists of coordinates in the matrix.",
        arity: 2,
        overloads: {
            "any-fun":
                "for each value of a (all the way down) call b with the coordinates of that value and put that at the appropriate position in a"
        },
        vectorise: false
    },
    {
        element: "Þ…",
        name: "Evenly Distribute",
        description: "Evenly distribute a number over elements of a list",
        arity: 2,
        overloads: {
            "list-num":
                "[i + b // len(a) for i in a], with any excess added to the last element, such that the sum of the list increases by b"
        },
        vectorise: false,
        tests: ["[[1,2,3],6] : [3,4,5]", "[[1,2,3],5] : [3,4,4]", "[[0,0,0],-4] : [-1,-1,-2]"]
    },
    {
        element: "Þ↓",
        name: "Minimum By Function",
        description: "Find the minimum value of a list by applying a function to each element",
        arity: 2,
        overloads: { "lst-fun": "minimum value of a by applying b to each element" },
        vectorise: false
    },
    {
        element: "Þ↑",
        name: "Maximum By Function",
        description: "Find the maximum value of a list by applying a function to each element",
        arity: 2,
        overloads: { "lst-fun": "maximum value of a by applying b to each element" },
        vectorise: false
    },
    {
        element: "Þ×",
        name: "All Combinations",
        description: "All combinations of a list / string, of all lengths, with replacement",
        arity: 1,
        overloads: {
            any: "all (non-empty) combinations of a, of all lengths and all orders, with replacement"
        },
        vectorise: false,
        tests: [
            "[[1,2,3]] : [[1], [2], [3], [1, 1], [1, 2], [1, 3], [2, 2], [2, 3], [3, 3], [1, 1, 1], [1, 1, 2], [1, 1, 3], [1, 2, 2], [1, 2, 3], [1, 3, 3], [2, 2, 2], [2, 2, 3], [2, 3, 3], [3, 3, 3]]",
            "['ab'] : ['a', 'b', 'aa', 'ab', 'bb']",
            "[[]] : []",
            '[""] : []'
        ]
    },
    {
        element: "Þx",
        name: "All Combinations Without Replacement",
        description: "All combinations of a list / string, of all lengths, without replacement",
        arity: 1,
        overloads: {
            any: "all (non-empty) combinations of a, of all lengths and all orders, without replacement"
        },
        vectorise: false,
        tests: [
            "[[1,2,3]] : [[1], [2], [3], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]",
            '["ab"] : ["a","b","ab","ba"]',
            "[[]] : []",
            '[""] : []'
        ]
    },
    {
        element: "ÞF",
        name: "All Fibonacci",
        description: "All Fibonacci numbers as a LazyList.",
        arity: 0,
        vectorise: false
    },
    {
        element: "Þ!",
        name: "All Factorials",
        description: "All factorials as a LazyList.",
        arity: 0,
        vectorise: false
    },
    {
        element: "ÞU",
        name: "Uniquify Mask",
        description:
            "A list of booleans describing which elements of a will remain after uniquifying.",
        arity: 1,
        overloads: {
            any: "a list of booleans describing which elements of a will remain after uniquifying"
        },
        vectorise: false,
        tests: [
            "[[1,2,3,1,2,3]] : [1,1,1,0,0,0]",
            "[[1,1,1,2,3,1,2,2,1,3]] : [1,0,0,1,1,0,0,0,0,0]",
            "[123123] : [1,1,1,0,0,0]",
            '["abacaba"] : [1,1,0,1,0,0,0]'
        ]
    },
    {
        element: "ÞD",
        name: "Diagonals",
        description: "Diagonals of a matrix, starting with the main diagonal.",
        arity: 1,
        overloads: { lst: "diagonals of a, starting with the main diagonal" },
        vectorise: false,
        tests: [
            "[[[1,2,3],[4,5,6],[7,8,9]]] : [[1,5,9],[2,6],[3],[7],[4,8]]",
            "[[[1,2,3,4],[5,6,7,8],[9,10,11,12]]] : [[1,6,11],[2,7,12],[3,8],[4],[9],[5,10]]",
            "[[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]] : [[1,5,9],[2,6],[3],[10],[7,11],[4,8,12]]",
            "[[[]]] : []"
        ]
    },
    {
        element: "Þ√",
        name: "Diagonals Ordered",
        description: "Diagonals of a matrix, starting with the shortest top diagonal",
        arity: 1,
        overloads: { lst: "diagonals of a, starting with the shortest top diagonal" },
        vectorise: false,
        tests: [
            "[[[1,2,3],[4,5,6],[7,8,9]]] : [[3], [2, 6], [1, 5, 9], [4, 8], [7]]",
            "[[[1,2,3,4],[5,6,7,8],[9,10,11,12]]] : [[4], [3, 8], [2, 7, 12], [1, 6, 11], [5, 10], [9]]",
            "[[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]] : [[3], [2, 6], [1, 5, 9], [4, 8, 12], [7, 11], [10]]",
            "[[[]]] : []"
        ]
    },
    {
        element: "Þḋ",
        name: "Anti-diagonals",
        description: "Anti-diagonals of a matrix, starting with the main anti-diagonal.",
        arity: 1,
        overloads: { lst: "anti-diagonals of a, starting with the main anti-diagonal" },
        vectorise: false,
        tests: [
            "[[[1,2,3],[4,5,6],[7,8,9]]] : [[3,5,7],[2,4],[1],[9],[6,8]]",
            "[[[1,2,3,4],[5,6,7,8],[9,10,11,12]]] : [[3,6,9],[2,5],[1],[12],[8,11],[4,7,10]]",
            "[[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]] : [[3,5,7],[2,4],[1],[12],[9,11],[6,8,10]]",
            "[[[]]] : []"
        ]
    },
    {
        element: "Þ`",
        name: "Anti-diagonals Ordered",
        description: "Anti-diagonals of a matrix, starting with the shortest top anti-diagonal",
        arity: 1,
        overloads: { lst: "anti-diagonals of a, starting with the shortest top anti-diagonal" },
        vectorise: false,
        tests: [
            "[[[1,2,3],[4,5,6],[7,8,9]]] : [[1], [2, 4], [3, 5, 7], [6, 8], [9]]",
            "[[[1,2,3,4],[5,6,7,8],[9,10,11,12]]] : [[1], [2, 5], [3, 6, 9], [4, 7, 10], [8, 11], [12]]",
            "[[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]] : [[1], [2, 4], [3, 5, 7], [6, 8, 10], [9, 11], [12]]",
            "[[[1,2,3],[4],[7,8,9]]] : [[1], [2, 4], [3, 7], [8], [9]]",
            "[[[]]] : []"
        ]
    },
    {
        element: "ÞS",
        name: "Sublists",
        description: "Sublists of a list.",
        arity: 1,
        overloads: { lst: "non-empty sublists of a" },
        vectorise: false,
        tests: [
            "[[1,2,3]] : [[1], [1, 2], [2], [1, 2, 3], [2, 3], [3]]",
            "[[]] : []",
            "[[[]]] : [[[]]]",
            "[3] : [[1],[1,2],[2],[1,2,3],[2,3],[3]]",
            '["ab"] : ["a","ab","b"]'
        ]
    },
    {
        element: "ÞṪ",
        name: "Transpose With Filler",
        description: "Transpose a matrix, with a filler value for empty cells.",
        arity: 2,
        overloads: { "lst-any": "transpose a, with filler value b" },
        vectorise: false,
        tests: [
            "[[[1,2,3],[4,5]],0] : [[1,4],[2,5],[3,0]]",
            '[[[1,2,3,4],[5,6],[7,8,9],[0]],"X"] : [[1,5,7,0],[2,6,8,"X"],[3,"X",9,"X"],[4,"X","X","X"]]'
        ]
    },
    {
        element: "Þ℅",
        name: "Random Permutation",
        description: "Random permutation of a list / string",
        arity: 1,
        overloads: { any: "random permutation of a" },
        vectorise: false,
        tests: ["[[]] : []", '[""] : ""', "[[1]] : [1]", '["a"] : "a"', "[1] : 1"]
    },
    {
        element: "ÞṀ",
        name: "Matrix Multiplication",
        description: "Multiply two matrices together.",
        arity: 2,
        overloads: { "lst-lst": "matrix multiply a and b" },
        vectorise: false,
        tests: ["[[[1,2],[3,4]],[[5,6],[7,8]]] : [[19, 22], [43, 50]]"]
    },
    {
        element: "ÞḊ",
        name: "Matrix Determinant",
        description: "Calculate the determinant of a matrix.",
        arity: 1,
        overloads: { lst: "determinant(a)" },
        vectorise: false,
        tests: ["[[[1,2],[3,4]]] : -2", "[[[1,2,3],[4,5,6],[7,8,9]]] : 0", "[[[]]] : 1"]
    },
    {
        element: "Þ\\",
        name: "Anti-diagonal",
        description: "Anti-diagonal of a matrix",
        arity: 1,
        overloads: { lst: "antidiagonal(a)" },
        vectorise: false,
        tests: [
            "[[[1,2,3],[4,5,6],[7,8,9]]] : [3,5,7]",
            "[[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]] : [3,5,7]",
            "[[[1,2,3,4],[5,6,7,8],[9,10,11,12]]] : [3,6,9]",
            "[[[]]] : []"
        ]
    },
    {
        element: "Þ/",
        name: "Main Diagonal",
        description: "Diagonal of a matrix",
        arity: 1,
        overloads: { lst: "diagonal(a)" },
        vectorise: false,
        tests: [
            "[[[1,2,3],[4,5,6],[7,8,9]]] : [1,5,9]",
            "[[[1,2,3,4],[5,6,7,8],[9,10,11,12]]] : [1,6,11]",
            "[[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]] : [1,5,9]",
            "[[[]]] : []"
        ]
    },
    {
        element: "ÞC",
        name: "Matrix Column Reduce",
        description: "Reduce columns of a matrix by a function.",
        arity: 2,
        overloads: { "lst-fun": "reduce columns of a with b" },
        vectorise: false
    },
    {
        element: "ÞĠ",
        name: "Gridify",
        description:
            "Gridify a 2-D list by padding each element with space to make columns aligned, joining each row on spaces, then joining by newlines.",
        arity: 1,
        overloads: { lst: "gridify a" },
        vectorise: false,
        tests: ["[[[12,2,3],[4,5,6],[7,8,'hi']]] : '12  2  3\\n 4  5  6\\n 7  8 hi'"]
    },
    {
        element: "Þ∨",
        name: "Multiset Difference",
        description: "Similar to set difference, but with duplicates allowed.",
        arity: 2,
        overloads: { "lst-lst": "multiset difference of a and b" },
        vectorise: false,
        tests: [
            "[[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10]] : []",
            "[[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10,11]] : []",
            "[[1,1,2,2,2,3,3,3],[1,2,2,3]] : [1, 2, 3, 3]",
            "[[1,1,2,2,2,3,3,3],[1,2,2,3,4]] : [1, 2, 3, 3]",
            "[[], []] : []",
            "[[1, 2, 3], []] : [1,2,3]",
            "[[], [1, 2, 3]] : []",
            "[12,234] : [1]",
            '[1234,"13"] : [1234]',
            '["1234",13] : ["1234"]'
        ]
    },
    {
        element: "Þ∩",
        name: "Multiset Intersection",
        description: "Similar to set intersection, but with duplicates allowed.",
        arity: 2,
        overloads: { "lst-lst": "multiset intersection of a and b" },
        vectorise: false,
        tests: [
            "[[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10]] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
            "[[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10,11]] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
            "[[1,1,2,2,2,3,3,3],[1,2,2,3]] : [1, 2, 2, 3]",
            "[[1,1,2,2,2,3,3,3],[1,2,2,3,4]] : [1, 2, 2, 3]",
            "[[], []] : []",
            "[[1, 2, 3], []] : []",
            "[[1, 1, 1], [1]] : [1]",
            "[12,234] : [2]",
            '[12,"12"] : []',
            '["12",12] : []',
            "[[3, 3, 3, 2, 2, 2, 2], [3, 3, 3, 3, 3, 2]] : [3, 3, 3, 2]"
        ]
    },
    {
        element: "Þ∪",
        name: "Multiset Union",
        description: "Similar to set union, but with duplicates allowed.",
        arity: 2,
        overloads: { "lst-lst": "multiset union of a and b" },
        vectorise: false,
        tests: [
            "[[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10]] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
            "[[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10,11]] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]",
            "[[1,1,2,2,2,3,3,3],[1,2,2,3]] : [1, 1, 2, 2, 2, 3, 3, 3]",
            "[[1,1,2,2,2,3,3,3],[1,2,2,3,4]] : [1, 1, 2, 2, 2, 3, 3, 3, 4]",
            "[[], []] : []",
            "[[1, 2, 3], []] : [1, 2, 3]",
            "[12,234] : [1,2,3,4]",
            '[12,"12"] : [1,2,"1","2"]',
            '["12",12] : ["1","2",1,2]'
        ]
    },
    {
        element: "Þ⊍",
        name: "Multiset Symmetric Difference",
        description: "Similar to set symmetric difference, but with duplicates allowed.",
        arity: 2,
        overloads: { "lst-lst": "multiset symmetric difference of a and b" },
        vectorise: false,
        tests: [
            "[[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10]] : []",
            "[[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10,11]] : [11]",
            "[[1,1,2,2,2,3,3,3],[1,2,2,3]] : [1, 2, 3, 3]",
            "[[1,1,2,2,2,3,3,3],[1,2,2,3,4]] : [1, 2, 3, 3, 4]",
            "[[], []] : []",
            "[[1, 2, 3], []] : [1, 2, 3]",
            "[12,234] : [1,3,4]",
            '[12,"12"] : [1, 2, "1", "2"]',
            '["12",12] : ["1","2",1,2]'
        ]
    },
    {
        element: "Þ•",
        name: "Dot Product",
        description: "Dot product of two lists.",
        arity: 2,
        overloads: { "lst-lst": "dot product of a and b" },
        vectorise: false,
        tests: ["[[1,2,3],[4,5,6]] : 32", "[[69, 420], [21, 42]] : 19089", "[[], []] : 0"]
    },
    {
        element: "Þṁ",
        name: "Mold without repeat",
        description: "Mold a list without repeating elements.",
        arity: 2,
        overloads: { "lst-lst": "mold a list without repeating elements" },
        vectorise: false,
        tests: [
            "[[1, 2, 3, 4, 5, 6, 7, 8, 9], [[1], [1, 2], [1, 2, 3], [1], [1, 2], [1, 2, 3]]] : [[1], [2, 3], [4, 5, 6], [7], [8, 9]]",
            "[[1,2,3,4,5,6,7], [[8, 9], 10, 11, 12, [13, 14]]] : [[1, 2], 3, 4, 5, [6, 7]]",
            "[[1,2,3], [[4], [], [6]]] : [[1], [], [2]]"
        ]
    },
    {
        element: "ÞM",
        name: "Maximal Indices",
        description: "Indices of the maximal elements of a list.",
        arity: 1,
        overloads: { lst: "indices of the maximal elements of a" },
        vectorise: false,
        tests: ["[[9,2,3,4,5,6,7,8,9]] : [0,8]", "[[]] : []"]
    },
    {
        element: "Þ∴",
        name: "Elementwise Vectorised Dyadic Maximum",
        description: "Elementwise vectorised dyadic maximum.",
        arity: 2,
        overloads: { "lst-lst": "[max(a[0], b[0]), max(a[1], b[1]), ...]" },
        vectorise: true,
        tests: [
            "[[1,5,3],[4,2,6]] : [4, 5, 6]",
            "[[[1], [5]], [[3], [2]]] : [[3], [5]]",
            '[["a", "f"], ["c", "d"]] : ["c", "f"]',
            "[[],[]] : []"
        ]
    },
    {
        element: "Þ∵",
        name: "Elementwise Vectorised Dyadic Minimum",
        description: "Elementwise vectorised dyadic minimum.",
        arity: 2,
        overloads: { "lst-lst": "[min(a[0], b[0]), min(a[1], b[1]), ...]" },
        vectorise: true,
        tests: [
            "[[1,5,3],[4,2,6]] : [1, 2, 3]",
            "[[[1], [5]], [[3], [2]]] : [[1], [2]]",
            '[["a", "f"], ["c", "d"]] : ["a", "d"]',
            "[[],[]] : []"
        ]
    },
    {
        element: "Þs",
        name: "All Slices of a List",
        description: "Get all slices of a list, skipping a certain number of items",
        arity: 2,
        overloads: {
            "lst-int": "[a[::b], a[1::b], a[2::b], ...]",
            "int-lst": "[b[::a], b[1::a], b[2::a], ...]"
        },
        vectorise: false,
        tests: [
            "[[1, 2, 3, 4, 5, 6, 7, 8, 9], 2] : [[1, 3, 5, 7, 9], [2, 4, 6, 8]]",
            "[[3, 1, 7, 21, 5, 76, 14, 4, 123, 543], 4] : [[3, 5, 123], [1, 76, 543], [7, 14], [21, 4]]",
            "[[3, 1, 2, 4, 6, 4, 5, 2, 1, 9, 5, 3, 9, 3], -4] : []"
        ]
    },
    {
        element: "Þ¾",
        name: "Empty the Global Array",
        description: "Empty the global array.",
        arity: 0
    },
    {
        element: "Þr",
        name: "Remove Last Item and Prepend 0",
        description: "Remove the last item of a list and prepend 0. A shortcut for Ṫ0p",
        arity: 1,
        overloads: { lst: "[0] + a[:-1]" },
        vectorise: false,
        tests: [
            "[[1,2,3,4,5,6,7,8,9]] : [0,1,2,3,4,5,6,7,8]",
            "['abcde'] : '0abcd'",
            "[[]] : [0]",
            '[""] : "0"'
        ]
    },
    {
        element: "Þ∞",
        name: "Infinite List of Positive Integers",
        description: "An infinite list of positive integers",
        arity: 0
    },
    {
        element: "Þ:",
        name: "Infinite List of Non-Negative Integers",
        description: "An infinite list of non-negative integers",
        arity: 0
    },
    {
        element: "ÞR",
        name: "Remove Last Item From Cumulative Sums and Prepend 0",
        description:
            "Remove the last item of the cumulative sums of a list and prepend 0. A shortcut for ¦Ṫ0p",
        arity: 1,
        overloads: { lst: "[0, a[0], a[0]+a[1], ..., a[0]+a[1]+...+a[-2]]" },
        vectorise: false,
        tests: [
            "[[5, 2, 7, 98, 34, 6, 21, 45]] : [0, 5, 7, 14, 112, 146, 152, 173]",
            "['abcde'] : [0, 'a', 'ab', 'abc', 'abcd']",
            "[[]] : [0]",
            '[""] : [0]'
        ]
    },
    {
        element: "Þẇ",
        name: "Unwrap",
        description: "Take a and push a[0]+a[-1] and a[1:-1]",
        arity: 1,
        overloads: { lst: "a[0]+a[-1], a[1:-1]" },
        vectorise: false,
        tests: [
            "['abcde'] : 'bcd'",
            "[[1,2,3,4,5,6,7,8,9]] : [2, 3, 4, 5, 6, 7, 8]",
            "[[1,2,3,4,5,6,7,8,9,10]] : [2, 3, 4, 5, 6, 7, 8, 9]",
            "['lsusp'] : 'sus'",
            '[""] : ""',
            "[[]] : []"
        ]
    },
    {
        element: "Þg",
        name: "Shortest By Length",
        description: "Return the shortest item in a list.",
        arity: 1,
        overloads: { lst: "the shortest item of a" },
        vectorise: false,
        tests: [
            "[['abcde', 'ab', 'abc', 'abcd', 'abcde']] : 'ab'",
            "[['abcde',  'abcd', 'abcde', 'abcdef']] : 'abcd'",
            "[['abcde', 'abcde', 'abcdef', 'abcdefg']] : 'abcde'",
            '[""] : ""',
            "[[]] : 0"
        ]
    },
    {
        element: "ÞG",
        name: "Longest By Length",
        description: "Return the longest item in a list.",
        arity: 1,
        overloads: { lst: "the longest item of a" },
        vectorise: false,
        tests: [
            "[['abcde', 'ab', 'abc', 'abcd', 'abcde']] : 'abcde'",
            "[['abcde',  'abcd', 'abcde', 'abcdef']] : 'abcdef'",
            "[['abcde', 'abcde', 'abcdef', 'abcdefg']] : 'abcdefg'",
            '[""] : ""',
            "[[]] : 0"
        ]
    },
    {
        element: "Þṡ",
        name: "Sort By Length",
        description: "Sort a list by length.",
        arity: 1,
        overloads: { lst: "sort a from shortest to longest" },
        vectorise: false,
        tests: [
            "[['abcde', 'ab', 'abc', 'abcd', 'abcde']] : ['ab', 'abc', 'abcd', 'abcde', 'abcde']",
            "[['abcdef',  'abcd', 'abcde', 'abcdef']] : ['abcd', 'abcde', 'abcdef', 'abcdef']",
            "[['abcdefg', 'abcde', 'abcdef', 'abcdefg']] : ['abcde', 'abcdef', 'abcdefg', 'abcdefg']",
            '[""] : ""',
            "[[]] : 0"
        ]
    },
    {
        element: "ÞṠ",
        name: "Is Sorted?",
        description:
            "Returns true if an item is sorted in ascending order using default sorting rules.",
        arity: 1,
        overloads: { lst: "is a sorted in increasing order?" },
        vectorise: false,
        tests: [
            "[[1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6]] : 1",
            '["abcde"] : 1',
            "[4315] : 0",
            "[[3, 2, 1]] : 0",
            "[[4, 1, 4, 2]] : 0",
            "[[4, 6, 8, 10, 3432, 65543]] : 1",
            '[""] : 1',
            "[[]] : 1"
        ]
    },
    {
        element: "ÞṘ",
        name: "Is Sorted in Reverse?",
        description:
            "Returns true if an item is sorted in descending order using default sorting rules.",
        arity: 1,
        overloads: { lst: "is a sorted in decreasing order?" },
        vectorise: false,
        tests: [
            "[[6, 5, 4, 4, 4, 3, 3, 3, 2, 2, 1]] : 1",
            '["edcba"] : 1',
            "[4315] : 0",
            "[[3, 2, 1]] : 1",
            "[[4, 1, 4, 2]] : 0",
            "[[4, 6, 8, 10, 3432, 65543]] : 0",
            '[""] : 1',
            "[[]] : 1"
        ]
    },
    {
        element: "ÞȮ",
        name: "Is Ordered?",
        description: "Returns true if the item is sorted in either descending or ascending order.",
        arity: 1,
        overloads: { lst: "is a sorted in increasing or decreasing order?" },
        vectorise: false,
        tests: [
            "[[1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6]] : 1",
            '["abcde"] : 1',
            "[4315] : 0",
            "[[3, 2, 1]] : 1",
            "[[4, 1, 4, 2]] : 0",
            "[[4, 6, 8, 10, 3432, 65543]] : 1",
            "[[8, 1, 5, 6, 6, 2]] : 0",
            "[[1, 2, 3, 4, 5, 5, 4]] : 0",
            '[""] : 1',
            "[[]] : 1"
        ]
    },
    {
        element: "ÞĊ",
        name: "Is Unordered?",
        description:
            "Returns true if the item is not sorted in either descending or ascending order.",
        arity: 1,
        overloads: { lst: "is a not sorted, in either increasing or decreasing order?" },
        vectorise: false,
        tests: [
            "[[1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6]] : 0",
            '["abcde"] : 0',
            "[4315] : 1",
            "[[3, 2, 1]] : 0",
            "[[4, 1, 4, 2]] : 1",
            "[[4, 6, 8, 10, 3432, 65543]] : 0",
            "[[8, 1, 5, 6, 6, 2]] : 1",
            "[[1, 2, 3, 4, 5, 5, 4]] : 1",
            '[""] : 0',
            "[[]] : 0"
        ]
    },
    {
        element: "Þ⇧",
        name: "Is Strictly Ascending?",
        description: "Returns true if the list is in strictly ascending order.",
        arity: 1,
        overloads: { lst: "is a in strictly ascending order?" },
        vectorise: false,
        tests: [
            "[[1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6]] : 0",
            '["abcde"] : 1',
            "[4321] : 0",
            "[[3, 2, 1]] : 0",
            "[[4, 1, 4, 2]] : 0",
            "[[4, 6, 8, 10, 3432, 65543]] : 1",
            "[[8, 6, 5, 4, 2]] : 0",
            '["edcba"] : 0',
            '[""] : 1',
            "[[]] : 1",
            "[[1, 1, 1, 1]] : 0"
        ]
    },
    {
        element: "Þ⇩",
        name: "Is Strictly Descending?",
        description: "Returns true if the list is in strictly descending order.",
        arity: 1,
        overloads: { lst: "is a in strictly descending order?" },
        vectorise: false,
        tests: [
            "[[1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6]] : 0",
            '["abcde"] : 0',
            "[4321] : 1",
            "[[3, 2, 1]] : 1",
            "[[4, 1, 4, 2]] : 0",
            "[[4, 6, 8, 10, 3432, 65543]] : 0",
            "[[8, 6, 5, 4, 2]] : 1",
            '["edcba"] : 1',
            '[""] : 1',
            "[[]] : 1",
            "[[1, 1, 1, 1]] : 0"
        ]
    },
    {
        element: "Þċ",
        name: "Cycle",
        description: "Form an infinite list from a vector.",
        arity: 1,
        overloads: { lst: "[a[0], a[1], ..., a[-1], a[0], a[1], ..., a[-1], a[0], ...]" },
        vectorise: false
    },
    {
        element: "ÞK",
        name: "Suffixes",
        description: "Suffixes of a list.",
        arity: 1,
        overloads: { lst: "[a, a[:-1], a[:-2], ..., a[:1]]" },
        vectorise: false,
        tests: [
            "['abcde'] : ['abcde', 'bcde', 'cde', 'de', 'e']",
            "[[1, 2, 3, 4, 5, 6]] : [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6], [3, 4, 5, 6], [4, 5, 6], [5, 6], [6]]",
            "[123456] : [123456, 23456, 3456, 456, 56, 6]",
            "[[]] : []"
        ]
    },
    {
        element: "ÞT",
        name: "Multi-dimensional truthy indices",
        description: "Multi-dimensional indices of truthy elements",
        arity: 1,
        overloads: { lst: "Multi-dimensional indices of truthy elements in a" },
        vectorise: false,
        tests: [
            "[[[[1,0,1],0,1,[1]],1,[[0]],[1]]] : [[0, 0, 0], [0, 0, 2], [0, 2], [0, 3, 0], [1], [3, 0]]"
        ]
    },
    {
        element: "Þİ",
        name: "First n Items and Rest",
        description: "Push the first n items of a, then the rest of a",
        arity: 2,
        overloads: { "lst-int": "a[:b], a[b:]", "int-lst": "b[:a], b[a:]" },
        vectorise: false,
        tests: [
            "[[1, 2, 3, 4, 5, 6, 7, 8, 9], 4] : [5, 6, 7, 8, 9]",
            "['abcde', 2] : 'cde'",
            "[1, 'xyz'] : 'yz'"
        ]
    },
    {
        element: "ÞN",
        name: "Alternating Negation",
        description:
            "An infinite list of an item, then that item negated, then that item, and so on. Uses the negation element for negation.",
        arity: 1,
        overloads: { any: "[a, -a, a, -a, ...]" },
        vectorise: false
    },
    {
        element: "Þ□",
        name: "Identity Matrix of Size n",
        description: "A matrix with 1s on the main diagonal and zeroes elsewhere",
        arity: 1,
        overloads: { num: "the a x a identity matrix" },
        vectorise: true,
        tests: [
            "[3] : [[1, 0, 0], [0, 1, 0], [0, 0, 1]]",
            "[4] : [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]",
            "[[3, 4, 5]] : [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], [[1, 0, 0, 0, 0], [0, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 0], [0, 0, 0, 0, 1]]]",
            "[0] : [[]]"
        ]
    },
    {
        element: "Þe",
        name: "Matrix Exponentiation",
        description: "A matrix multiplied by itself n times",
        arity: 2,
        overloads: {
            "lst-num": "a ** b (matrix exponentiation)",
            "num-lst": "b ** a (matrix exponentiation)"
        },
        vectorise: false,
        tests: [
            "[[[0, 0, 1, 0], [1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 0]], 2] : [[0, 1, 0, 1], [0, 1, 1, 1], [1, 0, 2, 0], [0, 1, 0, 1]]",
            "[[1, 2, 3, 4, 5], 4] : [[3375], [6750], [10125], [13500], [16875]]",
            "[[[]], 2] : [[]]"
        ]
    },
    {
        element: "Þd",
        name: "Distance matrix (Directed)",
        description: "Distance matrix of directed graph",
        arity: 1,
        overloads: {
            lst: "distance matrix of a directed graph (where a = [[i, j] for each edge i to j])"
        },
        vectorise: false,
        tests: [
            "[[[1,2],[2,3],[3,4],[4,1],[1,4],[3,6],[5,6]]] : [[0,1,2,1,float('inf'),3],[3,0,1,2,float('inf'),2],[2,3,0,1,float('inf'),1],[1,2,3,0,float('inf'),4],[float('inf'),float('inf'),float('inf'),float('inf'),0,1],[float('inf'),float('inf'),float('inf'),float('inf'),float('inf'),0]]"
        ]
    },
    {
        element: "Þw",
        name: "Distance matrix (Undirected)",
        description: "Distance matrix of undirected graph",
        arity: 1,
        overloads: {
            lst: "distance matrix of an undirected graph (where a = [[i, j] for each edge i to j])"
        },
        vectorise: false,
        tests: ["[[[1,3],[2,4],[3,4]]] : [[0,3,1,2],[3,0,2,1],[1,2,0,1],[2,1,1,0]]"]
    },
    {
        element: "ÞṖ",
        name: "Split Before Indices",
        description: "Split a list before indices in another list",
        arity: 2,
        overloads: { "lst-lst": "Split a list before indices in another list" },
        vectorise: false,
        tests: [
            "[[1,2,3,4,5,6,7,8,9], [3,6]] : [[1, 2], [3, 4, 5], [6, 7, 8, 9]]",
            "[[1,2,3,4,5,6], [0,1]] : [[], [1, 2, 3, 4, 5, 6]]"
        ]
    },
    {
        element: "Þṗ",
        name: "Split on Truthy Indices",
        description: "Split a list on truthy indices / Partition a list on truthy items",
        arity: 2,
        overloads: { "lst-lst": "Split a on truthy indices in b" },
        vectorise: false,
        tests: [
            "[[1,2,3,4], [0,1,0,0]] : [[1], [2, 3, 4]]",
            "[[1,2,3,4,5,6], [0,1,0,0]] : [[1], [2, 3, 4, 5, 6]]",
            "[[2,3,4,5,6], [1,1,0,1]] : [[], [2], [3, 4], [5, 6]]"
        ]
    },
    {
        element: "Þẏ",
        name: "Multidimensonal Indices",
        description: "A list of indices for a multidimensional list",
        arity: 1,
        overloads: { lst: "A list of indices for a multidimensional list" },
        vectorise: false,
        tests: [
            "[[69, 69, 69, 69, 69]] : [0, 1, 2, 3, 4]",
            "[[69, [69, 69, 69], 69, [69, 69]]] : [0, [1, 0], [1, 1], [1, 2], 2, [3, 0], [3, 1]]",
            "[[]] : []",
            "[[[], [], []]] : [0, 1, 2]"
        ]
    },
    {
        element: "Þė",
        name: "Multidimensonal Enumeration",
        description: "Enumerate a list and all its sublists",
        arity: 1,
        overloads: { lst: "Enumerate a list and all its sublists" },
        vectorise: false,
        tests: [
            "[[69, 69, 69, 69, 69]] : [[0, 69], [1, 69], [2, 69], [3, 69], [4, 69]]",
            "[[69, [69, 69, 69], 69, [69, 69]]] : [[0, 69], [[1, 0], 69], [[1, 1], 69], [[1, 2], 69], [2, 69], [[3, 0], 69], [[3, 1], 69]]",
            "[[]] : []",
            "[[[], [], []]] : [[0, []], [1, []], [2, []]]"
        ]
    },
    {
        element: "¨□",
        name: "Parse direction arrow to integer",
        description: "Map characters in `>^<v` to integers (0, 1, 2, 3 respectively)",
        arity: 1,
        overloads: {
            str: "map on a, replacing `>^<v` with integers, and others with -1 ([`>^<v`.find(a[0]), `>^<v`.find(a[1]), ...])"
        },
        vectorise: true,
        tests: [
            '["v"] : 3',
            '["^<><>"] : [1, 2, 0, 2, 0]',
            '[["^"]] : [1]',
            '["1V_☭"] : [-1, -1, -1, -1]'
        ]
    },
    {
        element: "¨^",
        name: "Parse direction arrow to vector",
        description: "Map characters in `>^<v` to direction vectors",
        arity: 1,
        overloads: {
            str: "map on a, replacing `>^<v` with [1, 0], [0, 1], etc., and others with [0, 0]"
        },
        vectorise: true,
        tests: [
            '["v"] : [0, -1]',
            '["^<><>"] : [[0, 1], [-1, 0], [1, 0], [-1, 0], [1, 0]]',
            '[["^"]] : [[0, 1]]',
            '["1V_☭"] : [[0, 0], [0, 0], [0, 0], [0, 0]]'
        ]
    },
    {
        element: "¨U",
        name: "Get Request",
        description: "Send a GET request to a URL",
        arity: 1,
        overloads: { str: "send a GET request to a" },
        vectorise: false
    },
    {
        modifier: "¨=",
        name: "Invariant After Application",
        arity: 1,
        usage: "¨=<element>",
        description:
            "Push whether the result of applying an element to an item is the same as the original item"
    },
    {
        element: "¨M",
        name: "Map At Indices",
        description: "Map a function at elements of a list whose indices are in another list",
        arity: 3,
        overloads: {
            "lst-lst-fun": "change the items in a with indices in by applying function c",
            "lst-num-fun": "change the bth item in a by applying function c"
        },
        vectorise: false
    },
    {
        element: "¨,",
        name: "Print With Space",
        description: "Print a value with a space after it",
        arity: 1,
        overloads: { any: "print a followed by a space" },
        vectorise: false
    },
    {
        element: "¨…",
        name: "Print With Space Without Popping",
        description: "Print a value with a space after it, without popping it",
        arity: 1,
        overloads: { any: "print a followed by a space, then push a" },
        vectorise: false
    },
    {
        element: "¨>",
        name: "Strict Greater Than",
        description:
            "Non-vectorising greater than - useful for lists. Note that all corresponding elements should be of the same type.",
        arity: 2,
        overloads: { "any-any": "Non-vectorising greater than - useful for lists" },
        vectorise: false,
        tests: ["[[1, 1, 1], [9, 9, 9]] : 0", "[[1, 2, '3'], [1, 2, '2']] : 1", "[[], []] : 0"]
    },
    {
        element: "¨<",
        name: "Strict Less Than",
        description:
            "Non-vectorising greater than - useful for lists. Note that all corresponding elements should be of the same type.",
        arity: 2,
        overloads: { "any-any": "a > b (non-vectorising)" },
        vectorise: false,
        tests: ["[[1, 1, 1], [9, 9, 9]] : 1", "[[1, 2, '3'], [1, 2, '2']] : 0", "[[], []] : 0"]
    },
    {
        element: "¨*",
        name: "All Multiples",
        description: "Return all multiples of a",
        arity: 1,
        overloads: { num: "[a*1, a*2, a*3, a*4, ...]", str: "[a*1, a*2, a*3, a*4, ...]" },
        vectorise: true
    },
    {
        element: "¨e",
        name: "All Powers",
        description: "Return all powers of a",
        arity: 1,
        overloads: { num: "[a**1, a**2, a**3, a**4, ...]", str: "[a**1, a**2, a**3, a**4, ...]" },
        vectorise: true
    },
    {
        element: "¨²",
        name: "All Powers of 2",
        description: "Return all powers of 2",
        arity: 0,
        overloads: { none: "[2**1, 2**2, 2**3, 2**4, ...]" },
        vectorise: false
    },
    {
        element: "¨₀",
        name: "All Powers of 10",
        description: "Return all powers of 10",
        arity: 0,
        overloads: { none: "[10**1, 10**2, 10**3, 10**4, ...]" },
        vectorise: false
    },
    {
        modifier: "¨£",
        name: "Star Map",
        description:
            "Reduce each pair of two lists zipped together by a function. Equivalent to Zvƒ",
        usage: "¨£<element>"
    },
    {
        element: "¨ẇ",
        name: "Wrap Last n Items",
        description: "Wrap the last n items on the stack into a list",
        arity: 1,
        overloads: {
            num: "last a items of the stack, as a list; does not pop anything other than a"
        },
        vectorise: false,
        tests: [
            "[1, 2, 3, 4, 4] : [1, 2, 3, 4]",
            "[3, 3, 3, 3, 3, 3, 3, 3, 3, 3] : [3, 3, 3]",
            "[[1, 2, 3, 4], 1] : [[1, 2, 3, 4]]"
        ]
    },
    {
        element: "¨2",
        name: "Dyadic Map Lambda",
        description: "Open a dyadic mapping lambda - ¨2...; Receives item and index.",
        arity: 2
    },
    {
        element: "¨3",
        name: "Triadic Map Lambda",
        description: "Open a triadic mapping lambda - ¨3...; Receives item, index, and vector.",
        arity: 3
    },
    {
        element: "¨₂",
        name: "Dyadic Filter Lambda",
        description: "Open a dyadic filter lambda - ¨₂...; Receives item and index.",
        arity: 2
    },
    {
        element: "¨₃",
        name: "Triadic Filter Lambda",
        description: "Open a triadic filter lambda - ¨₃...; Receives item, index, and vector.",
        arity: 3
    },
    {
        element: "¨Z",
        name: "Zip lambda",
        description:
            "Open a zip lambda - ¨Z...; Pops top two items off stack, zips them, and loops over them, pushing each item to the stack. Equivalent to `Zƛ÷...;`.",
        arity: 3
    },
    {
        modifier: "¨p",
        name: "For Each Overlapping Pair",
        description: "Run element for each overlapping pair. Equivalent to `2lvƒ`",
        usage: "¨p<element>"
    },
    {
        element: "¨?",
        name: "Explicit STDIN",
        description: "Read from STDIN, even if there are arguments",
        arity: 0
    },
    {
        element: "¨S",
        name: "Override Inputs",
        description: "Overrides the list of inputs",
        arity: 1
    },
    {
        element: "¨R",
        name: "Reset Inputs",
        description: "Resets the list of inputs to what they were before overriding with `¨S`",
        arity: 0
    },
    {
        modifier: "¨i",
        name: "If/Else",
        description:
            "If the top of the stack is truthy, run the first element, otherwise the second.",
        usage: "¨i<element><element>"
    }
] satisfies ((
    | {
          element: string;
          arity?: number | string;
          overloads?: { [key: string]: string };
          vectorise?: boolean;
          tests?: string[];
      }
    | { modifier: string }
) & {
    name: number | string;
    description: string;
    usage?: string;
})[];

export const shortcut_map = {
    "A\\": "λ",
    lambda: "λ",
    lmb: "λ",
    "`l": "λ",
    Ax: "ƛ",
    lambdax: "ƛ",
    lmbx: "ƛ",
    "`L": "ƛ",
    "`lx": "ƛ",
    "-,": "¬",
    not: "¬",
    and: "∧",
    "and.": "⟑",
    or: "∨",
    "or.": "⟇",
    ":-": "÷",
    "-:": "÷",
    div: "÷",
    "./.": "÷",
    xx: "×",
    mul: "×",
    times: "×",
    "<<": "«",
    ">>": "»",
    "^o": "°",
    deg: "°",
    "..": "•",
    ss: "ß",
    dagger: "†",
    tt: "†",
    CE: "€",
    EC: "€",
    "C=": "€",
    "=C": "€",
    euro: "€",
    "1/2": "½",
    delta: "∆",
    tri: "∆",
    "^_": "∆",
    "o/": "ø",
    "<>": "↔",
    lr: "↔",
    cent: "¢",
    "c|": "¢",
    notr: "⌐",
    ",-": "⌐",
    ae: "æ",
    RR: "ʀ",
    _R: "ʀ",
    R_: "ʁ",
    "R'": "ʁ",
    rr: "ɾ",
    ",r": "ɽ",
    rh: "ɽ",
    thorn: "Þ",
    bp: "Þ",
    ch: "ƈ",
    oo: "∞",
    inf: "∞",
    "^^": "¨",
    "^:": "¨",
    up: "↑",
    "^|": "↑",
    down: "↓",
    dn: "↓",
    therefore: "∴",
    ":.": "∴",
    since: "∵",
    ".:": "∵",
    "_>": "›",
    "_<": "‹",
    "::": "∷",
    "[]": "¤",
    eth: "ð",
    dx: "ð",
    right: "→",
    "->": "→",
    left: "←",
    "<-": "←",
    BB: "β",
    beta: "β",
    tau: "τ",
    ".a": "ȧ",
    ".b": "ḃ",
    ".c": "ċ",
    ".d": "ḋ",
    ".e": "ė",
    ".f": "ḟ",
    ".g": "ġ",
    ".h": "ḣ",
    "i~": "ḭ",
    "l.": "ŀ",
    ".l": "ŀ",
    ".m": "ṁ",
    ".n": "ṅ",
    ".o": "ȯ",
    ".p": "ṗ",
    ".r": "ṙ",
    ".s": "ṡ",
    ".t": "ṫ",
    ".w": "ẇ",
    ".x": "ẋ",
    ".y": "ẏ",
    ".z": "ż",
    sqrt: "√",
    "v/": "√",
    "[[": "⟨",
    "]]": "⟩",
    "\\'": "‛",
    "``": "‛",
    _0: "₀",
    _1: "₁",
    _2: "₂",
    _3: "₃",
    _4: "₄",
    _5: "₅",
    _6: "₆",
    _7: "₇",
    _8: "₈",
    pilcrow: "¶",
    pil: "¶",
    pilr: "⁋",
    pp: "⁋",
    section: "§",
    sec: "§",
    SS: "§",
    epsilon: "ε",
    ee: "ε",
    "!!": "¡",
    sum: "∑",
    EE: "∑",
    "||": "¦",
    "~~": "≈",
    "~=": "≈",
    "|u": "µ",
    mu: "µ",
    ".A": "Ȧ",
    ".B": "Ḃ",
    ".C": "Ċ",
    ".D": "Ḋ",
    ".E": "Ė",
    ".F": "Ḟ",
    ".G": "Ġ",
    ".H": "Ḣ",
    ".I": "İ",
    ".L": "Ŀ",
    "L.": "Ŀ",
    ".M": "Ṁ",
    ".N": "Ṅ",
    ".O": "Ȯ",
    ".P": "Ṗ",
    ".R": "Ṙ",
    ".S": "Ṡ",
    ".T": "Ṫ",
    ".W": "Ẇ",
    ".X": "Ẋ",
    ".Y": "Ẏ",
    ".Z": "Ż",
    "_=": "₌",
    "_(": "₍",
    "^0": "⁰",
    "^1": "¹",
    "^2": "²",
    nabla: "∇",
    _v: "∇",
    ceil: "⌈",
    "|^": "⌈",
    floor: "⌊",
    "|_": "⌊",
    macron: "¯",
    "^-": "¯",
    "+-": "±",
    pm: "±",
    "S=": "₴",
    "...": "…",
    box: "□",
    "L>": "↳",
    "v>": "↳",
    "<|": "↲",
    "<v": "↲",
    andc: "⋏",
    orc: "⋎",
    "/\\": "꘍",
    vc: "꘍",
    "^!": "ꜝ",
    "c/o": "℅",
    co: "℅",
    "<=": "≤",
    le: "≤",
    ">=": "≥",
    ge: "≥",
    "=/=": "≠",
    "!=": "≠",
    ne: "≠",
    "^=": "⁼",
    fh: "ƒ",
    "f/": "ƒ",
    ff: "ƒ",
    dq: "ɖ",
    UU: "∪",
    nn: "∩",
    "u.": "⊍",
    pound: "£",
    LE: "£",
    yen: "¥",
    "Y=": "¥",
    "=Y": "¥",
    UP: "⇧",
    DOWN: "⇩",
    DN: "⇩",
    uA: "Ǎ",
    vA: "Ǎ",
    ua: "ǎ",
    va: "ǎ",
    uI: "Ǐ",
    vI: "Ǐ",
    ui: "ǐ",
    vi: "ǐ",
    uO: "Ǒ",
    vO: "Ǒ",
    uo: "ǒ",
    vo: "ǒ",
    uU: "Ǔ",
    vU: "Ǔ",
    vu: "ǔ",
    uu: "ǔ",
    "^(": "⁽",
    "|=": "‡",
    "=|": "‡",
    "++": "‡",
    "()": "≬",
    "^+": "⁺",
    ret: "↵",
    "1/8": "⅛",
    "1/4": "¼",
    qt: "¼",
    "3/4": "¾",
    "3q": "¾",
    "|^|": "Π",
    pi: "Π",
    ",,": "„",
    "''": "‟"
} as { [key: string]: string };

export const shortcut_list = Object.entries(shortcut_map);

export const description_overrides = parse(`
λ: |
    Create a lambda function (pushes an anomymous function to the stack). <code>λarity|code;</code>
    defines a lambda function with the given arity (if unspecified, the arity is 1). When a lambda
    is applied with ${link("†")}, it pops that many values from the stack and places them on its
    own stack in reverse order. Then, the function body is run with that sub-stack. Finally, if the
    function's stack is non-empty, its top value is pushed back onto the stack. Otherwise, the
    original top-of-stack is pushed back.
`);
