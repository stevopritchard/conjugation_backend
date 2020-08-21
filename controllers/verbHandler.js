const favouriteVerbs = (req, res, db) => {
    const { infinitive } = req.body;
    db
    .select('*')
    .from('infinitive')
    .where({infinitive})
    .then(data => res.json(data[0]))
    .catch(err => {
        res.status(400).json('Unable to find matching verbs.')
        console.log(err)
    })
}

const checkFavourite = (req, res, db) => {
    const { id } = req.body;
    db
    .select('*')
    .from('users')
    .where({ id })
    .then(data => {
        res.json(data[0].favourites)
    })
    .catch(err =>{
        res.status(400).json('no favourites found for this user')
    })
}

const addFavourite = (req, res, db) => {
    const { infinitive, id } = req.body; //id passed as props from 'this.state.user' in App.js
    db
    .returning('favourites')
    .select('*')
    .from('users')
    .where({id})
    .update({
        favourites: db.raw('array_append(favourites, ?)',[`${infinitive}`])
    })
    .then(verb => res.json(verb))
    .catch(err => console.log(err))


}

const removeFavourite = (req, res, db) => {
    const { infinitive, id } = req.body;
    db
    .returning('favourites')
    .select('*')
    .from('users')
    .where({id})
    .update({
        favourites: db.raw('array_remove(favourites, ?)',[`${infinitive}`])
    })
    .then(verb => res.json(verb))
    .catch(err => console.log(err))
}

module.exports = {
    favouriteVerbs: favouriteVerbs,
    checkFavourite: checkFavourite,
    addFavourite: addFavourite,
    removeFavourite: removeFavourite
}