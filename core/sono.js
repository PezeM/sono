'use strict';

exports.__esModule = true;

var _defineEnumerableProperties2 = require('babel-runtime/helpers/defineEnumerableProperties');

var _defineEnumerableProperties3 = _interopRequireDefault(_defineEnumerableProperties2);

var _effects, _effects2, _fx, _fx2, _isTouchLocked, _playInBackground, _playInBackground2, _sounds, _volume, _volume2, _sono, _mutatorMap;

require('core-js/fn/object/assign');

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _effects3 = require('./effects');

var _effects4 = _interopRequireDefault(_effects3);

var _file = require('./utils/file');

var _file2 = _interopRequireDefault(_file);

var _group = require('./group');

var _group2 = _interopRequireDefault(_group);

var _loader = require('./utils/loader');

var _loader2 = _interopRequireDefault(_loader);

var _log2 = require('./utils/log');

var _log3 = _interopRequireDefault(_log2);

var _pageVisibility = require('./utils/pageVisibility');

var _pageVisibility2 = _interopRequireDefault(_pageVisibility);

var _sound = require('./sound');

var _sound2 = _interopRequireDefault(_sound);

var _soundGroup = require('./utils/sound-group');

var _soundGroup2 = _interopRequireDefault(_soundGroup);

var _touchLock = require('./utils/touchLock');

var _touchLock2 = _interopRequireDefault(_touchLock);

var _utils = require('./utils/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VERSION = '2.1.6';
var bus = new _group2.default(_context2.default, _context2.default.destination);

/*
* Get Sound by id
*/

function get(id) {
    return bus.find(id);
}

/*
* Create group
*/

function group(sounds) {
    var soundGroup = new _soundGroup2.default(_context2.default, bus.gain);
    if (sounds) {
        sounds.forEach(function (sound) {
            return soundGroup.add(sound);
        });
    }
    return soundGroup;
}

/*
* Loading
*/

function add(config) {
    var src = _file2.default.getSupportedFile(config.src || config.url || config.data || config);
    var sound = new _sound2.default(Object.assign({}, config || {}, {
        src: src,
        context: _context2.default,
        destination: bus.gain
    }));
    sound.isTouchLocked = isTouchLocked;
    if (config) {
        sound.id = config.id || config.name || '';
        sound.loop = !!config.loop;
        sound.volume = config.volume;
        sound.effects = config.effects || [];
    }
    bus.add(sound);
    return sound;
}

function queue(config, loaderGroup) {
    var sound = add(config).prepare();

    if (loaderGroup) {
        loaderGroup.add(sound.loader);
    }
    return sound;
}

function load(config) {
    var src = config.src || config.url || config.data || config;
    var sound = void 0,
        loader = void 0;

    if (_file2.default.containsURL(src)) {
        sound = queue(config);
        loader = sound.loader;
    } else if (Array.isArray(src) && _file2.default.containsURL(src[0].src || src[0].url)) {
        sound = [];
        loader = new _loader2.default.Group();
        src.forEach(function (url) {
            return sound.push(queue(url, loader));
        });
    } else {
        var errorMessage = 'sono.load: No audio file URLs found in config.';
        if (config.onError) {
            config.onError('[ERROR] ' + errorMessage);
        } else {
            throw new Error(errorMessage);
        }
        return null;
    }
    if (config.onProgress) {
        loader.on('progress', function (progress) {
            return config.onProgress(progress);
        });
    }
    if (config.onComplete) {
        loader.once('complete', function () {
            loader.off('progress');
            config.onComplete(sound);
        });
    }
    loader.once('error', function (err) {
        loader.off('error');
        if (config.onError) {
            config.onError(err);
        } else {
            console.error(err);
        }
    });
    loader.start();

    return sound;
}

/*
* Create Sound
*
* Accepted values for param config:
* Object config e.g. { id:'foo', url:['foo.ogg', 'foo.mp3'] }
* Array (of files e.g. ['foo.ogg', 'foo.mp3'])
* ArrayBuffer
* HTMLMediaElement
* Filename string (e.g. 'foo.ogg')
* Oscillator type string (i.e. 'sine', 'square', 'sawtooth', 'triangle')
*/

function create(config) {
    // try to load if config contains URLs
    if (_file2.default.containsURL(config)) {
        return load(config);
    }

    var sound = add(config);
    sound.data = config.data || config;

    return sound;
}

/*
* Destroy
*/

function destroy(soundOrId) {
    bus.find(soundOrId, function (sound) {
        return sound.destroy();
    });
    return sono;
}

function destroyAll() {
    bus.destroy();
    return sono;
}

/*
* Controls
*/

function mute() {
    bus.mute();
    return sono;
}

function unMute() {
    bus.unMute();
    return sono;
}

function fade(volume, duration) {
    bus.fade(volume, duration);
    return sono;
}

function pauseAll() {
    bus.pause();
    return sono;
}

function resumeAll() {
    bus.resume();
    return sono;
}

function stopAll() {
    bus.stop();
    return sono;
}

function play(id, delay, offset) {
    bus.find(id, function (sound) {
        return sound.play(delay, offset);
    });
    return sono;
}

function pause(id) {
    bus.find(id, function (sound) {
        return sound.pause();
    });
    return sono;
}

function stop(id) {
    bus.find(id, function (sound) {
        return sound.stop();
    });
    return sono;
}

/*
* Mobile touch lock
*/

var isTouchLocked = (0, _touchLock2.default)(_context2.default, function () {
    isTouchLocked = false;
    bus.sounds.forEach(function (sound) {
        return sound.isTouchLocked = false;
    });
});

/*
* Page visibility events
*/

var pageHiddenPaused = [];

// pause currently playing sounds and store refs
function onHidden() {
    bus.sounds.forEach(function (sound) {
        if (sound.playing) {
            sound.pause();
            pageHiddenPaused.push(sound);
        }
    });
}

// play sounds that got paused when page was hidden
function onShown() {
    while (pageHiddenPaused.length) {
        pageHiddenPaused.pop().play();
    }
}

var pageVis = (0, _pageVisibility2.default)(onHidden, onShown);

function register(name, fn) {
    var attachTo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _effects4.default.prototype;

    attachTo[name] = fn;
    sono[name] = fn;

    return fn;
}

var sono = (_sono = {
    canPlay: _file2.default.canPlay,
    context: _context2.default,
    create: create,
    createGroup: group,
    createSound: create,
    destroyAll: destroyAll,
    destroy: destroy,
    effects: bus.effects,
    extensions: _file2.default.extensions,
    fade: fade,
    file: _file2.default,
    gain: bus.gain,
    getOfflineContext: _utils2.default.getOfflineContext,
    get: get,
    getSound: get,
    group: group,
    hasWebAudio: !_context2.default.isFake,
    isSupported: _file2.default.extensions.length > 0,
    load: load,
    log: function log() {
        return (0, _log3.default)(sono);
    },
    mute: mute,
    pause: pause,
    pauseAll: pauseAll,
    play: play,
    register: register,
    resumeAll: resumeAll,
    stop: stop,
    stopAll: stopAll,
    unMute: unMute,
    utils: _utils2.default,
    VERSION: VERSION
}, _effects = 'effects', _mutatorMap = {}, _mutatorMap[_effects] = _mutatorMap[_effects] || {}, _mutatorMap[_effects].get = function () {
    return bus.effects;
}, _effects2 = 'effects', _mutatorMap[_effects2] = _mutatorMap[_effects2] || {}, _mutatorMap[_effects2].set = function (value) {
    bus.effects.removeAll().add(value);
}, _fx = 'fx', _mutatorMap[_fx] = _mutatorMap[_fx] || {}, _mutatorMap[_fx].get = function () {
    return this.effects;
}, _fx2 = 'fx', _mutatorMap[_fx2] = _mutatorMap[_fx2] || {}, _mutatorMap[_fx2].set = function (value) {
    this.effects = value;
}, _isTouchLocked = 'isTouchLocked', _mutatorMap[_isTouchLocked] = _mutatorMap[_isTouchLocked] || {}, _mutatorMap[_isTouchLocked].get = function () {
    return isTouchLocked;
}, _playInBackground = 'playInBackground', _mutatorMap[_playInBackground] = _mutatorMap[_playInBackground] || {}, _mutatorMap[_playInBackground].get = function () {
    return !pageVis.enabled;
}, _playInBackground2 = 'playInBackground', _mutatorMap[_playInBackground2] = _mutatorMap[_playInBackground2] || {}, _mutatorMap[_playInBackground2].set = function (value) {
    pageVis.enabled = !value;

    if (!value) {
        onShown();
    }
}, _sounds = 'sounds', _mutatorMap[_sounds] = _mutatorMap[_sounds] || {}, _mutatorMap[_sounds].get = function () {
    return bus.sounds.slice(0);
}, _volume = 'volume', _mutatorMap[_volume] = _mutatorMap[_volume] || {}, _mutatorMap[_volume].get = function () {
    return bus.volume;
}, _volume2 = 'volume', _mutatorMap[_volume2] = _mutatorMap[_volume2] || {}, _mutatorMap[_volume2].set = function (value) {
    bus.volume = value;
}, _sono.__test = {
    Effects: _effects4.default,
    Group: _group2.default,
    Sound: _sound2.default
}, (0, _defineEnumerableProperties3.default)(_sono, _mutatorMap), _sono);

exports.default = sono;