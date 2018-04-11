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
//import { SynchronousPromise } from "synchronous-promise";


// code partially ripped from @toffebjorkskog's node-biblegateway-api
// because i'm impatient (sorry love you)

function purifyText(text) {
    return text.replaceAll("“", " \"").replaceAll("[", " <").replaceAll("]", "> ").replaceAll("”", "\" ").replaceAll("‘", "'").replaceAll("’", "'").replaceAll(",", ", ").replaceAll(".", ". ").replaceAll(". \"", ".\"").replaceAll(". '", ".'").replaceAll(", \"", ",\"").replaceAll(", '", ",'").replaceAll("!", "! ").replaceAll("! \"", "!\"").replaceAll("! '", "!'").replaceAll("?", "? ").replaceAll("? \"", "?\"").replaceAll("? '", "?'").replaceAll(/\s+/g, ' ');
}

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
    var split = query.split(":");
    var book = split[0].split(" ")[0];
    var chapter = split[0].split(" ")[1];
    var startingVerse = split[1].split("-")[0];
    var endingVerse = split[1].split("-").length > 1 ? split[1].split("-")[1] : 0;

    var url = "https://www.revisedenglishversion.com/" + book + "/" + chapter + "/";

    var promise = new Promise(function (resolve, reject) {
        request(url, function (err, resp, body) {
            if (err !== null) {
                reject(err);
            }

            var verses = [];

            var $ = cheerio.load(body);

            $(".col1container").each(function () {
                var title = "";
                var text = "";

                $(".versenum").each(function () {
                    $(this).html("[" + $(this).text() + "] ");
                });

                $(".versenumcomm").each(function () {
                    $(this).html("[" + $(this).text() + "] ");
                });

                $(".fnmark").each(function () {
                    $(this).html("");
                });

                if (startingVerse > endingVerse) {
                    $(this).html($(this).html().split("[" + (Number(startingVerse) + 1) + "]")[0].split("[" + startingVerse + "]")[1]);

                    $(this).find(".headingfirst").each(function () {
                        title += $(this).text() + " / ";
                    });

                    $(this).find(".heading").each(function () {
                        title += $(this).text() + " / ";
                    });

                    text = " [" + startingVerse + "]" + $(this).text();
                    text = text.replace(/(\r\n|\n|\r)/gm, " ").slice(1, -1);
                } else {
                    $(this).html($(this).html().split("[" + (Number(endingVerse) + 1) + "]")[0].split("[" + startingVerse + "]")[1]);

                    $(this).find(".headingfirst").each(function () {
                        title += $(this).text() + " / ";
                        $(this).text("");
                    });

                    $(this).find(".heading").each(function () {
                        title += $(this).text() + " / ";
                        $(this).text("");
                    });

                    text = " [" + startingVerse + "]" + $(this).text();
                    text = text.replace(/(\r\n|\n|\r)/gm, " ").slice(1, -1);
                }

                if (verseNumbers == "disable") {
                    text = text.replace(/.?\[[0-9]\]/g, "");
                }

                if (headings == "disable") {
                    title = "";
                }

                var verseObject = {
                    "passage": query,
                    "version": "Revised English Version (REV)",
                    "title": title == "" ? "" : title.slice(0, -3),
                    "text": purifyText(text)
                };

                verses.push(verseObject);
            });

            // NOTE: DO NOT TRY TO MAKE FUNCTION() INTO () =>
            // IT WILL BREAK EVERYTHING
            /*$(".result-text-style-normal").each(function() {
                let verse = $(this);
                 if (headings == "disable") {
                    $(".result-text-style-normal h3").each(function() {
                        $(this).html("");
                    });
                     $(".inline-h3").each(function() {
                        $(this).html("");
                    });
                }
                 if (verseNumbers == "disable") {
                    $(".chapternum").each(function() {
                        $(this).html(" ");
                    });
                     $(".versenum").each(function() {
                        $(this).html(" ");
                    });
                } else {
                    $(".chapternum").each(function() {
                        $(this).html(
                            "[" + $(this).text().slice(0, -1) + "] ");
                     });
                     $(".versenum").each(function() {
                        $(this).html(
                            "[" + $(this).text().slice(0, -1) + "] ");
                     });
                }
                 $(".crossreference").each(function() {
                    $(this).html("");
                });
                 $(".footnote").each(function() {
                    $(this).html("");
                });
                 let title = "";
                if (headings == "enable") {
                    verse.find("h3").each(function() {
                        title += $(this).text() + " / ";
                    });
                }
                 $(".crossrefs").html("");
                $(".footnotes").html("");
                 let verseObject = {
                    "passage": verse.find(".passage-display-bcv").text(),
                    "version": verse.find(".passage-display-version").text(),
                    "title": title.slice(0, -3),
                    "text": purifyText(verse.find("p").text())
                };
                 verses.push(verseObject);
            });*/

            resolve(verses);
        });
    });

    return promise;
}