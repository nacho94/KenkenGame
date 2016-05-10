function createTable() {
	//var string = "kenken1.xml 44KB-kenken2.xml 56KB"

	$.get("http://192.168.56.102/cgi-bin/KenkenListGames.cgi", function(data) {
		console.log(data);
		var res = data.split("-");
		var table = $("#pasatiempos")
		
		for (var i = 0; i < res.length; i++) {
			if(res[i] != "") {
				var row = $("<tr>");
				var p = res[i].split(" ");
				var c = $("<td>");
				var a = $("<a>");
				$(a).html(p[0]).attr("href", "jugar.html?filename=" + p[0]);
				$(c).append(a);
				$(row).append(c);
				c = $("<td>");
				$(c).html(p[1]);
				$(row).append(c);
				$(table).append(row);
			}
			
		};
		console.log("res[0]: " + res[0]);
	});
	
}

$(function() {
	createTable();
});