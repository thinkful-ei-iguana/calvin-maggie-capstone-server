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
    );
    let getTotalScore = await LanguageService.getTotalScore(
      req.app.get("db"),
      req.language.id,
    );
    let getCorrectCount = await LanguageService.getCorrectCount(
      req.app.get("db"),
      req.language.id,
        req.body.currentWord

  );
    let getIncorrectCount = await LanguageService.getIncorrectCount(
      req.app.get("db"),
      req.language.id,
      req.body.currentWord
    );
    let getMemVal = await LanguageService.getMemoryValue(
      req.app.get("db"),
      req.language.id,
      req.body.currentWord
    );

console.log('get total score, correct, incorrect are', getTotalScore, getCorrectCount[0].correct_count, getIncorrectCount[0].incorrect_count)
    
    // if correct guess
    if(guess.toLowerCase() === userProgressLL.head.value.translation.toLowerCase()) {
      console.log('a correct translation');
    // console.log('correct userid is', correctTranslation[0].user_id);
      let newTotal = req.language.total_score + 1;
      let updatedTotalScore = await LanguageService.updateTotalScore(
        req.app.get("db"),
        req.language.id,
        newTotal
      )

      let updatedCorrect = await LanguageService.updateCorrectCount(
        req.app.get("db"),
        userProgressLL.head.value.id,
      );

      let calculateMemVal = getMemVal[0].memory_value * 2;
      console.log('calc mem val is', calculateMemVal);
      let updateMemVal = await LanguageService.updateMemoryValue(
        req.app.get("db"),
        userProgressLL.head.value.id,
        calculateMemVal
      )
      console.log('update mem val is', updateMemVal);

      res.send({
        isCorrect: true,
        correctCount: updatedCorrect,
        incorrectCount: getIncorrectCount[0].incorrect_count,
        totalScore: newTotal
      })
    }

    // if incorrect guess
    else {
      console.log('not a correct translation');
      let newTotal = req.language.total_score + 1;
      let updatedScore = await LanguageService.updateIncorrectCount(
        req.app.get("db"),
        userProgressLL.head.value.id
      );
      let updatedIncorrect = updatedScore;
      console.log('updated incorrect is', updatedIncorrect);
      // let updatedMemVal = updatedScore

      let calculateMemVal = 1;
      let updateMemVal = await LanguageService.updateMemoryValue(
        req.app.get("db"),
        userProgressLL.head.value.id,
        calculateMemVal
      )
      console.log('newtotal incorrect is', newTotal)
      res.send({
        isCorrect: false,
        correctCount: getCorrectCount[0].correct_count,
        incorrectCount: updatedIncorrect,
        totalScore: newTotal
      })
    }
  }
  catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
