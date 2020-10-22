// [{
//   id: 'sdfgsdfgsdfg',
//   name: 'WDJ',
//   room: 'node js'
// }]

//start adding roomid, room name


class Users {
  constructor() {
    this.users = [];
  }

  
  addUser(id, name, roomId, isAdmin) {
    let user = {id, name, roomId, isAdmin};
    this.users.push(user);
    return user;
  }
  getRoomId(socketId){
    let user = this.users.filter((user) => user.id === socketId);
    return user;
  }

  getUserList (roomId) {
    let users = this.users.filter((user) => user.roomId === roomId);
    let namesArray = users.map((user) => user);

    return namesArray;
  }

  getUser(id) {
    return this.users.filter((user) => user.id === id)[0];
  }

  checkIsAdmin(id){
   let user = this.getUser(id);

    if(user.isAdmin){
      return true;
    }else{
      return false;
    }
  }

  getRoomAdmin(id){
    let userlist = this.getUserList(id);
    let admin = userlist.filter((user) => user.isAdmin === true)[0];

    return admin;
  }

  removeUser(id) {
    let user = this.getUser(id);

    if(user){
      this.users = this.users.filter((user) => user.id !== id);
    }

    return user;
  }

}

module.exports = {Users};
