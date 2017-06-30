console.log("Web CLI running");


var consoleContainer = document.createElement("div");
var panel = document.createElement("div");
var label = document.createElement("div");
var input = document.createElement("input");

consoleContainer.id = "wcliConsoleContainer";

panel.id = "wcliConsolePanel";

input.id = "wcliConsole";
input.autocomplete = "off";
input.autocorrect = "off";
input.autocapitalize = "off";
input.spellcheck = false;

label.id = "wcliConsoleLabel";
label.textContent = ">";

consoleContainer.appendChild(panel);
consoleContainer.appendChild(label);
consoleContainer.appendChild(input);

var pageLoad = function () {
	document.body.appendChild(consoleContainer);
};

var open = true;

document.onkeydown = function (e) {
	if (e.key == "`" && e.ctrlKey) {
		if (open) {
			open = false;
			$(consoleContainer).animate({
				bottom: "-50px"
			}, 150);
		}
		else {
			open = true;
			$(consoleContainer).animate({
				bottom: "0px"
			}, 150);
		}
	}
	else if (e.key == "Escape" && open) {
		open = false;
		$(consoleContainer).animate({
			bottom: "-50px"
		}, 150);
	}
	else if (e.key == "`" && open) {
		e.preventDefault();
		input.focus();
	}
};