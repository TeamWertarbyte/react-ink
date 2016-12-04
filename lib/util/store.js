'use strict';

/**
 * Ink Store
 * Keeps track of changes to ripple epicenters
 * so that <Ink /> can focus on rendering them.
 */

var Equations = require('./equations');

var killStale = function killStale(_ref) {
  var mouseUp = _ref.mouseUp,
      duration = _ref.duration;
  return !mouseUp || Date.now() - mouseUp < duration;
};

module.exports = function (publicize) {
  var _data = [];
  var _playing = false;
  var _frame = void 0;

  var Store = {
    each: function each(callback, scope) {
      for (var i = 0, l = _data.length; i < l; i++) {
        callback.call(scope, _data[i]);
      }
    },
    play: function play() {
      if (!_playing) {
        _playing = true;
        Store.update();
      }
    },
    stop: function stop() {
      _playing = false;
      cancelAnimationFrame(_frame);
    },
    getTotalOpacity: function getTotalOpacity(opacity) {
      var answer = 0;

      for (var i = 0, l = _data.length; i < l; i++) {
        answer += Equations.getBlotOuterOpacity(_data[i], opacity);
      }

      return answer;
    },
    update: function update() {
      _data = _data.filter(killStale);

      if (_data.length) {
        _frame = requestAnimationFrame(Store.update);
        publicize();
      } else {
        Store.stop();
      }
    },
    add: function add(props) {
      _data.push(props);
      Store.play();
    },
    release: function release(time) {
      for (var i = _data.length - 1; i >= 0; i--) {
        if (!_data[i].mouseUp) {
          return _data[i].mouseUp = time;
        }
      }
    }
  };

  return Store;
};