// returns an ad message each time its called
module.exports = function () {
    var messages = [
        'Have more fun, get more done with your team. And Bang is currently in free private beta.',
        'And Bang is simple and powerful tasks and chat for teams. Join the free private beta now.',
        'Create a culture of shipping, one rocket at a time. And Bang is free while in private beta.',
        'An API for what\'s important right now. And Bang is free while in private beta.'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};
