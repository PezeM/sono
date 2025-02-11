'use strict';

exports.__esModule = true;
exports.default = AudioSource;
function AudioSource(Type, data, context, onEnded) {
    var sourceNode = context.createGain();
    var source = create(data);
    var api = {};
    var pool = [];
    var clones = [];
    var numCreated = 0;
    var singlePlay = false;

    function createSourceNode() {
        return sourceNode;
    }

    function disposeSource(src) {
        src.stop();
        if (!singlePlay) {
            pool.push(src);
        }
    }

    function onSourceEnded(src) {
        if (src !== source && clones.length) {
            var index = clones.indexOf(src);
            clones.splice(index, 1);
            disposeSource(src);
        }
        onEnded();
    }

    function create(buffer) {
        return new Type(buffer, context, onSourceEnded);
    }

    function getSource() {
        if (singlePlay || !source.playing) {
            return source;
        }

        if (pool.length > 0) {
            return pool.pop();
        }

        numCreated++;
        if (data.tagName) {
            return create(data.cloneNode());
        }
        return create(data);
    }

    function play(delay, offset) {
        var src = getSource();
        if (sourceNode) {
            src.sourceNode.connect(sourceNode);
        }
        if (src !== source) {
            clones.push(src);
        }
        src.play(delay, offset);
    }

    function stop() {
        source.stop();
        while (clones.length) {
            disposeSource(clones.pop());
        }
    }

    function pause() {
        source.pause();
        clones.forEach(function (src) {
            return src.pause();
        });
    }

    function load(url) {
        stop();
        pool.length = 0;
        source.load(url);
    }

    function destroy() {
        source.destroy();
        while (clones.length) {
            clones.pop().destroy();
        }
        while (pool.length) {
            pool.pop().destroy();
        }
        sourceNode.disconnect();
    }

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        play: {
            value: play
        },
        pause: {
            value: pause
        },
        stop: {
            value: stop
        },
        load: {
            value: load
        },
        destroy: {
            value: destroy
        },
        currentTime: {
            get: function get() {
                return source.currentTime || 0;
            },
            set: function set(value) {
                source.currentTime = value;
                clones.forEach(function (src) {
                    return src.currentTime = value;
                });
            }
        },
        duration: {
            get: function get() {
                return source.duration || 0;
            }
        },
        ended: {
            get: function get() {
                return source.ended && clones.every(function (src) {
                    return src.ended;
                });
            }
        },
        info: {
            get: function get() {
                return {
                    pooled: pool.length,
                    active: clones.length + 1,
                    created: numCreated + 1
                };
            }
        },
        loop: {
            get: function get() {
                return source.loop;
            },
            set: function set(value) {
                source.loop = !!value;
                clones.forEach(function (src) {
                    return src.loop = !!value;
                });
            }
        },
        paused: {
            get: function get() {
                return source.paused;
            }
        },
        playbackRate: {
            get: function get() {
                return source.playbackRate;
            },
            set: function set(value) {
                source.playbackRate = value;
                clones.forEach(function (src) {
                    return src.playbackRate = value;
                });
            }
        },
        playing: {
            get: function get() {
                return source.playing;
            }
        },
        progress: {
            get: function get() {
                return source.progress;
            }
        },
        singlePlay: {
            get: function get() {
                return singlePlay;
            },
            set: function set(value) {
                singlePlay = value;
            }
        },
        sourceNode: {
            get: function get() {
                return createSourceNode();
            }
        },
        volume: {
            get: function get() {
                return source.volume;
            },
            set: function set(value) {
                if (source.hasOwnProperty('volume')) {
                    source.volume = value;
                    clones.forEach(function (src) {
                        return src.volume = value;
                    });
                }
            }
        },
        groupVolume: {
            get: function get() {
                return source.groupVolume;
            },
            set: function set(value) {
                if (!source.hasOwnProperty('groupVolume')) {
                    return;
                }
                source.groupVolume = value;
                clones.forEach(function (src) {
                    return src.groupVolume = value;
                });
            }
        }
    });

    return Object.freeze(api);
}