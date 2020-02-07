const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const LinkedList = require("./linked-list");

const languageRouter = express.Router();
const jsonParser = express.json();

async function createLinkedListFromDB(req) {
  const words = await LanguageService.getLanguageWords(
    req.app.get("db"),
    req.language.id
  );
  let lastWord = words.find(word => word.next === null)

  let wordsLL = new LinkedList();
  wordsLL.insertFirst(lastWord);

  for (let i = 0; i < words.length - 1; i++) {
    let wordToInsert = words.find(word => word.next === lastWord.id);
    wordsLL.insertFirst(wordToInsert);

    lastWord = wordToInsert;
  }
  // wordsLL.displayList();
  return wordsLL;
}


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

      let wordsLL = await createLinkedListFromDB(req);

      let getTotalScore = await LanguageService.getTotalScore(
        req.app.get("db"),
        req.language.id
      );
      const dataResponse = {
        nextWord: wordsLL.head.value.original,
        totalScore: getTotalScore.total_score,
        wordCorrectCount: wordsLL.head.value.correct_count,
        wordIncorrectCount: wordsLL.head.value.incorrect_count
      }

      res.send(dataResponse);
    } catch (error) {
      next(error);
    }
  });


languageRouter
  .post("/guess", jsonParser, async (req, res, next) => {
    try {

      let wordsLL = await createLinkedListFromDB(req);

      let { guess } = req.body;
      if (!guess) {
        return res
          .status(400)
          .json({ error: `Missing 'guess' in request body` });
      }

      let getTotalScore = await LanguageService.getTotalScore(
        req.app.get("db"),
        req.language.id
      );

      let isCorrect = false;
      let memVal = 1;
      let currentHead = wordsLL.head.value;
      if (guess.toLowerCase() === currentHead.translation.toLowerCase()) {
        memVal = wordsLL.head.value.memory_value * 2;
        if (memVal > wordsLL.size() - 1) {
          memVal = wordsLL.size() - 1;
        }
        currentHead.correct_count++;
        getTotalScore.total_score++;
        isCorrect = true;
        await LanguageService.updateTotalScore(
          req.app.get("db"),
          req.language.id,
          getTotalScore.total_score
        );

      }
      else {
        currentHead.incorrect_count++;
      }

      let correctTranslation = currentHead.translation;
      currentHead.memory_value = memVal;


      wordsLL.remove(currentHead);
      wordsLL.insertAt(memVal, currentHead);

      let preceedingNode = wordsLL.findNthElement(memVal - 1);
      preceedingNode.value.next = preceedingNode.next.value.id;
      let oldHead = preceedingNode.next;
      oldHead.value.next = oldHead.next !== null ? oldHead.next.value.id : null;

      await LanguageService.updateWordStats(
        req.app.get("db"),
        preceedingNode.value,
      );

      await LanguageService.updateWordStats(
        req.app.get("db"),
        oldHead.value,
      );

      wordsLL.displayList();

      res
        .status(200)
        .send({
          nextWord: wordsLL.head.value.original,
          wordCorrectCount: wordsLL.head.value.correct_count,
          wordIncorrectCount: wordsLL.head.value.incorrect_count,
          totalScore: getTotalScore.total_score,
          answer: correctTranslation,
          isCorrect: isCorrect,
        })
    }

    catch (error) {
      next(error);
    }
  });

module.exports = languageRouter;
