const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");

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
    console.log('req.body is', req.body); 
    // sucessfully getting the query!
    // let guess = req.query.q;
    let {guess, currentWord} = req.body;
    let guessData = {guess, currentWord}
    let correctTranslation = await LanguageService.getResults(
      req.app.get("db"),
      guessData.currentWord
    )
    if(guess.toLowerCase() === correctTranslation[0].translation.toLowerCase()) {
      console.log('a correct translation');
    // console.log('correct userid is', correctTranslation[0].user_id);
      let updatedScore = LanguageService.updateCorrectCount(
        req.app.get("db"),
        correctTranslation[0].user_id
      );
      let updatedCorrect = updatedScore.and._single.update.correct_count;
      let updatedTotal = updatedScore.and._single.update.correct_count;
      res.send({
        isCorrect: true,
        correctCount: updatedCorrect,
        totalScore: updatedTotal
      })
    }
    else {
      console.log('not a correct translation');
      let updatedScore = LanguageService.updateIncorrectCount(
        req.app.get("db"),
        correctTranslation[0].user_id
      );
      let updatedIncorrect = updatedScore.and._single.update.incorrect_count;
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
