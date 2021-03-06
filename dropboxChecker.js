var dropbox = require("dropbox");
var moment = require("moment");
var Promise = require('promise');

var dropboxChecker = {
	check: function (config, winston) {
		return new Promise(function (resolve, reject) {
			var client = new dropbox.Client(config.dropbox.auth);

			client.readdir(config.backup.directory, function (error, entries) {
				if (error) {
					reject(error);
				} else {
					var visibleEntries = entries.filter(function (entry) {
						return entry.indexOf('.') !== 0;
					});
					winston.log("info", "Read the following entries from Dropbox: "+ visibleEntries.join(", "));

					var metadatas = [];

					visibleEntries.forEach(function (entry, index) {
						client.stat(config.backup.directory +"/"+ entry, function (error, metadata) {
							if (error) {
								reject(error);
							} else {
								metadatas.push(metadata);
							}

							if (index + 1 === visibleEntries.length) {
								var yesterday = moment().subtract(1, "day");

								var yesterdayMetadatas = metadatas.filter(function (m) {
									return moment(m.modifiedAt).isSame(yesterday, "day");
								}).map(function (metadata) {
									return metadata.name;
								});
								winston.log("info", "The entries from yesterday are: "+ yesterdayMetadatas.join(", "));
								winston.log("info", "Comparing yesterday entries to: "+ config.backup.filesToFind.join(", "));

								var result = config.backup.filesToFind.every(function (fileToFind) {
									return yesterdayMetadatas.some(function (metadata) {
										return metadata.indexOf(fileToFind) >= 0;
									});
								});

								resolve(result);
							}
						});
					});
				}
			});
		});
	}
};

module.exports = dropboxChecker;
