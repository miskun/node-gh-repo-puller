var puller = require('../index.js');

puller({
    user: "kontena",
    repo: "kontena",
    dir: "docs",
    target: "pulled-from-github"
}, function (err, result) {
    if(!err){
        console.log("Done! Check 'pulled-from-github' directory");
    } else {
        console.log(err);
    }
});