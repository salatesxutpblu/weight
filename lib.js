module.exports = {
    isAuthenticated: async function(req, res, next) {let username = req.session.user
  if (username) {
    return next()
  }
  res.redirect('/login')},
    getUser: function(req) { return req.session.user },
};