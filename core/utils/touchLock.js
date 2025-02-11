'use strict';

exports.__esModule = true;
exports.default = touchLock;

var _iOS = require('./iOS');

var _iOS2 = _interopRequireDefault(_iOS);

var _dummy = require('./dummy');

var _dummy2 = _interopRequireDefault(_dummy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function touchLock(context, callback) {
    var locked = _iOS2.default;

    function unlock() {
        if (context && context.state === 'suspended') {
            context.resume().then(function () {
                (0, _dummy2.default)(context);
                unlocked();
            });
        } else {
            unlocked();
        }
    }

    function unlocked() {
        document.body.removeEventListener('touchstart', unlock);
        document.body.removeEventListener('touchend', unlock);
        callback();
    }

    function addListeners() {
        document.body.addEventListener('touchstart', unlock, false);
        document.body.addEventListener('touchend', unlock, false);
    }

    if (locked) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addListeners);
        } else {
            addListeners();
        }
    }

    return locked;
}