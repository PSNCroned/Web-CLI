var settings = {};
var chain = "";
var storage = {};

var template = {
	open: true,
	custom: {
		commands: {},
		macros: {},
		scripts: {}
	},
	history: [],
	go: {
		google: "https://google.com",
		images: "https://images.google.com",
		gmail: "https://mail.google.com",
		youtube: "https://youtube.com",
		reddit: "https://reddit.com",
		facebook: "https://facebook.com",
		twitter: "https://twitter.com",
		extensions: "https://chrome.google.com/webstore/category/extensions",
		amazon: "https://amazon.com",
		wikipedia: "https://wikipedia.org",
		wikiarticle: "https://wikipedia.org/wiki/{0}",
		linkedin: "https://linkedin.com",
		ebay: "https://ebay.com",
		baidu: "https://baidu.com",
		yahoo: "https://yahoo.com",
		bing: "https://bing.com",
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
			watchlater: "/playlist?list=WL",
			user: "/user/{0}"
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
		},
		"twitter.com": {
			home: "/",
			moments: "/i/moments",
			notifs: "/i/notifications",
			user: "/{0}"
		},
		"www.google.com": {
			account: "https://myaccount.google.com"
		},
		"www.facebook.com": {
			home: "/",
			user: "/{0}",
			msg: "/messages",
			events: "/events",
			calendar: "/calendar",
			birthdays: "/events/birthdays",
			past: "/events/past",
			pages: "/pages",
			groups: "/groups",
			frequests: "/friends/requests",
			friends: "/{0}/friends",
			about: "/{0}/about",
			photos: "/{0}/photos",
			pokes: "/pokes"
		},
		"news.google.com": {
			top: "/news/headlines",
			world: "/news/headlines/section/topic/WORLD",
			nation: "/news/headlines/section/topic/NATION",
			us: "/news/headlines/section/topic/NATION",
			business: "/news/headlines/section/topic/BUSINESS",
			tech: "/news/headlines/section/topic/TECHNOLOGY",
			entertain: "/news/headlines/section/topic/ENTERTAINMENT",
			ent: "/news/headlines/section/topic/ENTERTAINMENT",
			sports: "/news/headlines/section/topic/SPORTS",
			science: "/news/headlines/section/topic/SCIENCE",
			sci: "/news/headlines/section/topic/SCIENCE",
			health: "/news/headlines/section/topic/HEALTH",
			manage: "/news/settings/sections",
			local: "/news/local",
			foryou: "/news/sfy"
		},
		"drive.google.com": {
			trash: "/drive/u/0/trash",
			home: "/drive/u/0/my-drive",
			comp: "/drive/u/0/comp",
			shared: "/drive/u/0/shared",
			photos: "/drive/u/0/photos",
			starred: "/drive/u/0/starred",
			backups: "/drive/u/0/backups"
		},
		"github.com": {
			home: "/",
			user: "/{0}",
			pulls: "/pulls",
			issues: "/issues",
			market: "/marketplace",
			gist: "https://gist.github.com",
			search: "/search?q={*}",
			new: "/new",
			notifs: "/notifications",
			import: "/new/import",
			org: "/organizations/new",
			explore: "/explore",
			help: "https://help.github.com",
			settings: "/settings/profile"
		},
		"www.amazon.com": {
			home: "/",
			search: "/s/?field-keywords={*}",
			orders: "/gp/css/order-history/ref=nav_nav_orders_first",
			cart: "/gp/cart/view.html/ref=nav_cart"
		},
		"en.wikipedia.org": {
			home: "/",
			search: "/w/index.php?search={*}",
			art: "/wiki/{*}"
		},
		"stackoverflow.com": {
			home: "/",
			questions: "/questions",
			jobs: "/jobs",
			docs: "/documentation",
			tags: "/tags",
			users: "/users",
			search: "/search?q={*}"
		},
		"www.ebay.com": {
			home: "/",
			search: "/sch/i.html?_nkw={*}"
		}
	}
};

var save = function (cb) {
	chrome.storage.sync.set({wcli: settings}, cb);
	console.log(settings);
};

var updateTabs = function () {
	chrome.tabs.query({}, tabs => {
		tabs.forEach(tab => {
			chrome.tabs.sendMessage(tab.id, {type: "settings", settings: settings});
		});
	});
};

chrome.storage.sync.get("wcli", function (data) {
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
		
		for (let key in template.cgo) {
			if (!(key in data.wcli.cgo)) {
				data.wcli.cgo[key] = template.cgo[key];
			}
		}
	}
	else {
		data.wcli = template;
	}
	
	settings = data.wcli;
});

chrome.runtime.onMessage.addListener(function (res, sender, sRes) {
	switch (res.type) {
		case "getSettings":
			sRes({type: "settings", settings: settings});
			break;
		case "set":
			if (res.key) {
				settings[res.key] = res.value;
			}
			else {
				settings = res.settings;	
			}
			
			save();
			updateTabs();
			break;
		case "setChain":
			chain = res.chain;
			break;
		case "getChain":
			sRes({type: "chain", chain: chain});
			break;
		case "addChain":
			if (chain) {
				if (res.chain[res.chain.length - 1] != ";") {
					chain = res.chain + ";" + chain;
				}
				else {
					chain = res.chain + chain;
				}
			}
			else {
				chain = res.chain;
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
			chrome.tabs.remove(sender.tab.id, () => {
				chrome.windows.getLastFocused({populate: true}, w => {
					for (let i = 0; i < w.tabs.length; i++) {
						if (w.tabs[i].active) {
							chrome.tabs.sendMessage(w.tabs[i].id, {
								type: "checkChains"
							});
							break;
						}
					}
				});
			});
			break;
		case "open":
			if ("url" in res) {
				if (res.focus) {
					chrome.tabs.create({url: res.url, selected: false}, t => {
						chrome.tabs.update(t.id, {active: true});
					});
				}
				else {
					chrome.tabs.create({url: res.url, selected: false});
				}
			}
			else {
				chrome.tabs.create({});
			}
			break;
		case "changeTab":
			chrome.windows.getLastFocused({populate: true}, w => {
				let active = {id: null, index: null};
				for (let i = 0; i < w.tabs.length; i++) {
					if (w.tabs[i].active) {
						active = {id: w.tabs[i].id, index: i};
						break;
					}
				}
				
				let id;
				switch (res.option) {
					case "dup":
						chrome.tabs.duplicate(sender.tab.id);
						break;
					case "index":
						if (res.index > 0 && res.index <= w.tabs.length) {
							id = w.tabs[parseInt(res.index) - 1].id;
							chrome.tabs.update(id, {active: true});
						}
						break;
					case "n":
						if (active.index + 1 < w.tabs.length) {
							id = w.tabs[active.index + 1].id;
							chrome.tabs.update(id, {active: true});
						}
						else {
							id = w.tabs[0].id;
							chrome.tabs.update(id, {active: true});
						}
						break;
					case "p":
						if (active.index - 1 >= 0) {
							id = w.tabs[active.index - 1].id;
							chrome.tabs.update(id, {active: true});
						}
						else {
							id = w.tabs[w.tabs.length - 1].id;
							chrome.tabs.update(id, {active: true});
						}
						break;
					case "f":
						id = w.tabs[0].id;
						chrome.tabs.update(id, {active: true});
						break;
					case "l":
						id = w.tabs[w.tabs.length - 1].id;
						chrome.tabs.update(id, {active: true});
						break;
				}
			});
			break;
		case "window":
			chrome.windows.create();
			break;
	}
});

chrome.tabs.onActivated.addListener(info => {
	chrome.tabs.sendMessage(info.tabId, {type: "checkChains"});
});