var Crypto = require('crypto');
function User(username, socketId,secretCode,hash){
    this.username = username;
    this.socketId = socketId;
    this.hash = hash||(Crypto.createHash('md5').update(secretCode+username).digest('hex'));
}

User.prototype.toString = function(){
    return this.username;
}
User.prototype.isEqual = function(userCompare){
    return (userCompare.hash === this.hash)
};
User.prototype.MakeSession = function(){
    return {
        Username:this.username,
        Token:this.hash
    };
}
module.exports = User;