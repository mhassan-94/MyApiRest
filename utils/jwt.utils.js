// IMPORTS //
var jwt = require ('jsonwebtoken');

const JWT_SIGN_SECRET = 'C070F9A3C027FE0C6210C0FD14B7B4E02E11A17AB2A132EA0F968E25150A28E1';


// FONCTIONS EXPORT //
module.exports = {
    generateTokenForUser: (userData) => {
        return jwt.sign({
            userId: userData.id,
            isadmin: userData.isadmin,
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '1h'
        })
    },
    parseAuthorization: (authorization) => {
        return(authorization != null) ? authorization.replace('Bearer',''): null;
    },
    getUserId: (authorization) => {
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);
        if (token != null) {
            try {
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if(jwtToken != null) 
                    userId =jwtToken.userId;
                } catch(err) { }
            }
            return userId;
        }
    }
