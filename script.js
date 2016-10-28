"use strict";
let exec = require("child_process").exec;
let config = require("./config.json");
let https = require("https");
function getSelection() {
    return new Promise(function (resolve, reject) {
        exec("/usr/bin/xclip -o", function(err, stdout, stderr) {
            if (err || stderr) {
                reject(err || new Error(stderr));
            }
            resolve(stdout);
        });
    });
}

getSelection().then(function (stdout) {
    //let args = require("minimist")(process.argv.slice(2));
    https.get({
        hostname: "translate.yandex.net",
        port: 443,
        path: `/api/v1.5/tr.json/translate?key=${config.apiKey}&lang=en-ru&text=${encodeURIComponent(stdout)}`,
        agent: false
    }, (res) => {
        let rawData = "";
        res.on("data", (chunk) => rawData += chunk);
        res.on("end", () => {
            try {
                let parsedData = JSON.parse(rawData);
                exec(`/usr/bin/notify-send "Yandex Translate" "${parsedData.text}"`, function(err, stdout, stderr) {
                    if (err || stderr) {
                        console.log(err || stderr);
                    }
                });
            } catch (e) {
                exec(`/usr/bin/notify-send "Yandex Translate" "${e.message}"`, function(err, stdout, stderr) {
                    if (err || stderr) {
                        console.log(err || stderr);
                    }
                });
            }
        });
    });
});