const Boom = require('boom');
var isAdmin = function(request, reply, next) {
   var role = 'admin';/*_do_something_to_check_user_role(request);*/
   if (role && role === 'admin') {
	   //console.log('POLICY: True on isAdmin Policy for role: ' + role);
       return next(null, true); // All is well with this request.  Proceed to the next policy or the route handler.
   } else {
	   //console.log('POLICY:  False on isAdmin Policy for role: ' + role);
       return next(Boom.unauthorized('This endpoint requires an Admin Role'), false); // This policy is not satisfied.  Return a 403 forbidden.
   }
};

// This is optional.  It will default to 'onPreHandler' unless you use a different defaultApplyPoint.
/*
Other 'applyPoint' are:
'onRequest'
'onPreAuth'
'onPostAuth'
'onPreHandler'
'onPostHandler'
'onPreResponse'
*/
isAdmin.applyPoint = 'onPreHandler';

module.exports = isAdmin;