console.log("Web CLI running");

var settings;
var localStorage = window.localStorage;

const consoleContainer = document.createElement("div");
const panel = document.createElement("div");
const formWrapper = document.createElement("div");
const label = document.createElement("div");
const input = document.createElement("input");

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

consoleContainer.appendChild(panel);
consoleContainer.appendChild(formWrapper);
formWrapper.appendChild(label);
formWrapper.appendChild(input);

var process = function (cmd) {
	cmd = cmd.trim();
	if (cmd[cmd.length - 1] == ";") {
		cmd.replace(";", "");
	}
	
	var combo = cmd.toLowerCase().split(";");
	if (combo.length == 1) {
		let args = cmd.toLowerCase().split(" ");
		let caseArgs = cmd.split(" ");
		let flairs = [];
		let notFlairs = [];
		
		for (let i in args) {
			if (args[i].indexOf("-") == 0) {
				flairs.push(args[i]);
			}
			else {
				notFlairs.push(args[i]);
			}
		}
		
		try {
			switch (args[0]) {
				case "go":
					if (args[1] in settings.go) {
						gotoPage(settings.go[args[1]], flairs);
					}
					break;
				case "cgo":
					let site = window.location.host;
					if (site in settings.cgo) {
						if (args[1] in settings.cgo[site]) {
							gotoPage(settings.cgo[site][args[1]], flairs);
						}
					}
					break;
				case "set":
					if (notFlairs.length >= 4) {
						switch (args[1]) {
							case "go":
								settings.go[args[2]] = args[3];
								break;
							case "cgo":
								settings.cgo[window.location.host][args[2]] = args[3];
								break;
							case "command":
							case "cmd":
								settings.custom.commands[args[2]] = args[3];
								break;
							case "delete":
								switch (args[2]) {
									case "go":
										delete settings.go[args[3]];
										break;
									case "cgo":
										delete settings.cgo[window.location.host][args[3]];
										break;
									case "command":
									case "cmd":
										delete settings.custom.commands[args[3]];
										break;
								}
								break;
						}
						save();
					}
					checkCombos();
					break;
				case "back":
				case "b":
					window.history.back();
				case "forward":
				case "fwd":
					window.history.forward();
					break;
					break;
				case "refresh":
				case "re":
				case "r":
					window.location.reload();
					break;
				case "top":
					window.scrollTo(0, 0);
					checkCombos();
					break;
				case "bottom":
				case "bot":
					window.scrollTo(0,document.body.scrollHeight);
					checkCombos();
					break;
				case "up":
				case "u":
					window.scroll(0, window.scrollY - (500 * (parseInt(args[1]) || 1)));
					checkCombos();
					break;
				case "down":
				case "d":
					window.scroll(0, window.scrollY + (500 * (parseInt(args[1]) || 1)));
					checkCombos();
					break;
				case "wait":
					setTimeout(() => {
						checkCombos();
					}, args[1] || 0);
					break;
				case "reset":
					chrome.runtime.sendMessage({type: "reset"});
					break;
				case "close":
					chrome.runtime.sendMessage({type: "close"});
					break;
				case "help":
					//
					break;
				default:
					if (settings.custom.commands[args[0]]) {
						args[0] = settings.custom.commands[args[0]];
						process(args.join(" "));
					}
					else {
						sAlert(`${args[0]} is not a known command!`);
						checkCombos();
					}
			}
		}
		catch (e) {
			checkCombos();
			console.log(e);
		}
	}
	else {
		chrome.runtime.sendMessage({type: "addCombo", combo: combo.slice(1, combo.length).join(";")});
		process(combo[0]);
	}
};

var setCombos = function (arr) {
	chrome.runtime.sendMessage({type: "setCombo", combo: arr.join(";")});
};

var checkCombos = function () {
	chrome.runtime.sendMessage({type: "getCombo"}, (res, sender, sRes) => {
		let combo = res.combo;
		
		console.log("Combo:");
		console.log(combo);
		
		if (combo) {
			combo = combo.split(";");
			setCombos(combo.slice(1, combo.length));
			process(combo[0]);
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
		window.open(url);
	}
	else {
		window.location = url;
	}
};

var sAlert = function (msg) {
	//
	console.log(msg);
};

var run = function () {
	document.body.appendChild(consoleContainer);
	
	if (!settings.open) {
		consoleContainer.style.bottom = "-50px";
	}
	else {
		input.focus();
	}
	
	checkCombos();
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
			bottom: "-50px"
		}, 150);
	}
};

var pageLoad = function () {
	chrome.runtime.sendMessage({type: "getSettings"}, (res, sender, sRes) => {
		if (res.type == "settings") {
			//console.log("Settings:");
			//console.log(res.settings);
			
			settings = res.settings;
			run();
		}
		else {
			console.error("Error loading wCLI settings!");
		}
	});
};

chrome.runtime.onMessage.addListener(function (res, sender, sRes) {
	switch (res.type) {
		case "settings":
			settings = res.settings;
			
			//console.log("New settings:");
			//console.log(settings);
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
		input.value = "";
	}
};