const rooms = [];

function createRoom(id, drawer, word) {
    const room = { id, drawer, word };
    rooms.push(room);
    return room;
}

function getRoom(roomid) {
    return rooms.filter(room => room.id === roomid);
}

module.exports = {
    createRoom,
    getRoom
}