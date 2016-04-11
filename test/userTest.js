var assert = require('assert');
var user = require('../routes/users');

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1, 2, 3].indexOf(5));
            assert.equal(-1, [1, 2, 3].indexOf(0));
        });
    });
});

describe('users', function() {
    describe('captcha', function() {
        user.get('')
    });
});
