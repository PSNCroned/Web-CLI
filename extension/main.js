console.log("Web CLI running");

var settings;
var localStorage = window.localStorage;
var historyIndex = -1;
var tempHistVal = "";
var lastAlert = null;

const consoleContainer = document.createElement("div");
const panel = document.createElement("div");
const formWrapper = document.createElement("div");
const label = document.createElement("div");
const input = document.createElement("input");
const notif = document.createElement("div");

consoleContainer.id = "wcliConsoleContainer";

panel.id = "wcliConsolePanel";

formWrapper.id = "wcliWrapper";

input.id = "wcliConsole";
input.autocomplete = "off";
input.autocorrect = "off";
input.autocapitalize = "off";
input.spellcheck = false;

label.id = "wcliConsoleLabel";
label.textContent = ">";

notif.id = "wcliNotif";

consoleContainer.appendChild(panel);
consoleContainer.appendChild(formWrapper);
formWrapper.appendChild(label);
formWrapper.appendChild(input);
formWrapper.appendChild(notif);

var process = function (cmd) {
	cmd = cmd.trim();
	if (cmd.length) {
		if (cmd[cmd.length - 1] == ";") {
			cmd.replace(";", "");
		}

		var chain = cmd.toLowerCase().split(";");
		if (chain.length == 1) {
			let args = cmd.toLowerCase().split(" ");
			let caseArgs = cmd.split(" ");
			let flairs = [];
			let notFlairs = [];
			var repeat = 0;

			for (let i in args) {
				if (args[i].indexOf("-") == 0) {
					flairs.push(args[i]);
				}
				else if (args[i].indexOf("*") == 0 && args[i].indexOf("}") != 1) {
					let num = args[i].slice(1);
					if (parseInt(num)) {
						repeat = num;
					}
				}
				else {
					notFlairs.push(args[i]);
				}
			}

			if (repeat > 0) {
				let cleaned = cmd.substr(0, cmd.indexOf("*")).trim();
				let newCmd = "";
				for (let i = 0; i < repeat; i++) {
					newCmd += (cleaned + ";");
				}
				process(newCmd);
			}
			else {
				try {
					switch (args[0]) {
						case "go":
							if (args[1] in settings.go) {
								let goArgs = args.slice(2, notFlairs.length);
								let parsed = parseTemplate(settings.go[args[1]], goArgs);
								gotoPage(parsed, flairs);
							}
							else {
								gotoPage(args[1], flairs);
							}
							break;
						case "cgo":
							var site = window.location.host;
							if (site in settings.cgo) {
								if (args[1] in settings.cgo[site]) {
									let cgoArgs = args.slice(2, notFlairs.length);
									let parsed = parseTemplate(settings.cgo[site][args[1]], cgoArgs);
									gotoPage(parsed, flairs);
								}
								else {
									sAlert(`${args[1]} is not a valid cgo label for this site`);
								}
							}
							else {
								sAlert("There are no cgo labels for this site");
							}
							break;
						case "set":
							if (notFlairs.length >= 4) {
								switch (args[1]) {
									case "go":
										if (args[3] in settings.go) {
											settings.go[args[2]] = settings.go[args[3]];
										}
										else {
											settings.go[args[2]] = args[3];
										}
										sAlert(`You can now use 'go ${args[2]}'`);
										break;
									case "cgo":
										let host = window.location.host;
										if (!(host in settings.cgo)) {
											settings.cgo[host] = {};
										}
										if (args[3] in settings.cgo[host]) {
											settings.cgo[host][args[2]] = settings.cgo[host][args[3]];
										}
										else {
											settings.cgo[host][args[2]] = args[3];
										}
										sAlert(`You can now use 'cgo ${args[2]}' from this site`);
										break;
									case "command":
									case "cmd":
										settings.custom.commands[args[2]] = args[3];
										sAlert(`You can now use the command '${args[2]}'`);
										break;
									case "delete":
										switch (args[2]) {
											case "go":
												delete settings.go[args[3]];
												sAlert(`Deleted go label '${args[3]}'`);
												break;
											case "cgo":
												delete settings.cgo[window.location.host][args[3]];
												sAlert(`Deleted cgo label '${args[3]}' from this site`);
												break;
											case "command":
											case "cmd":
												delete settings.custom.commands[args[3]];
												sAlert(`Deleted custom command '${args[3]}'`);
												break;
										}
										break;
									default:
										sAlert("Invalid use of 'set'. Type 'help' for assistance.");
								}
								save();
							}
							else {
								sAlert("Invalid use of 'set'. Type 'help' for assistance.");
							}
							checkChains();
							break;
						case "back":
						case "b":
							window.history.back();
						case "forward":
						case "fwd":
							window.history.forward();
							break;
						case "r":
							window.location.reload();
							break;
						case "top":
							window.scrollTo(0, 0);
							checkChains();
							break;
						case "bottom":
						case "bot":
							window.scrollTo(0,document.body.scrollHeight);
							checkChains();
							break;
						case "up":
						case "u":
							window.scroll(0, window.scrollY - (500 * (parseInt(args[1]) || 1)));
							checkChains();
							break;
						case "down":
						case "d":
							window.scroll(0, window.scrollY + (500 * (parseInt(args[1]) || 1)));
							checkChains();
							break;
						case "tab":
							if (notFlairs.length == 2) {
								if (parseInt(args[1])) {
									chrome.runtime.sendMessage({type: "changeTab", option: "index", index: args[1]});
								}
								else {
									chrome.runtime.sendMessage({type: "changeTab", option: args[1]});
								}
							}
							else {
								chrome.runtime.sendMessage({type: "open"});
							}
							break;
						case "dup":
							chrome.runtime.sendMessage({type: "changeTab", option: "dup"});
							break;
						case "window":
						case "win":
							chrome.runtime.sendMessage({type: "window"});
							break;
						case "wait":
							setTimeout(() => {
								checkchains();
							}, args[1] || 0);
							break;
						case "reset":
							settings.history = [];
							chrome.runtime.sendMessage({type: "reset"});
							sAlert(`Web CLI reset`);
							checkChains();
							break;
						case "close":
							chrome.runtime.sendMessage({type: "close"});
							break;
						case "macro":
							if (args[1] in settings.custom.macros) process(settings.custom.macros[args[1]]);
							break;
						case "script":
							if (args[1] in settings.custom.scripts) eval(settings.custom.scripts[args[1]]);
							checkChains();
							break;
						case "help":
							chrome.runtime.sendMessage({type: "open", url: chrome.runtime.getURL("/html/help.html"), focus: !hasFlair("-f", flairs)});
							break;
						case "search":
						case "s":
							var query = "https://www.google.com/search?q=";
							for (let i = 1; i < notFlairs.length; i++) {
								query += (notFlairs[i] + " ");
							}
							gotoPage(query, flairs);
							break;
						case "img":
							var query = "https://www.google.com/search?tbm=isch&q=";
							for (let i = 1; i < notFlairs.length; i++) {
								query += (notFlairs[i] + " ");
							}
							gotoPage(query, flairs);
							break;
						case "wiki":
							var query = "https://en.wikipedia.org/wiki/";
							for (let i = 1; i < notFlairs.length; i++) {
								query += (notFlairs[i] + " ");
							}
							gotoPage(query, flairs);
							break;
						default:
							if (args[0] in settings.custom.commands) {
								args[0] = settings.custom.commands[args[0]];
								process(args.join(" "));
							}
							else if (args[0] in settings.custom.macros) {
								process(settings.custom.macros[args[0]]);
							}
							else if (args[0] in settings.custom.scripts) {
								eval(settings.custom.scripts[args[0]]);
								checkChains();
							}
							else {
								sAlert(`${args[0]} is not a known command!`);
								checkChains();
							}
					}
				}
				catch (e) {
					checkChains();
					console.log(e);
					sAlert(`Error executing '${cmd}': ${e}`);
				}
			}
		}
		else {
			chrome.runtime.sendMessage({type: "addChain", chain: chain.slice(1, chain.length).join(";")});
			process(chain[0]);
		}
	}
};

var setChains = function (arr) {
	chrome.runtime.sendMessage({type: "setChain", chain: arr.join(";")});
};

var checkChains = function () {
	chrome.runtime.sendMessage({type: "getChain"}, (res, sender, sRes) => {
		let chain = res.chain;
		
		console.log("Chain:");
		console.log(chain);
		
		if (chain) {
			chain = chain.split(";");
			setChains(chain.slice(1, chain.length));
			process(chain[0]);
		}
	});
};

var hasFlair = function (flair, flairList=[]) {
	for (let i in flairList) {
		if (flairList[i] == flair) return true; 
	}
	return false;
};

var gotoPage = function (url, flairs=[]) {
	if (hasFlair("-t", flairs)) {
		if (hasFlair("-f", flairs)) {
			chrome.runtime.sendMessage({type: "open", url: url, focus: false});
		}
		else {
			window.open(url);
		}
	}
	else {
		window.location = url;
	}
};

var sAlert = function (msg) {
	clearTimeout(lastAlert);
	notif.textContent = msg;
	$(notif).fadeIn(100);
	lastAlert = setTimeout(function () {
		$(notif).fadeOut(100);
	}, 2500);
};

var run = function () {
	//document.body.appendChild(consoleContainer);
	$("body").after(consoleContainer);
	$("body").attr("data-wcli", "true");
	
	if (!settings.open) {
		consoleContainer.style.bottom = "-75px";
	}
	else {
		input.focus();
	}
	
	checkChains();
};

var save = function (key, value) {
	if (key && value) {
		chrome.runtime.sendMessage({type: "set", key: key, value: value});
	}
	else {
		chrome.runtime.sendMessage({type: "set", settings: settings});
	}
};

var changeOpen = function (bool) {
	settings.open = bool;
	save("open", bool);
	
	if (bool) {
		$(consoleContainer).animate({
			bottom: "0px"
		}, 150);
	}
	else {
		$(consoleContainer).animate({
			bottom: "-75px"
		}, 150);
	}
};

var store = function (key="default", data="") {
	chrome.runtime.sendMessage({type: "store", key: key, data: data});
};

var retrieve = function (key, cb) {
	if (typeof key == "string") {
		chrome.runtime.sendMessage({type: "retrieve", key: key}, cb);
	}
	else if (typeof key == "function") {
		chrome.runtime.sendMessage({type: "retrieve", key: null}, key);
	}
};

var deleteKey = function (key) {
	chrome.runtime.sendMessage({type: "deleteKey", key: key});
};

var pageLoad = function () {
	chrome.runtime.sendMessage({type: "getSettings"}, (res, sender, sRes) => {
		if (res.type == "settings") {
			settings = res.settings;
			run();
		}
		else {
			console.error("Error loading wCLI settings!");
		}
	});
};
	
var showHistory = function () {
	if (historyIndex > -1) {
		input.value = settings.history[historyIndex];
	}
	else {
		input.value = tempHistVal;
	}
};

var parseTemplate = function (str, args) {
	var list = [], index = 0, res = str;
	for (let c = 0; c < str.length; c++) {
		if (str[c] == "{") {
			list[index] = {start: c, end: null};
		}
		else if (str[c] == "}" && list[index]) {
			list[index].end = c;
			index++;
		}
	}
	list.forEach(o => {
		if (o.end) {
			let holder = str.slice(o.start, o.end + 1);
			let num = holder.replace("{", "").replace("}", "");
			num = (num == "*" ? "*" : parseInt(num));
			if (args[num]) {
				res = res.replace(holder, args[num]);
			}
			else if (num == "*") {
				res = res.replace(holder, args.join(" "));
			}
		}
	});
	return res;
};

chrome.runtime.onMessage.addListener(function (res, sender, sRes) {
	switch (res.type) {
		case "settings":
			settings = res.settings;
			break;
		case "checkChains":
			checkChains();
			break;
	};
});

document.onkeydown = function (e) {
	if (e.key == "`" && e.ctrlKey) {
		if (settings.open) {
			changeOpen(false);
		}
		else {
			changeOpen(true);
			input.focus();
		}
	}
	else if (e.key == "Escape" && settings.open) {
		changeOpen(false);
	}
	else if (e.key == "`" && settings.open) {
		e.preventDefault();
		input.focus();
	}
	else if (e.key == "Enter" && settings.open && document.activeElement.id == "wcliConsole") {
		process(input.value);
		
		settings.history.unshift(input.value);
		if (settings.history.length > 50) {
			settings.history = settings.history.slice(0, 50);
		}
		save("history", settings.history);
		
		input.value = "";
	}
	else if (e.key == "ArrowUp" && document.activeElement.id == "wcliConsole") {
		if (historyIndex < settings.history.length - 1) {
			e.preventDefault();
			if (historyIndex == -1) tempHistVal = input.value;
			historyIndex ++;
			showHistory();
		}
	}
	else if (e.key == "ArrowDown" && document.activeElement.id == "wcliConsole") {
		if (historyIndex > -1) {
			e.preventDefault();
			historyIndex --;
			showHistory();
		}
	}
};