module.exports = {
    ensureAuth: function (req, res, next) {
      if (req.isAuthenticated()) {
        return next()
      } else {
        res.redirect('/')
      }
    },
    ensureGuest: function (req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      } else {
        res.redirect('/dashboard');
      }
    },
    // ensureAdmin : function(req, res, next){
    //   console.log(req.body)
    //   if (req.isAuthenticated()) {
    //     return next();
    //   } else {
    //     res.redirect('/login');
    //   }
    // }
  }