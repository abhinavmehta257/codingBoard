class Rooms{
    constructor(){
        this.rooms = [];
    }

    addRoom(roomId){
        
        this.rooms.push(roomId);
    }

    removeRoom(roomId){
        this.rooms = this.rooms.filter((id) => id != roomId);
    }
    getRoom(roomId){
       return this.rooms.includes(roomId);
    }
}

module.exports = {Rooms};