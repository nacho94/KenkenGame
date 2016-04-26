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
				for (var j = 0; j < 2; j++) {
					var c = $("<td>");
					$(c).append(p[j])
					$(row).append(c);
				};
				$(table).append(row);
			}
			
		};
		console.log("res[0]: " + res[0]);
	});
	
}

$(function() {
	createTable();
});