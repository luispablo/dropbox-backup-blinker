var config = require("./config");
var ledSignal = require("./ledSignal");
var winston = require("winston");
var ledSignal = require("./ledSignal");
require("winston-loggly");

winston.add(winston.transports.Loggly, config.loggly);

var dropboxChecker = require("./dropboxChecker");

function check () {
	winston.log("info", "Checking...");
	dropboxChecker.check(config)
					.then(function (isBackupOK) {
						winston.log("info", "Result of check: "+ isBackupOK);
						
						ledSignal.stop();

						if (isBackupOK) ledSignal.ok();
						else ledSignal.alert();
					})
					.catch(function (error) {
						winston.log("error", error);
						
						ledSignal.stop();
						ledSignal.alert();
					});
}

var checkFrequencyMillis = config.backup.checkFrequencySeconds * 1000;

check(); // First check
setInterval(check, checkFrequencyMillis); // Subsequent checks
 
function exit (ledSignal) {
	ledSignal.stop();
	ledSignal.release();
}

process.on('SIGINT', function() {
	winston.log("info", "Caught interrupt signal");
	exit(ledSignal);
	process.exit();
});
