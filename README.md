# Simple Github repository puller for Node

## Installation

```
npm install node-gh-repo-puller
```

## Usage

```js
var puller = require('node-gh-repo-puller');

puller({
    user: "miskun",
    repo: "node-gh-repo-puller",
    dir: "sample",
    target: "pulled-from-github"
}, function (err, result) {
	if(!err){
	    console.log("Done! Check 'pulled-from-github' directory");
	} else {
    	console.log(err);
	}
});
```

## License

MIT