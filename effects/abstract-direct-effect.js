'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _context = require('../core/context');

var _context2 = _interopRequireDefault(_context);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AbstractDirectEffect = function () {
    function AbstractDirectEffect(node) {
        (0, _classCallCheck3.default)(this, AbstractDirectEffect);

        this._node = this._in = this._out = node;
    }

    AbstractDirectEffect.prototype.connect = function connect(node) {
        this._node.connect(node._in || node);
    };

    AbstractDirectEffect.prototype.disconnect = function disconnect() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        this._node.disconnect(args);
    };

    AbstractDirectEffect.prototype.update = function update() {
        throw new Error('update must be overridden');
    };

    (0, _createClass3.default)(AbstractDirectEffect, [{
        key: 'context',
        get: function get() {
            return _context2.default;
        }
    }, {
        key: 'numberOfInputs',
        get: function get() {
            return 1;
        }
    }, {
        key: 'numberOfOutputs',
        get: function get() {
            return 1;
        }
    }, {
        key: 'channelCount',
        get: function get() {
            return 1;
        }
    }, {
        key: 'channelCountMode',
        get: function get() {
            return 'max';
        }
    }, {
        key: 'channelInterpretation',
        get: function get() {
            return 'speakers';
        }
    }]);
    return AbstractDirectEffect;
}();

exports.default = AbstractDirectEffect;