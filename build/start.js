"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Discord API


var _central = require("./central");

var _central2 = _interopRequireDefault(_central);

var _discord = require("discord.js");

var Discord = _interopRequireWildcard(_discord);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _books = require("./books");

var _books2 = _interopRequireDefault(_books);

var _version2 = require("./version");

var _version3 = _interopRequireDefault(_version2);

var _bibleGateway = require("./bibleGateway");

var bibleGateway = _interopRequireWildcard(_bibleGateway);

var _rev = require("./rev");

var rev = _interopRequireWildcard(_rev);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bot = new Discord.Client();

// Other stuff


// bible modules


var availableVersions = [];

bot.on("ready", function () {
    _central2.default.logMessage("info", "global", "global", "connected");
    bot.user.setPresence({
        status: "online",
        afk: false,
        game: {
            "name": "BibleBot v" + process.env.npm_package_version,
            "url": "https://biblebot.vypr.space"
        }
    });

    _central2.default.versionDB.find({}, function (err, docs) {
        for (var i in docs) {
            availableVersions.push(docs[i].abbv);
        }
    });
});

bot.on("debug", function (debug) {
    if (_config2.default.debug) {
        _central2.default.logMessage("debug", "global", "global", debug);
    }
});

bot.on("reconnecting", function () {
    _central2.default.logMessage("info", "global", "global", "attempting to reconnect");
});

bot.on("disconnect", function () {
    _central2.default.logMessage("info", "global", "global", "disconnected");
});

bot.on("warning", function (warn) {
    _central2.default.logMessage("warn", "global", "global", warn);
});

bot.on("error", function (e) {
    _central2.default.logMessage("err", "global", "global", e);
});

bot.on("message", function (raw) {
    // taking the raw message object and making it more usable
    var rawSender = raw.author;
    var sender = rawSender.username + "#" + rawSender.discriminator;
    var channel = raw.channel;
    var guild = raw.guild;
    var msg = raw.content;
    var source = void 0;

    if (_config2.default.debug) {
        // TODO: Replace this with user IDs.
        switch (sender) {
            case "vipr#4035":
                break;
            default:
                break;
        }
    }

    _central2.default.getLanguage(rawSender, function (language) {
        if (typeof language == "undefined") {
            language = _central2.default.languages.english_us;
        }

        if (typeof channel.guild != "undefined" && typeof channel.name != "undefined") {
            source = channel.guild.name + "#" + channel.name;
        } else {
            source = "unknown (direct messages?)";
        }

        if (sender == _config2.default.botname) return;
        if (source.includes("Discord Bots") && raw.author.id != _config2.default.owner) return;

        // for verse arrays
        var alphabet = "abcdef";

        if (msg == "+joseph") {
            channel.send("Jesus never consecrated peanut butter and jelly sandwiches and Coca-Cola!");
        } else if (msg == "+jepekula") {
            _central2.default.getVersion(rawSender, function (data) {
                var version = language.defversion;
                var headings = "enable";
                var verseNumbers = "enable";

                if (data) {
                    if (data[0].hasOwnProperty('version')) {
                        version = data[0].version;
                    }
                    if (data[0].hasOwnProperty('headings')) {
                        headings = data[0].headings;
                    }
                    if (data[0].hasOwnProperty('verseNumbers')) {
                        verseNumbers = data[0].verseNumbers;
                    }
                }

                bibleGateway.getResult("Mark 9:23-24", version, headings, verseNumbers).then(function (result) {
                    result.forEach(function (object) {
                        var content = "```Dust\n" + object.title + "\n\n" + object.text + "```";

                        var responseString = "**" + object.passage + " - " + object.version + "**\n\n" + content;

                        if (responseString.length < 2000) {
                            _central2.default.logMessage("info", sender, source, "+jepekula");
                            channel.send(responseString);
                        }
                    });
                }).catch(function (err) {
                    _central2.default.logMessage("err", "global", "bibleGateway", err);
                });
            });
        } else if (msg == "+supporters") {
            _central2.default.logMessage("info", sender, source, "+supporters");
            channel.send("A special thank you to CHAZER2222, Jepekula, Joseph, Soku, and anonymous donors for financially supporting BibleBot! <3");
        } else if (msg == "+" + language.rawobj.commands.invite) {
            _central2.default.logMessage("info", sender, source, "+invite");
            channel.send("https://discordapp.com/oauth2/authorize?client_id=361033318273384449&scope=bot&permissions=0");
        } else if (msg == "+" + language.rawobj.commands.leave && raw.author.id == _config2.default.owner) {
            _central2.default.logMessage("info", sender, source, "+leave");

            try {
                if (guild !== undefined) {
                    guild.leave();
                }
            } catch (e) {
                channel.send(e);
            }
        } else if (msg.startsWith("+" + language.rawobj.commands.announce + " ") && raw.author.id == _config2.default.owner) {
            bot.guilds.forEach(function (value) {
                if (value.name == "Discord Bots" || value.name == "Discord Bot List") return;

                var sent = false;
                var ch = value.channels.findAll("type", "text");
                var preferred = ["misc", "bots", "meta", "hangout", "fellowship", "lounge", "congregation", "general", "taffer", "family_text", "staff"];

                var _loop = function _loop(i) {
                    if (!sent) {
                        var receiver = ch.find(function (val) {
                            return val.name === preferred[i];
                        });

                        if (receiver) {
                            receiver.send(msg.replace("+" + language.rawobj.commands.announce + " ", "")).catch(function () {
                                // do nothing
                            });

                            sent = true;
                        }
                    }
                };

                for (var i = 0; i < preferred.length; i++) {
                    _loop(i);
                }
            });

            channel.send("Done.");
            _central2.default.logMessage("info", sender, source, "+announce");
        } else if (msg.startsWith("+" + language.rawobj.commands.puppet + " ") && raw.author.id == _config2.default.owner) {
            // requires manage messages permission (optional)
            raw.delete().then(function (msg) {
                return _central2.default.logMessage("info", sender, source, msg);
            }).catch(function (msg) {
                return _central2.default.logMessage("info", sender, source, msg);
            });
            channel.send(msg.replaceAll("+" + language.rawobj.commands.puppet + " ", ""));
        } else if (msg.startsWith("+eval") && rawSender.id == _config2.default.owner) {
            try {
                _central2.default.logMessage("info", sender, source, "+eval");

                var argument = msg.replace("+eval ", "");

                if (argument.indexOf("bot.token") > -1) {
                    throw "I refuse to process anything with bot.token for " + "the sake of bot security.";
                }

                channel.send(eval(argument));
            } catch (e) {
                channel.send("[error] " + e);
            }
        } else if (msg == "+" + language.rawobj.commands.allusers) {
            var users = bot.users;
            var processed = 0;

            users.forEach(function (value) {
                if (!value.bot) {
                    processed++;
                }
            });

            _central2.default.logMessage("info", sender, source, "+allusers");
            channel.send(language.rawobj.allusers + ": " + processed.toString());
        } else if (msg == "+" + language.rawobj.commands.users) {
            if (guild) {
                var _users = guild.members.size;

                guild.members.forEach(function (v) {
                    if (v.user.bot) _users--;
                });

                _central2.default.logMessage("info", sender, source, "+users");
                channel.send(language.rawobj.users + ": " + _users.toString());
            } else {
                _central2.default.logMessage("info", sender, source, "failed +users");
                channel.send(language.rawobj.usersfailed);
            }
        } else if (msg == "+" + language.rawobj.commands.listservers) {
            var count = bot.guilds.size.toString();
            _central2.default.logMessage("info", sender, source, "+listservers");
            channel.send(language.rawobj.listservers.replace("<count>", count));
        } else if (msg == "+" + language.rawobj.commands.biblebot) {
            _central2.default.logMessage("info", sender, source, "+biblebot");

            var response = language.rawobj.biblebot;
            response = response.replace("<biblebotversion>", process.env.npm_package_version);
            response = response.replace("<setversion>", language.rawobj.commands.setversion);
            response = response.replace("<version>", language.rawobj.commands.version);
            response = response.replace("<versions>", language.rawobj.commands.versions);
            response = response.replace("<versioninfo>", language.rawobj.commands.versioninfo);
            response = response.replace("<votd>", language.rawobj.commands.votd);
            response = response.replace("<verseoftheday>", language.rawobj.commands.verseoftheday);
            response = response.replace("<random>", language.rawobj.commands.random);
            response = response.replace("<biblebot>", language.rawobj.commands.biblebot);
            response = response.replace("<addversion>", language.rawobj.commands.addversion);
            response = response.replace("<av>", language.rawobj.commands.av);
            response = response.replace("<versenumbers>", language.rawobj.commands.versenumbers);
            response = response.replace("<headings>", language.rawobj.commands.headings);
            response = response.replace("<puppet>", language.rawobj.commands.puppet);
            response = response.replace("<setlanguage>", language.rawobj.commands.setlanguage);
            response = response.replace("<language>", language.rawobj.commands.language);
            response = response.replace("<languages>", language.rawobj.commands.languages);
            response = response.replaceAll("<enable>", language.rawobj.arguments.enable);
            response = response.replaceAll("<disable>", language.rawobj.arguments.disable);
            response = response.replace("<allusers>", language.rawobj.commands.allusers);
            response = response.replace("<users>", language.rawobj.commands.users);
            response = response.replace("<usersindb>", language.rawobj.commands.usersindb);
            response = response.replace("<listservers>", language.rawobj.commands.listservers);
            response = response.replace("<invite>", language.rawobj.commands.invite);

            response += "\n\n---\n";

            var second = "**Help BibleBot's development and hosting by becoming a patron on Patreon! See <https://patreon.com/BibleBot> for more information!**";
            second += "\n---\n\nJoin the BibleBot Discord server! Invite: <https://discord.gg/Ssn8KNv>\nSee <https://biblebot.vypr.space/copyrights> for any copyright-related information.";

            channel.send(response);
            channel.send(second);
        } else if (msg == "+" + language.rawobj.commands.random) {
            _central2.default.getVersion(rawSender, function (data) {
                var version = language.defversion;
                var headings = "enable";
                var verseNumbers = "enable";

                if (data) {
                    if (data[0].hasOwnProperty('version')) {
                        version = data[0].version;
                    }
                    if (data[0].hasOwnProperty('headings')) {
                        headings = data[0].headings;
                    }
                    if (data[0].hasOwnProperty('verseNumbers')) {
                        verseNumbers = data[0].verseNumbers;
                    }
                }

                bibleGateway.getRandomVerse(version, headings, verseNumbers).then(function (result) {
                    _central2.default.logMessage("info", sender, source, "+random");
                    channel.send(result);
                });
            });
        } else if (msg == "+" + language.rawobj.commands.verseoftheday || msg == "+" + language.rawobj.commands.votd) {
            _central2.default.getVersion(rawSender, function (data) {
                var version = language.defversion;
                var headings = "enable";
                var verseNumbers = "enable";

                if (data) {
                    if (data[0].hasOwnProperty('version')) {
                        version = data[0].version;
                    }
                    if (data[0].hasOwnProperty('headings')) {
                        headings = data[0].headings;
                    }
                    if (data[0].hasOwnProperty('verseNumbers')) {
                        verseNumbers = data[0].verseNumbers;
                    }
                }

                bibleGateway.getVOTD(version, headings, verseNumbers).then(function (result) {
                    if (result == "too long") {
                        channel.send(language.rawobj.passagetoolong);
                        return;
                    }

                    _central2.default.logMessage("info", sender, source, "+votd");
                    channel.send(result);
                });
            });
        } else if (msg.startsWith("+" + language.rawobj.commands.setversion)) {
            if (msg.split(" ").length != 2) {
                _central2.default.versionDB.find({}, function (err, docs) {
                    var chatString = "";
                    for (var i in docs) {
                        chatString += docs[i].abbv + ", ";
                    }

                    _central2.default.logMessage("info", sender, source, "empty +setversion sent");
                    raw.reply("**" + language.rawobj.setversionfail + ":**\n```" + chatString.slice(0, -2) + "```");
                });
                return;
            } else {
                _central2.default.setVersion(rawSender, msg.split(" ")[1], function (data) {
                    if (data) {
                        _central2.default.logMessage("info", sender, source, "+setversion " + msg.split(" ")[1]);
                        raw.reply("**" + language.rawobj.setversionsuccess + "**");
                    } else {
                        _central2.default.versionDB.find({}, function (err, docs) {
                            var chatString = "";
                            for (var i in docs) {
                                chatString += docs[i].abbv + ", ";
                            }

                            _central2.default.logMessage("info", sender, source, "failed +setversion");
                            raw.reply("**" + language.rawobj.setversionfail + ":**\n```" + chatString.slice(0, -2) + "```");
                        });
                    }
                });
            }

            return;
        } else if (msg.startsWith("+" + language.rawobj.commands.headings)) {
            if (msg.split(" ").length != 2) {
                _central2.default.logMessage("info", sender, source, "empty +headings sent");

                var _response = language.rawobj.headingsfail;

                _response = _response.replace("<headings>", language.rawobj.commands.headings);
                _response = _response.replace("<headings>", language.rawobj.commands.headings);
                _response = _response.replace("<enable>", language.rawobj.arguments.enable);
                _response = _response.replace("<disable>", language.rawobj.arguments.disable);

                raw.reply("**" + _response + "**");
            } else {
                var option = void 0;

                switch (msg.split(" ")[1]) {
                    case language.rawobj.arguments.enable:
                        option = "enable";
                        break;
                    case language.rawobj.arguments.disable:
                        option = "disable";
                        break;
                    default:
                        option = null;
                        break;
                }

                if (option !== null) {
                    _central2.default.setHeadings(rawSender, option, function (data) {
                        if (data) {
                            _central2.default.logMessage("info", sender, source, "+headings " + option);
                            var _response2 = language.rawobj.headingssuccess;
                            _response2 = _response2.replace("<headings>", language.rawobj.commands.headings);

                            raw.reply("**" + _response2 + "**");
                        } else {
                            _central2.default.logMessage("info", sender, source, "failed +headings");

                            var _response3 = language.rawobj.headingsfail;

                            _response3 = _response3.replace("<headings>", language.rawobj.commands.headings);
                            _response3 = _response3.replace("<headings>", language.rawobj.commands.headings);
                            _response3 = _response3.replace("<enable>", language.rawobj.arguments.enable);
                            _response3 = _response3.replace("<disable>", language.rawobj.arguments.disable);

                            raw.reply("**" + _response3 + "**");
                        }
                    });
                } else {
                    _central2.default.logMessage("info", sender, source, "failed +headings");

                    var _response4 = language.rawobj.headingsfail;

                    _response4 = _response4.replace("<headings>", language.rawobj.commands.headings);
                    _response4 = _response4.replace("<headings>", language.rawobj.commands.headings);
                    _response4 = _response4.replace("<enable>", language.rawobj.arguments.enable);
                    _response4 = _response4.replace("<disable>", language.rawobj.arguments.disable);

                    raw.reply("**" + _response4 + "**");
                }
            }

            return;
        } else if (msg.startsWith("+" + language.rawobj.commands.versenumbers)) {
            if (msg.split(" ").length != 2) {
                _central2.default.logMessage("info", sender, source, "empty +versenumbers sent");

                var _response5 = language.rawobj.versenumbersfail;

                _response5 = _response5.replace("<versenumbers>", language.rawobj.commands.versenumbers);
                _response5 = _response5.replace("<versenumbers>", language.rawobj.commands.versenumbers);
                _response5 = _response5.replace("<enable>", language.rawobj.arguments.enable);
                _response5 = _response5.replace("<disable>", language.rawobj.arguments.disable);

                raw.reply("**" + _response5 + "**");
            } else {
                var _option = void 0;

                switch (msg.split(" ")[1]) {
                    case language.rawobj.arguments.enable:
                        _option = "enable";
                        break;
                    case language.rawobj.arguments.disable:
                        _option = "disable";
                        break;
                    default:
                        _option = null;
                        break;
                }

                if (_option !== null) {
                    _central2.default.setVerseNumbers(rawSender, _option, function (data) {
                        if (data) {
                            _central2.default.logMessage("info", sender, source, "+versenumbers " + _option);

                            var _response6 = language.rawobj.versenumberssuccess;
                            _response6 = _response6.replace("<versenumbers>", language.rawobj.commands.versenumbers);

                            raw.reply("**" + _response6 + "**");
                        } else {
                            _central2.default.logMessage("info", sender, source, "failed +versenumbers");

                            var _response7 = language.rawobj.versenumbersfail;

                            _response7 = _response7.replace("<versenumbers>", language.rawobj.commands.versenumbers);
                            _response7 = _response7.replace("<versenumbers>", language.rawobj.commands.versenumbers);
                            _response7 = _response7.replace("<enable>", language.rawobj.arguments.enable);
                            _response7 = _response7.replace("<disable>", language.rawobj.arguments.disable);

                            raw.reply("**" + _response7 + "**");
                        }
                    });
                } else {
                    _central2.default.logMessage("info", sender, source, "failed +versenumbers");

                    var _response8 = language.rawobj.versenumbersfail;

                    _response8 = _response8.replace("<versenumbers>", language.rawobj.commands.versenumbers);
                    _response8 = _response8.replace("<versenumbers>", language.rawobj.commands.versenumbers);
                    _response8 = _response8.replace("<enable>", language.rawobj.arguments.enable);
                    _response8 = _response8.replace("<disable>", language.rawobj.arguments.disable);

                    raw.reply("**" + _response8 + "**");
                }
            }

            return;
        } else if (msg == "+" + language.rawobj.commands.version) {
            _central2.default.getVersion(rawSender, function (data) {
                _central2.default.logMessage("info", sender, source, "+version");

                if (data) {
                    if (data[0].version) {
                        if (data[0].version == "HWP") data[0].version = "NRSV";
                        var _response9 = language.rawobj.versionused;

                        _response9 = _response9.replace("<version>", data[0].version);
                        _response9 = _response9.replace("<setversion>", language.rawobj.commands.setversion);

                        raw.reply("**" + _response9 + ".**");
                    } else {
                        var _response10 = language.rawobj.noversionused;

                        _response10 = _response10.replace("<setversion>", language.rawobj.commands.setversion);

                        raw.reply("**" + _response10 + "**");
                    }
                } else {
                    var _response11 = language.rawobj.noversionused;

                    _response11 = _response11.replace("<setversion>", language.rawobj.commands.setversion);

                    raw.reply("**" + _response11 + "**");
                }
            });

            return;
        } else if (msg == "+" + language.rawobj.commands.versions) {
            _central2.default.versionDB.find({}, function (err, docs) {
                var chatString = "";
                for (var i in docs) {
                    chatString += docs[i].abbv + ", ";
                }

                _central2.default.logMessage("info", sender, source, "+versions");
                raw.reply("**" + language.rawobj.versions + ":**\n```" + chatString.slice(0, -2) + "```");
            });
        } else if (msg.startsWith("+" + language.rawobj.commands.setlanguage)) {
            if (msg.split(" ").length != 2) {
                var chatString = "";
                Object.keys(_central2.default.languages).forEach(function (key) {
                    switch (key) {
                        case "deflang":
                        case "isLanguage":
                        case "isIncomplete":
                            return;
                        default:
                            chatString += _central2.default.languages[key].name + " [" + key + "], ";
                            break;
                    }
                });

                _central2.default.logMessage("info", sender, source, "empty +setlanguage sent");
                raw.reply("**" + language.rawobj.setlanguagefail + ":**\n```" + chatString.slice(0, -2) + "```");
                return;
            } else {
                _central2.default.setLanguage(rawSender, msg.split(" ")[1], function (data) {
                    if (data) {
                        _central2.default.logMessage("info", sender, source, "+setlanguage " + msg.split(" ")[1]);
                        raw.reply("**" + language.rawobj.setlanguagesuccess + "**");
                    } else {
                        var _chatString = "";
                        Object.keys(_central2.default.languages).forEach(function (key) {
                            switch (key) {
                                case "deflang":
                                case "isLanguage":
                                case "isIncomplete":
                                    return;
                                default:
                                    _chatString += _central2.default.languages[key].name + " [" + key + "], ";
                                    break;
                            }
                        });

                        _central2.default.logMessage("info", sender, source, "failed +setlanguage");
                        raw.reply("**" + language.rawobj.setlanguagefail + ":**\n```" + _chatString.slice(0, -2) + "```");
                    }
                });
            }

            return;
        } else if (msg == "+" + language.rawobj.commands.language) {
            _central2.default.getLanguage(rawSender, function (data) {
                _central2.default.logMessage("info", sender, source, "+language");

                if (data) {
                    var _response12 = language.rawobj.languageused;

                    _response12 = _response12.replace("<setlanguage>", language.rawobj.commands.setlanguage);

                    raw.reply("**" + _response12 + "**");
                } else {
                    var _response13 = language.rawobj.languageused;

                    _response13 = _response13.replace("<setlanguage>", language.rawobj.commands.setlanguage);

                    raw.reply("**" + _response13 + "**");
                }
            });

            return;
        } else if (msg == "+" + language.rawobj.commands.languages) {
            var _chatString2 = "";
            Object.keys(_central2.default.languages).forEach(function (key) {
                switch (key) {
                    case "default": // i don't need this, but JS is being weird
                    case "isLanguage":
                    case "isIncomplete":
                        return;
                    default:
                        _chatString2 += _central2.default.languages[key].name + " [" + key + "], ";
                        break;
                }
            });

            _central2.default.logMessage("info", sender, source, "+languages");
            raw.reply("**" + language.rawobj.languages + ":**\n```" + _chatString2.slice(0, -2) + "```");
            return;
        } else if (msg.startsWith("+" + language.rawobj.commands.addversion) || msg.startsWith("+" + language.rawobj.commands.av)) {
            if (raw.author.id == _config2.default.owner) {

                var argv = msg.split(" ");
                var argc = argv.length;
                var name = "";

                // build the name string
                for (var i = 1; i < argv.length - 4; i++) {
                    name = name + argv[i] + " ";
                }

                name = name.slice(0, -1); // remove trailing space
                var abbv = argv[argc - 4];
                var hasOT = argv[argc - 3];
                var hasNT = argv[argc - 2];
                var hasAPO = argv[argc - 1];

                var object = new _version3.default(name, abbv, hasOT, hasNT, hasAPO);
                _central2.default.versionDB.insert(object.toObject(), function (err) {
                    if (err) {
                        _central2.default.logMessage("err", "versiondb", "global", err);
                        raw.reply("**" + language.rawobj.addversionfail + "**");
                    } else {
                        raw.reply("**" + language.rawobj.addversionsuccess + "**");
                    }
                });
            }
        } else if (msg.startsWith("+" + language.rawobj.commands.versioninfo)) {
            if (msg.split(" ").length == 2) {
                _central2.default.versionDB.find({
                    "abbv": msg.split(" ")[1]
                }, function (err, data) {
                    data = data; // for some reason it won't initialize properly

                    if (err) {
                        _central2.default.logMessage("err", "versiondb", "global", err);
                        raw.reply("**" + language.rawobj.versioninfofailed + "**");
                    } else if (data.length > 0) {
                        _central2.default.logMessage("info", sender, source, "+versioninfo");

                        var _response14 = language.rawobj.versioninfo;
                        _response14 = _response14.replace("<versionname>", data[0].name);

                        if (data[0].hasOT == true) _response14 = _response14.replace("<hasOT>", language.rawobj.arguments.yes);else _response14 = _response14.replace("<hasOT>", language.rawobj.arguments.no);

                        if (data[0].hasNT == true) _response14 = _response14.replace("<hasNT>", language.rawobj.arguments.yes);else _response14 = _response14.replace("<hasNT>", language.rawobj.arguments.no);

                        if (data[0].hasAPO == true) _response14 = _response14.replace("<hasAPO>", language.rawobj.arguments.yes);else _response14 = _response14.replace("<hasAPO>", language.rawobj.arguments.no);

                        raw.reply(_response14);
                    } else {
                        raw.reply("**" + language.rawobj.versioninfofailed + "**");
                    }
                });
            } else {}
        } else if (msg.includes(":") && msg.includes(" ")) {
            var _ret2 = function () {
                var spaceSplit = [];
                var bookIndexes = [];
                var bookNames = [];
                var verses = {};
                var verseCount = 0;

                if (msg.includes("-")) {
                    // tokenize the message
                    // TODO: better variable names?
                    msg.split("-").forEach(function (item) {
                        var tempSplit = item.split(":");

                        tempSplit.forEach(function (item) {
                            var tempTempSplit = item.split(" ");

                            tempTempSplit.forEach(function (item) {
                                item = item.replaceAll(/[^a-zA-Z0-9:()"'<>|\\/;*&^%$#@!.+_?=]/g, "");

                                spaceSplit.push(item);
                            });
                        });
                    });
                } else {
                    msg.split(":").forEach(function (item) {
                        var tempSplit = item.split(" ");

                        tempSplit.forEach(function (item) {
                            spaceSplit.push(item);
                        });
                    });
                }

                // because of multiple verses with the same book, this
                // must be done to ensure that its not duping itself.
                for (var _i = 0; _i < spaceSplit.length; _i++) {
                    try {
                        spaceSplit[_i] = spaceSplit[_i].replaceAll("(", "");
                        spaceSplit[_i] = spaceSplit[_i].replaceAll(")", "");
                        spaceSplit[_i] = spaceSplit[_i].replaceAll("[", "");
                        spaceSplit[_i] = spaceSplit[_i].replaceAll("]", "");
                        spaceSplit[_i] = spaceSplit[_i].replaceAll("?", "");
                        // While we're here, let's get rid of Discord Markdown formatting
                        spaceSplit[_i] = spaceSplit[_i].replaceAll("_", "");
                        spaceSplit[_i] = spaceSplit[_i].replaceAll("*", "");
                        spaceSplit[_i] = spaceSplit[_i].replaceAll("-", "");
                        spaceSplit[_i] = spaceSplit[_i].replaceAll("\\", "");
                        spaceSplit[_i] = spaceSplit[_i].replaceAll("`", "");
                        // end Discord Markdown formatting
                        spaceSplit[_i] = _central2.default.capitalizeFirstLetter(spaceSplit[_i]);
                    } catch (e) {}
                    /* it'll probably be a number anyways, if this fails */


                    // this checks if there's a numbered book
                    // TODO: Rewrite/refactor this.
                    var temp = spaceSplit[_i];
                    switch (temp) {
                        case "Sam":
                        case "Sm":
                        case "Shmuel":
                        case "Kgs":
                        case "Melachim":
                        case "Chron":
                        case "Chr":
                        case "Cor":
                        case "Thess":
                        case "Thes":
                        case "Tim":
                        case "Tm":
                        case "Pet":
                        case "Pt":
                        case "Macc":
                        case "Mac":
                        case "Esd":
                        case "Samuel":
                        case "Kings":
                        case "Chronicles":
                        case "Esdras":
                        case "Maccabees":
                        case "Corinthians":
                        case "Thessalonians":
                        case "Timothy":
                        case "Peter":
                        case "151":
                            spaceSplit[_i] = spaceSplit[_i - 1] + temp;
                            break;
                        case "Esther":
                            if (spaceSplit[_i - 1] == "Greek") {
                                spaceSplit[_i] = spaceSplit[_i - 1] + temp;
                            } else {
                                spaceSplit[_i] = "Esther";
                            }
                            break;
                        case "Jeremiah":
                            var isLetter = spaceSplit[_i - 2] + spaceSplit[_i - 1] == "LetterOf";

                            if (isLetter) {
                                spaceSplit[_i] = "LetterOfJeremiah";
                            } else {
                                spaceSplit[_i] = "Jeremiah";
                            }
                            break;
                        case "Dragon":
                            spaceSplit[_i] = spaceSplit[_i - 3] + spaceSplit[_i - 2] + spaceSplit[_i - 1] + temp;
                            break;
                        case "Men":
                        case "Youths":
                        case "Children":
                            spaceSplit[_i] = spaceSplit[_i - 5] + spaceSplit[_i - 4] + spaceSplit[_i - 3] + spaceSplit[_i - 2] + spaceSplit[_i - 1] + temp;
                            break;
                        case "Manasses":
                        case "Manasseh":
                        case "Solomon":
                        case "Songs":
                            spaceSplit[_i] = spaceSplit[_i - 2] + spaceSplit[_i - 1] + temp;
                            break;
                        case "John":
                        case "Jn":
                            var num = Number(spaceSplit[_i - 1]);
                            var bnum = !isNaN(Number(spaceSplit[_i - 1]));

                            if (spaceSplit[_i - 1] && bnum && !isNaN(num) && num > 0 && num < 4) {
                                spaceSplit[_i] = spaceSplit[_i - 1] + temp;
                            }
                            break;
                    }

                    // matches book names to the index
                    // of where they are in spaceSplit
                    var book = spaceSplit[_i].replace("<", "").replace(">", "");

                    if (_books2.default.ot[book.toLowerCase()]) {
                        bookNames.push(_books2.default.ot[book.toLowerCase()]);
                        bookIndexes.push(_i);
                    }

                    if (_books2.default.nt[book.toLowerCase()]) {
                        bookNames.push(_books2.default.nt[book.toLowerCase()]);
                        bookIndexes.push(_i);
                    }

                    if (_books2.default.apo[book.toLowerCase()]) {
                        bookNames.push(_books2.default.apo[book.toLowerCase()]);
                        bookIndexes.push(_i);
                    }
                }

                bookIndexes.forEach(function (index) {
                    var verse = [];

                    // make sure that its proper verse structure
                    // Book chapterNum:chapterVerse
                    if (isNaN(Number(spaceSplit[index + 1])) || isNaN(Number(spaceSplit[index + 2]))) {
                        return;
                    }

                    // if it's surrounded by angle brackets
                    // we want to ignore it
                    if (spaceSplit[index].indexOf("<") != -1) return;

                    var angleBracketIndexes = [];
                    for (var _i2 in spaceSplit) {
                        if (_i2 < index && spaceSplit[_i2].indexOf("<") != -1) angleBracketIndexes.push(_i2);

                        if (_i2 > index && spaceSplit[_i2].indexOf(">") != -1) angleBracketIndexes.push(_i2);
                    }

                    if (angleBracketIndexes.length == 2) if (angleBracketIndexes[0] < index && angleBracketIndexes[1] > index) return;

                    // organize our variables correctly
                    var book = spaceSplit[index];
                    var chapter = spaceSplit[index + 1];
                    var startingVerse = spaceSplit[index + 2];

                    // ignore any other angle brackets
                    // as we've already properly detected
                    // whether they surround the verse
                    try {
                        book = spaceSplit[index].replace("<", "");
                        book = book.replace(">", "");

                        chapter = spaceSplit[index + 1].replace("<", "");
                        chapter = chapter.replace(">", "");

                        startingVerse = spaceSplit[index + 2].replace("<", "");
                        startingVerse = startingVerse.replace(">", "");
                    } catch (e) {} /* this won't be a problem */

                    // this becomes our verse array
                    // ex. [ "Genesis", "1", "1" ]
                    verse.push(book);
                    verse.push(chapter);
                    verse.push(startingVerse);

                    // check if there's an ending verse
                    // if so, add it to the verse array
                    if (spaceSplit[index + 3] != undefined) {
                        if (spaceSplit[index + 3].indexOf(">") != -1) return;
                        if (!isNaN(Number(spaceSplit[index + 3]))) {
                            if (Number(spaceSplit[index + 3]) > Number(spaceSplit[index + 2])) {
                                var endingVerse = spaceSplit[index + 3].replace("<", "");
                                endingVerse = endingVerse.replace(">", "");
                                verse.push(endingVerse);
                            }
                        } else {
                            if (availableVersions.indexOf(spaceSplit[index + 3]) != -1) {
                                spaceSplit[index + 3] = spaceSplit[index + 3].toUpperCase();
                                var version = spaceSplit[index + 3].replace("<", "");
                                version = version.replace(">", "");
                                verse.push("v - " + version);
                            }
                        }
                    }

                    if (spaceSplit[index + 4] != undefined) {
                        if (isNaN(Number(spaceSplit[index + 4]))) {
                            spaceSplit[index + 4] = spaceSplit[index + 4].toUpperCase();
                            if (availableVersions.indexOf(spaceSplit[index + 4]) != -1) {
                                var _version = spaceSplit[index + 4].replace("<", "");
                                _version = _version.replace(">", "");
                                verse.push("v - " + _version);
                            }
                        } else if (spaceSplit[index + 4].indexOf(">") != -1) {
                            return;
                        }
                    }

                    // the alphabet organization may be
                    // unnecessary, but i put it in as a
                    // safeguard
                    verses[alphabet[verseCount]] = verse;
                    verseCount++;
                });

                // we don't want to flood a server
                if (verseCount > 6) {
                    var responses = ["spamming me, really?", "no spam pls", "no spam, am good bot", "be nice to me", "don't spam me, i'm a good bot", "hey buddy, get your own " + "bot to spam"];
                    var randomIndex = Math.floor(Math.random() * (4 - 0)) + 0;

                    channel.send(responses[randomIndex]);

                    _central2.default.logMessage("warn", sender, source, "spam attempt - verse count: " + verseCount);
                    return {
                        v: void 0
                    };
                }

                // lets formulate a verse reference
                // (yes, we tokenize the message, only to make
                // another verse reference; this is so we process
                // an actual verse, not something else)
                // the result of this ends up being "Genesis 1:1"
                // in line with our current example

                var _loop2 = function _loop2(_i3) {
                    var properString = void 0;
                    var verse = verses[alphabet[_i3]];

                    for (var k = 0; k < verse.length; k++) {
                        if (typeof verse[k] != "undefined") {
                            verse[k] = verse[k].replaceAll(/[^a-zA-Z0-9:]/g, "");
                        }
                    }

                    if (isNaN(Number(verse[1])) || isNaN(Number(verse[2]))) {
                        return {
                            v: {
                                v: void 0
                            }
                        };
                    }

                    if (verse.length > 4) {
                        if (isNaN(Number(verse[3]))) {
                            return {
                                v: {
                                    v: void 0
                                }
                            };
                        }
                    }

                    if (verse.length <= 3) {
                        properString = verse[0] + " " + verse[1] + ":" + verse[2];
                    } else {
                        if (verse[3] != undefined) {
                            if (verse[3].startsWith("v")) {
                                properString = verse[0] + " " + verse[1] + ":" + verse[2] + " | v: " + verse[3].substr(1);
                            }
                        }

                        if (verse[4] != undefined) {
                            if (verse[4].startsWith("v")) {
                                properString = verse[0] + " " + verse[1] + ":" + verse[2] + "-" + verse[3] + " | v: " + verse[4].substr(1);
                            } else {
                                if (verse[3].startsWith("v")) {
                                    properString = verse[0] + " " + verse[1] + ":" + verse[2] + " | v: " + verse[3].substr(1);
                                } else {
                                    properString = verse[0] + " " + verse[1] + ":" + verse[2] + "-" + verse[3];
                                }
                            }
                        }

                        if (properString === undefined) {
                            properString = verse[0] + " " + verse[1] + ":" + verse[2] + "-" + verse[3];
                        }
                    }

                    // and now we begin the descent of
                    // returning the result to the sender
                    // by getting the proper version to process
                    _central2.default.getVersion(rawSender, function (data) {
                        var version = language.defversion;
                        var headings = "enable";
                        var verseNumbers = "enable";

                        if (data) {
                            if (data[0].hasOwnProperty('version')) {
                                version = data[0].version;
                            }
                            if (data[0].hasOwnProperty('headings')) {
                                headings = data[0].headings;
                            }
                            if (data[0].hasOwnProperty('verseNumbers')) {
                                verseNumbers = data[0].verseNumbers;
                            }
                        }

                        if (properString.split(" | v: ")[1] != undefined) {
                            version = properString.split(" | v: ")[1];
                            properString = properString.split(" | v: ")[0];
                        }

                        _central2.default.versionDB.find({
                            "abbv": version
                        }, function (err, docs) {
                            if (docs) {
                                bookNames.forEach(function (book) {
                                    // now once we have our version
                                    // make sure that the version we're using
                                    // has the books we want (organized by testament/canon)
                                    // TODO: change APO to DEU
                                    var isOT = false;
                                    var isNT = false;
                                    var isAPO = false;

                                    for (var index in _books2.default.ot) {
                                        if (_books2.default.ot[index] == book) {
                                            isOT = true;
                                        }
                                    }

                                    if (!docs[0].hasOT && isOT) {
                                        _central2.default.logMessage("info", sender, source, "this sender is trying to use the OT " + "with a version that doesn't have it.");

                                        var _response15 = language.rawobj.otnotsupported;
                                        _response15 = _response15.replace("<version>", docs[0].name);

                                        var response2 = language.rawobj.otnotsupported2;
                                        response2 = response2.replace("<setversion>", language.rawobj.commands.setversion);

                                        channel.send(_response15);
                                        channel.send(response2);

                                        return;
                                    }

                                    for (var _index in _books2.default.nt) {
                                        if (_books2.default.nt[_index] == book) {
                                            isNT = true;
                                        }
                                    }

                                    if (!docs[0].hasNT && isNT) {
                                        _central2.default.logMessage("info", sender, source, "this sender is trying to use the NT " + "with a version that doesn't have it.");

                                        var _response16 = language.rawobj.ntnotsupported;
                                        _response16 = _response16.replace("<version>", docs[0].name);

                                        var _response17 = language.rawobj.ntnotsupported2;
                                        _response17 = _response17.replace("<setversion>", language.rawobj.commands.setversion);

                                        channel.send(_response16);
                                        channel.send(_response17);

                                        return;
                                    }

                                    for (var _index2 in _books2.default.apo) {
                                        if (_books2.default.apo[_index2] == book) {
                                            isAPO = true;
                                        }
                                    }

                                    if (!docs[0].hasAPO && isAPO) {
                                        _central2.default.logMessage("info", sender, source, "this sender is trying to use the APO " + "with a version that doesn't have it.");

                                        var _response18 = language.rawobj.aponotsupported;
                                        _response18 = _response18.replace("<version>", docs[0].name);

                                        var _response19 = language.rawobj.aponotsupported2;
                                        _response19 = _response19.replace("<setversion>", language.rawobj.commands.setversion);

                                        channel.send(_response18);
                                        channel.send(_response19);

                                        return;
                                    }
                                });

                                // now we ask our bibleGateway bridge
                                // to nicely provide us with a verse object
                                // to send back; the last step of the process
                                if (version != "REV") {
                                    bibleGateway.getResult(properString, version, headings, verseNumbers).then(function (result) {
                                        result.forEach(function (object) {
                                            var content = "```Dust\n" + object.title + "\n\n" + object.text + "```";

                                            var responseString = "**" + object.passage + " - " + object.version + "**\n\n" + content;

                                            if (responseString.length < 2000) {
                                                _central2.default.logMessage("info", sender, source, properString);
                                                channel.send(responseString);
                                            } else if (responseString.length > 2000 && responseString.length < 3500) {
                                                _central2.default.logMessage("info", sender, source, properString);

                                                var splitText = _central2.default.splitter(object.text);

                                                var content1 = "```Dust\n" + object.title + "\n\n" + splitText.first + "```";
                                                var responseString1 = "**" + object.passage + " - " + object.version + "**\n\n" + content1;
                                                var content2 = "```Dust\n " + splitText.second + "```";

                                                channel.send(responseString1);
                                                channel.send(content2);
                                            } else {
                                                _central2.default.logMessage("info", sender, source, "length of " + properString + " is too long for me");
                                                channel.send(language.rawobj.passagetoolong);
                                            }
                                        });
                                    }).catch(function (err) {
                                        _central2.default.logMessage("err", "global", "bibleGateway", err);
                                    });
                                } else {
                                    rev.getResult(properString, version, headings, verseNumbers).then(function (result) {
                                        result.forEach(function (object) {
                                            var content = "```Dust\n" + object.title + "\n\n" + object.text + "```";

                                            var responseString = "**" + object.passage + " - " + object.version + "**\n\n" + content;

                                            if (responseString.length < 2000) {
                                                _central2.default.logMessage("info", sender, source, properString);
                                                channel.send(responseString);
                                            } else if (responseString.length > 2000 && responseString.length < 3500) {
                                                _central2.default.logMessage("info", sender, source, properString);

                                                var splitText = _central2.default.splitter(object.text);

                                                var content1 = "```Dust\n" + object.title + "\n\n" + splitText.first + "```";
                                                var responseString1 = "**" + object.passage + " - " + object.version + "**\n\n" + content1;
                                                var content2 = "```Dust\n " + splitText.second + "```";

                                                channel.send(responseString1);
                                                channel.send(content2);
                                            } else {
                                                _central2.default.logMessage("info", sender, source, "length of " + properString + " is too long for me");
                                                channel.send(language.rawobj.passagetoolong);
                                            }
                                        });
                                    }).catch(function (err) {
                                        _central2.default.logMessage("err", "global", "rev", err);
                                    });
                                }
                            }
                        });
                    });
                };

                for (var _i3 = 0; _i3 < Object.keys(verses).length; _i3++) {
                    var _ret3 = _loop2(_i3);

                    if ((typeof _ret3 === "undefined" ? "undefined" : _typeof(_ret3)) === "object") return _ret3.v;
                };
            }();

            if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
        }
    });
});

_central2.default.logMessage("info", "global", "global", "BibleBot v" + process.env.npm_package_version + " by Elliott Pardee (vypr)");
bot.login(_config2.default.token);