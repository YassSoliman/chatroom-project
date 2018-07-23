
function User(username, socketId){
    this.username = username;
    this.socketId = socketId;
}

User.prototype.toString = function(){
    return this.username;
}
module.exports = User;