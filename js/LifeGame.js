//生命游戏js代码
var GameSet = {
	speed: 60,
	line: 32,
	row: 50,
	width: 0,
	height: 0,
	living: 100,
	total: 1600,
	state: "失败",
	times: 0,
};

var cells, run;

function getid() {
	if(arguments.length == 1) {
		var str = arguments[0], pos = new Array(2);
		pos[0] = parseInt(str.substr(0, 2));
		pos[1] = parseInt(str.substr(2, 2));
		return pos;
	}
	else if(arguments.length == 2){
		var xpos = arguments[0].toString(), ypos = arguments[1].toString();
		if(xpos < 10)
			xpos = "0" + xpos;
		if(ypos < 10)
			ypos = "0" + ypos;
		return xpos + ypos;
	}
	else
		return 0;
}

function init() {
	$("#gamebox").empty();
	GameSet.speed = parseInt($("#initspeed").val());
	GameSet.line = parseInt($("#line").val());
	GameSet.row = parseInt($("#row").val());
	GameSet.living = parseInt($("#create").val());
	GameSet.total = GameSet.line * GameSet.row;
	GameSet.width = 990 / GameSet.row;
	GameSet.height = 650 / GameSet.line;
	GameSet.times = 0;
	if(GameSet.row >= 100 || GameSet.line > 66 || GameSet.speed > 720) {
		GameSet.state = "失败";
		statechange(0);
		alert("行数、列数过多，或者速度过快！");
		return;
	}
	GameSet.state = "暂停";
	statechange(0);
	var i = 0, j = 0;
	cells = new Array(GameSet.row + 2);
	for(i = 0; i <= GameSet.row + 1; i++) {
		cells[i] = new Array(GameSet.line + 2);
		for(j = 0; j <= GameSet.line + 1; j++)
			cells[i][j] = 0;
	}
	var cellid;
	for(i = 1; i <= GameSet.row; i++) {
		for(j = 1; j <= GameSet.line; j++) {
			cellid = getid(i, j);
			$("<div>", {id: cellid, class: "cells"}).appendTo($("#gamebox"));
			$("#" + cellid).css({
				display: "block",
                position: "absolute",
                width: GameSet.width - 1 + "px",
                height: GameSet.height - 1 + "px",
                left: 6 + (i - 1) * GameSet.width + "px",
                top: 6 + (j - 1) * GameSet.height + "px",
                backgroundColor: "black",
			}).click(function() {
				if(GameSet.state == "运行")
					return;
				var pos = getid($(this).attr("id"));
				if(cells[pos[0]][pos[1]] == 1) {
					cells[pos[0]][pos[1]] = 0;
					GameSet.living --;
					$(this).css({backgroundColor: "black"});
				}
				else {
					cells[pos[0]][pos[1]] = 1;
					GameSet.living ++;
					$(this).css({backgroundColor: "red"});
				}
				statechange(0);
			});
		}
	}
}

function clear() {
	var cellid;
	for(var i = 1; i <= GameSet.row; i++) {
		for(var j = 1; j <= GameSet.line; j++) {
			cells[i][j] = 0;
			cellid = getid(i, j);
			$("#" + cellid).css({backgroundColor: "black"});
		}
	}
	GameSet.living = 0;
	statechange(0);
}

function initcell() {
	if(GameSet.state == "失败")
		return;
	for(var i = 1; i <= GameSet.row; i++) {
		for(var j = 1; j <= GameSet.line; j++) {
			cells[i][j] = 0;
		}
	}
	if(GameSet.living / GameSet.total >= 0.9)
		return 0;
	else {
		var cellid;
		for(i = 0; i < GameSet.living; i++) {
			while(true) {
				var x = parseInt(1 + Math.random() * GameSet.row), y = parseInt(1 + Math.random() * GameSet.line);
				if(cells[x][y] == 0) {
					cellid = getid(x, y);
					$("#" + cellid).css({backgroundColor: "red"}); 
					cells[x][y] = 1;
					break;
				}
			}
		}
	}
}

function cellschange() {
	if(GameSet.state == "失败")
		return -1;
	var nextcells = new Array(GameSet.row + 2), cellid;
	if(GameSet.living == 0) {
		GameSet.state = "暂停";
		statechange(0);
		clearInterval(run);
		return 0;
	}
	for(var i = 0; i <= GameSet.row + 1; i++)
		nextcells[i] = new Array(GameSet.line + 2);
	for(i = 1; i <= GameSet.row; i++)
		for(var j = 1; j <= GameSet.line; j++) {
			var arroundcells = cells[i - 1][j - 1] + cells[i - 1][j] + cells[i - 1][j + 1] + cells[i][j - 1] + cells[i][j + 1] + cells[i + 1][j - 1] + cells[i + 1][j] + cells[i + 1][j + 1];
			if(arroundcells == 2)
				nextcells[i][j] = cells[i][j];
			else if(arroundcells == 3)
				nextcells[i][j] = 1;
			else
				nextcells[i][j] = 0;
		}
	GameSet.living = 0;
	for(i = 1; i <= GameSet.row; i++)
		for(j = 1; j <= GameSet.line; j++) {
			cells[i][j] = nextcells[i][j];
			cellid = getid(i, j);
			if(cells[i][j] == 1) {
				GameSet.living ++;
				$("#" + cellid).css({backgroundColor: "red"});
			}
			else
				$("#" + cellid).css({backgroundColor: "black"});
		}
	GameSet.times ++;
	statechange(0);
	return 1;
}

function statechange(type) {
	if(type == 0) {
		if(GameSet.state == "运行")
			$("#startbtn").text("暂停");
		else
			$("#startbtn").text("运行");
		$("#runstate").val(GameSet.state);
		$("#times").val(GameSet.times);
		$("#speed").val(GameSet.speed);
		$("#speedcontrol").val(GameSet.speed);
		$("#living").val(GameSet.living);
		$("#dead").val(GameSet.total - GameSet.living);
	}
}

$("#startbtn").click(function() {
	if(GameSet.state == "暂停") {
		GameSet.state = "运行";
		run = window.setInterval("cellschange()", 60000 / GameSet.speed);
	}
	else if(GameSet.state == "运行") {
		GameSet.state = "暂停";
		clearInterval(run);
		statechange(0);
	}
});

$("#nextbtn").click(cellschange);

$("#emptybtn").click(function() {
	if(GameSet.state == "运行")
		alert("游戏正在运行中，您无法清空界面！");
	else if(GameSet.state == "暂停")
		clear();
});

$("#initbtn").click(function() {
	if(GameSet.state == "运行")
		alert("游戏正在运行中，您无法进行初始化！");
	else {
		init();
		initcell();
	}
});

$("#speedcontrol").change(function() {
	if(GameSet.state == "运行")
		alert("游戏正在运行中，您无法修改速度！");
	else
		GameSet.speed = $("#speedcontrol").val();
});

init();
var rlt = initcell();
if(rlt == 0)
	alert("初始的细胞数太多，请重新设置！");