var settings = {};

var save = function (cb) {
	chrome.storage.sync.set({wcli: settings}, cb);
};

chrome.storage.sync.get("wcli", function (data) {
	var template = {
		open: true
	};
	
	if (data.wcli) {
		for (var key in template) {
			if (!data.wcli[key]) {
				data.wcli[key] = template[key];
			}
		}
		save();
	}
	else {
		data.wcli = template;
		save()
	}
});

chrome.runtime.onMessage.addListener(function (res, sender, sRes) {
	switch (res.type) {
		case "getSettings":
			sRes({type: "settings", data: settings});
			break;
		case "set":
			settings = res.settings;
			save();
			break;
	}
});