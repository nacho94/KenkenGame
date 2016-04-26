var selectedCell = null;

function createKenkenTable(width, heigh) {
	var t = $("<table>").attr("id", "kenken-game");
	for (var i = 0; i < heigh; i++) {
		var row = $("<tr>");
		for (var j = 0; j < width; j++) {
			var c = $("<td>");
			assignKenkenInformationToTableCell(c);
			$(row).append(c);
		};
		$(t).append(row);
	};
	return t;
}

function assignKenkenInformationToTableCell(cell, number, result, operation, walls) {
	var spanNumber = $("<span>").attr("class","number").html(number);
	$(cell).append(spanNumber);

	var spanResult = $("<span>").attr("class","result").html(result);
	var spanOperation = $("<span>").attr("class","operation").html(operation);

	var spanRO = $("<span>").attr("class","ro").append(spanResult).append(spanOperation);
	$(cell).append(spanRO);
	$(cell).attr("data-walls",walls);
}

function findCellByCoords(x, y, table) {
	return $(table).find("tr:eq(" + (x-1) + ") td:eq(" + (y-1) + ")");
}

function showKenkenCellInfoOnClick(event) {
	event.stopPropagation();
	selectedCell = $(this);
	$("#chooseNumber").show();
	$("#chooseNumber tr td").css({
		"font-weight": "normal",
		"font-size": "initial"
	});
	$("#chooseNumber #c" + $(this).find("span.number").html()).css({
		"font-weight": "bold",
		"font-size": "x-large"
	});
	$("#chooseNumber").css({
		"top": event.clientY,
		"left": event.clientX 
	});
}

function disableChooseNumberTable() {
	$("#chooseNumber").hide();
}

function assignKenkenNumberToTableCell(cell, number) {
	$(cell).find(".number").html(number);
}

function onClickKenkenNumbersTable(event) {
	if(selectedCell != null) {
		assignKenkenNumberToTableCell(selectedCell, $(this).html());
	}
}

function getKenkenGameDimensions (dom) {
	var root = dom.getElementsByTagName("kenken");
	root = root[0];
	return root.getAttribute("filas");
}

function onClickLoadGame(e) {
	e.preventDefault();
	$.get("http://192.168.56.102/cgi-bin/KenkenLoadGame.cgi", function(data) {
		//var result = JSON.parse(data);
		console.log(data);
		var xmlparser = new DOMParser();
		var dom = xmlparser.parseFromString(data,"text/xml");
		console.log(dom);
		$("#kenken-game").remove();
		var d = getKenkenGameDimensions(dom);
		$("main").append(createKenkenTable(d,d)); // las tablas siempre son cuadradas
		var table = $("#kenken-game");
		xmlToKenkenData(table,dom);
		drawKenkenCellsWalls(table);
	});
}

function drawKenkenCellsWalls(table) {
	$(table).find("td").each(function(index, cell) {
		var w = $(cell).attr("data-walls");
		var borders = [];
		var colors = [];
		if(w == undefined) {
			return;
		}
		for(var i=0; i<4; i++) {
			var a = parseInt(w.charAt(i));
			borders.push((a+1) + "px");
			colors.push(a == 0 ? "silver" : "black");
		}
		console.log(borders.join(","));
		$(cell).css("border-width",borders.join(" "));
		$(cell).css("border-color",colors.join(" "));
	});
}

function kenkenWallsToString(norte, este, sur, oeste) {
	var walls = "";
	if(norte == "true") {
		walls += 1;
	}else {
		walls += 0;
	}
	if(este == "true") {
		walls += 1;
	}else {
		walls += 0;
	}
	if(sur == "true") {
		walls += 1;
	}else {
		walls += 0;
	}
	if(oeste == "true") {
		walls += 1;
	}else {
		walls += 0;
	}

	console.log("walls: " + walls);
	return walls;
}

function resultKenkenCell(operation) {
	var size = 0;
	size = operation.length;
	var result = "";
	console.log("size: " + size);
	for(var i = 0; i<(size-1); i++) {
		result += operation.charAt(i);
	}
	return result;
}

function operationKenkenCell(operation) {
	var size = 0;
	size = operation.length;
	var result = "";
	result = operation.charAt(size-1);
	return result;
}

function xmlToKenkenData (table, dom) {
	
	var numFilas = getKenkenGameDimensions(dom);
	console.log("numFilas: " + numFilas);
	var filas = dom.getElementsByTagName("fila");
	for(var i = 0; i< numFilas; i++) {
		var fila = filas[i];
		var casillas = fila.getElementsByTagName("casilla");
		for (var j = 0; j < numFilas; j++) {
			var casilla = casillas[j];
			
			var walls = kenkenWallsToString(casilla.getAttribute("norte"),casilla.getAttribute("este"),casilla.getAttribute("sur"),casilla.getAttribute("oeste"));
			var result = "";
			var operation = "";
			if(casilla.getElementsByTagName("operacion")[0] != undefined) {
				var x = casilla.getElementsByTagName("operacion")[0].childNodes[0];
				result = resultKenkenCell(x.nodeValue);
				operation = operationKenkenCell(x.nodeValue);

			}
			var cell = findCellByCoords(i+1,j+1, table);
			assignKenkenInformationToTableCell(cell,"",result, operation, walls);
		};
		
	}
}

$(function() {
	$("body").on("click",disableChooseNumberTable);
	$("table#kenken-game td").on("click", showKenkenCellInfoOnClick);	
	$("table#chooseNumber td").on("click", onClickKenkenNumbersTable);
	$("#cargarJuego").on("click", onClickLoadGame);
});