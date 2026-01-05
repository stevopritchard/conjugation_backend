const search = (req, res, db) => {
  const { infinitive } = req.body;
  db.raw(
    `SELECT infinitive, infinitive_english, 
        CASE    WHEN infinitive like '%${infinitive}%' THEN 'esp' 
                WHEN infinitive_english like '%${infinitive}%' THEN 'eng'
        END
        from infinitive`
  )
    .then((verbs) =>
      verbs.rows.filter(function (verb) {
        if (verb.case !== null) {
          return verb;
        }
      })
    )
    // .then(verbs => verbs.map(function(verb) { return verb.infinitive }))
    .then((data) => res.json(data))
    .catch((err) => {
      res.status(400).json('Unable to find matching verbs.');
      console.log(err);
    });
};

const getFullConjugation = async (req, res, db) => {
  const { infinitive } = req.body;

  try {
    // Fetch gerund and past participle (separate tables)
    const gerund = await db('gerund').where('infinitive', infinitive).first();
    const pastParticiple = await db('pastparticiple')
      .where('infinitive', infinitive)
      .first();

    // Fetch all verb conjugations (single query)
    const conjugations = await db('verbs')
      .where('infinitive', infinitive)
      .select('*');

    // Build response object organized by mood and tense
    const response = {
      infinitive,
      gerund: gerund?.gerund || null,
      gerund_english: gerund?.gerund_english || null,
      past_participle: pastParticiple?.pastparticiple || null,
      past_participle_english: pastParticiple?.pastparticiple_english || null,
      indicative: {},
      subjunctive: {},
      imperative: {},
    };

    // Group conjugations by mood and tense
    conjugations.forEach((conj) => {
      if (conj.mood === 'Indicativo') {
        response.indicative[conj.tense] = {
          form_1s: conj.form_1s,
          form_2s: conj.form_2s,
          form_3s: conj.form_3s,
          form_1p: conj.form_1p,
          form_2p: conj.form_2p,
          form_3p: conj.form_3p,
        };
      } else if (conj.mood === 'Subjuntivo') {
        response.subjunctive[conj.tense] = {
          form_1s: conj.form_1s,
          form_2s: conj.form_2s,
          form_3s: conj.form_3s,
          form_1p: conj.form_1p,
          form_2p: conj.form_2p,
          form_3p: conj.form_3p,
        };
      } else if (conj.mood.startsWith('Imperativo')) {
        const imperativeType = conj.mood.includes('Afirmativo')
          ? 'affirmative'
          : 'negative';
        response.imperative[imperativeType] = {
          form_2s: conj.form_2s,
          form_3s: conj.form_3s,
          form_2p: conj.form_2p,
          form_3p: conj.form_3p,
        };
      }
    });

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not fetch conjugation data' });
  }
};

const getGerund = (req, res, db) => {
  const { infinitive } = req.body;
  db('gerund')
    .where('infinitive', infinitive)
    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('No matching participles.');
    });
};

const pastParticiple = (req, res, db) => {
  const { infinitive } = req.body;
  db('pastparticiple')
    .where('infinitive', infinitive)
    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('No matching participles.');
    });
};

const indicativePresent = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', 'Presente')
    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const indicativePresentperfect = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', 'Presente perfecto')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const indicativePreterite = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', 'Pretérito')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const indicativePastperfect = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', 'Pluscuamperfecto')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const indicativeImperfect = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', 'Imperfecto')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const indicativeConditional = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', 'Condicional')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const indicativeConditionalperfect = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', 'Condicional perfecto')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const indicativeFuture = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', 'Futuro')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const indicativeFutureperfect = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Indicativo')
    .andWhere('tense', 'Futuro perfecto')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const imperativeAffirmative = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_2s', 'form_3s', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Imperativo Afirmativo')
    .andWhere('tense', 'Presente')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const imperativeNegative = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_2s', 'form_3s', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Imperativo Negativo')
    .andWhere('tense', 'Presente')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const subjunctivePresent = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Subjuntivo')
    .andWhere('tense', 'Presente')
    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const subjunctivePresentperfect = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Subjuntivo')
    .andWhere('tense', 'Presente perfecto')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const subjunctivePastperfect = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Subjuntivo')
    .andWhere('tense', 'Pluscuamperfecto')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const subjunctiveImperfect = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Subjuntivo')
    .andWhere('tense', 'Imperfecto')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const subjunctiveFuture = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Subjuntivo')
    .andWhere('tense', 'Futuro')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

const subjunctiveFutureperfect = (req, res, db) => {
  const { infinitive } = req.body;
  db.column('form_1s', 'form_2s', 'form_3s', 'form_1p', 'form_2p', 'form_3p')
    .select()
    .from('verbs')
    .where('infinitive', infinitive)
    .andWhere('mood', 'Subjuntivo')
    .andWhere('tense', 'Futuro perfecto')

    .then((data) => res.json(data[0]))
    .catch((err) => {
      res.status(400).json('Could not conjugate verb.');
    });
};

module.exports = {
  search: search,
  getFullConjugation: getFullConjugation,
  getGerund: getGerund,
  pastParticiple: pastParticiple,
  indicativePresent: indicativePresent,
  indicativePresentperfect: indicativePresentperfect,
  indicativePreterite: indicativePreterite,
  indicativePastperfect: indicativePastperfect,
  indicativeImperfect: indicativeImperfect,
  indicativeConditional: indicativeConditional,
  indicativeConditionalperfect: indicativeConditionalperfect,
  indicativeFuture: indicativeFuture,
  indicativeFutureperfect: indicativeFutureperfect,
  imperativeAffirmative: imperativeAffirmative,
  imperativeNegative: imperativeNegative,
  subjunctivePresent: subjunctivePresent,
  subjunctivePresentperfect: subjunctivePresentperfect,
  subjunctivePastperfect,
  subjunctivePastperfect,
  subjunctiveImperfect: subjunctiveImperfect,
  subjunctiveFuture: subjunctiveFuture,
  subjunctiveFutureperfect: subjunctiveFutureperfect,
};
