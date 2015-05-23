var request = require('request'),
    fs      = require('fs-extended'),
    path    = require('path'),
    unzip   = require('unzip');

var noop = function(){};

/**
 * @param {Object} [options] The options for Github repo puller.
 * @param {Function} [callback] The callback function.
 *
 * Options:
 *
 * user:    The Github user
 * repo:    The Github repository
 * dir:     [optional] The Github repository directory to be downloaded. Default: "/"
 * target:  The target output directory
 *
 */
function fetch(options, callback){
    callback = callback || noop;

    if(options.user && options.repo && options.target){

        // Github archive URL
        var ghUrl = "https://github.com/"+options.user+"/"+options.repo+"/archive/master.zip";

        // Ensure paths
        var targetPath = path.resolve(__dirname, options.target);
        var workPath = path.resolve(__dirname, "_ghrepopullerwork/");

        // Ensure we are not trying to target current directory
        if(__dirname == targetPath){
            callback("Error: Cannot set target directory same as current working directory.");
            return;
        }

        // clean work directory
        if (!fs.existsSync(workPath)) fs.mkdirSync(workPath);
        fs.emptyDirSync(workPath);

        // work file path
        var workFile = path.resolve(workPath, 'master.zip');

        // get the archive from Github
        request
            .get(ghUrl)
            .on('error', function(e) { console.log(e); callback("Error while trying to connect to '"+ghUrl+"'"); })

            // write archive to disk
            .pipe(fs.createWriteStream(workFile)).on('finish', function () {

                // unzip archive
                fs.createReadStream(workFile).pipe(unzip.Extract({ path: workPath })).on('close', function () {

                    // remove archive file
                    fs.deleteFileSync(workFile);

                    // resolve the contents directory
                    options.dir = options.dir || "";

                    var contentsRoot = path.resolve(workPath, fs.listDirsSync(workPath)[0]);
                    var contentPath = path.resolve(contentsRoot, options.dir);

                    // ensure content path exists
                    if (fs.existsSync(contentPath)){

                        // clean target directory
                        fs.deleteDirSync(targetPath);

                        // move content to target
                        fs.moveDirSync(contentPath, targetPath);

                        // clean work directory
                        fs.deleteDirSync(workPath);

                        callback(null, targetPath);

                    } else {
                        if(options.dir == "") options.dir = "/";

                        fs.deleteDirSync(workPath);

                        callback("Error while trying to access Github directory '"+options.dir+"'");
                    }
                });

            });

    } else {
        callback("Error: the required parameters 'user', 'repo' and 'target' are missing!");
    }
}

module.exports = fetch;
