module.exports = {
    isAuthenticated: async function(req, res, next) {let username = req.session.user
  if (username) {
    return next()
  }
  res.redirect('/login')},
    getUser: function(req) { return req.session.user },
    getMonthByNumber: function getMonthByNumber(number) {
  const date = new Date(2020, number)
  let val = date.toLocaleString('ru-RU', { month: 'long' })
  return String(val).charAt(0).toUpperCase() + String(val).slice(1)
},
};