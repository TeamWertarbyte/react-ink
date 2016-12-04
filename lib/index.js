'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Ink
 * Fills a container with an SVG object that provides feedback on mouse/touch
 * events with a rippling pool.
 */

var HAS_TOUCH = require('./util/hasTouch');
var MOUSE_LEFT = 0;
var pixelRatio = require('./util/pixelRatio');
var React = require('react');
var STYLE = require('./style');
var Store = require('./util/store');
var Types = React.PropTypes;
var TAU = Math.PI * 2;
var Equations = require('./util/equations');
var Pure = require('./util/pure');

var Ink = React.createClass({
  displayName: 'Ink',


  shouldComponentUpdate: Pure,

  propTypes: {
    background: Types.bool,
    duration: Types.number,
    opacity: Types.number,
    radius: Types.number,
    recenter: Types.bool,
    hasTouch: Types.bool,
    color: Types.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      background: true,
      color: '#FFFFFF',
      duration: 1000,
      opacity: 0.25,
      radius: 150,
      recenter: true,
      hasTouch: HAS_TOUCH
    };
  },
  getInitialState: function getInitialState() {
    return {
      density: 1,
      height: 0,
      store: Store(this.tick),
      touchEvents: this.touchEvents(),
      width: 0
    };
  },
  touchEvents: function touchEvents() {
    if (this.props.hasTouch) {
      return {
        onTouchStart: this._onPress,
        onTouchEnd: this._onRelease,
        onTouchCancel: this._onRelease,
        onTouchLeave: this._onRelease
      };
    } else {
      return {
        onMouseDown: this._onPress,
        onMouseUp: this._onRelease,
        onMouseLeave: this._onRelease
      };
    }
  },
  tick: function tick() {
    var _state = this.state,
        ctx = _state.ctx,
        density = _state.density,
        height = _state.height,
        width = _state.width,
        store = _state.store;


    ctx.save();

    ctx.scale(density, density);

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = this.props.color;

    if (this.props.background) {
      ctx.globalAlpha = store.getTotalOpacity(this.props.opacity);
      ctx.fillRect(0, 0, width, height);
    }

    store.each(this.makeBlot, this);

    ctx.restore();
  },
  makeBlot: function makeBlot(blot) {
    var _state2 = this.state,
        ctx = _state2.ctx,
        height = _state2.height,
        width = _state2.width;
    var x = blot.x,
        y = blot.y,
        radius = blot.radius;


    ctx.globalAlpha = Equations.getBlotOpacity(blot, this.props.opacity);
    ctx.beginPath();

    if (this.props.recenter) {
      var size = Math.max(height, width);

      x += Equations.getBlotShiftX(blot, size, width);
      y += Equations.getBlotShiftY(blot, size, height);
    }

    ctx.arc(x, y, radius * Equations.getBlotScale(blot), 0, TAU);

    ctx.closePath();
    ctx.fill();
  },
  componentWillUnmount: function componentWillUnmount() {
    this.state.store.stop();
  },
  pushBlot: function pushBlot(timeStamp, clientX, clientY) {
    var _this = this;

    var el = this.refs.canvas;

    // 0.13 support
    if (el instanceof window.HTMLCanvasElement === false) {
      el = el.getDOMNode();
    }

    var _el$getBoundingClient = el.getBoundingClientRect(),
        top = _el$getBoundingClient.top,
        bottom = _el$getBoundingClient.bottom,
        left = _el$getBoundingClient.left,
        right = _el$getBoundingClient.right;

    var ctx = this.state.ctx || el.getContext('2d');
    var density = pixelRatio(ctx);
    var height = bottom - top;
    var width = right - left;
    var radius = this.props.radius;
    if (this.props.radius === Ink.getDefaultProps().radius) radius = Equations.getMaxRadius(height, width, this.props.radius);

    this.setState({ ctx: ctx, density: density, height: height, width: width }, function () {
      _this.state.store.add({
        duration: _this.props.duration,
        mouseDown: timeStamp,
        mouseUp: 0,
        radius: radius,
        x: clientX - left,
        y: clientY - top
      });
    });
  },
  render: function render() {
    var _state3 = this.state,
        density = _state3.density,
        height = _state3.height,
        width = _state3.width,
        touchEvents = _state3.touchEvents;


    return React.createElement('canvas', _extends({ className: 'ink',
      ref: 'canvas',
      style: _extends({}, STYLE, this.props.style),
      height: height * density,
      width: width * density,
      onDragOver: this._onRelease
    }, touchEvents));
  },
  _onPress: function _onPress(e) {
    var button = e.button,
        ctrlKey = e.ctrlKey,
        clientX = e.clientX,
        clientY = e.clientY,
        changedTouches = e.changedTouches;

    var timeStamp = Date.now();

    if (changedTouches) {
      for (var i = 0; i < changedTouches.length; i++) {
        var _changedTouches$i = changedTouches[i],
            _clientX = _changedTouches$i.clientX,
            _clientY = _changedTouches$i.clientY;

        this.pushBlot(timeStamp, _clientX, _clientY);
      }
    } else if (button === MOUSE_LEFT && !ctrlKey) {
      this.pushBlot(timeStamp, clientX, clientY);
    }
  },
  _onRelease: function _onRelease() {
    this.state.store.release(Date.now());
  }
});

module.exports = Ink;