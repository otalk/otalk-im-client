var BaseCollection = require('./baseCollection');
var Resource = require('./resource');


module.exports = BaseCollection.extend({
    type: 'resources',
    model: Resource,
    comparator: function (res1, res2) {
        if (res1.priority > res2.priority) {
            return -1;
        }
        if (res1.priority < res2.priority) {
            return 1;
        }
        if (res1.show === res2.show) {
            return 0;
        }

        var ranking = {
            xa: 0,
            away: 1,
            '': 2,
            chat: 3,
            dnd: 3
        };
        var r1 = ranking[res1.show];
        var r2 = ranking[res2.show];

        if (r1 === r2) {
            return 0;
        }
        if (r1 > r2) {
            return -1;
        }
        return 1;
    }
});
