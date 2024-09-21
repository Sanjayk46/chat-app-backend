const  UNAUTHORIZED =400; 
const {protect} = require('./authMiddleware');

const admin = (req, res,next) => {
  // Call the authMiddleware to authenticate the user
  protect(req, res, () => {
    const user = req.user;
    if (!user || typeof user.isAdmin === 'undefined') {
      // If user is not defined or isAdmin property is not defined, return unauthorized
      return res.status(UNAUTHORIZED).json({ error: 'Unauthorized' });
    }

    // Check if user is an admin
    if (!user.isAdmin) {
      // If user is not an admin, return forbidden
      return res.status(UNAUTHORIZED).json({ error: 'Forbidden' });
    }

    // If user is an admin, proceed to the next middleware or route handler
    // For example, you can send a success response with status 200
    return next();
  });
};

module.exports = { admin };