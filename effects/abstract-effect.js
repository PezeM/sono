'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _context = require('../core/context');

var _context2 = _interopRequireDefault(_context);

var _isSafeNumber = require('../core/utils/isSafeNumber');

var _isSafeNumber2 = _interopRequireDefault(_isSafeNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AbstractEffect = function () {
    function AbstractEffect() {
        var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var nodeOut = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var enabled = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        (0, _classCallCheck3.default)(this, AbstractEffect);

        this._node = node;
        this._nodeOut = nodeOut || node;
        this._enabled;

        this._in = this.context.createGain();
        this._out = this.context.createGain();
        this._wet = this.context.createGain();
        this._dry = this.context.createGain();

        this._in.connect(this._dry);
        this._wet.connect(this._out);
        this._dry.connect(this._out);

        this.enable(enabled);
    }

    AbstractEffect.prototype.enable = function enable(b) {
        if (b === this._enabled) {
            return;
        }

        this._enabled = b;

        this._in.disconnect();

        if (b) {
            this._in.connect(this._dry);
            this._in.connect(this._node);
            this._nodeOut.connect(this._wet);
        } else {
            this._nodeOut.disconnect();
            this._in.connect(this._out);
        }
    };

    AbstractEffect.prototype.connect = function connect(node) {
        this._out.connect(node._in || node);
    };

    AbstractEffect.prototype.disconnect = function disconnect() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        this._out.disconnect(args);
    };

    AbstractEffect.prototype.setSafeParamValue = function setSafeParamValue(param, value) {
        if (!(0, _isSafeNumber2.default)(value)) {
            console.warn(this, 'Attempt to set invalid value ' + value + ' on AudioParam');
            return;
        }
        param.value = value;
    };

    AbstractEffect.prototype.update = function update() {
        throw new Error('update must be overridden');
    };

    (0, _createClass3.default)(AbstractEffect, [{
        key: 'wet',
        get: function get() {
            return this._wet.gain.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._wet.gain, value);
        }
    }, {
        key: 'dry',
        get: function get() {
            return this._dry.gain.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._dry.gain, value);
        }
    }, {
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
    return AbstractEffect;
}();

exports.default = AbstractEffect;