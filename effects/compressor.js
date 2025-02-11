'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _abstractEffect = require('./abstract-effect');

var _abstractEffect2 = _interopRequireDefault(_abstractEffect);

var _sono = require('../core/sono');

var _sono2 = _interopRequireDefault(_sono);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Compressor = function (_AbstractEffect) {
    (0, _inherits3.default)(Compressor, _AbstractEffect);

    function Compressor() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$attack = _ref.attack,
            attack = _ref$attack === undefined ? 0.003 : _ref$attack,
            _ref$knee = _ref.knee,
            knee = _ref$knee === undefined ? 30 : _ref$knee,
            _ref$ratio = _ref.ratio,
            ratio = _ref$ratio === undefined ? 12 : _ref$ratio,
            _ref$release = _ref.release,
            release = _ref$release === undefined ? 0.25 : _ref$release,
            _ref$threshold = _ref.threshold,
            threshold = _ref$threshold === undefined ? -24 : _ref$threshold,
            _ref$wet = _ref.wet,
            wet = _ref$wet === undefined ? 1 : _ref$wet,
            _ref$dry = _ref.dry,
            dry = _ref$dry === undefined ? 1 : _ref$dry;

        (0, _classCallCheck3.default)(this, Compressor);

        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractEffect.call(this, _sono2.default.context.createDynamicsCompressor()));

        _this.wet = wet;
        _this.dry = dry;
        _this.update({ threshold: threshold, knee: knee, ratio: ratio, attack: attack, release: release });
        return _this;
    }

    Compressor.prototype.update = function update(options) {
        // min decibels to start compressing at from -100 to 0
        this.setSafeParamValue(this._node.threshold, options.threshold);
        // decibel value to start curve to compressed value from 0 to 40
        this.setSafeParamValue(this._node.knee, options.knee);
        // amount of change per decibel from 1 to 20
        this.setSafeParamValue(this._node.ratio, options.ratio);
        // seconds to reduce gain by 10db from 0 to 1 - how quickly signal adapted when volume increased
        this.setSafeParamValue(this._node.attack, options.attack);
        // seconds to increase gain by 10db from 0 to 1 - how quickly signal adapted when volume redcuced
        this.setSafeParamValue(this._node.release, options.release);
    };

    (0, _createClass3.default)(Compressor, [{
        key: 'threshold',
        get: function get() {
            return this._node.threshold.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._node.threshold, value);
        }
    }, {
        key: 'knee',
        get: function get() {
            return this._node.knee.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._node.knee, value);
        }
    }, {
        key: 'ratio',
        get: function get() {
            return this._node.ratio.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._node.ratio, value);
        }
    }, {
        key: 'attack',
        get: function get() {
            return this._node.attack.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._node.attack, value);
        }
    }, {
        key: 'release',
        get: function get() {
            return this._node.release.value;
        },
        set: function set(value) {
            this.setSafeParamValue(this._node.release, value);
        }
    }]);
    return Compressor;
}(_abstractEffect2.default);

exports.default = _sono2.default.register('compressor', function (opts) {
    return new Compressor(opts);
});