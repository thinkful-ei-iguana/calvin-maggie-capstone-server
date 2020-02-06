const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const LinkedList = require("./linked-list");

const languageRouter = express.Router();
const jsonParser = express.json();

async function createLinkedListFromDB(req) {
  console.log("language id:", req.language.id)
  const words = await LanguageService.getLanguageWords(
    req.app.get("db"),
    req.language.id
  );
  // console.log('head words is', words);
  let lastWord = words.find(word => word.next === null)

  let wordsLL = new LinkedList();
  wordsLL.insertFirst(lastWord);

  for (let i = 0; i < words.length - 1; i++) {
    let wordToInsert = words.find(word => word.next === lastWord.id);
    wordsLL.insertFirst(wordToInsert);

    lastWord = wordToInsert;
  }
  wordsLL.displayList();
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

let userProgressLL;

languageRouter
  .get("/head", async (req, res, next) => {
    try {

      let wordsLL = await createLinkedListFromDB(req);
      console.log('nextword is', wordsLL.head.value.original);

      let getTotalScore = await LanguageService.getTotalScore(
        req.app.get("db"),
        req.language.id
      );
      console.log('gettotalscorehere is', getTotalScore.total_score);
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
      console.log('linked list is', wordsLL.head.value);

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

      console.log('gettotalscore is', getTotalScore);
      let memVal = 1;
      let isCorrect = false;
      let currentHead = wordsLL.head.value;
      console.log(`compare '${guess.toLowerCase()}' to '${currentHead.translation.toLowerCase()}'`)
      if (guess.toLowerCase() === currentHead.translation.toLowerCase()) {
        memVal = wordsLL.head.value.memory_value * 2;
        if (memVal > wordsLL.size() - 1) {
          memVal = wordsLL.size() - 1;
        }
        currentHead.correct_count++;
        getTotalScore.total_score++;
        console.log('updating total score to:', getTotalScore.total_score);
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
      let getCorrectCount = currentHead.correct_count;
      let getIncorrectCount = currentHead.incorrect_count;
      currentHead.memory_value = memVal;


      wordsLL.remove(currentHead);
      wordsLL.insertAt(memVal, currentHead);

      let preceedingNode = wordsLL.findNthElement(memVal - 1);
      preceedingNode.value.next = preceedingNode.next.value.id;
      console.log("preceeding next is", preceedingNode.next);
      let oldHead = preceedingNode.next;
      console.log("oldHead next is", oldHead.next);
      oldHead.value.next = oldHead.next !== null ? oldHead.next.value.id : null;

      console.log("updating word states for preceeding:", preceedingNode.value);
      await LanguageService.updateWordStats(
        req.app.get("db"),
        preceedingNode.value,
      );

      console.log("updating word states for old head:", oldHead.value);
      await LanguageService.updateWordStats(
        req.app.get("db"),
        oldHead.value,
      );

      console.log('reordered linked list');
      wordsLL.displayList();

      res.send({
        nextWord: wordsLL.head.value,
        wordCorrectCount: getCorrectCount,
        wordInCorrectCount: getIncorrectCount,
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
