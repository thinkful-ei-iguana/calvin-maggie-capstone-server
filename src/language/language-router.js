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
    console.log('req.language.id', req.language)
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
    console.log('worddsta', dataResponse);
    res.send(dataResponse);
  } catch (error) {
    next(error);
  }
});

languageRouter
  .post("/guess", async (req, res, next) => {
  try {
    console.log('req is', req.query.q); // sucessfully getting the query!

    
    // const words = await LanguageService.getLanguageWords(
    //   req.app.get("db"),
    //   req.query.q
    // );

    // if()
    res.send({
      language: req.language,
      words
    });
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
