const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "word.id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id });
  },

  getWord(db, language_id) {
    return db
      .from("language")
      .join("word", { "word.language_id": "language.id"})
      .select(
        "word.id",
        "word.language_id",
        "word.original",
        "word.translation",
        "word.next",
        "word.memory_value",
        "word.correct_count",
        "word.incorrect_count",
        "language.total_score",
        "language.user_id"
        )
      .where("language.id", language_id);
  },

  getResults(db, currentWord) {
    return db
      .from("word")
      .join("language", {"language.id": "word.language_id"})
      .select(
        "word.translation",
        "word.language_id",
        "word.memory_value",
        "word.correct_count",
        "word.incorrect_count",
        "language.total_score",
        "language.user_id"
        )
      .where("word.original", currentWord)
  },
  updateCorrectCount(db, user_id) {
    return db
      .from("language")
      .join("word", { "word.language_id": "language.id"})
      // .update(
      //   "word.id",
      //   "word.language_id",
      //   "word.memory_value",
      //   "word.correct_count",
      //   "language.total_score",
      //   "language.user_id"
      //   )
      .update({
        correct_count: + 1,
        total_score: + 1
      })
      .select(
        "word.correct_count",
        "language.total_score"
      )
      .where("language.user_id", user_id);
},
updateIncorrectCount(db, user_id) {
    return db
      .from("language")
      .join("word", { "word.language_id": "language.id"})
      // .update(
      //   "word.id",
      //   "word.language_id",
      //   "word.memory_value",
      //   "word.correct_count",
      //   "language.total_score",
      //   "language.user_id"
      //   )
      .update({
        incorrect_count: + 1
      })
      .select(
        "word.incorrect_count"
      )
      .where("language.user_id", user_id);
}
  
};

module.exports = LanguageService;
