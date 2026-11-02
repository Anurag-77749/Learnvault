const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/data/curriculumData.ts');
const existingContent = fs.readFileSync(targetPath, 'utf8');

const match = existingContent.match(/export const CANONICAL_CURRICULUM: RawTrackData\[\] = (\[[\s\S]*?\]);\s*$/);
if (!match) {
  console.error("Could not find CANONICAL_CURRICULUM");
  process.exit(1);
}

const curriculum = JSON.parse(match[1]);

// 1. Python Resources (User PDF: Angela Yu 100 Days of Code Complete Professional Python Bootcamp by App Brewery)
const pythonResources = [
  {
    title: "100 Days of Code: Complete Python Pro Bootcamp by Dr. Angela Yu (App Brewery)",
    url: "https://www.appbrewery.co",
    isVideo: true
  },
  {
    title: "App Brewery 100 Days of Code Official Syllabus & Projects",
    url: "https://www.appbrewery.co/p/100-days-of-code",
    isVideo: false
  },
  {
    title: "Official Python 3 Documentation & Standard Library Tutorial",
    url: "https://docs.python.org/3/tutorial/",
    isVideo: false
  },
  {
    title: "Real Python: Python 3 Guides & Best Practices",
    url: "https://realpython.com",
    isVideo: false
  }
];

// 2. DSA Resources (User: Code & Debug playlist + Striver A2Z sheet)
const dsaResources = [
  {
    title: "Code and Debug: DSA with Python Course & Playlist (YouTube)",
    url: "https://www.codeanddebug.in",
    isVideo: true
  },
  {
    title: "Striver's A2Z DSA Course & Sheet (TakeUForward)",
    url: "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2",
    isVideo: false
  },
  {
    title: "NeetCode 150 Practice Roadmap",
    url: "https://neetcode.io/practice",
    isVideo: false
  }
];

// 3. System Design Resources
const systemDesignResources = [
  {
    title: "ByteByteGo: System Design Interview by Alex Xu",
    url: "https://bytebytego.com",
    isVideo: false
  },
  {
    title: "Designing Data-Intensive Applications (DDIA) by Martin Kleppmann",
    url: "https://dataintensive.net/",
    isVideo: false
  },
  {
    title: "Gaurav Sen System Design Series (YouTube)",
    url: "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX",
    isVideo: true
  }
];

// Enrich each track
curriculum.forEach(track => {
  // Track 0
  if (track.trackId === 0) {
    track.topics[0].resources = [
      { title: "The Forward Deployed Engineer: Role & Definition (Palantir Blog)", url: "https://blog.palantir.com", isVideo: false },
      { title: "Field Engineering in High-Stakes Tech (YouTube)", url: "https://www.youtube.com/watch?v=wXWpQ2c2L2U", isVideo: true },
      { title: "The Pragmatic Engineer: Understanding FDEs & Last-Mile Delivery", url: "https://newsletter.pragmaticengineer.com", isVideo: false }
    ];
    track.topics[1].resources = [
      { title: "Levels.fyi: Forward Deployed Engineer Career Framework & Compensation", url: "https://www.levels.fyi", isVideo: false },
      { title: "Day in the Life of a Palantir FDE (YouTube)", url: "https://www.youtube.com/watch?v=kYv9b9iE-g0", isVideo: true }
    ];
  }

  // Track 1
  if (track.trackId === 1) {
    // Other language topics to keep
    const otherLangTopics = track.topics.filter(top => !top.id.startsWith('t1-python') && top.id !== 't1-1');

    const pythonCourseTopics = [
      {
        id: "t1-python-beginner",
        title: "Python: Beginner Python",
        subtopics: [
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
        resources: pythonResources
      },
      {
        id: "t1-python-intermediate",
        title: "Python: Intermediate Python",
        subtopics: [
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
        resources: pythonResources
      },
      {
        id: "t1-python-intermediate-plus",
        title: "Python: Intermediate +",
        subtopics: [
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
        resources: pythonResources
      },
      {
        id: "t1-python-advanced",
        title: "Python: Advanced Python",
        subtopics: [
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
        resources: pythonResources
      },
      {
        id: "t1-python-projects",
        title: "Python: Professional Portfolio Projects",
        subtopics: [
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
        resources: pythonResources
      }
    ];

    // Other languages resources
    otherLangTopics.forEach(top => {
      if (top.title.includes('JavaScript') || top.title.includes('TypeScript')) {
        top.resources = [
          { title: "Total TypeScript by Matt Pocock", url: "https://www.totaltypescript.com", isVideo: false },
          { title: "The Modern JavaScript Tutorial", url: "https://javascript.info", isVideo: false },
          { title: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", isVideo: false }
        ];
      } else if (top.title.includes('Java')) {
        top.resources = [
          { title: "University of Helsinki: Java Programming MOOC I & II", url: "https://java-programming.mooc.fi/", isVideo: false },
          { title: "Rock the JVM: Scala & Functional Programming for Beginners", url: "https://rockthejvm.com", isVideo: true }
        ];
      } else if (top.title.includes('Go')) {
        top.resources = [
          { title: "Learn Go with Tests by Chris James", url: "https://quii.gitbook.io/learn-go-with-tests/", isVideo: false },
          { title: "Go by Example", url: "https://gobyexample.com/", isVideo: false }
        ];
      } else if (top.title.includes('Rust')) {
        top.resources = [
          { title: "The Rust Programming Language (The Official Book)", url: "https://doc.rust-lang.org/book/", isVideo: false },
          { title: "Rustlings - Hands-on Exercises to Learn Rust", url: "https://github.com/rust-lang/rustlings", isVideo: false },
          { title: "Crust of Rust by Jon Gjengset (YouTube)", url: "https://www.youtube.com/c/JonGjengset", isVideo: true }
        ];
      } else if (top.title.includes('C++')) {
        top.resources = [
          { title: "LearnCpp.com - Complete C++ Tutorial", url: "https://www.learncpp.com/", isVideo: false },
          { title: "The Cherno C++ Series (YouTube)", url: "https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4G4b", isVideo: true }
        ];
      }
    });

    track.topics = [...pythonCourseTopics, ...otherLangTopics];
  }

  // Track 2: DSA & System Design
  if (track.trackId === 2) {
    track.topics.forEach(top => {
      if (top.title.toLowerCase().includes('system design')) {
        top.resources = systemDesignResources;
      } else {
        top.resources = dsaResources;
      }
    });
  }

  // Track 3: Git & GitHub
  if (track.trackId === 3) {
    track.topics.forEach(top => {
      top.resources = [
        { title: "Pro Git Book (2nd Edition by Scott Chacon)", url: "https://git-scm.com/book/en/v2", isVideo: false },
        { title: "MIT Missing Semester: Version Control (Git)", url: "https://missing.csail.mit.edu/2020/version-control/", isVideo: true },
        { title: "Oh Shit, Git!?! (Interactive Troubleshooting Guide)", url: "https://ohshitgit.com/", isVideo: false }
      ];
    });
  }

  // Track 4: Linux Skills
  if (track.trackId === 4) {
    track.topics.forEach(top => {
      top.resources = [
        { title: "The Linux Command Line (TLCL) by William Shotts", url: "https://linuxcommand.org/tlcl.php", isVideo: false },
        { title: "MIT Missing Semester: Shell Tools and Scripting", url: "https://missing.csail.mit.edu/2020/shell-tools/", isVideo: true },
        { title: "OverTheWire: Bandit (Hands-on Linux CLI Wargame)", url: "https://overthewire.org/wargames/bandit/", isVideo: false }
      ];
    });
  }

  // Track 5: Frontend Skills
  if (track.trackId === 5) {
    track.topics.forEach(top => {
      if (top.title.includes('HTML') || top.title.includes('CSS')) {
        top.resources = [
          { title: "MDN Web Docs (Mozilla Developer Network)", url: "https://developer.mozilla.org", isVideo: false },
          { title: "CSS for JavaScript Developers by Josh W. Comeau", url: "https://css-for-js.dev/", isVideo: false },
          { title: "Kevin Powell CSS Mastery (YouTube)", url: "https://www.youtube.com/@KevinPowell", isVideo: true }
        ];
      } else if (top.title.includes('JavaScript')) {
        top.resources = [
          { title: "The Modern JavaScript Tutorial", url: "https://javascript.info", isVideo: false },
          { title: "Eloquent JavaScript (Marijn Haverbeke)", url: "https://eloquentjavascript.net/", isVideo: false }
        ];
      } else if (top.title.includes('React')) {
        top.resources = [
          { title: "The Joy of React by Josh W. Comeau", url: "https://www.joyofreact.com", isVideo: false },
          { title: "Full Stack Open (University of Helsinki)", url: "https://fullstackopen.com/", isVideo: false },
          { title: "React Official Documentation", url: "https://react.dev", isVideo: false }
        ];
      } else {
        top.resources = [
          { title: "Frontend Mentor: Real-World UI Challenges", url: "https://www.frontendmentor.io", isVideo: false },
          { title: "Build 15 JavaScript Projects - FreeCodeCamp (YouTube)", url: "https://www.youtube.com/watch?v=3PHXvlpOkf4", isVideo: true }
        ];
      }
    });
  }

  // Track 6: Backend Skills
  if (track.trackId === 6) {
    track.topics.forEach(top => {
      top.resources = [
        { title: "Fundamentals of Backend Engineering by Hussein Nasser", url: "https://www.udemy.com", isVideo: true },
        { title: "PostgreSQL Tutorial & Architecture", url: "https://www.postgresqltutorial.com/", isVideo: false },
        { title: "Designing Data-Intensive Applications (DDIA)", url: "https://dataintensive.net/", isVideo: false },
        { title: "roadmap.sh/backend Architecture Guide", url: "https://roadmap.sh/backend", isVideo: false }
      ];
    });
  }

  // Track 7: Data Engineering Skills
  if (track.trackId === 7) {
    track.topics.forEach(top => {
      top.resources = [
        { title: "DataTalksClub Data Engineering Zoomcamp (Free Course)", url: "https://github.com/DataTalksClub/data-engineering-zoomcamp", isVideo: true },
        { title: "Fundamentals of Data Engineering by Joe Reis & Matt Housley", url: "https://www.oreilly.com", isVideo: false },
        { title: "Apache Spark: The Definitive Guide (O'Reilly)", url: "https://www.oreilly.com", isVideo: false }
      ];
    });
  }

  // Track 8: AI Engineering
  if (track.trackId === 8) {
    track.topics.forEach(top => {
      if (top.title.includes('8.10')) {
        top.resources = [
          { title: "Official Model Context Protocol (MCP) Documentation (Anthropic)", url: "https://modelcontextprotocol.io/", isVideo: false },
          { title: "Anthropic MCP TypeScript & Python SDKs (GitHub)", url: "https://github.com/modelcontextprotocol", isVideo: false }
        ];
      } else if (top.title.includes('8.9')) {
        top.resources = [
          { title: "LangChain & LangGraph Academy: Reliable Autonomous Agents", url: "https://academy.langchain.com/", isVideo: true },
          { title: "Building Effective Agents by Anthropic Research", url: "https://www.anthropic.com/research/building-effective-agents", isVideo: false }
        ];
      } else if (top.title.includes('8.8')) {
        top.resources = [
          { title: "Building Production RAG Systems by Eugene Yan", url: "https://eugeneyan.com/writing/llm-rag/", isVideo: false },
          { title: "LlamaIndex Production Documentation", url: "https://docs.llamaindex.ai/", isVideo: false }
        ];
      } else if (top.title.includes('8.3') || top.title.includes('8.4')) {
        top.resources = [
          { title: "Anthropic Interactive Prompt Engineering Tutorial", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", isVideo: false },
          { title: "DeepLearning.AI: ChatGPT Prompt Engineering for Developers (Andrew Ng)", url: "https://www.deeplearning.ai", isVideo: true }
        ];
      } else {
        top.resources = [
          { title: "DeepLearning.AI: Generative AI with LLMs (Andrew Ng)", url: "https://www.deeplearning.ai", isVideo: true },
          { title: "Chip Huyen: Building LLM Applications for Production", url: "https://huyenchip.com", isVideo: false },
          { title: "Pinecone Vector Database Architecture & Mastery", url: "https://www.pinecone.io/learn/", isVideo: false }
        ];
      }
    });
  }

  // Track 9: DevOps & Cloud Skills
  if (track.trackId === 9) {
    track.topics.forEach(top => {
      top.resources = [
        { title: "TechWorld with Nana: Complete Docker & Kubernetes Bootcamp (YouTube)", url: "https://www.youtube.com/@TechWorldwithNana", isVideo: true },
        { title: "Adrian Cantrill AWS Certified Solutions Architect Course", url: "https://learn.cantrill.io/", isVideo: false },
        { title: "HashiCorp Certified Terraform Associate (Anton Putra / Zeal Vora)", url: "https://www.hashicorp.com/certification/terraform-associate", isVideo: false }
      ];
    });
  }

  // Track 10: Production AI Systems
  if (track.trackId === 10) {
    track.topics.forEach(top => {
      top.resources = [
        { title: "Arize Phoenix: Open-Source AI Observability & Evaluation", url: "https://arize.com/phoenix", isVideo: false },
        { title: "OWASP Top 10 for Large Language Model Applications", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", isVideo: false },
        { title: "Full Stack LLM Boot Camp by UC Berkeley", url: "https://fullstackdeeplearning.com/", isVideo: true }
      ];
    });
  }

  // Track 11: Customer Delivery & Field Skills
  if (track.trackId === 11) {
    track.topics.forEach(top => {
      top.resources = [
        { title: "The Trusted Advisor by David H. Maister", url: "https://thetrustedadvisor.com/", isVideo: false },
        { title: "The McKinsey Engagement: Powerful Problem Solving by Paul N. Friga", url: "https://www.amazon.com", isVideo: false },
        { title: "The Pyramid Principle: Logic in Writing and Thinking by Barbara Minto", url: "https://www.mckinsey.com", isVideo: false }
      ];
    });
  }
});

// 4. Add TRACK 12: COMMUNICATION, ENGLISH & ADSD
const track12 = {
  trackId: 12,
  trackTitle: "TRACK 12: COMMUNICATION, ENGLISH & ADSD",
  topics: [
    {
      id: "t12-1",
      title: "Professional Communication & Field Presence",
      subtopics: [
        "Executive Presence & Confident Speaking",
        "Active Listening & Stakeholder Empathy",
        "Translating Engineering Technicals to Business Impact",
        "High-Stakes Client Demos & Pitching",
        "Handling Pushback, Escalations & Difficult Stakeholders",
        "Cross-Functional Collaboration & Team Dynamics"
      ],
      resources: [
        { title: "Stanford GSB: Think Fast, Talk Smart Communication Techniques (YouTube)", url: "https://www.youtube.com/watch?v=HAnw168huqA", isVideo: true },
        { title: "Crucial Conversations: Tools for Talking When Stakes Are High", url: "https://www.amazon.com/Crucial-Conversations-Talking-Stakes-Second/dp/0071771328", isVideo: false },
        { title: "The Trusted Advisor: Client Relationship Framework", url: "https://thetrustedadvisor.com/", isVideo: false }
      ]
    },
    {
      id: "t12-2",
      title: "Technical English & Engineering Writing",
      subtopics: [
        "Grammar, Precision & Conciseness for Technical Engineers",
        "Writing Clear Technical Specifications & RFCs",
        "Architecture Decision Records (ADRs)",
        "Writing Executive Summaries & Status Reports",
        "Cold Emailing, Client Correspondence & Slack Hygiene",
        "Comprehensive Documentation & Runbook Authoring"
      ],
      resources: [
        { title: "Google Technical Writing Course for Software Engineers", url: "https://developers.google.com/tech-writing", isVideo: false },
        { title: "RFC & Architecture Decision Records (ADR) Guide (GitHub)", url: "https://github.com/joelparkerhenderson/architecture-decision-record", isVideo: false },
        { title: "The Elements of Style by Strunk & White (Online Guide)", url: "https://www.crockford.com/style.html", isVideo: false }
      ]
    },
    {
      id: "t12-3",
      title: "ADSD: Analog & Digital System Design",
      subtopics: [
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
      resources: [
        { title: "NPTEL: Digital System Design with Verilog (IIT Kharagpur)", url: "https://nptel.ac.in/courses/106105165", isVideo: true },
        { title: "All About Circuits: Operational Amplifiers & Analog Circuits", url: "https://www.allaboutcircuits.com/textbook/semiconductors/chpt-8/", isVideo: false },
        { title: "Digital Design: With an Introduction to the Verilog HDL by M. Morris Mano", url: "https://www.pearson.com", isVideo: false },
        { title: "MIT 6.002: Circuits and Electronics (MIT OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/", isVideo: true }
      ]
    }
  ]
};

// Check if track 12 already exists, if so replace, else push
const existingIdx = curriculum.findIndex(t => t.trackId === 12);
if (existingIdx !== -1) {
  curriculum[existingIdx] = track12;
} else {
  curriculum.push(track12);
}

// Generate updated file
const output = `export interface RawTopicData {
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

export const CANONICAL_CURRICULUM: RawTrackData[] = ${JSON.stringify(curriculum, null, 2)};
`;

fs.writeFileSync(targetPath, output, 'utf8');
console.log("Successfully updated curriculumData.ts with all curated resources and Track 12!");
