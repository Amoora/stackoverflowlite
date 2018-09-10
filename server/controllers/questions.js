import db from '../model/postgres-connect';

export default class Question {
/**
 * get all questions route
 * @params {object} req
 * @params {object} res
 */
  allQuestions(req, res){
    db.any('SELECT users.username as askedBy,questions.title,questions.id as questionId,questions.description,questions.category as tags, questions.date_created as askedOn FROM USERS INNER JOIN QUESTIONS ON users.id = questions.createdby ORDER BY questions.date_created')
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
    }


/**
 * get a question by id
 * @params {object} req
 * @params {object} res
 */
getQuestion(req, res) {
  const id = parseInt(req.params.id);
  db.one('SELECT * FROM questions WHERE id = $1', id)
    .then((data) => {
      return db.any('SELECT USERS.username as answeredBy, answers.id as answerId,answer, accepted FROM users INNER JOIN  answers ON users.id = answers.userid WHERE answers.question_id = $1 ORDER BY answers.date_answered',id)
      .then((answers)=>{
        const result = {
          questionId: data.id,
          title: data.title,
          tags: data.category,
          Description: data.description,
          answers,
        };
        return result;
      })
    },()=>{
      res.status(404).send({error: 'Question does not exist'})
    })
    .then((result)=>{
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

  /**
 * post a question
 * @params {object} req
 * @params {object} res
 */
  postQuestion(req, res) {
    const { title, description,category } = req.body;
    const createdby = req.user.id;
    if(!title || !description || !createdby){
      return res.status(400).json({
        errorMsg: 'Invalid input',
      })
    }
      db.one('INSERT INTO questions(title,description,category,createdby) values($1,$2,$3,$4) RETURNING id', [title, description, category,createdby])
        .then((data) => {
          res.status(200).json({
            id: data.id,
            message: 'Sucess! Question Saved',
          });
        })
        .catch((err) => {
          res.status(500).send(err)
        });
    
  }
 
  /**
 * get all questions ever asked by a user
 * @params {object} req
 * @params {object} res
 */
getQuestionsByUser(req, res){
  db.any('SELECT users.username as askedBy,questions.title,questions.description,questions.date_created as askedOn FROM USERS INNER JOIN QUESTIONS ON users.id = questions.createdby WHERE createdby = $1 ORDER BY questions.date_created', req.user.id)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}


  /**
 * Post an answer to a question by id
 * @params {object} req
 * @params {object} res
 */
  postAnswerToQuestion(req, res) {
    const questionId = parseInt(req.params.id);
    const { answer } = req.body;
    const userId = req.user.id;
    if(!answer){
      res.status(400)
      .send({
        errorMsg: 'Bad Request',
      })
    }
    db.one('INSERT INTO answers(answer,question_id,userid,accepted) values($1,$2,$3,$4) RETURNING id', [answer, questionId, userId, false])
      .then((data) => {
        res.status(200).json({
          id: data.id,
          message: 'Success! Answer Saved',
        });
      })
      .catch((error) => {
        res.status(500).send({
          errorMessage: 'Question currently unavailable',
          errorDetails: error,
        });
      });
  }

  /**
 * Marking an aswer as preferred
 * @param {object} req
 * @param {object} res
 */
 acceptAnswer(req, res){
  const {answer} = req.body;
  const questionId = parseInt(req.params.id);
  const answerId = parseInt(req.params.answerid);
  const ownerId = req.user.id; 
  db.one('SELECT questions.createdby,answers.userid FROM questions INNER JOIN answers ON questions.id = answers.question_id WHERE answers.question_id = $1 AND answers.id = $2', [questionId,answerId])
  .then((data)=>{
    if(data.userid == ownerId){
      return db.one('UPDATE answers SET answer = $1 WHERE id = $4 AND question_id = $2 AND userid = $3 RETURNING id', [answer, questionId, ownerId,answerId])
      .then((result)=>{
        return result;
      })
    }else if(data.createdby == ownerId){
      return db.one('UPDATE answers SET accepted = $1 WHERE id = $3 AND question_id = $2 RETURNING accepted', [true, questionId, answerId])
      .then((data) => {
        return data;
      })
    }else{
      return 
    }
  },(e)=>{
    throw e;
  })
  .then((result)=>{
    res.status(200).json({msg: 'Answer accepted'});
  })
    .catch((error) => {
      res.status(500).send({
        errorMessage: 'Server Error, if your are the author, check that the answer field is set',
      });
    });
}

/**
 * get all answers a user has ever asked
 * @params {object} req
 * @params {object} res
 */
  getAnswers(req, res) {
    const id = parseInt(req.params.id);
    db.any('SELECT * FROM answers WHERE question_id = $1', id)
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).send({
          errorMessage: 'Question is note available',
          errorDetails: err,
        });
      });
  }

  /**
 * Delete a question by id
 * @params {object} req
 * @params {object} res
 */
  deleteQuestion (req, res){
    const id = parseInt(req.params.id);
    const ownerId = req.user.id;
    db.result('DELETE FROM questions WHERE id = $1 AND createdby = $2', [id,ownerId])
      .then((result) => {
        if(result.rowCount == 0){
          return res.status(401).json({
            message: `You are not authorized to delete a question you did not create`,
          });
        }
        res.status(200).json({
          id,
          message: `${result.rowCount} Question Deleted`,
        });
      })
      .catch((error) => {
        res.status(500).send(
          {
            errMsg: `Server Error`,
            error,
          });
      });
  }

    /**
 * search for questions
 * @param {object} req
 * @param {object} res
 */
search (req, res){
  let {query} = req.query;
  if(!query || query.length > 25) return res.status(400).json(query);
  query = `%${query}%`
  db.any('SELECT title FROM questions WHERE title ILIKE $1',[query])
  .then((data)=>{
    res.status(200).json(data);
  })
  .catch((err)=>{
    res.status(404).json({
      msg: 'No Search Results'
    });
  });
}
/**
 * Users can view questions with the most answers
 * @params {object} req
 * @params {object} res
 */
questionsWithMostAnswers(req,res){
  db.any('SELECT questions.title, questions.description,answers.question_id, COUNT(answers.question_id) FROM questions INNER JOIN answers ON questions.id = answers.question_id GROUP BY answers.question_id,questions.title,questions.description ORDER BY COUNT(answers.question_id) desc')
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).send(err)
    });
}


}
