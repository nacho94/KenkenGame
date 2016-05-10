var selectedCell = null;
var dimension = 0;

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

function createChooseNumberTable(n) {
	var t = $("<table>").attr("id","chooseNumber");
	var row = $("<tr>");
	for (var i = 0; i < n; i++) {
		var c = $("<td>").attr("id", "c" + (i+1)).html((i+1));
		$(row).append(c);
	}
	$(t).append(row);

	return t;
}

function assignKenkenInformationToTableCell(cell, number, result, operation, walls) {
	if($(cell).find(".number").length <= 0) {
		var spanNumber = $("<span>").attr("class","number").html(number);
		$(cell).append(spanNumber);
	} else {
		$(cell).find(".number").html(number);
	}
	
	if($(cell).find(".ro").length <= 0) {
		var spanResult = $("<span>").attr("class","result").html(result);
		var spanOperation = $("<span>").attr("class","operation").html(operation);

		var spanRO = $("<span>").attr("class","ro").append(spanResult).append(spanOperation);
		$(cell).append(spanRO);
	} else {
		$(cell).find(".result").html(result);
		$(cell).find(".operation").html(operation);
		$(cell).find(".ro").append(spanResult).append(spanOperation);
	}
	
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
		var cellsRow = findRowFromCell(selectedCell);
		var cellsColunm = findColumnFromCell(selectedCell);
		checkRowsAndColumns($("#kenken-game"));
		/*if(checkDuplicatedNumbers(cellsRow)) {
			markFailedCells(cellsRow);
		}else{
			cleanCellsMark1(cellsRow);
		}

		if(checkDuplicatedNumbers(cellsColunm)) {
			markFailedCells(cellsColunm);
		} else {
			cleanCellsMark1(cellsColunm);
		}*/
	}
}

function checkRowsAndColumns(table) {
	cleanCellsMark(table);
	for (var i = 0; i < dimension; i++) {
		var cell = findCellByCoords(i,0,table);
		var a = findRowFromCell(cell);
		if(checkDuplicatedNumbers(a)) {
			markFailedCells(a);
		}
	}
	for (var i = 0; i < dimension; i++) {
		var cell = findCellByCoords(0,i,table);
		var a = findColumnFromCell(cell);
		if(checkDuplicatedNumbers(a)) {
			markFailedCells(a);
		}
	}
	checkOperationNumbers(selectedCell);
} 

function getKenkenGameDimensions (dom) {
	var root = dom.getElementsByTagName("kenken");
	root = root[0];
	dimension = root.getAttribute("filas");
}

function onClickLoadGame(e) {
	e.preventDefault();
	$.get("http://192.168.56.102/cgi-bin/KenkenLoadGame.cgi", function(data) {
		var xmlparser = new DOMParser();
		var dom = xmlparser.parseFromString(data,"text/xml");
		$("#kenken-game").remove();
		getKenkenGameDimensions(dom);
		$("main").append(createKenkenTable(dimension,dimension)); // las tablas siempre son cuadradas
		var table = $("#kenken-game");
		$("table#kenken-game td").on("click", showKenkenCellInfoOnClick);
		$("main").append(createChooseNumberTable(dimension));
		$("table#chooseNumber td").on("click", onClickKenkenNumbersTable);
		disableChooseNumberTable();
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
		//console.log(borders.join(","));
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

	//console.log("walls: " + walls);
	return walls;
}

function resultKenkenCell(operation) {
	var size = 0;
	size = operation.length;
	var result = "";
	//console.log("size: " + size);
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

function checkDuplicatedNumbers(a) {
	var numbers = [];
	for(var i = 0; i < a.length; i++) {
    	numbers.push(0);
	}	

	for (var i = 0; i < a.length; i++) {
		var n = $(a[i]).find(".number").html();
		console.log(n);
		if(n != "") {
			n = parseInt(n);
			numbers[n-1]++;
		}
	}
	console.log(numbers);

	for (var i = 0; i < a.length; i++) {
		if(numbers[i] > 1) {
			return true;
		}
	}
	
	return false;
}

function checkOperationNumbers(cell) {
	var a = []; 
	cleanVisitedMarks($("#kenken-game"));
	findOperationCells(cell,a);
	var  r = findOperationFromCells(a);
	var result = operateValues(a,r.operation);
	if(result == null) {
		console.log("null");
	} else if(result != r.result){
		console.log("result: " + result);
		console.log("r.result: " + r.result);
		markFailedCells(a);
	}
}

function operateValues(cells, op) {

	switch(op) {
		case "+":
			var suma = parseInt(0);
				for (var i = 0; i < cells.length; i++) {
					var r = $(cells[i]).find(".number").html();
					if(r == "") {
						return null;
					}
					suma = suma + parseInt(r);
				}
			return suma;
		case "-":
			if($(cells[0]).find(".number").html() == "") {
				return null;
			}else {
				var resta = parseInt($(cells[0]).find(".number").html());
				for (var i = 1; i < cells.length; i++) {
					var r = $(cells[i]).find(".number").html();
					if(r == "") {
						return null;
					}
					resta = resta - parseInt(r);
				}
				return resta;
			}
			
		case "x":
			var mul = parseInt(1);
			for (var i = 0; i < cells.length; i++) {
				var r = $(cells[i]).find(".number").html();
				if(r == "") {
					return null;
				}
				mul = mul * parseInt(r);
			}
			return mul;
		case "?":
			if($(cells[0]).find(".number").html() == "") {
				return null;
			} else {
				var div = parseInt($(cells[0]).find(".number").html());
				for (var i = 1; i < cells.length; i++) {
					var r = $(cells[i]).find(".number").html();
					if(r == "") {
						return null;
					}
					div = div / parseInt(r);
				}
				return div;
			}
	}
	
}

function findOperationFromCells(cells) {
	var r = {
		result: "",
		operation: ""
	};
	for (var i = 0; i < cells.length; i++) {
		r.result = $(cells[i]).find(".ro .result").html();
		r.operation = $(cells[i]).find(".ro .operation").html();
		if(r.result != "" && r.operation != "") {
			//console.log("r1: " + r.operation);
			return r;
		}
	}
	return null;
}

function findRowFromCell(cell) {
	return $(cell).parent().find("td").toArray();
}

function findColumnFromCell(cell) {
	var index = $(cell).index();
	var t = $(cell).parent().parent().parent();
	return $(t).find("td:nth-child(" + (index+1) + ")").toArray();

}

function findNCell(cell) {
	//console.log($(cell).attr("data-walls").charAt(0));
	if($(cell).attr("data-walls").charAt(0) == 0) {
		var index = $(cell).index();
		var row = $(cell).parent().prev();
		return $(row).find("td:nth-child(" + (index+1) + ")").get(0);
	}
	return null;
}

function findSCell(cell) {
	if($(cell).attr("data-walls").charAt(2) == 0) {
		var index = $(cell).index();
		var row = $(cell).parent().next();
		return $(row).find("td:nth-child(" + (index+1) + ")").get(0);
	}
	return null;
}

function findECell(cell) {
	if($(cell).attr("data-walls").charAt(1) == 0) {
		return $(cell).next().get(0);
	}
	return null;
}

function findWCell(cell) {
	if($(cell).attr("data-walls").charAt(3) == 0) {
		return $(cell).prev().get(0);
	}
	return null;
}

function findCell(cell, wall) {
	switch(wall) {
    case 0:
        return findNCell(cell);
    case 1:
    	return findECell(cell);
    case 2:
    	return findSCell(cell);
    case 3:  
    	return findWCell(cell);
	}
}

function markCellAsVisited(cell) {
	$(cell).attr("data-visited",true);
}

function cleanVisitedMarks(table) {
	$(table).find("td").removeAttr("data-visited");
}

function isCellVisited(cell) {
	return $(cell).attr("data-visited");
}

function findOperationCells(cell, a) {
	for (var i = 0; i < 4; i++) {
		var c = findCell(cell, i);
		if(c != null && !isCellVisited(c)) {
			a.push(c);
			markCellAsVisited(c);
			findOperationCells(c,a);
		}	
	}
}


function markFailedCells(a) {
	$(a).addClass("failed");
}

function cleanCellsMark(table) {
	$(table).find("td").removeClass("failed");
}

function cleanCellsMark1(a, exclude) {
	$(a).removeClass("failed");
	$(exclude).addClass("failed");
}

function xmlToKenkenData (table, dom) {
	
	var filas = dom.getElementsByTagName("fila");
	for(var i = 0; i< dimension; i++) {
		var fila = filas[i];
		var casillas = fila.getElementsByTagName("casilla");
		for (var j = 0; j < dimension; j++) {
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
	
	
	$("#cargarJuego").on("click", onClickLoadGame);

	$("#test").on("click",function() {
		checkRowsAndColumns($("#kenken-game"));
	});
});