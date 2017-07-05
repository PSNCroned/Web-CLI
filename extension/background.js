var settings = {};
var combo = "";
var storage = {};

var template = {
	open: true,
	custom: {
		commands: {},
		macros: {},
		scripts: {}
	},
	go: {
		google: "https://google.com",
		gmail: "https://mail.google.com",
		youtube: "https://youtube.com",
		reddit: "https://reddit.com",
		facebook: "https://facebook.com",
		twitter: "https://twitter.com",
		extensions: "https://chrome.google.com/webstore/category/extensions",
		amazon: "https://amazon.com",
		wikipedia: "https://wikipedia.org",
		linkedin: "https://linkedin.com",
		ebay: "https://ebay.com",
		baidu: "https://baidu.com",
		yahoo: "https://yahoo.com",
		netflix: "https://netflix.com",
		stack: "https://stackoverflow.com",
		github: "https://github.com",
		drive: "https://drive.google.com",
		maps: "https://maps.google.com",
		news: "https://news.google.com"
	},
	cgo: {
		"www.youtube.com": {
			subs: "/feed/subscriptions",
			trend: "/feed/trending",
			home: "/",
			watchlater: "/playlist?list=WL"
		},
		"www.reddit.com": {
			home: "/",
			hot: "/",
			new: "/new",
			rising: "/rising",
			contro: "controversial",
			top: "/top",
			gilder: "/gilder",
			wiki: "/wiki",
			ads: "/ads",
			random: "/r/random",
			submit: "/submit"
		}
	}
};

var save = function (cb) {
	chrome.storage.sync.set({wcli: settings}, cb);
};

var updateTabs = function () {
	chrome.tabs.query({}, tabs => {
		tabs.forEach(tab => {
			chrome.tabs.sendMessage(tab.id, {type: "settings", settings: settings});
		});
	});
};

chrome.storage.sync.get("wcli", function (data) {
	console.log("Old settings:");
	console.log(data.wcli);
	
	if (data.wcli) {
		for (let key in template) {
			if (!(key in data.wcli)) {
				data.wcli[key] = template[key];
			}
		}
		
		for (let key in template.custom) {
			if (!(key in data.wcli.custom)) {
				data.wcli.custom[key] = template.custom[key];
			}
		}
		
		for (let key in template.go) {
			if (!(key in data.wcli.go)) {
				data.wcli.go[key] = template.go[key];
			}
		}
	}
	else {
		data.wcli = template;
	}
	
	settings = data.wcli;
	
	console.log("New settings:");
	console.log(settings);
});

chrome.runtime.onMessage.addListener(function (res, sender, sRes) {
	switch (res.type) {
		case "getSettings":
			sRes({type: "settings", settings: settings});
			break;
		case "set":
			console.log("change setting");
			if (res.key) {
				settings[res.key] = res.value;
			}
			else {
				settings = res.settings;	
			}
			
			console.log(settings);
			
			save();
			updateTabs();
			break;
		case "setCombo":
			combo = res.combo;
			break;
		case "getCombo":
			sRes({type: "combo", combo: combo});
			break;
		case "addCombo":
			if (combo) {
				if (res.combo[res.combo.length - 1] != ";") {
					combo = res.combo + ";" + combo;
				}
				else {
					combo = res.combo + combo;
				}
			}
			else {
				combo = res.combo;
			}
			break;
		case "store":
			storage[res.key] = res.data;
			break;
		case "retrieve":
			if (res.key) {
				sRes({data: storage[res.key]});
			}
			else {
				sRes({data: storage});
			}
			break;
		case "deleteKey":
			delete storage[res.key];
		case "reset":
			settings = template;
			save();
			updateTabs();
			break;
		case "close":
			chrome.tabs.remove(sender.tab.id);
			break;
	}
});