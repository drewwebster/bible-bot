"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getRandomVerse = getRandomVerse;
exports.getVOTD = getVOTD;
exports.getResult = getResult;

var _central = require("./central");

var _central2 = _interopRequireDefault(_central);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require("request");
var cheerio = require("cheerio");


// code partially ripped from @toffebjorkskog's node-biblegateway-api
// because i'm impatient (sorry love you)

// remove a buncha noise characters from
// `text`, and converting some characters
// to others accordingly
function purifyText(text) {
    return text.replaceAll("“", " \"").replaceAll("[", " <").replaceAll("]", "> ").replaceAll("”", "\" ").replaceAll("‘", "'").replaceAll("’", "'").replaceAll(",", ", ").replaceAll(".", ". ").replaceAll(". \"", ".\"").replaceAll(". '", ".'").replaceAll(", \"", ",\"").replaceAll(", '", ",'").replaceAll("!", "! ").replaceAll("! \"", "!\"").replaceAll("! '", "!'").replaceAll("?", "? ").replaceAll("? \"", "?\"").replaceAll("? '", "?'").replaceAll(/\s+/g, ' ');
}

// take a guess at what this does
function getRandomVerse(version, headings, verseNumbers) {
    var _this = this;

    var url = "https://dailyverses.net/random-bible-verse";

    var promise = new Promise(function (resolve, reject) {
        request(url, function (err, resp, body) {
            if (err !== null) {
                reject(err);
            }

            var $ = cheerio.load(body);
            var verse = $(".bibleChapter a").first().text();

            // yep, we load up the **whole**
            // dailyverses page, just to send the reference
            // to Bible Gateway
            getResult(verse, version, headings, verseNumbers).then(function (result) {
                result.forEach(function (object) {
                    var content = "```Dust\n" + object.title + "\n\n" + object.text + "```";

                    var responseString = "**" + object.passage + " - " + object.version + "**\n\n" + content;

                    if (responseString.length < 2000) {
                        resolve(responseString);
                    } else {
                        _this.getRandomVerse(version, headings, verseNumbers);
                    }
                });
            }).catch(function (err) {
                _central2.default.logMessage("err", "global", "bibleGateway", err);
            });
        });
    });

    return promise;
}

function getVOTD(version, headings, verseNumbers) {
    var url = "https://www.biblegateway.com/reading-plans/verse-of-the-day/next";

    var promise = new Promise(function (resolve, reject) {
        request(url, function (err, resp, body) {
            if (err !== null) {
                reject(err);
            }

            var $ = cheerio.load(body);
            var verse = $(".rp-passage-display").text();

            // same thing as getRandomVerse()
            getResult(verse, version, headings, verseNumbers).then(function (result) {
                result.forEach(function (object) {
                    var content = "```Dust\n" + object.title + "\n\n" + object.text + "```";

                    var responseString = "**" + object.passage + " - " + object.version + "**\n\n" + content;

                    if (responseString.length < 2000) {
                        resolve(responseString);
                    } else {
                        resolve("too long");
                    }
                });
            }).catch(function (err) {
                _central2.default.logMessage("err", "global", "bibleGateway", err);
            });
        });
    });

    return promise;
}
function getResult(query, version, headings, verseNumbers) {
    // formulate a URL based on what we have
    var url = "https://www.biblegateway.com/passage/?search=" + query + "&version=" + version + "&interface=print";

    var promise = new Promise(function (resolve, reject) {
        request(url, function (err, resp, body) {
            if (err !== null) {
                reject(err);
            }

            var verses = [];

            var $ = cheerio.load(body);

            // we work through `.result-text-style-normal`
            // as Bible Gateway has all of its text inside it
            // it's the one container that has everything we need
            // inside
            $(".result-text-style-normal").each(function () {
                var verse = $(this);

                if (headings == "disable") {
                    $(".result-text-style-normal h3").each(function () {
                        $(this).html("");
                    });

                    $(".inline-h3").each(function () {
                        $(this).html("");
                    });
                }

                if (verseNumbers == "disable") {
                    $(".chapternum").each(function () {
                        $(this).html(" ");
                    });

                    $(".versenum").each(function () {
                        $(this).html(" ");
                    });
                } else {
                    $(".chapternum").each(function () {
                        $(this).html("[" + $(this).text().slice(0, -1) + "] ");
                    });

                    $(".versenum").each(function () {
                        $(this).html("[" + $(this).text().slice(0, -1) + "] ");
                    });
                }

                $(".crossreference").each(function () {
                    $(this).html("");
                });

                $(".footnote").each(function () {
                    $(this).html("");
                });

                var title = "";
                if (headings == "enable") {
                    verse.find("h3").each(function () {
                        title += $(this).text() + " / ";
                    });
                }

                $(".crossrefs").html("");
                $(".footnotes").html("");

                // formulate a nice verseObject to send back
                var verseObject = {
                    "passage": verse.find(".passage-display-bcv").text(),
                    "version": verse.find(".passage-display-version").text(),
                    "title": title.slice(0, -3),
                    "text": purifyText(verse.find("p").text())
                };

                verses.push(verseObject);
            });

            // estimated delivery date: 5ms
            resolve(verses);
        });
    });

    return promise;
}