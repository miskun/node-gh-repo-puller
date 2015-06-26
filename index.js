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
 * target:  The target output directory
 * dir:     [optional] The GitHub repository directory to be downloaded. Default: "/"
 * branch:  [optional] The GitHub repository branch name. Default: "master"
 *
 */
function fetch(options, callback){
    callback = callback || noop;

    if(options.user && options.repo && options.target){

        // Default branch
        var ghBranch = options.branch || "master";

        // Github archive URL
        var ghUrl = "https://github.com/"+options.user+"/"+options.repo+"/archive/"+ghBranch+".zip";

        // Ensure paths
        var targetPath = path.resolve(options.target);
        var workPath = path.resolve("_ghrepopullerwork/");

        // Ensure we are not trying to target current directory
        if(__dirname == targetPath){
            callback("Error: Cannot set target directory same as current working directory.");
            return;
        }

        // clean work directory
        if (!fs.existsSync(workPath)) fs.mkdirSync(workPath);
        fs.emptyDirSync(workPath);

        // work file path
        var workFile = path.resolve(workPath, 'node-gh-repo-puller-tmp.zip');

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

                        // ensure target directory exists and is empty
                        if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath);
                        fs.emptyDirSync(targetPath);

                        // copy content to target
                        fs.copyDirSync(contentPath, targetPath);

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
