"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _languages = require("./languages");

var languages = _interopRequireWildcard(_languages);

var _log4js = require("log4js");

var log4js = _interopRequireWildcard(_log4js);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

log4js.configure({
    appenders: {
        'out': {
            type: 'console',
            layout: {
                type: 'coloured'
            }
        }
    },
    categories: {
        default: {
            appenders: ['out'],
            level: 'debug'
        }
    }
});

var logger = log4js.getLogger();

String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};

// For user version preferences
var Datastore = require("nedb"); // for some reason this is unimportable
var db = new Datastore({
    filename: './databases/db',
    autoload: true,
    corruptAlertThreshold: 1
});

var versionDB = new Datastore({
    filename: './databases/versiondb',
    autoload: true
});

exports.default = {
    languages: languages,
    db: db,
    versionDB: versionDB,
    splitter: function splitter(s) {
        var middle = Math.floor(s.length / 2);
        var before = s.lastIndexOf(' <', middle);
        var after = s.indexOf(' <', middle + 1);

        if (before == -1 || after != -1 && middle - before >= after - middle) {
            middle = after;
        } else {
            middle = before;
        }

        var first = s.substr(0, middle);
        var second = s.substr(middle + 1);

        return {
            "first": first,
            "second": second
        };
    },
    capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    logMessage: function logMessage(level, sender, channel, message) {
        var content = "<" + sender + "@" + channel + "> " + message;

        switch (level) {
            case "debug":
                logger.debug(content);
                break;
            case "info":
                logger.info(content);
                break;
            case "err":
                logger.error(content);
                break;
            case "warn":
                logger.warn(content);
                break;
        }
    },
    setLanguage: function setLanguage(user, language, callback) {
        if (languages.isLanguage(language)) {
            db.find({
                "id": user.id
            }, function (err, doc) {
                if (doc.length > 0) {
                    db.update({
                        "id": user.id
                    }, {
                        $set: {
                            "language": language
                        }
                    }, {
                        "multi": true
                    }, function (err, docs) {
                        return callback(docs);
                    });
                } else {
                    db.insert({
                        "id": user.id,
                        "language": language
                    }, function (err, docs) {
                        return callback(docs);
                    });
                }
            });
        } else {
            callback(null);
        }
    },
    setVersion: function setVersion(user, version, callback) {
        version = version.toUpperCase();

        versionDB.find({
            "abbv": version
        }, function (err, docs) {
            if (docs.length === 0) {
                return callback(null);
            }
            db.find({
                "id": user.id
            }, function (err, doc) {
                if (doc.length > 0) {
                    db.update({
                        "id": user.id
                    }, {
                        $set: {
                            "version": version
                        }
                    }, {
                        "multi": true
                    }, function (err, docs) {
                        return callback(docs);
                    });
                } else {
                    db.insert({
                        "id": user.id,
                        "version": version
                    }, function (err, docs) {
                        return callback(docs);
                    });
                }
            });
        });
    },
    setHeadings: function setHeadings(user, headings, callback) {
        headings = headings.toLowerCase();

        if (headings != "enable" && headings != "disable") {
            return callback(null);
        }

        db.find({
            "id": user.id
        }, function (err, doc) {
            if (doc.length > 0) {
                db.update({
                    "id": user.id
                }, {
                    $set: {
                        "headings": headings
                    }
                }, {
                    "multi": true
                }, function (err, docs) {
                    return callback(docs);
                });
            } else {
                db.insert({
                    "id": user.id,
                    "headings": headings
                }, function (err, docs) {
                    return callback(docs);
                });
            }
        });
    },
    setVerseNumbers: function setVerseNumbers(user, verseNumbers, callback) {
        verseNumbers = verseNumbers.toLowerCase();

        if (verseNumbers != "enable" && verseNumbers != "disable") {
            return callback(null);
        }

        db.find({
            "id": user.id
        }, function (err, doc) {
            if (doc.length > 0) {
                db.update({
                    "id": user.id
                }, {
                    $set: {
                        "verseNumbers": verseNumbers
                    }
                }, {
                    "multi": true
                }, function (err, docs) {
                    return callback(docs);
                });
            } else {
                db.insert({
                    "id": user.id,
                    "verseNumbers": verseNumbers
                }, function (err, docs) {
                    return callback(docs);
                });
            }
        });
    },
    getVersion: function getVersion(user, callback) {
        db.find({
            "id": user.id
        }, function (err, docs) {
            if (docs.length > 0) {
                return callback(docs);
            } else {
                return callback(null);
            }
        });
    },
    getLanguage: function getLanguage(user, callback) {
        db.find({
            "id": user.id
        }, function (err, docs) {
            if (docs.length > 0) {
                return callback(languages[docs[0].language]);
            } else {
                return callback(languages.english_us);
            }
        });
    }
};