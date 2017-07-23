chrome.runtime.sendMessage({type: "getSettings"}, (res, sender, sRes) => {
	var settings = res.settings;
	
	var edit = function (id) {
		var name = document.getElementById(id).value.toLowerCase();
		var input = document.getElementById(id + "Input");
		if (name) {
			if (name in settings.custom[id + "s"]) {
				input.value = settings.custom[id + "s"][name];
			}
			else {
				input.value = "";
			}
			
			input.disabled = false;
			input.focus();
			document.getElementById(id).disabled = true;
			
			$("#" + id + "Panel .nameB").prop("disabled", true);
			$("#" + id + "Panel .contentB").prop("disabled", false);
		}
	};
	
	var save = function (id) {
		var name = document.getElementById(id).value.toLowerCase();
		var val = document.getElementById(id + "Input").value.trim();
		if (val) {
			settings.custom[id + "s"][name] = val;
		}
		else {
			delete settings.custom[id + "s"][name];
		}
		
		chrome.runtime.sendMessage({type: "set", settings: settings});
		document.getElementById(id + "Input").disabled = true;
		document.getElementById(id).disabled = false;
		document.getElementById(id).focus();
		
		$("#" + id + "Panel .nameB").prop("disabled", false);
		$("#" + id + "Panel .contentB").prop("disabled", true);
	};
	
	var cancel = function (id) {
		console.log(id);
		var input = document.getElementById(id + "Input");
		var name = document.getElementById(id);
		input.value = "";
		input.disabled = true;
		name.disabled = false;
		document.getElementById(id).focus();
		
		$("#" + id + "Panel .nameB").prop("disabled", false);
		$("#" + id + "Panel .contentB").prop("disabled", true);
	};
	
	document.onkeydown = function (e) {
		if (e.key == "Enter") {
			let name, input;
			switch (document.activeElement.id) {
				case "macro":
					edit("macro");
					break;
				case "script":
					edit("script");
					break;
				case "macroInput":
					save("macro");
					break;
			}
		}
	};
	
	$("button").click(function () {
		var action = $(this).data("action");
		var type = $(this).data("type");
		
		if (action == "edit") {
			edit(type);
		}
		else if (action == "save") {
			save(type);
		}
		else if (action == "cancel") {
			console.log(type);
			cancel(type);
		}
	});
	
	$("#navbar span").click(function () {
		$("#navbar span").removeClass("sel");
		$(this).addClass("sel");
		$(".panel").hide();
		$("#" + $(this).data("panel") + "Panel").show();
		
		if ($(this).data("panel") == "set") {
			$("#setPanel pre").text(JSON.stringify(settings, null, 4));
		}
	});
	
	$("#help").click(function () {
		chrome.runtime.sendMessage({type: "open", url: chrome.runtime.getURL("/html/help.html"), focus: true});
	});
});