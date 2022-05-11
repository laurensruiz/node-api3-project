const express = require('express');
const { validatePost, validateUser, validateUserId} = require('../middleware/middleware')

// You will need `users-model.js` and `posts-model.js` both
// The middleware functions also need to be required

const User = require('./users-model')
const Post = require('../posts/posts-model')

const router = express.Router();

router.get('/', (req, res, next) => {
  // RETURN AN ARRAY WITH ALL THE USERS
  User.get()
  .then(users => {
    res.json(users)
  })
  .catch(next)
});

router.get('/:id', validateUserId, (req, res) => {
  // RETURN THE USER OBJECT
  // this needs a middleware to verify user id
  //console.log(req.user)
  res.json(req.user)
});

router.post('/', validateUser, (req, res, next) => {
  // RETURN THE NEWLY CREATED USER OBJECT
  // this needs a middleware to check that the request body is valid
  //console.log(req.name)
  //return object with name
  User.insert({name: req.name})
  .then(newUser => {
    //throw new Error('ouvh!') //to test catch
    res.status(201).json(newUser)
  })
  .catch(next) //shortcut same as calling err => {next(err)}
});

router.put('/:id', validateUserId, validateUser,(req, res, next) => {
  //http put :5000/api/users/1 name=foo
  // RETURN THE FRESHLY UPDATED USER OBJECT
  // this needs a middleware to verify user id
  // and another middleware to check that the request body is valid
  // console.log(req.user) //validate user ID
  // console.log(req.name) //validate user
  User.update(req.params.id, {name: req.name})
  .then( ()=> { //gives back number of changes if u check
    return User.getById(req.params.id) // give us the id
  })
  .then(user =>{ //then with that id
    res.json(user) // we put id in json
  })
  .catch(next)
    //check the middleware how we called name thats hy we need to put it like this

});

router.delete('/:id', validateUserId, async (req, res, next) => {
  // RETURN THE FRESHLY DELETED USER OBJECT
  // this needs a middleware to verify user id
  // console.log(req.user)
  // User.remove(req.params.id)
  // .then(deletedUser => {
  //   res.json(deletedUser)
  // })
  // .catch(next)
  try{
    await User.remove(req.params.id)
    res.json(req.user)
  } catch (err) {
    next(err)
  }
});

router.get('/:id/posts', validateUserId, async (req, res, next) => {
  // RETURN THE ARRAY OF USER POSTS
  // this needs a middleware to verify user id
  //console.log(req.user)
  try{
    const result = await User.getUserPosts(req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
  //http post :5000/api/users/1/posts text='   foo '
  // RETURN THE NEWLY CREATED USER POST
  // this needs a middleware to verify user id
  // and another middleware to check that the request body is valid
  console.log(req.user)
  console.log(req.text)
});

//error handling middleware

router.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500).jsson({
    customMessage: 'something really bad happened in the router',
    message: err.message,
    stack: err.stack,
  })
})

// do not forget to export the router

module.exports = router