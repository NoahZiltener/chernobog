const rooms = [];

function createRoom(id, drawer) {
    const room = { id, drawer };
    rooms.push(room);
    return room;
}

function getRoomUsers(roomid) {
    return rooms.filter(room => room.id === roomid);
}

module.exports = {
    createRoom,
    getRoomUsers
}