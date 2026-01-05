const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3001;
const knex = require('knex');
// const { Client } = require('pg');
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
    host: '127.0.0.1',
    port: 5432,
    user: 'stephenpritchard',
    database: 'conjugado',
  },
});

// const client = new Client({
//   user: 'stephenpritchard',
//   database: 'conjugado',
//   host: 'localhost',
//   port: 5432,
// });
// // Connect to PostgreSQL and start the server
// (async () => {
//   try {
//     await client.connect();

//     const testQuery1 = {
//       name: 'test1',
//       text: "SELECT infinitive, infinitive_english FROM infinitive WHERE infinitive LIKE 'ab%'",
//     };

//     const result = await client.query(testQuery1);

//     console.log(result);
//   } catch (error) {
//     console.error('Error starting server:', error);
//     process.exit(1);
//   }
// })();

// app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connection is working!');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
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

app.post('/api/auth/signin', (req, response) => {
  signin.handleSignIn(req, response, db, bcrypt);
});

app.post('/api/auth/register', (req, res) => {
  register.handleRegister(req, res, db, bcrypt, saltRounds);
});

app.post('/api/verb/search', (req, res) => {
  conjugation.search(req, res, db);
});

app.post('/api/verb/conjugation', (req, res) => {
  conjugation.getFullConjugation(req, res, db);
});

// app.post('/gerund', (req, res) => {
//   conjugation.getGerund(req, res, db);
// });

// app.post('/past_participle', (req, res) => {
//   conjugation.pastParticiple(req, res, db);
// });

// app.post('/indicative_present', (req, res) => {
//   conjugation.indicativePresent(req, res, db);
// });

// app.post('/indicative_presentperfect', (req, res) => {
//   conjugation.indicativePresentperfect(req, res, db);
// });

// app.post('/indicative_preterite', (req, res) => {
//   conjugation.indicativePreterite(req, res, db);
// });

// app.post('/indicative_pastperfect', (req, res) => {
//   conjugation.indicativePreterite(req, res, db);
// });

// app.post('/indicative_imperfect', (req, res) => {
//   conjugation.indicativeImperfect(req, res, db);
// });

// app.post('/indicative_conditional', (req, res) => {
//   conjugation.indicativeConditional(req, res, db);
// });

// app.post('/indicative_conditionalperfect', (req, res) => {
//   conjugation.indicativeConditionalperfect(req, res, db);
// });

// app.post('/indicative_future', (req, res) => {
//   conjugation.indicativeFuture(req, res, db);
// });

// app.post('/indicative_futureperfect', (req, res) => {
//   conjugation.indicativeFutureperfect(req, res, db);
// });

// app.post('/imperative_affirmative', (req, res) => {
//   conjugation.imperativeAffirmative(req, res, db);
// });

// app.post('/imperative_negative', (req, res) => {
//   conjugation.imperativeNegative(req, res, db);
// });

// app.post('/subjunctive_present', (req, res) => {
//   conjugation.subjunctivePresent(req, res, db);
// });

// app.post('/subjunctive_presentperfect', (req, res) => {
//   conjugation.subjunctivePresentperfect(req, res, db);
// });

// app.post('/subjunctive_pastperfect', (req, res) => {
//   conjugation.subjunctivePastperfect(req, res, db);
// });

// app.post('/subjunctive_imperfect', (req, res) => {
//   conjugation.subjunctiveImperfect(req, res, db);
// });

// app.post('/subjunctive_future', (req, res) => {
//   conjugation.subjunctiveFuture(req, res, db);
// });

// app.post('/subjunctive_futureperfect', (req, res) => {
//   conjugation.subjunctiveFutureperfect(req, res, db);
// });

app.post('/api/favourite_verbs', (req, res) => {
  verbHandler.favouriteVerbs(req, res, db);
});

app.post('/api/check_favourite', (req, res) => {
  verbHandler.checkFavourite(req, res, db);
});

app.post('/api/add_favourite', (req, res) => {
  verbHandler.addFavourite(req, res, db);
});

app.post('/api/remove_favourite', (req, res) => {
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
