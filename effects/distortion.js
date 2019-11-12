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

var _isSafeNumber = require('../core/utils/isSafeNumber');

var _isSafeNumber2 = _interopRequireDefault(_isSafeNumber);

var _sono = require('../core/sono');

var _sono2 = _interopRequireDefault(_sono);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// up-sample before applying curve for better resolution result 'none', '2x' or '4x'
// oversample: '2x'
// oversample: '4x'

var Distortion = function (_AbstractEffect) {
    (0, _inherits3.default)(Distortion, _AbstractEffect);

    function Distortion() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$level = _ref.level,
            level = _ref$level === undefined ? 1 : _ref$level,
            _ref$samples = _ref.samples,
            samples = _ref$samples === undefined ? 22050 : _ref$samples,
            _ref$oversample = _ref.oversample,
            oversample = _ref$oversample === undefined ? 'none' : _ref$oversample,
            _ref$wet = _ref.wet,
            wet = _ref$wet === undefined ? 1 : _ref$wet,
            _ref$dry = _ref.dry,
            dry = _ref$dry === undefined ? 0 : _ref$dry;

        (0, _classCallCheck3.default)(this, Distortion);

        var _this = (0, _possibleConstructorReturn3.default)(this, _AbstractEffect.call(this, _sono2.default.context.createWaveShaper(), null, false));

        _this._node.oversample = oversample || 'none';

        _this._samples = samples || 22050;

        _this._curve = new Float32Array(_this._samples);

        _this._level;

        _this._enabled = false;

        _this.wet = wet;
        _this.dry = dry;
        _this.update({ level: level });
        return _this;
    }

    Distortion.prototype.update = function update(_ref2) {
        var level = _ref2.level;

        if (level === this._level || !(0, _isSafeNumber2.default)(level)) {
            return;
        }

        this.enable(level > 0);

        if (!this._enabled) {
            return;
        }

        var k = level * 100;
        var deg = Math.PI / 180;
        var y = 2 / this._samples;

        var x = void 0;
        for (var i = 0; i < this._samples; ++i) {
            x = i * y - 1;
            this._curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }

        this._level = level;
        this._node.curve = this._curve;
    };

    (0, _createClass3.default)(Distortion, [{
        key: 'level',
        get: function get() {
            return this._level;
        },
        set: function set(level) {
            this.update({ level: level });
        }
    }]);
    return Distortion;
}(_abstractEffect2.default);

exports.default = _sono2.default.register('distortion', function (opts) {
    return new Distortion(opts);
});