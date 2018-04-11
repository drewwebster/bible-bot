"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// that's right, we're going ES6 bay bee

var _class = function () {
    function _class(name, abbv, hasOT, hasNT, hasAPO) {
        _classCallCheck(this, _class);

        this.name = name;
        this.abbv = abbv;

        if (hasOT == "yes") {
            this.hasOT = true;
        } else {
            this.hasOT = false;
        }

        if (hasNT == "yes") {
            this.hasNT = true;
        } else {
            this.hasNT = false;
        }

        if (hasAPO == "yes") {
            this.hasAPO = true;
        } else {
            this.hasAPO = false;
        }
    }

    _createClass(_class, [{
        key: "toObject",
        value: function toObject() {
            return {
                "name": this.name,
                "abbv": this.abbv,
                "hasOT": this.hasOT,
                "hasNT": this.hasNT,
                "hasAPO": this.hasAPO
            };
        }
    }, {
        key: "toString",
        value: function toString() {
            return JSON.stringify(this.toObject());
        }
    }]);

    return _class;
}();

exports.default = _class;
;