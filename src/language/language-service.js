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

  getTotalScore(db, language_id) {
    return db
      .from("language")
      .select("language.total_score")
      .where("language.id", language_id)
  },
  getIncorrectCount(db, language_id, currentWord){
    return db
      .from("language")
      .join("word", { "word.language_id": "language.id"})
      .select("word.incorrect_count")
      .where("language.id", language_id) 
      .where("word.original", currentWord)  
 
  },
  getCorrectCount(db, language_id, currentWord){
    return db
      .from("language")
      .join("word", { "word.language_id": "language.id"})
      .select("word.correct_count")
      .where("language.id", language_id)
      .where("word.original", currentWord)  
  },
  getMemoryValue(db, language_id, currentWord){
    return db
      .from("language")
      .join("word", { "word.language_id": "language.id"})
      .select("word.memory_value")
      .where("language.id", language_id)
      .where("word.original", currentWord)  
  },

  updateTotalScore(db, language_id, newTotal) {
    return db
      .from("language")
      .where("language.id", language_id)
      .update({total_score: newTotal})
  },

  updateMemoryValue(db, word_id, new_mem_val){
    console.log('service word_id and memory value', word_id, new_mem_val);
    return db ("word")
      .update({memory_value: new_mem_val})
      .where("word.id", word_id)  
      .returning("memory_value")
  },

  updateCorrectCount(db, word_id) {
    return db
      .from("word")
      .update({"correct_count": db.raw("correct_count + 1")}
      )
      .returning("word.correct_count")
      .where("word.id", word_id);
},
  updateIncorrectCount(db, word_id) {
    return db
      .from("word")
      .update({"incorrect_count": db.raw("incorrect_count + 1")}
      )
      .returning(
        "word.correct_count",
      )
      .where("word.id", word_id);
}
  
};

module.exports = LanguageService;
