const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const LinkedList = require("./linked-list");

const languageRouter = express.Router();
const jsonParser = express.json();

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter
  .get("/", async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );

    res.json({
      language: req.language,
      words
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter
  .get("/head", async (req, res, next) => {
  try {
    // console.log('req.language.id', req.language)
    const wordData = await LanguageService.getWord(
      req.app.get("db"),
      req.language.id
    );

    const dataResponse = {
      currentWord: wordData[0].original,
      nextWord: wordData[0].next,
      correctCount: wordData[0].correct_count,
      incorrectCount: wordData[0].incorrect_count,
      totalScore: wordData[0].total_score
    }
    // console.log('worddsta', dataResponse);
    res.send(dataResponse);
  } catch (error) {
    next(error);
  }
});


languageRouter
  .post("/guess", jsonParser, async (req, res, next) => {
  try {

    let userProgressLL = new LinkedList();
    const wordData = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    wordData.map(word => {userProgressLL.insertLast(word)})
    userProgressLL.displayList(userProgressLL)
    
    console.log(userProgressLL.head.value.translation);
  
    let {guess, currentWord} = req.body;
    let guessData = {guess, currentWord}
    // let {translation, memory_value} = userProgressLL.head
    let correctTranslation = await LanguageService.getResults(
      req.app.get("db"),
      guessData.currentWord
    )
    
    if(guess.toLowerCase() === userProgressLL.head.value.translation.toLowerCase()) {
      console.log('a correct translation');
    // console.log('correct userid is', correctTranslation[0].user_id);
      let newTotal = req.language.total_score + 1;
      let updatedTotalScore = await LanguageService.updateTotalScore(
        req.app.get("db"),
        req.language.id,
        newTotal
      )
      console.log('newtotal is',newTotal)

      let updatedCorrect = await LanguageService.updateCorrectCount(
        req.app.get("db"),
        userProgressLL.head.value.id,
        userProgressLL.head.value.memory_value,
      );
            console.log('updated correct is', updatedCorrect);

      // let updatedMemVal = updatedScore
      res.send({
        isCorrect: true,
        correctCount: updatedCorrect,
        totalScore: newTotal
      })
    }
    else {
      console.log('not a correct translation');
      let updatedScore = await LanguageService.updateIncorrectCount(
        req.app.get("db"),
        userProgressLL.head.value.id,
        userProgressLL.head.value.memory_value

      );
      console.log('updated incorrect is', updatedScore);
      let updatedIncorrect = updatedScore
      // let updatedMemVal = updatedScore

      res.send({
        isCorrect: false,
        incorrectCount: updatedIncorrect
      })
    }
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
