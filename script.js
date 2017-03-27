const exec = require("child_process").exec;
const config = require("./config.json");
const https = require("https");

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
    https.get({
        hostname: "translate.yandex.net",
        port: 443,
        path: `/api/v1.5/tr.json/translate?key=${config.apiKey}&lang=en-ru&text=${encodeURIComponent(stdout)}`,
        agent: false
    }, res => {
        let rawData = "";

        res.on("data", chunk => rawData += chunk);
        res.on("end", () => {
            try {
                const parsedData = JSON.parse(rawData);

                exec(`/usr/bin/notify-send "Yandex Translate" "${parsedData.text}"`, function(err, stdout, stderr) {
                    if (err || stderr) {
                        console.error(err || stderr);
                    }
                });
            } catch (e) {
                exec(`/usr/bin/notify-send "Yandex Translate" "${e.message}"`, function(err, stdout, stderr) {
                    if (err || stderr) {
                        console.error(err || stderr);
                    }
                });
            }
        });
    });
});