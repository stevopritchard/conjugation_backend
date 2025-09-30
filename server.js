const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3001;
const knex = require('knex');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const signin = require('./controllers/signin');
const register = require('./controllers/register');
const conjugation = require('./controllers/conjugation');
const verbHandler = require('./controllers/verbHandler');

const cors = require('cors');
// const { response } = require('express');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1', //localhost
    port: '5432',
    user: 'stephenpritchard',
    password: '',
    database: 'verbos',
  },
});

// app.use(express.urlencoded({extended: false}));
// app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

app.get('/', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db('users')
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('User not found.');
      }
    });
  // .catch(err => res.status(400).json('error getting user'))
});

app.post('/signin', (req, response) => {
  signin.handleSignIn(req, response, db, bcrypt);
});

app.post('/register', (req, res) => {
  register.handleRegister(req, res, db, bcrypt, saltRounds);
});

app.post('/infinitive', (req, res) => {
  conjugation.getInfinitive(req, res, db);
});

app.post('/gerund', (req, res) => {
  conjugation.getGerund(req, res, db);
});

app.post('/past_participle', (req, res) => {
  conjugation.pastParticiple(req, res, db);
});

app.post('/indicative_present', (req, res) => {
  conjugation.indicativePresent(req, res, db);
});

app.post('/indicative_presentperfect', (req, res) => {
  conjugation.indicativePresentperfect(req, res, db);
});

app.post('/indicative_preterite', (req, res) => {
  conjugation.indicativePreterite(req, res, db);
});

app.post('/indicative_pastperfect', (req, res) => {
  conjugation.indicativePreterite(req, res, db);
});

app.post('/indicative_imperfect', (req, res) => {
  conjugation.indicativeImperfect(req, res, db);
});

app.post('/indicative_conditional', (req, res) => {
  conjugation.indicativeConditional(req, res, db);
});

app.post('/indicative_conditionalperfect', (req, res) => {
  conjugation.indicativeConditionalperfect(req, res, db);
});

app.post('/indicative_future', (req, res) => {
  conjugation.indicativeFuture(req, res, db);
});

app.post('/indicative_futureperfect', (req, res) => {
  conjugation.indicativeFutureperfect(req, res, db);
});

app.post('/imperative_affirmative', (req, res) => {
  conjugation.imperativeAffirmative(req, res, db);
});

app.post('/imperative_negative', (req, res) => {
  conjugation.imperativeNegative(req, res, db);
});

app.post('/subjunctive_present', (req, res) => {
  conjugation.subjunctivePresent(req, res, db);
});

app.post('/subjunctive_presentperfect', (req, res) => {
  conjugation.subjunctivePresentperfect(req, res, db);
});

app.post('/subjunctive_pastperfect', (req, res) => {
  conjugation.subjunctivePastperfect(req, res, db);
});

app.post('/subjunctive_imperfect', (req, res) => {
  conjugation.subjunctiveImperfect(req, res, db);
});

app.post('/subjunctive_future', (req, res) => {
  conjugation.subjunctiveFuture(req, res, db);
});

app.post('/subjunctive_futureperfect', (req, res) => {
  conjugation.subjunctiveFutureperfect(req, res, db);
});

app.post('/favourite_verbs', (req, res) => {
  verbHandler.favouriteVerbs(req, res, db);
});

app.post('/check_favourite', (req, res) => {
  verbHandler.checkFavourite(req, res, db);
});

app.post('/add_favourite', (req, res) => {
  verbHandler.addFavourite(req, res, db);
});

app.post('/remove_favourite', (req, res) => {
  verbHandler.removeFavourite(req, res, db);
});

function getInfinitiveCount() {
  return db
    .count('*')
    .from('infinitive')
    .then((result) => {
      return result[0].count;
    });
}

function getRandomVerb() {
  return getInfinitiveCount()
    .then((count) => {
      return db
        .select('*')
        .from('infinitive')
        .where('infinitive', '<>', 'llover')
        .orWhere('infinitive', '<>', 'nevar')
        .orWhere('infinitive', '<>', 'nevar')
        .limit(1)
        .offset(Math.floor(Math.random() * count));
    })
    .then((response) => {
      return response[0].infinitive;
    });
}

app.use(function (req, res, next) {
  getRandomVerb().then(function (response) {
    req.verb = response;
    next();
  });
});

app.post('/get_conjugations', (req, res) => {
  const { tense } = req.body;
  const pronouns = [
    'form_1s',
    'form_2s',
    'form_3s',
    'form_1p',
    'form_2p',
    'form_3p',
  ];
  let subjects = [];
  function randSubject() {
    do {
      var a = Math.floor(Math.random() * pronouns.length);
      subjects.push(pronouns[a]);
      pronouns.splice(a, 1);
    } while (subjects.length < 4);
  }
  randSubject();

  db.column('infinitive', subjects[0], subjects[1], subjects[2], subjects[3])
    .select()
    .from('verbs')
    .where('infinitive', req.verb)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', tense)
    .then((response) => res.json(response))
    .catch((err) => console.log(err));
});
