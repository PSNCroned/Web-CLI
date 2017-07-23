$("td").click(function () {
	var anchor = $(this).data("anchor");
	console.log(anchor);
	location.hash = "#cmd_" + anchor;
});