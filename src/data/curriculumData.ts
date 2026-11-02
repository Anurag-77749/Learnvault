export interface RawTopicData {
  id: string;
  title: string;
  subtopics: string[];
  resources?: { title: string; url: string; isVideo?: boolean }[];
}

export interface RawTrackData {
  trackId: number;
  trackTitle: string;
  topics: RawTopicData[];
}

export const CANONICAL_CURRICULUM: RawTrackData[] = [
  {
    "trackId": 0,
    "trackTitle": "TRACK 0: INTRODUCTION",
    "topics": [
      {
        "id": "t0-1",
        "title": "FDE Glossary",
        "subtopics": [
          "Delta",
          "UAT (User Acceptance Testing)",
          "Last-Mile Integration",
          "Day 2 Operations",
          "Productized Consulting",
          "Embedded Engineering"
        ],
        "resources": [
          {
            "title": "The Forward Deployed Engineer: Role & Definition (Palantir Blog)",
            "url": "https://blog.palantir.com",
            "isVideo": false
          },
          {
            "title": "Field Engineering in High-Stakes Tech (YouTube)",
            "url": "https://www.youtube.com/watch?v=wXWpQ2c2L2U",
            "isVideo": true
          },
          {
            "title": "The Pragmatic Engineer: Understanding FDEs & Last-Mile Delivery",
            "url": "https://newsletter.pragmaticengineer.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t0-2",
        "title": "Roles & Responsibilities & Tiers",
        "subtopics": [
          "From X to FDE",
          "Roles & Responsibilities",
          "FDE Tiers"
        ],
        "resources": [
          {
            "title": "Levels.fyi: Forward Deployed Engineer Career Framework & Compensation",
            "url": "https://www.levels.fyi",
            "isVideo": false
          },
          {
            "title": "Day in the Life of a Palantir FDE (YouTube)",
            "url": "https://www.youtube.com/watch?v=kYv9b9iE-g0",
            "isVideo": true
          }
        ]
      }
    ]
  },
  {
    "trackId": 1,
    "trackTitle": "TRACK 1: COMPUTER SCIENCE BASICS (Learn a Language)",
    "topics": [
      {
        "id": "t1-python-beginner",
        "title": "Python: Beginner Python",
        "subtopics": [
          "Variables in Python",
          "String Manipulation",
          "Input and Print Functions",
          "Variable Naming Rules",
          "Mathematical Operations in Python",
          "DataTypes",
          "Converting types",
          "Conditionals IF/ELIF/ELSE",
          "Logical Operators",
          "Randomisation",
          "Error Handling",
          "Functions",
          "For Loops",
          "Code blocks and Indentation",
          "While Loops",
          "Flowchart Programming",
          "Positional and Keyword Arguments",
          "Python Dictionaries and Lists",
          "Nested Collections",
          "Returning Functions",
          "Return vs. Print",
          "Doc Strings vs. Comments",
          "Scope and Local/Global Variables",
          "Debugging Techniques"
        ],
        "resources": [
          {
            "title": "100 Days of Code: Complete Python Pro Bootcamp by Dr. Angela Yu (App Brewery)",
            "url": "https://www.appbrewery.co",
            "isVideo": true
          },
          {
            "title": "App Brewery 100 Days of Code Official Syllabus & Projects",
            "url": "https://www.appbrewery.co/p/100-days-of-code",
            "isVideo": false
          },
          {
            "title": "Official Python 3 Documentation & Standard Library Tutorial",
            "url": "https://docs.python.org/3/tutorial/",
            "isVideo": false
          },
          {
            "title": "Real Python: Python 3 Guides & Best Practices",
            "url": "https://realpython.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t1-python-intermediate",
        "title": "Python: Intermediate Python",
        "subtopics": [
          "Local Development Environment Setup",
          "PyCharm Tips and Tricks",
          "Python Object Oriented Programming",
          "Creating Classes in Python",
          "Using External Python Modules/Import",
          "Getting / Setting Attributes",
          "Python Methods",
          "Class Initialisers",
          "Module Aliasing",
          "Optional, Required and Default Parameters",
          "Event Listeners",
          "Python Instances and State",
          "Python Turtle",
          "Game Development with Python and OOP",
          "Python Inheritance",
          "Python Slice Function",
          "File I/O Reading and Writing to Local Files",
          "File Directories",
          "Reading and Writing to CSV",
          "Introduction to the Pandas Framework",
          "List Comprehensions",
          "Dictionary Comprehensions",
          "Packing and Unpacking Functions in Python",
          "Creating Desktop GUI Apps with Tkinter",
          "Strongly Dynamic Typing",
          "Error Handling and Exceptions",
          "Try / Except/ Raise",
          "Working with JSONs",
          "Local Persistence",
          "Sending Email with Python and SMTP",
          "Working with date and time",
          "Hosting Python Code Online with PythonAnywhere"
        ],
        "resources": [
          {
            "title": "100 Days of Code: Complete Python Pro Bootcamp by Dr. Angela Yu (App Brewery)",
            "url": "https://www.appbrewery.co",
            "isVideo": true
          },
          {
            "title": "App Brewery 100 Days of Code Official Syllabus & Projects",
            "url": "https://www.appbrewery.co/p/100-days-of-code",
            "isVideo": false
          },
          {
            "title": "Official Python 3 Documentation & Standard Library Tutorial",
            "url": "https://docs.python.org/3/tutorial/",
            "isVideo": false
          },
          {
            "title": "Real Python: Python 3 Guides & Best Practices",
            "url": "https://realpython.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t1-python-intermediate-plus",
        "title": "Python: Intermediate +",
        "subtopics": [
          "APIs",
          "Making HTTP Requests with the Requests module",
          "Sending Parameters with the Request",
          "APIs with Authentication",
          "Sending SMS with Python",
          "Web Scraping with Beautiful Soup",
          "Browser Automation with Selenium Web Driver",
          "Automating Tinder",
          "Automating Twitter",
          "Automating LinkedIn",
          "Automating Instagram",
          "Web Development with Flask",
          "Command Line",
          "Python Decorators",
          "Templating with Jinja 2",
          "WTForms"
        ],
        "resources": [
          {
            "title": "100 Days of Code: Complete Python Pro Bootcamp by Dr. Angela Yu (App Brewery)",
            "url": "https://www.appbrewery.co",
            "isVideo": true
          },
          {
            "title": "App Brewery 100 Days of Code Official Syllabus & Projects",
            "url": "https://www.appbrewery.co/p/100-days-of-code",
            "isVideo": false
          },
          {
            "title": "Official Python 3 Documentation & Standard Library Tutorial",
            "url": "https://docs.python.org/3/tutorial/",
            "isVideo": false
          },
          {
            "title": "Real Python: Python 3 Guides & Best Practices",
            "url": "https://realpython.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t1-python-advanced",
        "title": "Python: Advanced Python",
        "subtopics": [
          "Build Your Own REST API with Python",
          "Build Your Own Blog",
          "Databases with SQLite",
          "Dataframe Inspection",
          "Data Cleaning",
          "Sorting Values in Dataframes",
          "Arithmetic Operations with Pandas",
          "Creating Pivot Tables",
          "Chaining Functions",
          "Smoothing Time Series Data",
          "Creating Line Charts with Matplotlib",
          "Using Jupyter Notebook",
          "HTML Markdown",
          "Creating Scatterplots with Matplotlib",
          "Relational Database Schemas",
          "Descriptive Statistics",
          "Creating Bar Charts, Pie Charts, Donut Charts, Box Plots with Plotly",
          "Creating NumPy NDArrays",
          "Array Slicing and Subsetting",
          "Matrix Multiplication",
          "Bitwise and Operators in Pandas",
          "Creating Bubble Charts with Seaborn",
          "Running Regressions with Scikit-Learn",
          "Non-Parametric Regression",
          "Students T-Tests and Histograms with Scikit-Learn",
          "Multi-Variable Regression",
          "Log Transformations",
          "Residuals Analysis"
        ],
        "resources": [
          {
            "title": "100 Days of Code: Complete Python Pro Bootcamp by Dr. Angela Yu (App Brewery)",
            "url": "https://www.appbrewery.co",
            "isVideo": true
          },
          {
            "title": "App Brewery 100 Days of Code Official Syllabus & Projects",
            "url": "https://www.appbrewery.co/p/100-days-of-code",
            "isVideo": false
          },
          {
            "title": "Official Python 3 Documentation & Standard Library Tutorial",
            "url": "https://docs.python.org/3/tutorial/",
            "isVideo": false
          },
          {
            "title": "Real Python: Python 3 Guides & Best Practices",
            "url": "https://realpython.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t1-python-projects",
        "title": "Python: Professional Portfolio Projects",
        "subtopics": [
          "Text to Morse Code Converter",
          "Portfolio Website",
          "Tic Tac Toe Game",
          "Image Watermarking App",
          "Typing Speed Test",
          "Breakout Game",
          "Cafe and Wifi Website",
          "Todo List Website",
          "Disappearing Text Writing App",
          "Image Color Palette Generator",
          "Custom Web Scraper",
          "Automating the Google Dinosaur Game",
          "Space Invaders Game",
          "Custom API Driven Website",
          "An Online Shop",
          "Custom Browser Automation",
          "Analyse and Visualise the Space Race",
          "Analyse Deaths Involving the Police in the US",
          "Predict Earnings using Multivariable Regression"
        ],
        "resources": [
          {
            "title": "100 Days of Code: Complete Python Pro Bootcamp by Dr. Angela Yu (App Brewery)",
            "url": "https://www.appbrewery.co",
            "isVideo": true
          },
          {
            "title": "App Brewery 100 Days of Code Official Syllabus & Projects",
            "url": "https://www.appbrewery.co/p/100-days-of-code",
            "isVideo": false
          },
          {
            "title": "Official Python 3 Documentation & Standard Library Tutorial",
            "url": "https://docs.python.org/3/tutorial/",
            "isVideo": false
          },
          {
            "title": "Real Python: Python 3 Guides & Best Practices",
            "url": "https://realpython.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t1-2",
        "title": "JavaScript / TypeScript",
        "subtopics": [
          "Basic types",
          "Interfaces & type aliases",
          "Unions & narrowing",
          "Generics",
          "Utility types",
          "tsconfig",
          "Using TS with Node and React"
        ],
        "resources": [
          {
            "title": "Total TypeScript by Matt Pocock",
            "url": "https://www.totaltypescript.com",
            "isVideo": false
          },
          {
            "title": "The Modern JavaScript Tutorial",
            "url": "https://javascript.info",
            "isVideo": false
          },
          {
            "title": "TypeScript Official Handbook",
            "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t1-3",
        "title": "Java / Scala",
        "subtopics": [
          "Java syntax",
          "OOP",
          "Collections",
          "Exceptions",
          "Streams",
          "Maven basics",
          "Scala basics (awareness, for Spark)"
        ],
        "resources": [
          {
            "title": "University of Helsinki: Java Programming MOOC I & II",
            "url": "https://java-programming.mooc.fi/",
            "isVideo": false
          },
          {
            "title": "Rock the JVM: Scala & Functional Programming for Beginners",
            "url": "https://rockthejvm.com",
            "isVideo": true
          }
        ]
      },
      {
        "id": "t1-4",
        "title": "Go",
        "subtopics": [
          "Syntax",
          "Structs & interfaces",
          "Error handling",
          "Goroutines & channels",
          "Building a small HTTP server"
        ],
        "resources": [
          {
            "title": "Learn Go with Tests by Chris James",
            "url": "https://quii.gitbook.io/learn-go-with-tests/",
            "isVideo": false
          },
          {
            "title": "Go by Example",
            "url": "https://gobyexample.com/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t1-5",
        "title": "Rust",
        "subtopics": [
          "Cargo",
          "Ownership & borrowing",
          "Structs & enums",
          "Error handling",
          "Traits (awareness level)"
        ],
        "resources": [
          {
            "title": "The Rust Programming Language (The Official Book)",
            "url": "https://doc.rust-lang.org/book/",
            "isVideo": false
          },
          {
            "title": "Rustlings - Hands-on Exercises to Learn Rust",
            "url": "https://github.com/rust-lang/rustlings",
            "isVideo": false
          },
          {
            "title": "Crust of Rust by Jon Gjengset (YouTube)",
            "url": "https://www.youtube.com/c/JonGjengset",
            "isVideo": true
          }
        ]
      },
      {
        "id": "t1-6",
        "title": "C++",
        "subtopics": [
          "Syntax",
          "Pointers & references",
          "OOP",
          "STL containers & algorithms",
          "Memory management"
        ],
        "resources": [
          {
            "title": "LearnCpp.com - Complete C++ Tutorial",
            "url": "https://www.learncpp.com/",
            "isVideo": false
          },
          {
            "title": "The Cherno C++ Series (YouTube)",
            "url": "https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4G4b",
            "isVideo": true
          }
        ]
      }
    ]
  },
  {
    "trackId": 2,
    "trackTitle": "TRACK 2: DSA & SYSTEM DESIGN",
    "topics": [
      {
        "id": "t2-1",
        "title": "1 Basics",
        "subtopics": [
          "I/O & data types",
          "Conditionals & loops",
          "Patterns",
          "Functions",
          "Time & space complexity (Big-O)",
          "Basic maths (digits, gcd, primes, palindromes)",
          "Basic recursion",
          "Basic hashing"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-2",
        "title": "2 Sorting",
        "subtopics": [
          "Selection sort",
          "Bubble sort",
          "Insertion sort",
          "Merge sort",
          "Quick sort"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-3",
        "title": "3 Arrays",
        "subtopics": [
          "Easy (largest, sorted check, duplicates, rotate, move zeros, missing number, single number)",
          "Medium (two sum, Kadane, stock buy/sell, next permutation, prefix sums, subarray sum = k, 3Sum, 4Sum, rearrange, spiral & rotate matrix)",
          "Hard (merge intervals, inversions, reverse pairs, max product subarray)"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-4",
        "title": "4 Binary Search",
        "subtopics": [
          "Basics",
          "Lower/upper bound",
          "First/last occurrence",
          "Rotated array",
          "Search on answer (sqrt, Koko bananas, ship capacity, aggressive cows, book allocation, painter's partition)",
          "Binary search on 2D matrix",
          "Median of two sorted arrays"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-5",
        "title": "5 Strings",
        "subtopics": [
          "Basics",
          "Frequency & anagrams",
          "Longest common prefix",
          "Palindromic substrings",
          "String-to-integer",
          "KMP, Z-function, Rabin-Karp"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-6",
        "title": "6 Linked List",
        "subtopics": [
          "Singly linked list",
          "Doubly linked list",
          "Middle, reverse, cycle detection, palindrome, merge, sort",
          "Remove nth from end",
          "Intersection",
          "Add two numbers",
          "Reverse in k-groups",
          "Clone with random pointer"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-7",
        "title": "7 Recursion & Backtracking",
        "subtopics": [
          "Subsequences",
          "Subsets",
          "Combination sum",
          "Permutations",
          "N-Queens",
          "Sudoku",
          "Rat in a maze",
          "Word break",
          "Palindrome partitioning"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-8",
        "title": "8 Bit Manipulation",
        "subtopics": [
          "Basics & operators",
          "Set/clear/toggle bit",
          "Count set bits",
          "Power of two",
          "XOR tricks",
          "Single number"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-9",
        "title": "9 Stack & Queue",
        "subtopics": [
          "Implementations",
          "Valid parentheses",
          "Prefix/infix/postfix",
          "Monotonic stack (next greater, histogram, trapping rain water)",
          "Stock span",
          "Sliding window maximum",
          "LRU cache"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-10",
        "title": "10 Sliding Window & Two Pointers",
        "subtopics": [
          "Fixed window",
          "Variable window",
          "Longest substring without repeat",
          "Minimum window substring",
          "Fruit baskets",
          "Count subarrays with constraint"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-11",
        "title": "11 Heaps",
        "subtopics": [
          "Heap basics",
          "Kth largest/smallest",
          "Merge k sorted lists",
          "Top-k frequent",
          "Task scheduler",
          "Median from data stream"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-12",
        "title": "12 Greedy",
        "subtopics": [
          "Basic greedy",
          "Activity selection",
          "Job sequencing",
          "Fractional knapsack",
          "Jump game",
          "Intervals",
          "Candy"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-13",
        "title": "13 Binary Trees",
        "subtopics": [
          "Traversals (pre/in/post/level, iterative, Morris)",
          "Height & diameter",
          "Balanced",
          "LCA",
          "Views (top, bottom, left, right)",
          "Path problems",
          "Construct from traversals",
          "Serialize & deserialize"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-14",
        "title": "14 Binary Search Trees",
        "subtopics": [
          "Search/insert/delete",
          "Validate BST",
          "Kth smallest",
          "LCA in BST",
          "Successor/predecessor",
          "BST iterator"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-15",
        "title": "15 Graphs",
        "subtopics": [
          "Representations",
          "BFS",
          "DFS",
          "Connected components",
          "Cycle detection",
          "Bipartite",
          "Topological sort",
          "Shortest paths (BFS, Dijkstra, Bellman-Ford, Floyd-Warshall)",
          "MST (Prim, Kruskal)",
          "Union-Find (DSU)",
          "Bridges & articulation points",
          "SCC"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-16",
        "title": "16 Dynamic Programming",
        "subtopics": [
          "Intro (memoization vs tabulation)",
          "1-D DP",
          "2-D / grid DP",
          "Subsequences (subset sum, knapsack)",
          "DP on strings (LCS, edit distance)",
          "Stock problems",
          "LIS",
          "Partition DP",
          "DP on squares"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-17",
        "title": "17 Tries",
        "subtopics": [
          "Implement",
          "Prefix search",
          "Word problems",
          "XOR queries"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-18",
        "title": "18 Revision with NeetCode 150",
        "subtopics": [
          "Arrays & Hashing",
          "Two Pointers",
          "Stack",
          "Binary Search",
          "Sliding Window",
          "Linked List",
          "Trees",
          "Tries",
          "Heap/Priority Queue",
          "Backtracking",
          "Graphs",
          "Advanced Graphs",
          "1-D DP",
          "2-D DP",
          "Greedy",
          "Intervals",
          "Math & Geometry",
          "Bit Manipulation"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-19",
        "title": "19 Continuous Practice",
        "subtopics": [
          "1 to 2 LeetCode problems daily"
        ],
        "resources": [
          {
            "title": "Code and Debug: DSA with Python Course & Playlist (YouTube)",
            "url": "https://www.codeanddebug.in",
            "isVideo": true
          },
          {
            "title": "Striver's A2Z DSA Course & Sheet (TakeUForward)",
            "url": "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
            "isVideo": false
          },
          {
            "title": "NeetCode 150 Practice Roadmap",
            "url": "https://neetcode.io/practice",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t2-20",
        "title": "System Design",
        "subtopics": [
          "How the web works",
          "Latency, throughput, scalability",
          "Load balancing",
          "Caching & CDN",
          "SQL vs NoSQL",
          "Indexing",
          "Replication & sharding",
          "CAP & consistency",
          "Message queues",
          "API gateway & rate limiting",
          "Monolith vs microservices",
          "Consistent hashing",
          "Back-of-envelope estimation",
          "Design: URL shortener",
          "Design: Rate limiter",
          "Design: Chat app",
          "Design: News feed",
          "Design: Notification system",
          "Design: File storage"
        ],
        "resources": [
          {
            "title": "ByteByteGo: System Design Interview by Alex Xu",
            "url": "https://bytebytego.com",
            "isVideo": false
          },
          {
            "title": "Designing Data-Intensive Applications (DDIA) by Martin Kleppmann",
            "url": "https://dataintensive.net/",
            "isVideo": false
          },
          {
            "title": "Gaurav Sen System Design Series (YouTube)",
            "url": "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX",
            "isVideo": true
          }
        ]
      }
    ]
  },
  {
    "trackId": 3,
    "trackTitle": "TRACK 3: GIT & GITHUB",
    "topics": [
      {
        "id": "t3-1",
        "title": "Git & GitHub",
        "subtopics": [
          "Install & configure",
          "Init, add, commit, status, log",
          ".gitignore",
          "Branches",
          "Merge",
          "Resolving conflicts",
          "Rebase",
          "Stash",
          "Reset & revert",
          "Tags",
          "Remotes (clone, push, pull, fetch)",
          "GitHub repos & SSH keys",
          "Forks",
          "Pull requests & code review",
          "Issues",
          "README & Markdown",
          "GitHub Pages",
          "Branching strategies",
          "Good commit messages"
        ],
        "resources": [
          {
            "title": "Pro Git Book (2nd Edition by Scott Chacon)",
            "url": "https://git-scm.com/book/en/v2",
            "isVideo": false
          },
          {
            "title": "MIT Missing Semester: Version Control (Git)",
            "url": "https://missing.csail.mit.edu/2020/version-control/",
            "isVideo": true
          },
          {
            "title": "Oh Shit, Git!?! (Interactive Troubleshooting Guide)",
            "url": "https://ohshitgit.com/",
            "isVideo": false
          }
        ]
      }
    ]
  },
  {
    "trackId": 4,
    "trackTitle": "TRACK 4: LINUX SKILLS",
    "topics": [
      {
        "id": "t4-1",
        "title": "Linux",
        "subtopics": [
          "What Linux is & distros",
          "Filesystem hierarchy",
          "Navigation",
          "File operations",
          "Viewing files",
          "Permissions & ownership",
          "Users, groups, sudo",
          "Package managers",
          "Processes (ps, top, kill)",
          "Services (systemd)",
          "Networking commands (ping, curl, ssh, ss)",
          "Disk usage",
          "Environment variables",
          "Cron",
          "Logs",
          "Text processing (grep, sed, awk, find, pipes, redirection)",
          "SSH keys"
        ],
        "resources": [
          {
            "title": "The Linux Command Line (TLCL) by William Shotts",
            "url": "https://linuxcommand.org/tlcl.php",
            "isVideo": false
          },
          {
            "title": "MIT Missing Semester: Shell Tools and Scripting",
            "url": "https://missing.csail.mit.edu/2020/shell-tools/",
            "isVideo": true
          },
          {
            "title": "OverTheWire: Bandit (Hands-on Linux CLI Wargame)",
            "url": "https://overthewire.org/wargames/bandit/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t4-2",
        "title": "Shell & Bash",
        "subtopics": [
          "Shell basics",
          "Variables",
          "Quoting",
          "Conditionals",
          "Loops",
          "Functions",
          "Arguments",
          "Exit codes",
          "Writing scripts",
          "Automating with cron",
          "Debugging scripts"
        ],
        "resources": [
          {
            "title": "The Linux Command Line (TLCL) by William Shotts",
            "url": "https://linuxcommand.org/tlcl.php",
            "isVideo": false
          },
          {
            "title": "MIT Missing Semester: Shell Tools and Scripting",
            "url": "https://missing.csail.mit.edu/2020/shell-tools/",
            "isVideo": true
          },
          {
            "title": "OverTheWire: Bandit (Hands-on Linux CLI Wargame)",
            "url": "https://overthewire.org/wargames/bandit/",
            "isVideo": false
          }
        ]
      }
    ]
  },
  {
    "trackId": 5,
    "trackTitle": "TRACK 5: FRONTEND SKILLS",
    "topics": [
      {
        "id": "t5-1",
        "title": "HTML",
        "subtopics": [
          "How the web works (browser, HTTP, DNS)",
          "Document structure",
          "Text elements",
          "Links & images",
          "Lists",
          "Tables",
          "Forms & inputs & validation",
          "Semantic HTML",
          "Audio & video",
          "Accessibility basics (alt text, ARIA)",
          "SEO meta tags"
        ],
        "resources": [
          {
            "title": "MDN Web Docs (Mozilla Developer Network)",
            "url": "https://developer.mozilla.org",
            "isVideo": false
          },
          {
            "title": "CSS for JavaScript Developers by Josh W. Comeau",
            "url": "https://css-for-js.dev/",
            "isVideo": false
          },
          {
            "title": "Kevin Powell CSS Mastery (YouTube)",
            "url": "https://www.youtube.com/@KevinPowell",
            "isVideo": true
          }
        ]
      },
      {
        "id": "t5-2",
        "title": "CSS",
        "subtopics": [
          "Syntax & selectors",
          "Cascade & specificity",
          "Box model",
          "Units",
          "Colours & typography",
          "Display & positioning",
          "Flexbox",
          "Grid",
          "Responsive design (mobile-first, media queries)",
          "Pseudo-classes & pseudo-elements",
          "Transitions & animations",
          "Transforms",
          "CSS variables",
          "Dark mode"
        ],
        "resources": [
          {
            "title": "MDN Web Docs (Mozilla Developer Network)",
            "url": "https://developer.mozilla.org",
            "isVideo": false
          },
          {
            "title": "CSS for JavaScript Developers by Josh W. Comeau",
            "url": "https://css-for-js.dev/",
            "isVideo": false
          },
          {
            "title": "Kevin Powell CSS Mastery (YouTube)",
            "url": "https://www.youtube.com/@KevinPowell",
            "isVideo": true
          }
        ]
      },
      {
        "id": "t5-3",
        "title": "JavaScript",
        "subtopics": [
          "Variables & data types",
          "Operators",
          "Control flow",
          "Functions",
          "Arrays & array methods",
          "Objects",
          "ES6+ (destructuring, spread, modules)",
          "Scope & closures",
          "this",
          "Prototypes & classes",
          "DOM selection & manipulation",
          "Events & delegation",
          "Forms",
          "Async JS (callbacks, promises, async/await, fetch)",
          "JSON & APIs",
          "Error handling",
          "localStorage",
          "npm & Vite",
          "Debugging with DevTools"
        ],
        "resources": [
          {
            "title": "The Modern JavaScript Tutorial",
            "url": "https://javascript.info",
            "isVideo": false
          },
          {
            "title": "Eloquent JavaScript (Marijn Haverbeke)",
            "url": "https://eloquentjavascript.net/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t5-4",
        "title": "React",
        "subtopics": [
          "Why React",
          "JSX",
          "Components & props",
          "useState",
          "Events",
          "Conditional rendering",
          "Lists & keys",
          "Controlled forms",
          "useEffect",
          "Data fetching",
          "Custom hooks",
          "Context",
          "useReducer",
          "useRef",
          "useMemo & useCallback",
          "React Router",
          "State management (Redux Toolkit or Zustand)",
          "Styling approaches",
          "Error boundaries",
          "Performance",
          "Testing basics",
          "Build & deploy"
        ],
        "resources": [
          {
            "title": "The Joy of React by Josh W. Comeau",
            "url": "https://www.joyofreact.com",
            "isVideo": false
          },
          {
            "title": "Full Stack Open (University of Helsinki)",
            "url": "https://fullstackopen.com/",
            "isVideo": false
          },
          {
            "title": "React Official Documentation",
            "url": "https://react.dev",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t5-5",
        "title": "Frontend Project Ideas",
        "subtopics": [
          "Portfolio site",
          "To-do app",
          "Weather app",
          "Quiz app",
          "Expense tracker",
          "Movie search",
          "E-commerce UI",
          "Kanban board"
        ],
        "resources": [
          {
            "title": "Frontend Mentor: Real-World UI Challenges",
            "url": "https://www.frontendmentor.io",
            "isVideo": false
          },
          {
            "title": "Build 15 JavaScript Projects - FreeCodeCamp (YouTube)",
            "url": "https://www.youtube.com/watch?v=3PHXvlpOkf4",
            "isVideo": true
          }
        ]
      }
    ]
  },
  {
    "trackId": 6,
    "trackTitle": "TRACK 6: BACKEND SKILLS",
    "topics": [
      {
        "id": "t6-1",
        "title": "Node.js",
        "subtopics": [
          "What Node is & the event loop",
          "Modules (CommonJS, ESM)",
          "npm",
          "fs, path, os",
          "HTTP module",
          "Express (routing, middleware, error handling)",
          "Environment variables",
          "Async patterns",
          "Authentication (sessions, JWT, bcrypt)",
          "Validation",
          "File uploads",
          "Testing (Jest, Supertest)",
          "Logging",
          "Security basics (CORS, helmet, rate limiting)"
        ],
        "resources": [
          {
            "title": "Fundamentals of Backend Engineering by Hussein Nasser",
            "url": "https://www.udemy.com",
            "isVideo": true
          },
          {
            "title": "PostgreSQL Tutorial & Architecture",
            "url": "https://www.postgresqltutorial.com/",
            "isVideo": false
          },
          {
            "title": "Designing Data-Intensive Applications (DDIA)",
            "url": "https://dataintensive.net/",
            "isVideo": false
          },
          {
            "title": "roadmap.sh/backend Architecture Guide",
            "url": "https://roadmap.sh/backend",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t6-2",
        "title": "SQL",
        "subtopics": [
          "Database basics",
          "Tables & data types",
          "SELECT, WHERE, ORDER BY, LIMIT",
          "Aggregates",
          "GROUP BY & HAVING",
          "JOINs",
          "Subqueries",
          "CTEs",
          "Window functions",
          "INSERT/UPDATE/DELETE",
          "Constraints",
          "Normalization",
          "Indexes",
          "Transactions & ACID",
          "Views",
          "EXPLAIN query plans"
        ],
        "resources": [
          {
            "title": "Fundamentals of Backend Engineering by Hussein Nasser",
            "url": "https://www.udemy.com",
            "isVideo": true
          },
          {
            "title": "PostgreSQL Tutorial & Architecture",
            "url": "https://www.postgresqltutorial.com/",
            "isVideo": false
          },
          {
            "title": "Designing Data-Intensive Applications (DDIA)",
            "url": "https://dataintensive.net/",
            "isVideo": false
          },
          {
            "title": "roadmap.sh/backend Architecture Guide",
            "url": "https://roadmap.sh/backend",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t6-3",
        "title": "PostgreSQL",
        "subtopics": [
          "Install & psql",
          "Data types",
          "Schemas",
          "Constraints",
          "Indexes (B-tree, GIN)",
          "JSONB",
          "Full-text search",
          "Transactions & isolation",
          "Migrations",
          "Connection pooling",
          "Backups",
          "Using it from Node (pg, Prisma or Drizzle)",
          "Performance tuning"
        ],
        "resources": [
          {
            "title": "Fundamentals of Backend Engineering by Hussein Nasser",
            "url": "https://www.udemy.com",
            "isVideo": true
          },
          {
            "title": "PostgreSQL Tutorial & Architecture",
            "url": "https://www.postgresqltutorial.com/",
            "isVideo": false
          },
          {
            "title": "Designing Data-Intensive Applications (DDIA)",
            "url": "https://dataintensive.net/",
            "isVideo": false
          },
          {
            "title": "roadmap.sh/backend Architecture Guide",
            "url": "https://roadmap.sh/backend",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t6-4",
        "title": "APIs Design",
        "subtopics": [
          "HTTP methods & status codes",
          "REST principles",
          "Resource naming",
          "Versioning",
          "Pagination & filtering",
          "API authentication",
          "Idempotency",
          "Rate limiting",
          "Error formats",
          "OpenAPI/Swagger docs",
          "Testing with Postman",
          "Webhooks",
          "API security"
        ],
        "resources": [
          {
            "title": "Fundamentals of Backend Engineering by Hussein Nasser",
            "url": "https://www.udemy.com",
            "isVideo": true
          },
          {
            "title": "PostgreSQL Tutorial & Architecture",
            "url": "https://www.postgresqltutorial.com/",
            "isVideo": false
          },
          {
            "title": "Designing Data-Intensive Applications (DDIA)",
            "url": "https://dataintensive.net/",
            "isVideo": false
          },
          {
            "title": "roadmap.sh/backend Architecture Guide",
            "url": "https://roadmap.sh/backend",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t6-5",
        "title": "NoSQL DBs",
        "subtopics": [
          "Types (document, key-value, column, graph)",
          "MongoDB basics & CRUD",
          "Schema design (embed vs reference)",
          "Indexes",
          "Aggregation",
          "Mongoose",
          "Redis (key-value, caching, TTL, pub/sub)",
          "SQL vs NoSQL choice",
          "CAP theorem"
        ],
        "resources": [
          {
            "title": "Fundamentals of Backend Engineering by Hussein Nasser",
            "url": "https://www.udemy.com",
            "isVideo": true
          },
          {
            "title": "PostgreSQL Tutorial & Architecture",
            "url": "https://www.postgresqltutorial.com/",
            "isVideo": false
          },
          {
            "title": "Designing Data-Intensive Applications (DDIA)",
            "url": "https://dataintensive.net/",
            "isVideo": false
          },
          {
            "title": "roadmap.sh/backend Architecture Guide",
            "url": "https://roadmap.sh/backend",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t6-6",
        "title": "GraphQL",
        "subtopics": [
          "Concepts",
          "Schema & types",
          "Queries",
          "Mutations",
          "Resolvers",
          "Variables",
          "Subscriptions",
          "Apollo Server",
          "N+1 problem & DataLoader",
          "GraphQL vs REST"
        ],
        "resources": [
          {
            "title": "Fundamentals of Backend Engineering by Hussein Nasser",
            "url": "https://www.udemy.com",
            "isVideo": true
          },
          {
            "title": "PostgreSQL Tutorial & Architecture",
            "url": "https://www.postgresqltutorial.com/",
            "isVideo": false
          },
          {
            "title": "Designing Data-Intensive Applications (DDIA)",
            "url": "https://dataintensive.net/",
            "isVideo": false
          },
          {
            "title": "roadmap.sh/backend Architecture Guide",
            "url": "https://roadmap.sh/backend",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t6-7",
        "title": "Backend Project Ideas",
        "subtopics": [
          "Blog REST API",
          "Auth service",
          "URL shortener",
          "Task manager API",
          "E-commerce backend",
          "Chat backend"
        ],
        "resources": [
          {
            "title": "Fundamentals of Backend Engineering by Hussein Nasser",
            "url": "https://www.udemy.com",
            "isVideo": true
          },
          {
            "title": "PostgreSQL Tutorial & Architecture",
            "url": "https://www.postgresqltutorial.com/",
            "isVideo": false
          },
          {
            "title": "Designing Data-Intensive Applications (DDIA)",
            "url": "https://dataintensive.net/",
            "isVideo": false
          },
          {
            "title": "roadmap.sh/backend Architecture Guide",
            "url": "https://roadmap.sh/backend",
            "isVideo": false
          }
        ]
      }
    ]
  },
  {
    "trackId": 7,
    "trackTitle": "TRACK 7: DATA ENGINEERING SKILLS",
    "topics": [
      {
        "id": "t7-1",
        "title": "Data Modeling",
        "subtopics": [
          "Conceptual, logical, physical models",
          "ER diagrams",
          "Normalization",
          "Dimensional modeling (facts, dimensions, star, snowflake)",
          "Slowly changing dimensions",
          "Schema design for analytics",
          "Auditing and profiling a customer's data"
        ],
        "resources": [
          {
            "title": "DataTalksClub Data Engineering Zoomcamp (Free Course)",
            "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp",
            "isVideo": true
          },
          {
            "title": "Fundamentals of Data Engineering by Joe Reis & Matt Housley",
            "url": "https://www.oreilly.com",
            "isVideo": false
          },
          {
            "title": "Apache Spark: The Definitive Guide (O'Reilly)",
            "url": "https://www.oreilly.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t7-2",
        "title": "Data Pipelines",
        "subtopics": [
          "Batch vs streaming",
          "ETL vs ELT",
          "Data ingestion (files, APIs, CDC)",
          "Transformation",
          "Data quality & validation",
          "Idempotency & retries",
          "File formats (CSV, JSON, Parquet, Avro)",
          "Kafka basics"
        ],
        "resources": [
          {
            "title": "DataTalksClub Data Engineering Zoomcamp (Free Course)",
            "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp",
            "isVideo": true
          },
          {
            "title": "Fundamentals of Data Engineering by Joe Reis & Matt Housley",
            "url": "https://www.oreilly.com",
            "isVideo": false
          },
          {
            "title": "Apache Spark: The Definitive Guide (O'Reilly)",
            "url": "https://www.oreilly.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t7-3",
        "title": "Data Warehouses",
        "subtopics": [
          "OLTP vs OLAP",
          "Warehouse vs lake vs lakehouse",
          "Columnar storage",
          "Partitioning & clustering",
          "BigQuery, Snowflake, Redshift overview",
          "Loading data",
          "Query optimization",
          "BI basics"
        ],
        "resources": [
          {
            "title": "DataTalksClub Data Engineering Zoomcamp (Free Course)",
            "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp",
            "isVideo": true
          },
          {
            "title": "Fundamentals of Data Engineering by Joe Reis & Matt Housley",
            "url": "https://www.oreilly.com",
            "isVideo": false
          },
          {
            "title": "Apache Spark: The Definitive Guide (O'Reilly)",
            "url": "https://www.oreilly.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t7-4",
        "title": "Spark",
        "subtopics": [
          "Architecture (driver, executors)",
          "RDDs",
          "DataFrames",
          "Spark SQL",
          "Transformations vs actions",
          "Lazy evaluation",
          "Partitions & shuffles",
          "Joins",
          "Caching & broadcast",
          "Structured streaming",
          "PySpark practice"
        ],
        "resources": [
          {
            "title": "DataTalksClub Data Engineering Zoomcamp (Free Course)",
            "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp",
            "isVideo": true
          },
          {
            "title": "Fundamentals of Data Engineering by Joe Reis & Matt Housley",
            "url": "https://www.oreilly.com",
            "isVideo": false
          },
          {
            "title": "Apache Spark: The Definitive Guide (O'Reilly)",
            "url": "https://www.oreilly.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t7-5",
        "title": "Airflow",
        "subtopics": [
          "Concepts (DAG, task, operator)",
          "Scheduler, executor, webserver",
          "Writing DAGs",
          "Dependencies",
          "Scheduling",
          "XCom",
          "Sensors",
          "Retries & alerts",
          "Connections & variables",
          "Docker setup",
          "Best practices"
        ],
        "resources": [
          {
            "title": "DataTalksClub Data Engineering Zoomcamp (Free Course)",
            "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp",
            "isVideo": true
          },
          {
            "title": "Fundamentals of Data Engineering by Joe Reis & Matt Housley",
            "url": "https://www.oreilly.com",
            "isVideo": false
          },
          {
            "title": "Apache Spark: The Definitive Guide (O'Reilly)",
            "url": "https://www.oreilly.com",
            "isVideo": false
          }
        ]
      }
    ]
  },
  {
    "trackId": 8,
    "trackTitle": "TRACK 8: AI ENGINEERING",
    "topics": [
      {
        "id": "t8-1",
        "title": "8.1 INTRODUCTION",
        "subtopics": [
          "What is an AI Engineer?",
          "Roles and Responsibilities",
          "Impact on Product Development",
          "AI Engineer vs ML Engineer"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-2",
        "title": "8.2 WORKING WITH LLMs: HOW LLMs WORK",
        "subtopics": [
          "Common Terminology: AI vs AGI",
          "Common Terminology: Large Language Model (LLM)",
          "Common Terminology: Training",
          "Common Terminology: Inference",
          "Common Terminology: Embeddings",
          "Common Terminology: Vector DBs",
          "Common Terminology: AI Agents",
          "Common Terminology: RAGs",
          "Common Terminology: Context Window",
          "Common Terminology: Fine-tuning",
          "Common Terminology: Prompt Engineering",
          "Common Terminology: Inference Engineering",
          "Common Terminology: Context Engineering",
          "Core LLM Elements: Tokens",
          "Core LLM Elements: Context",
          "Core LLM Elements: Sampling Parameters",
          "Core LLM Elements: Temperature",
          "Core LLM Elements: Top-K",
          "Core LLM Elements: Top-P",
          "Core LLM Elements: Repetition Penalties"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-3",
        "title": "8.3 PROMPT ENGINEERING",
        "subtopics": [
          "Prompt Anatomy: Input Format",
          "Prompt Anatomy: System Prompting",
          "Prompt Anatomy: Role & Behavior",
          "Prompt Anatomy: Context",
          "Prompt Anatomy: Constraints",
          "Prompt Anatomy: Structured Output",
          "Prompting Techniques: Zero-Shot",
          "Prompting Techniques: Few-Shot",
          "Prompting Techniques: CoT",
          "Prompting Techniques: ReAct",
          "Model Interaction: Function Calling",
          "Model Interaction: Prompt Caching",
          "Model Interaction: Streaming Responses",
          "Extras: Writing Prompts [older PDF]",
          "Extras: OpenAI Playground [older PDF]",
          "Extras: Prompt Management [FDE]"
        ],
        "resources": [
          {
            "title": "Anthropic Interactive Prompt Engineering Tutorial",
            "url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
            "isVideo": false
          },
          {
            "title": "DeepLearning.AI: ChatGPT Prompt Engineering for Developers (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          }
        ]
      },
      {
        "id": "t8-4",
        "title": "8.4 CONTEXT ENGINEERING",
        "subtopics": [
          "Fundamentals: Context vs Prompt Engineering",
          "Fundamentals: What is a Context Layer?",
          "Fundamentals: Context Sources",
          "Fundamentals: MCP",
          "Fundamentals: Context Security",
          "Fundamentals: Context Evaluation",
          "Context Engineering Techniques: RAG & Dynamic Filters",
          "Context Engineering Techniques: Memory Systems",
          "Context Engineering Techniques: Context Compaction",
          "Context Engineering Techniques: Long-Context Processing",
          "Context Engineering Techniques: State & Historical Context",
          "Context Engineering Techniques: Multi-agent Context Sharing",
          "Context Engineering Techniques: Context Isolation",
          "Context Engineering Techniques: Context Failure Modes",
          "Tools & Context Warehouses: Modus",
          "Tools & Context Warehouses: DataHub",
          "Tools & Context Warehouses: Atlan",
          "Tools & Context Warehouses: PostHog"
        ],
        "resources": [
          {
            "title": "Anthropic Interactive Prompt Engineering Tutorial",
            "url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
            "isVideo": false
          },
          {
            "title": "DeepLearning.AI: ChatGPT Prompt Engineering for Developers (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          }
        ]
      },
      {
        "id": "t8-5",
        "title": "8.5 AI MODELS",
        "subtopics": [
          "Type of Models: Pre-trained Models",
          "Type of Models: Closed vs Open Source Models",
          "Type of Models: Self-Hosted Models",
          "Extras: Using Pre-trained Models [older PDF]",
          "Extras: Benefits of Pre-trained Models [older PDF]",
          "Extras: Limitations and Considerations [older PDF]",
          "Extras: Popular AI Models [older PDF]",
          "Extras: Capabilities / Context Length [older PDF]",
          "Extras: Cut-off Dates / Knowledge [older PDF]"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-6",
        "title": "8.6 CHOOSING THE RIGHT MODEL",
        "subtopics": [
          "Platforms & Ecosystem: Hugging Face",
          "Platforms & Ecosystem: Hugging Face Tasks",
          "Platforms & Ecosystem: Hugging Face Hub",
          "Platforms & Ecosystem: Transformers.js",
          "Platforms & Ecosystem: Ollama",
          "Platforms & Ecosystem: LM Studio",
          "Platforms & Ecosystem: OpenRouter",
          "APIs & SDKs: OpenAI Responses API",
          "APIs & SDKs: Claude Messages API",
          "APIs & SDKs: Google Gemini API",
          "APIs & SDKs: Hugging Face Inference SDK",
          "APIs & SDKs: OpenAI-compatible APIs",
          "Closed Models: Anthropic Claude",
          "Closed Models: Google Gemini",
          "Closed Models: OpenAI (GPT, o-series)",
          "Closed Models: Cohere",
          "Closed Models: Mistral",
          "Open Source Models: Meta Llama",
          "Open Source Models: DeepSeek",
          "Open Source Models: Qwen",
          "Open Source Models: Gemma",
          "Extras: OpenAI Platform [older PDF]",
          "Extras: OpenAI API [older PDF]",
          "Extras: Chat Completions API [older PDF]",
          "Extras: Azure AI [older PDF]",
          "Extras: AWS SageMaker [older PDF]",
          "Extras: Managing Tokens (Maximum Tokens, Token Counting, Pricing Considerations) [older PDF]",
          "Extras: Fine-tuning [older PDF]",
          "Extras: Finding Open Source Models [older PDF]",
          "Extras: Using Open Source Models [older PDF]",
          "Extras: Ollama Models [older PDF]",
          "Extras: Ollama SDK [older PDF]"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-7",
        "title": "8.7 EMBEDDINGS & VECTOR DATABASES",
        "subtopics": [
          "What are Embeddings: Semantic Search",
          "What are Embeddings: Data Classification",
          "What are Embeddings: Recommendation Systems",
          "What are Embeddings: Anomaly Detection",
          "What are Embeddings: Use Cases for Embeddings",
          "Embedding Models, Proprietary: OpenAI Embeddings API",
          "Embedding Models, Proprietary: Gemini Embedding",
          "Embedding Models, Proprietary: Cohere",
          "Embedding Models, Open Source: Sentence Transformers",
          "Embedding Models, Open Source: Models on Hugging Face",
          "Embedding Models, Open Source: Jina",
          "Vector Databases: Purpose and Functionality",
          "Vector Databases: Popular Vector DBs, pick one (Chroma, Pinecone, Weaviate, FAISS, LanceDB, Qdrant, Supabase, MongoDB Atlas)",
          "Implementing Vector Search: Indexing Embeddings",
          "Implementing Vector Search: Performing Similarity Search",
          "Extras: OpenAI Embedding Models [older PDF]",
          "Extras: Pricing Considerations [older PDF]"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-8",
        "title": "8.8 RAGs",
        "subtopics": [
          "What are RAGs? RAG Usecases",
          "RAG vs Fine-tuning",
          "Implementing RAG: Chunking",
          "Implementing RAG: Embedding",
          "Implementing RAG: Vector Database",
          "Implementing RAG: Retrieval Process",
          "Implementing RAG: Generation",
          "Ways of Implementing RAG: Using SDKs Directly",
          "Ways of Implementing RAG: LangChain",
          "Ways of Implementing RAG: LlamaIndex",
          "Ways of Implementing RAG: Haystack",
          "Ways of Implementing RAG: RAGFlow",
          "Extras: OpenAI Assistant API [older PDF]",
          "Extras: Replicate [older PDF]",
          "Extras: RAG Alternative [older PDF]"
        ],
        "resources": [
          {
            "title": "Building Production RAG Systems by Eugene Yan",
            "url": "https://eugeneyan.com/writing/llm-rag/",
            "isVideo": false
          },
          {
            "title": "LlamaIndex Production Documentation",
            "url": "https://docs.llamaindex.ai/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-9",
        "title": "8.9 AI AGENTS",
        "subtopics": [
          "Agents Usecases",
          "ReAct Prompting",
          "Tools & Function Calling",
          "Multi-agents",
          "[FDE]: Agent Architectures",
          "[FDE]: Memory & State",
          "Building AI Agents: Manual Implementation",
          "Building AI Agents: OpenAI AgentKit & Agent SDK",
          "Building AI Agents: Claude Agent SDK",
          "Building AI Agents: Vertex AI Agent Builder",
          "Building AI Agents: Google ADK",
          "Extras: OpenAI Functions / Tools [older PDF]",
          "Extras: OpenAI Assistant API [older PDF]"
        ],
        "resources": [
          {
            "title": "LangChain & LangGraph Academy: Reliable Autonomous Agents",
            "url": "https://academy.langchain.com/",
            "isVideo": true
          },
          {
            "title": "Building Effective Agents by Anthropic Research",
            "url": "https://www.anthropic.com/research/building-effective-agents",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-10",
        "title": "8.10 MODEL CONTEXT PROTOCOL (MCP)",
        "subtopics": [
          "Core Components: MCP Host",
          "Core Components: MCP Client",
          "Core Components: MCP Server",
          "Core Components: Data Layer",
          "Core Components: Transport Layer",
          "Developing with MCP: Building an MCP Server",
          "Developing with MCP: Building an MCP Client",
          "Developing with MCP: Connect to Local Server",
          "Developing with MCP: Connect to Remote Server"
        ],
        "resources": [
          {
            "title": "Official Model Context Protocol (MCP) Documentation (Anthropic)",
            "url": "https://modelcontextprotocol.io/",
            "isVideo": false
          },
          {
            "title": "Anthropic MCP TypeScript & Python SDKs (GitHub)",
            "url": "https://github.com/modelcontextprotocol",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-11",
        "title": "8.11 AI SAFETY AND ETHICS",
        "subtopics": [
          "Prompt Injection Attacks",
          "Security and Privacy Concerns",
          "Bias and Fairness",
          "Understanding AI Safety Issues: Content Moderation APIs",
          "Understanding AI Safety Issues: Adding end-user IDs in prompts",
          "Understanding AI Safety Issues: Conducting adversarial testing",
          "Understanding AI Safety Issues: Robust prompt engineering",
          "Understanding AI Safety Issues: Know your Customers / Usecases",
          "Understanding AI Safety Issues: Constraining outputs and inputs",
          "Safety Best Practices",
          "Extras: OpenAI Moderation API [older PDF]"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-12",
        "title": "8.12 EVALUATION & OBSERVABILITY",
        "subtopics": [
          "LLM Observability: Tracing & Logging",
          "LLM Observability: Cost / Latency Monitoring",
          "LLM Observability: Production Monitoring",
          "Observability Tools: LangSmith",
          "Observability Tools: Langfuse",
          "Observability Tools: Helicone",
          "Observability Tools: Arize AI",
          "LLM Evaluations: Evaluation Types (Deterministic Evals, Model-Based Evals, Human Evals)",
          "LLM Evaluations: Evaluation Metrics",
          "Evaluation Tools: DeepEval",
          "Evaluation Tools: RAGAS",
          "Regression Testing"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-13",
        "title": "8.13 OTHER AI APPLICATIONS: MULTIMODAL AI",
        "subtopics": [
          "Multimodal AI Usecases",
          "Image Understanding",
          "Image Generation",
          "Video Understanding",
          "Audio Processing",
          "Text-to-Speech",
          "Speech-to-Text",
          "Multimodal AI Tasks: OpenAI Vision API",
          "Multimodal AI Tasks: DALL-E API",
          "Multimodal AI Tasks: NanoBanana API",
          "Multimodal AI Tasks: Whisper API",
          "Multimodal AI Tasks: Hugging Face Models",
          "Multimodal AI Tasks: LangChain for Multimodal Apps",
          "Multimodal AI Tasks: LlamaIndex for Multimodal Apps",
          "Implementing Multimodal AI"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-14",
        "title": "8.14 DEVELOPMENT TOOLS",
        "subtopics": [
          "AI Assisted Coding Tools: Claude Code",
          "AI Assisted Coding Tools: Gemini",
          "AI Assisted Coding Tools: Codex",
          "AI Assisted Coding Tools: Cursor",
          "AI Assisted Coding Tools: OpenCode",
          "AI Assisted Coding Tools: Replit",
          "AI Assisted Coding Tools: OpenClaw [FDE]",
          "Vibe Coding",
          "Extras: AI Code Editors [older PDF]",
          "Extras: Code Completion Tools [older PDF]"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t8-15",
        "title": "8.15 INTEGRATION ENGINEERING [FDE]",
        "subtopics": [
          "Types of legacy systems",
          "APIs, SOAP, flat files, SFTP and databases",
          "Integration patterns and adapters",
          "Webhooks",
          "Authenticating to old systems",
          "Safe migration and testing",
          "Documenting what you found"
        ],
        "resources": [
          {
            "title": "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)",
            "url": "https://www.deeplearning.ai",
            "isVideo": true
          },
          {
            "title": "Chip Huyen: Building LLM Applications for Production",
            "url": "https://huyenchip.com",
            "isVideo": false
          },
          {
            "title": "Pinecone Vector Database Architecture & Mastery",
            "url": "https://www.pinecone.io/learn/",
            "isVideo": false
          }
        ]
      }
    ]
  },
  {
    "trackId": 9,
    "trackTitle": "TRACK 9: DEVOPS & CLOUD SKILLS",
    "topics": [
      {
        "id": "t9-1",
        "title": "Docker",
        "subtopics": [
          "Containers vs VMs",
          "Images",
          "Dockerfile",
          "Build & run",
          "Volumes",
          "Networks",
          "Docker Compose",
          "Registries",
          "Multi-stage builds",
          "Security best practices"
        ],
        "resources": [
          {
            "title": "TechWorld with Nana: Complete Docker & Kubernetes Bootcamp (YouTube)",
            "url": "https://www.youtube.com/@TechWorldwithNana",
            "isVideo": true
          },
          {
            "title": "Adrian Cantrill AWS Certified Solutions Architect Course",
            "url": "https://learn.cantrill.io/",
            "isVideo": false
          },
          {
            "title": "HashiCorp Certified Terraform Associate (Anton Putra / Zeal Vora)",
            "url": "https://www.hashicorp.com/certification/terraform-associate",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t9-2",
        "title": "AWS",
        "subtopics": [
          "Account & IAM",
          "Regions & availability zones",
          "EC2",
          "S3",
          "VPC basics",
          "RDS",
          "Lambda",
          "API Gateway",
          "CloudWatch",
          "Route 53",
          "ECS & ECR",
          "Cost management"
        ],
        "resources": [
          {
            "title": "TechWorld with Nana: Complete Docker & Kubernetes Bootcamp (YouTube)",
            "url": "https://www.youtube.com/@TechWorldwithNana",
            "isVideo": true
          },
          {
            "title": "Adrian Cantrill AWS Certified Solutions Architect Course",
            "url": "https://learn.cantrill.io/",
            "isVideo": false
          },
          {
            "title": "HashiCorp Certified Terraform Associate (Anton Putra / Zeal Vora)",
            "url": "https://www.hashicorp.com/certification/terraform-associate",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t9-3",
        "title": "Terraform",
        "subtopics": [
          "Infrastructure as code concepts",
          "HCL syntax",
          "Providers & resources",
          "Variables & outputs",
          "State & remote backends",
          "Modules",
          "Plan/apply workflow",
          "Workspaces",
          "Deploying real AWS infrastructure"
        ],
        "resources": [
          {
            "title": "TechWorld with Nana: Complete Docker & Kubernetes Bootcamp (YouTube)",
            "url": "https://www.youtube.com/@TechWorldwithNana",
            "isVideo": true
          },
          {
            "title": "Adrian Cantrill AWS Certified Solutions Architect Course",
            "url": "https://learn.cantrill.io/",
            "isVideo": false
          },
          {
            "title": "HashiCorp Certified Terraform Associate (Anton Putra / Zeal Vora)",
            "url": "https://www.hashicorp.com/certification/terraform-associate",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t9-4",
        "title": "DevOps Skills",
        "subtopics": [
          "CI/CD concepts",
          "GitHub Actions",
          "Deployment strategies (blue/green, canary)",
          "Monitoring (Prometheus, Grafana)",
          "Logging",
          "Secrets management",
          "Incident response",
          "SRE basics"
        ],
        "resources": [
          {
            "title": "TechWorld with Nana: Complete Docker & Kubernetes Bootcamp (YouTube)",
            "url": "https://www.youtube.com/@TechWorldwithNana",
            "isVideo": true
          },
          {
            "title": "Adrian Cantrill AWS Certified Solutions Architect Course",
            "url": "https://learn.cantrill.io/",
            "isVideo": false
          },
          {
            "title": "HashiCorp Certified Terraform Associate (Anton Putra / Zeal Vora)",
            "url": "https://www.hashicorp.com/certification/terraform-associate",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t9-5",
        "title": "Kubernetes",
        "subtopics": [
          "Architecture",
          "Pods",
          "Deployments",
          "Services",
          "ConfigMaps & Secrets",
          "Ingress",
          "Volumes",
          "Namespaces",
          "Scaling",
          "Helm",
          "kubectl",
          "Health probes",
          "Debugging"
        ],
        "resources": [
          {
            "title": "TechWorld with Nana: Complete Docker & Kubernetes Bootcamp (YouTube)",
            "url": "https://www.youtube.com/@TechWorldwithNana",
            "isVideo": true
          },
          {
            "title": "Adrian Cantrill AWS Certified Solutions Architect Course",
            "url": "https://learn.cantrill.io/",
            "isVideo": false
          },
          {
            "title": "HashiCorp Certified Terraform Associate (Anton Putra / Zeal Vora)",
            "url": "https://www.hashicorp.com/certification/terraform-associate",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t9-6",
        "title": "GCP",
        "subtopics": [
          "Console & IAM",
          "Compute Engine",
          "Cloud Storage",
          "Cloud Run",
          "BigQuery",
          "Vertex AI intro"
        ],
        "resources": [
          {
            "title": "TechWorld with Nana: Complete Docker & Kubernetes Bootcamp (YouTube)",
            "url": "https://www.youtube.com/@TechWorldwithNana",
            "isVideo": true
          },
          {
            "title": "Adrian Cantrill AWS Certified Solutions Architect Course",
            "url": "https://learn.cantrill.io/",
            "isVideo": false
          },
          {
            "title": "HashiCorp Certified Terraform Associate (Anton Putra / Zeal Vora)",
            "url": "https://www.hashicorp.com/certification/terraform-associate",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t9-7",
        "title": "Azure",
        "subtopics": [
          "Portal & Entra ID",
          "Virtual machines",
          "Blob Storage",
          "App Service",
          "Azure Functions",
          "Azure OpenAI"
        ],
        "resources": [
          {
            "title": "TechWorld with Nana: Complete Docker & Kubernetes Bootcamp (YouTube)",
            "url": "https://www.youtube.com/@TechWorldwithNana",
            "isVideo": true
          },
          {
            "title": "Adrian Cantrill AWS Certified Solutions Architect Course",
            "url": "https://learn.cantrill.io/",
            "isVideo": false
          },
          {
            "title": "HashiCorp Certified Terraform Associate (Anton Putra / Zeal Vora)",
            "url": "https://www.hashicorp.com/certification/terraform-associate",
            "isVideo": false
          }
        ]
      }
    ]
  },
  {
    "trackId": 10,
    "trackTitle": "TRACK 10: PRODUCTION AI SYSTEMS",
    "topics": [
      {
        "id": "t10-1",
        "title": "Observability",
        "subtopics": [
          "Building Eval Pipelines",
          "Debugging Agent Logic",
          "Inference Optimization",
          "Inference Engineering"
        ],
        "resources": [
          {
            "title": "Arize Phoenix: Open-Source AI Observability & Evaluation",
            "url": "https://arize.com/phoenix",
            "isVideo": false
          },
          {
            "title": "OWASP Top 10 for Large Language Model Applications",
            "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
            "isVideo": false
          },
          {
            "title": "Full Stack LLM Boot Camp by UC Berkeley",
            "url": "https://fullstackdeeplearning.com/",
            "isVideo": true
          }
        ]
      },
      {
        "id": "t10-2",
        "title": "Security",
        "subtopics": [
          "DevSecOps",
          "API Security",
          "Authentication",
          "AI Governance",
          "Data Privacy & Compliance"
        ],
        "resources": [
          {
            "title": "Arize Phoenix: Open-Source AI Observability & Evaluation",
            "url": "https://arize.com/phoenix",
            "isVideo": false
          },
          {
            "title": "OWASP Top 10 for Large Language Model Applications",
            "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
            "isVideo": false
          },
          {
            "title": "Full Stack LLM Boot Camp by UC Berkeley",
            "url": "https://fullstackdeeplearning.com/",
            "isVideo": true
          }
        ]
      },
      {
        "id": "t10-3",
        "title": "MLOps",
        "subtopics": [
          "ML lifecycle",
          "Experiment tracking",
          "Model registry",
          "Model serving",
          "CI/CD for ML",
          "Monitoring & drift",
          "Retraining"
        ],
        "resources": [
          {
            "title": "Arize Phoenix: Open-Source AI Observability & Evaluation",
            "url": "https://arize.com/phoenix",
            "isVideo": false
          },
          {
            "title": "OWASP Top 10 for Large Language Model Applications",
            "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
            "isVideo": false
          },
          {
            "title": "Full Stack LLM Boot Camp by UC Berkeley",
            "url": "https://fullstackdeeplearning.com/",
            "isVideo": true
          }
        ]
      }
    ]
  },
  {
    "trackId": 11,
    "trackTitle": "TRACK 11: CUSTOMER DELIVERY & FIELD SKILLS",
    "topics": [
      {
        "id": "t11-1",
        "title": "Discovery & Scoping",
        "subtopics": [
          "Requirements Gathering",
          "Technical Scoping & Sequencing",
          "Tradeoffs: Scope, Speed, Quality",
          "What it is",
          "A real example",
          "Practise exercise",
          "One written deliverable I can show"
        ],
        "resources": [
          {
            "title": "The Trusted Advisor by David H. Maister",
            "url": "https://thetrustedadvisor.com/",
            "isVideo": false
          },
          {
            "title": "The McKinsey Engagement: Powerful Problem Solving by Paul N. Friga",
            "url": "https://www.amazon.com",
            "isVideo": false
          },
          {
            "title": "The Pyramid Principle: Logic in Writing and Thinking by Barbara Minto",
            "url": "https://www.mckinsey.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t11-2",
        "title": "Business Acumen",
        "subtopics": [
          "Enterprise Workflow",
          "ROI & AI Impact",
          "Stakeholder Management",
          "Product Feedback Loop",
          "Time-to-Value",
          "What it is",
          "A real example",
          "Practise exercise",
          "One written deliverable I can show"
        ],
        "resources": [
          {
            "title": "The Trusted Advisor by David H. Maister",
            "url": "https://thetrustedadvisor.com/",
            "isVideo": false
          },
          {
            "title": "The McKinsey Engagement: Powerful Problem Solving by Paul N. Friga",
            "url": "https://www.amazon.com",
            "isVideo": false
          },
          {
            "title": "The Pyramid Principle: Logic in Writing and Thinking by Barbara Minto",
            "url": "https://www.mckinsey.com",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t11-3",
        "title": "Communication",
        "subtopics": [
          "Technical Writing",
          "Executive Reporting",
          "What it is",
          "A real example",
          "Practise exercise",
          "One written deliverable I can show"
        ],
        "resources": [
          {
            "title": "The Trusted Advisor by David H. Maister",
            "url": "https://thetrustedadvisor.com/",
            "isVideo": false
          },
          {
            "title": "The McKinsey Engagement: Powerful Problem Solving by Paul N. Friga",
            "url": "https://www.amazon.com",
            "isVideo": false
          },
          {
            "title": "The Pyramid Principle: Logic in Writing and Thinking by Barbara Minto",
            "url": "https://www.mckinsey.com",
            "isVideo": false
          }
        ]
      }
    ]
  },
  {
    "trackId": 12,
    "trackTitle": "TRACK 12: COMMUNICATION, ENGLISH & ADSD",
    "topics": [
      {
        "id": "t12-1",
        "title": "Professional Communication & Field Presence",
        "subtopics": [
          "Executive Presence & Confident Speaking",
          "Active Listening & Stakeholder Empathy",
          "Translating Engineering Technicals to Business Impact",
          "High-Stakes Client Demos & Pitching",
          "Handling Pushback, Escalations & Difficult Stakeholders",
          "Cross-Functional Collaboration & Team Dynamics"
        ],
        "resources": [
          {
            "title": "Stanford GSB: Think Fast, Talk Smart Communication Techniques (YouTube)",
            "url": "https://www.youtube.com/watch?v=HAnw168huqA",
            "isVideo": true
          },
          {
            "title": "Crucial Conversations: Tools for Talking When Stakes Are High",
            "url": "https://www.amazon.com/Crucial-Conversations-Talking-Stakes-Second/dp/0071771328",
            "isVideo": false
          },
          {
            "title": "The Trusted Advisor: Client Relationship Framework",
            "url": "https://thetrustedadvisor.com/",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t12-2",
        "title": "Technical English & Engineering Writing",
        "subtopics": [
          "Grammar, Precision & Conciseness for Technical Engineers",
          "Writing Clear Technical Specifications & RFCs",
          "Architecture Decision Records (ADRs)",
          "Writing Executive Summaries & Status Reports",
          "Cold Emailing, Client Correspondence & Slack Hygiene",
          "Comprehensive Documentation & Runbook Authoring"
        ],
        "resources": [
          {
            "title": "Google Technical Writing Course for Software Engineers",
            "url": "https://developers.google.com/tech-writing",
            "isVideo": false
          },
          {
            "title": "RFC & Architecture Decision Records (ADR) Guide (GitHub)",
            "url": "https://github.com/joelparkerhenderson/architecture-decision-record",
            "isVideo": false
          },
          {
            "title": "The Elements of Style by Strunk & White (Online Guide)",
            "url": "https://www.crockford.com/style.html",
            "isVideo": false
          }
        ]
      },
      {
        "id": "t12-3",
        "title": "ADSD: Analog & Digital System Design",
        "subtopics": [
          "Op-Amps & Linear Applications: Inverting, Non-Inverting, Summer, Integrator, Differentiator",
          "Non-Linear Op-Amp Circuits: Comparators, Schmitt Triggers & Precision Rectifiers",
          "Signal Generators & Active Filters: Low-pass, High-pass, Band-pass & Oscillators",
          "Data Converters: ADC (Flash, SAR) & DAC (R-2R Ladder, Weighted Resistor)",
          "Combinational Logic: Boolean Algebra, K-Maps & Quine-McCluskey Minimization",
          "MSI Combinational Blocks: Multiplexers, Demux, Encoders, Decoders & Adders",
          "Sequential Logic: Flip-Flops (SR, JK, D, T), Master-Slave & Conversion",
          "Registers & Counters: Shift Registers (SISO/SIPO/PIPO), Ripple & Synchronous Counters",
          "Finite State Machines (FSM): Mealy & Moore Models, State Reduction & Transition Tables",
          "Hardware Description Languages: Verilog HDL / VHDL Modeling & Simulation",
          "ADSD Hardware Lab: Breadboard Prototyping, IC Testing & Digital Troubleshooting"
        ],
        "resources": [
          {
            "title": "NPTEL: Digital System Design with Verilog (IIT Kharagpur)",
            "url": "https://nptel.ac.in/courses/106105165",
            "isVideo": true
          },
          {
            "title": "All About Circuits: Operational Amplifiers & Analog Circuits",
            "url": "https://www.allaboutcircuits.com/textbook/semiconductors/chpt-8/",
            "isVideo": false
          },
          {
            "title": "Digital Design: With an Introduction to the Verilog HDL by M. Morris Mano",
            "url": "https://www.pearson.com",
            "isVideo": false
          },
          {
            "title": "MIT 6.002: Circuits and Electronics (MIT OpenCourseWare)",
            "url": "https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/",
            "isVideo": true
          }
        ]
      }
    ]
  }
];
