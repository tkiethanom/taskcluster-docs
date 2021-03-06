var through = require('through2');
var awspublish = require('gulp-awspublish');

/**
 * Make a new awspublish publisher
 */
exports.makePublisher = function() {
  var bucket = process.env['PUBLISH_BUCKET'];
  var region = process.env['PUBLISH_REGION'];
  if (!bucket) {
    console.error("Must specify PUBLISH_BUCKET, PUBLISH_REGION, and some of " +
          "AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN, or AWS_PROFILE");
    process.exit(1);
  }

  return awspublish.create({
    region: region,
    params: {
      Bucket: bucket,
    },
  });
}

/**
 * Copy data.headers to s3.headers
 */
exports.setHeaders = function() {
  return through.obj(function(file, enc, cb) {
    var path = file.relative;
    // serve the root as 'index.html', per S3 website hosting
    if (!path) {
      path = 'index.html';
    }
    // S3's website hosting will serve `XXX/index.html` when `XXX/` is requested, so
    // reverse that transformation here.  `file.relative` strips the trailing
    // slash, so we have to look at `file.path`.
    if (!path || file.path.endsWith('/')) {
      path = file.relative + '/index.html';
    }
    file.s3 = {
      headers: file.data.headers || {},
      path: path
    };
    cb(null, file);
  }, function(cb) {
    cb();
  });
}
