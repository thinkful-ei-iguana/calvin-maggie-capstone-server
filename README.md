# Spaced Repetition Capstone
Built by Calvin Rosehart and Maggie McClellan

Learn a new language using the spaced repetition technique! Remember studying using flash cards? You may have followed a pattern like this: get a word right and move its flashcard to the middle or back of the stack; get a word wrong and move it back by just a few cards, so as to come across the word again before too long. That's spaced repetition, and that's essentially how our app is going to teach you some basic Maori words!

The dashboard organizes a user's progress, showing all words that the user is learning, as well as counters for overall correct and incorrect guesses at each word's translation, and.. of course.. a total score to mark their success as they get a handle on more and more words!

Beyond the dashboard, users encounter one word at a time, flashcard-style. Upon a user entering the translation of the current word into the text field, the app gives feedback about whether or not the user was correct. The more often a user correctly enters a translation for a given word, the less frequently they'll encounter it; likewise, a word that the user may not have memorized yet/continues to guess incorrectly will be shown more frequently.


## Visit Maori in Motion
[Live app](https://spaced-repetition-theta.now.sh/ "Spaced Repetition")

[GitHub repository (client)](https://github.com/thinkful-ei-iguana/calvin-maggie-capstone-client "Spaced Repetition client repo")

## Technology used

**Front-End:** *ReactJS | HTML | CSS*

**Back-End:** *NodeJS | Express | PostgreSQL*

**Testing:** *Mocha | Chai | Cypress*


| **HTTP Verb** | **Path**                           | **Used for**         |
| --------- |:--------------------------------------:| --------------------:|
| GET       | / | user dashboard, displays overview of all words and scores    |
| GET       | /head  | initiates the word-learning tool of the app    |
| POST | /guess  | displays feedback on correct or incorrect answers  |


## Screenshots

![Image - spaced repetition dashboard](https://i.gyazo.com/f25d98350604971cfa2d53f8ab840e05.png)