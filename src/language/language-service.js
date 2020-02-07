const LanguageService = {

  getIncorrectCount(db, language_id, currentWord) {
    return db
      .from('language')
      .join('word', { 'word.language_id': 'language.id' })
      .select('word.incorrect_count')
      .where('language.id', language_id)
      .where('word.original', currentWord);

  },
  getCorrectCount(db, language_id, currentWord) {
    return db
      .from('language')
      .join('word', { 'word.language_id': 'language.id' })
      .select('word.correct_count')
      .where('language.id', language_id)
      .where('word.original', currentWord);
  },
  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'word.id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },
  getMemoryValue(db, language_id, currentWord) {
    return db
      .from('language')
      .join('word', { 'word.language_id': 'language.id' })
      .select('word.memory_value')
      .where('language.id', language_id)
      .where('word.original', currentWord);
  },
  getResults(db, currentWord) {
    return db
      .from('word')
      .join('language', { 'language.id': 'word.language_id' })
      .select(
        'word.translation',
        'word.language_id',
        'word.memory_value',
        'word.correct_count',
        'word.incorrect_count',
        'language.total_score',
        'language.user_id'
      )
      .where('word.original', currentWord);
  },
  getTotalScore(db, language_id) {
    return db
      .from('language')
      .select('language.total_score')
      .where('language.id', language_id)
      .first();
  },
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },
  getWord(db, language_id, word_id) {
    return db
      .from('language')
      .join('word', { 'word.language_id': 'language.id' })
      .select(
        'word.id',
        'word.language_id',
        'word.original',
        'word.translation',
        'word.next',
        'word.memory_value',
        'word.correct_count',
        'word.incorrect_count',
        'language.total_score',
        'language.user_id'
      )
      .where('language.id', language_id)
      .where('word.id', word_id);
  },


  updateCorrectCount(db, word_id) {
    return db
      .from('word')
      .update({ 'correct_count': db.raw('correct_count + 1') }
      )
      .returning('correct_count')
      .where('word.id', word_id);
  },
  updateIncorrectCount(db, word_id) {
    return db
      .from('word')
      .update({ 'incorrect_count': db.raw('incorrect_count + 1') }
      )
      .returning(
        'incorrect_count'
      )
      .where('word.id', word_id);
  },
  updateMemoryValue(db, word_id, new_mem_val) {
    return db
      .from('word')
      .update({ memory_value: new_mem_val })
      .where('word.id', word_id)
      .returning('memory_value');
  },
  updateTotalScore(db, language_id, newTotal) {
    return db
      .from('language')
      .where('language.id', language_id)
      .update({ total_score: newTotal });
  },
  updateWordStats(db, wordObj) {
    return db
      .from('word')
      .update({
        memory_value: wordObj.memory_value,
        correct_count: wordObj.correct_count,
        incorrect_count: wordObj.incorrect_count,
        next: wordObj.next
      })
      .where('word.id', wordObj.id);
  }

};

module.exports = LanguageService;
