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

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _bufferSource = require('./source/buffer-source');

var _bufferSource2 = _interopRequireDefault(_bufferSource);

var _effects = require('./effects');

var _effects2 = _interopRequireDefault(_effects);

var _emitter = require('./utils/emitter');

var _emitter2 = _interopRequireDefault(_emitter);

var _file = require('./utils/file');

var _file2 = _interopRequireDefault(_file);

var _firefox = require('./utils/firefox');

var _firefox2 = _interopRequireDefault(_firefox);

var _utils = require('./utils/utils');

var _utils2 = _interopRequireDefault(_utils);

var _isSafeNumber = require('./utils/isSafeNumber');

var _isSafeNumber2 = _interopRequireDefault(_isSafeNumber);

var _loader = require('./utils/loader');

var _loader2 = _interopRequireDefault(_loader);

var _audioSource = require('./source/audio-source');

var _audioSource2 = _interopRequireDefault(_audioSource);

var _mediaSource = require('./source/media-source');

var _mediaSource2 = _interopRequireDefault(_mediaSource);

var _microphoneSource = require('./source/microphone-source');

var _microphoneSource2 = _interopRequireDefault(_microphoneSource);

var _oscillatorSource = require('./source/oscillator-source');

var _oscillatorSource2 = _interopRequireDefault(_oscillatorSource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Sound = function (_Emitter) {
    (0, _inherits3.default)(Sound, _Emitter);

    function Sound(config) {
        (0, _classCallCheck3.default)(this, Sound);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Emitter.call(this));

        _this.id = config.id || null;

        _this._context = config.context || _context2.default;
        _this._destination = config.destination || _this._context.destination;
        _this._effects = new _effects2.default(_this._context);
        _this._gain = _this._context.createGain();
        _this._config = config;

        _this._data = null;
        _this._fadeTimeout = null;
        _this._isTouchLocked = false;
        _this._loader = null;
        _this._loop = false;
        _this._offset = 0;
        _this._playbackRate = 1;
        _this._playWhenReady = null;
        _this._source = null;
        _this._wave = null;
        _this._userData = {};

        _this._effects.setDestination(_this._gain);
        _this._gain.connect(_this._destination);

        _this._onEnded = _this._onEnded.bind(_this);
        _this._onLoad = _this._onLoad.bind(_this);
        _this._onLoadError = _this._onLoadError.bind(_this);
        return _this;
    }

    Sound.prototype.prepare = function prepare() {
        var newConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var skipLoad = !force && !this._source && !!this._config.deferLoad;

        if (newConfig) {
            var configSrc = _file2.default.getSrc(newConfig);
            var src = _file2.default.getSupportedFile(configSrc) || this._config.src;
            this._config = Object.assign(this._config, newConfig, { src: src });
        }

        if (this._source && this._data && this._data.tagName) {
            this._source.load(this._config.src);
        } else {
            this._loader = new _loader2.default(this._config.src, skipLoad);
            this._loader.audioContext = !!this._config.asMediaElement || this._context.isFake ? null : this._context;
            this._loader.isTouchLocked = this._isTouchLocked;
            this._loader.once('loaded', this._onLoad);
            this._loader.once('error', this._onLoadError);
        }
        return this;
    };

    Sound.prototype.load = function load() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.stop();
        this._source = null;

        if (!config || _file2.default.containsURL(config)) {
            if (this._loader) {
                this._loader.destroy();
            }
            this.prepare(config, true);
            this._loader.start();
        } else {
            this.data = config.data || config;
        }

        return this;
    };

    Sound.prototype.play = function play(delay, offset) {
        var _this2 = this;

        if (!this._source || this._isTouchLocked) {
            this._playWhenReady = function () {
                if (_this2._source) {
                    _this2.play(delay, offset);
                }
            };
            if (!!this._config.deferLoad) {
                if (!this._loader) {
                    this.prepare(null, true);
                }
                this._loader.start(true);
            }
            return this;
        }
        this._playWhenReady = null;
        this._effects.setSource(this._source.sourceNode);

        if (this._offset && typeof offset === 'undefined') {
            offset = this._offset;
            this._offset = 0;
        }

        this._source.play(delay, offset);

        if (this._source.hasOwnProperty('volume')) {
            this._source.volume = this._gain.gain.value;
        }

        if (this._source.hasOwnProperty('loop')) {
            this._source.loop = this._loop;
        }

        this.emit('play', this);

        return this;
    };

    Sound.prototype.pause = function pause() {
        this._source && this._source.pause();
        this.emit('pause', this);
        return this;
    };

    Sound.prototype.stop = function stop(delay) {
        this._source && this._source.stop(delay || 0);
        this.emit('stop', this);
        return this;
    };

    Sound.prototype.seek = function seek(value) {
        this.currentTime = value;
        return this;
    };

    Sound.prototype.fade = function fade(volume) {
        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        if (!this._source) {
            return this;
        }

        var param = this._gain.gain;

        if (this._context && !this._context.isFake && !_firefox2.default) {
            var time = this._context.currentTime;
            param.cancelScheduledValues(time);
            param.setValueAtTime(param.value, time);
            param.linearRampToValueAtTime(volume, time + duration);
        } else {
            this._fadePolyfill(volume, duration);
        }

        this.emit('fade', this, volume);

        return this;
    };

    Sound.prototype._fadePolyfill = function _fadePolyfill(toVolume, duration) {
        var _this3 = this;

        var ramp = function ramp(value, step) {
            _this3._fadeTimeout = window.setTimeout(function () {
                _this3.volume = _this3.volume + (value - _this3.volume) * 0.2;
                if (Math.abs(_this3.volume - value) > 0.05) {
                    ramp(value, step);
                    return;
                }
                _this3.volume = value;
            }, step * 1000);
        };

        window.clearTimeout(this._fadeTimeout);
        ramp(toVolume, duration / 10);

        return this;
    };

    Sound.prototype.unload = function unload() {
        this._source && this._source.destroy();
        this._loader && this._loader.destroy();
        this._data = null;
        this._playWhenReady = null;
        this._source = null;
        this._loader = null;
        this._config.deferLoad = true;
        this.emit('unload', this);
    };

    Sound.prototype.reload = function reload() {
        return this.load(null, true);
    };

    Sound.prototype.destroy = function destroy() {
        this._source && this._source.destroy();
        this._effects && this._effects.destroy();
        this._gain && this._gain.disconnect();
        if (this._loader) {
            this._loader.off('loaded');
            this._loader.off('error');
            this._loader.destroy();
        }
        this._gain = null;
        this._context = null;
        this._destination = null;
        this._data = null;
        this._playWhenReady = null;
        this._source = null;
        this._effects = null;
        this._loader = null;
        this._config = null;
        this.emit('destroy', this);
        this.off();
    };

    Sound.prototype.waveform = function waveform(length) {
        var _this4 = this;

        if (!this._wave) {
            this._wave = _utils2.default.waveform();
        }
        if (!this._data) {
            this.once('ready', function () {
                return _this4._wave(_this4._data, length);
            });
        }
        return this._wave(this._data, length);
    };

    Sound.prototype._createSource = function _createSource(data) {
        var isAudioBuffer = _file2.default.isAudioBuffer(data);
        if (isAudioBuffer || _file2.default.isMediaElement(data)) {
            var Fn = isAudioBuffer ? _bufferSource2.default : _mediaSource2.default;
            this._source = new _audioSource2.default(Fn, data, this._context, this._onEnded);
            this._source.singlePlay = !!this._config.singlePlay;
            this._source.playbackRate = this._playbackRate;
            this._source.currentTime = this._offset;
        } else if (_file2.default.isMediaStream(data)) {
            this._source = new _microphoneSource2.default(data, this._context);
        } else if (_file2.default.isOscillatorType(data && data.type || data)) {
            this._source = new _oscillatorSource2.default(data.type || data, this._context);
        } else {
            throw new Error('Cannot detect data type: ' + data);
        }

        this._effects.setSource(this._source.sourceNode);

        this.emit('ready', this);

        if (this._playWhenReady) {
            this._playWhenReady();
        }
    };

    Sound.prototype._onEnded = function _onEnded() {
        this.emit('ended', this);
    };

    Sound.prototype._onLoad = function _onLoad(data) {
        this._data = data;
        this.emit('loaded', this);
        this._createSource(data);
    };

    Sound.prototype._onLoadError = function _onLoadError(err) {
        if (this.listenerCount('error')) {
            this.emit('error', this, err);
            return;
        }
        console.error('Sound load error', this._loader.url);
    };

    (0, _createClass3.default)(Sound, [{
        key: 'context',
        get: function get() {
            return this._context;
        }
    }, {
        key: 'currentTime',
        get: function get() {
            return this._source ? this._source.currentTime : this._offset;
        },
        set: function set(value) {
            if (this._source) {
                var playing = this._source.playing;
                this._source.stop();
                this._source.currentTime = value;
                if (playing) {
                    this.play(0, value);
                }
            } else {
                this._offset = value;
            }
        }
    }, {
        key: 'data',
        get: function get() {
            return this._data;
        },
        set: function set(value) {
            if (!value) {
                return;
            }
            this._data = value;
            this._createSource(value);
        }
    }, {
        key: 'duration',
        get: function get() {
            return this._source ? this._source.duration : 0;
        }
    }, {
        key: 'effects',
        get: function get() {
            return this._effects._nodes;
        },
        set: function set(value) {
            this._effects.removeAll().add(value);
        }
    }, {
        key: 'fx',
        get: function get() {
            return this.effects;
        },
        set: function set(value) {
            this.effects = value;
        }
    }, {
        key: 'ended',
        get: function get() {
            return !!this._source && this._source.ended;
        }
    }, {
        key: 'frequency',
        get: function get() {
            return this._source ? this._source.frequency : 0;
        },
        set: function set(value) {
            if (this._source && this._source.hasOwnProperty('frequency')) {
                this._source.frequency = value;
            }
        }
    }, {
        key: 'gain',
        get: function get() {
            return this._gain;
        }

        // for media element source

    }, {
        key: 'groupVolume',
        get: function get() {
            return this._source.groupVolume;
        },
        set: function set(value) {
            if (this._source && this._source.hasOwnProperty('groupVolume')) {
                this._source.groupVolume = value;
            }
        }
    }, {
        key: 'isTouchLocked',
        set: function set(value) {
            this._isTouchLocked = value;
            if (this._loader) {
                this._loader.isTouchLocked = value;
            }
            if (!value && this._playWhenReady) {
                this._playWhenReady();
            }
        }
    }, {
        key: 'loader',
        get: function get() {
            return this._loader;
        }
    }, {
        key: 'loop',
        get: function get() {
            return this._loop;
        },
        set: function set(value) {
            this._loop = !!value;

            if (this._source && this._source.hasOwnProperty('loop') && this._source.loop !== this._loop) {
                this._source.loop = this._loop;
            }
        }
    }, {
        key: 'singlePlay',
        get: function get() {
            return this._config.singlePlay;
        },
        set: function set(value) {
            this._config.singlePlay = value;
            this._source.singlePlay = value;
        }
    }, {
        key: 'config',
        get: function get() {
            return this._config;
        }
    }, {
        key: 'paused',
        get: function get() {
            return !!this._source && this._source.paused;
        }
    }, {
        key: 'playing',
        get: function get() {
            return !!this._source && this._source.playing;
        }
    }, {
        key: 'playbackRate',
        get: function get() {
            return this._playbackRate;
        },
        set: function set(value) {
            this._playbackRate = value;
            if (this._source) {
                this._source.playbackRate = value;
            }
        }
    }, {
        key: 'progress',
        get: function get() {
            return this._source ? this._source.progress || 0 : 0;
        }
    }, {
        key: 'sourceInfo',
        get: function get() {
            return this._source && this._source.info ? this._source.info : {};
        }
    }, {
        key: 'sourceNode',
        get: function get() {
            return this._source ? this._source.sourceNode : null;
        }
    }, {
        key: 'volume',
        get: function get() {
            return this._gain.gain.value;
        },
        set: function set(value) {
            if (!(0, _isSafeNumber2.default)(value)) {
                return;
            }

            window.clearTimeout(this._fadeTimeout);

            value = Math.min(Math.max(value, 0), 1);

            var param = this._gain.gain;
            var time = this._context.currentTime;
            param.cancelScheduledValues(time);
            param.value = value;
            if (!_firefox2.default) {
                param.setValueAtTime(value, time);
            }

            if (this._source && this._source.hasOwnProperty('volume')) {
                this._source.volume = value;
            }
        }
    }, {
        key: 'userData',
        get: function get() {
            return this._userData;
        }
    }]);
    return Sound;
}(_emitter2.default);

// expose for unit tests


exports.default = Sound;
Sound.__source = {
    BufferSource: _bufferSource2.default,
    MediaSource: _mediaSource2.default,
    MicrophoneSource: _microphoneSource2.default,
    OscillatorSource: _oscillatorSource2.default
};