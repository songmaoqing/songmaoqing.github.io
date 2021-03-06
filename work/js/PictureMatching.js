﻿//连连看js代码
var game = { //游戏的基本设置
    left: 17,  //游戏部分距gamebox最左边的距离 
    top: 9,  //游戏部分距gamebox最顶部的距离
    xdis: 50,  //每个块的宽度
    ydis: 50,  //每个块的高度
    xnum: 14,  //横向块的数量
    ynum: 10,  //纵向块的数量
    xgap: 1,   //块之间的横向间隔
    ygap: 1,  //块之间的纵向间隔
    picpath: "pic/images/",  //图片文件路径
    picname: "img",  //图片名
    picnum: 36  //图片类型数目
};

var play = {  //游戏时的动态设置
    nownum: new Array(),  //记录每种图片的剩余数目
    nowtotal: 0,  //记录图片总数
    playing: false,  //记录是否正在游戏
    type: "easy", //游戏类型，默认为容易
    prepic: "0",  //记录用户点击的上个图片
    lefttime: 180,  //记录剩余时间
    totaltime: 180,  //总时间
    timer,  //计时器
    find: 30,  //寻找道具的个数
    addtime: 3,  //时间道具的个数
    refresh: 3,  //刷新道具的个数
    findpic: new Array("0", "0"),  //寻找道具找到的两张图片
}

var sound={
    clock: 20,   //开始产生倒计时音效的时间
    BGM: true,   //背景音乐
    soundEffect: true   //音效
}

var pictype = new Array(game.xnum + 2);  //记录数组，对应的数是图片类型，如果没有图片则为0
for(var i = 0; i < game.xnum + 2; i++) {
    pictype[i] = new Array(game.ynum + 2);
}

function basicinit() {
    play.prepic = "0";
    play.nowtotal = 0;
    for (var i = 0; i <= game.picnum; i++)
        play.nownum[i] = 0;  //初始化时每种图片数目都为0
    for (var i = 0; i < game.xnum + 2; i++) {
        for (var j = 0; j < game.ynum + 2; j++)
            pictype[i][j] = 0;  //初始化都没有图片
    }
}

function getpicid(x, y) {  //根据图片的相对位置获取id
    var xname, yname, imgname;
    if(x < 10)
        xname = "0" + x;
    else
        xname = x;
    if(y < 10)
        yname = "0" + y;
    else
        yname = y;
    imgname = game.picname + xname + yname;
    return imgname;
}

function getrelpos(picid) {  //根据id获取图片的相对位置
    var relpos = new Array(2);
    relpos[0] = parseInt(picid.substring(picid.length - 4, picid.length - 2));
    relpos[1] = parseInt(picid.substring(picid.length - 2, picid.length));
    return relpos;
}

function getpos(x, y) {   //根据图片的相对位置获取图片的中心位置
    var pos = new Array(2);
    pos[0] = game.left + (x - 1) * (game.xgap + game.xdis) + game.xdis / 2;
    pos[1] = game.top + (y - 1) * (game.ygap + game.ydis) + game.ydis / 2;
    return pos;
}

function ispathexist(pos1, pos21, pos22, type) {  //判断直线路径是否存在
    if(pos21 > pos22) {
        var p = pos21;
        pos21 = pos22;
        pos22 = p;
    }  //保证pos21必须比pos22小
    if(type == 0) {
        for(var i = pos21 + 1; i < pos22; i++) {
            if(pictype[i][pos1] != "0")
                return false;
        }
    }
    else {
        for (var i = pos21 + 1; i < pos22; i++) {
            if (pictype[pos1][i] != "0")
                return false;
        }
    }
    //type用于控制类型(是横直线还是竖直线)，如果两个块之间的所有块的display属性都已经为none，即对应的数组存储值为0，那么说明路径存在, 返回true，否则，路径不存在，直接返回false
    return true;
}

function drawline(pos1, pos21, pos22, type) {  //在两个块之间画一条直线
    if(pos21 > pos22) {
        var p = pos21;
        pos21 = pos22;
        pos22 = p;
    }  //保证pos21必须比pos22小
    if(type == 1) {  //type为1，画竖线
        $("<div>", {class: "line"}).appendTo($("#game")).css({
            display: "block",
            position: "absolute",
            width: "2px",
            height: (pos22 - pos21) + 2 + "px",
            left: pos1 + "px",
            top: pos21 + "px",
            backgroundColor: "red",
        });
    }
    else {   //否则，画横线
        $("<div>", {class: "line"}).appendTo($("#game")).css({
            display: "block",
            position: "absolute",
            width: pos22 - pos21 + 2 + "px",
            height: "2px",
            top: pos1 + "px",
            left: pos21 + "px",
            backgroundColor: "red",
        });
    }
}

function drawlines(path, pos1) {  //画线，与寻找路径函数相对应
    var linenum = path[0][0];
    var prepos = new Array(2);
    prepos[0] = pos1[0];
    prepos[1] = pos1[1];  //上一个点
    for(var i = 1; i <= linenum; i++) {  //遍历每个点
        var j = path[i][1], pos2 = new Array(2);
        if(j == 0) {
            pos2[0] = path[i][0];
            pos2[1] = prepos[1];
        }
        else {
            pos2[1] = path[i][0];
            pos2[0] = prepos[0];
        }
        var abspos1 = getpos(prepos[0], prepos[1]), abspos2 = getpos(pos2[0], pos2[1]);
        drawline(abspos1[1 - j], abspos1[j], abspos2[j], j);  //在对应的位置画线
        prepos = pos2; 
    }
}

function getpath(pos1, pos2) {  //判断两个块之间是否有路径存在
    var path = new Array(4);
    for (var h = 0; h < 4; h++) {
        path[h] = new Array(2);
        path[h][0] = -1;
        path[h][1] = -1;
    }   //0位置记录对应的位置，因为两个先后的块x或y坐标中的一个必定相同，所以只需要记录一个；1位置记录路径类型，1代表为竖路径，0代表为横路径
    for (var i = 0; i < 2; i++) {   //先检查没有转折的路径是否存在
        if (pos1[i] == pos2[i] && ispathexist(pos1[i], pos1[1 - i], pos2[1 - i], 1 - i)) {
            path[0][0] = 1;
            path[1][0] = pos2[1 - i];
            path[1][1] = 1 - i;
            return path;
        }
    }
    if (pos1[0] != pos2[0] && pos1[1] != pos2[1])  //检查有一个转折的路径是否存在
        for (var i = 0; i < 2; i++)
            if (ispathexist(pos1[i], pos1[1 - i], pos2[1 - i], 1 - i) && ispathexist(pos2[1 - i], pos1[i], pos2[i], i))
                if ((i == 0 && pictype[pos1[0]][pos2[1]] == "0") || (i == 1 && pictype[pos2[0]][pos1[1]] == "0")) {
                    path[0][0] = 2;
                    path[1][0] = pos2[1 - i];
                    path[1][1] = 1 - i;
                    path[2][0] = pos2[i];
                    path[2][1] = i;
                    return path;
                }
    /*以下检查有两个转折的路径是否存在，四个循环对应上下左右四个方位*/
    for (var i = pos1[0] - 1; i >= 0; i--)     
        if (pictype[i][pos1[1]] != 0)
            break;
        else if (ispathexist(i, pos1[1], pos2[1], 1) && pictype[i][pos2[1]] == "0" && ispathexist(pos2[1], i, pos2[0], 0)) {
            path[0][0] = 3;
            path[1][0] = i;
            path[1][1] = 0;
            path[2][0] = pos2[1];
            path[2][1] = 1;
            path[3][0] = pos2[0];
            path[3][1] = 0; 
            return path;
        }
        
    for (var i = pos1[0] + 1; i <= game.xnum + 1; i++)
        if (pictype[i][pos1[1]] != 0)
            break;
        else if (ispathexist(i, pos1[1], pos2[1], 1) && pictype[i][pos2[1]] == "0" && ispathexist(pos2[1], i, pos2[0], 0)) {
            path[0][0] = 3;
            path[1][0] = i;
            path[1][1] = 0;
            path[2][0] = pos2[1];
            path[2][1] = 1;
            path[3][0] = pos2[0];
            path[3][1] = 0;
            return path;
        }
    for (var i = pos1[1] - 1; i >= 0; i--)
        if (pictype[pos1[0]][i] != 0)
            break;
        else if (ispathexist(i, pos1[0], pos2[0], 0) && pictype[pos2[0]][i] == "0" && ispathexist(pos2[0], i, pos2[1], 1)) {
            path[0][0] = 3;
            path[1][0] = i;
            path[1][1] = 1;
            path[2][0] = pos2[0];
            path[2][1] = 0;
            path[3][0] = pos2[1];
            path[3][1] = 1;
            return path;
        }
    for (var i = pos1[1] + 1; i <= game.ynum + 1; i++)
        if (pictype[pos1[0]][i] != 0)
            break;
        else if (ispathexist(i, pos1[0], pos2[0], 0) && pictype[pos2[0]][i] == "0" && ispathexist(pos2[0], i, pos2[1], 1)) {
            path[0][0] = 3;
            path[1][0] = i;
            path[1][1] = 1;
            path[2][0] = pos2[0];
            path[2][1] = 0;
            path[3][0] = pos2[1];
            path[3][1] = 1;
            return path;
        }
    return false;
}

function findpath() { //找到游戏中相匹配的两个块，寻找道具会调用这个函数
    if(play.prepic != "0") {  //如果用户在使用道具前点击了一个块，那么将这个块的状态还原
        var pos1 = getrelpos(play.prepic);
        setbackground(play.prepic, pictype[pos1[0]][pos1[1]], 0);
        play.prepic = "0";
    }
    if(play.findpic[0] != "0") {  //如果之前已经用过一次寻找道具且没有点击新的块，将之前的两个块还原
        for(var i = 0; i < 2; i++) {
            var pos1 = getrelpos(play.findpic[i]);
            setbackground(play.findpic[i], pictype[pos1[0]][pos1[1]], 0);
        }
    }
    for(var i = 1; i <= game.picnum; i++) {  
        var class1 = $(".pic" + i);  //遍历所有类，每个类对应一种图片
        for(var j = 0; j < class1.length; j++) {  //从第一个元素开始
            for(var k = j + 1; k < class1.length; k++) {
                var pos1 = getrelpos(class1[j].id), pos2 = getrelpos(class1[k].id);
                if(getpath(pos1, pos2) != false) {  //如果找到了路径
                    if(class1[j].id == play.findpic[0] || class1[j].id == play.findpic[1])  //如果是之前找到的，跳过，找新的
                         continue;
                    class1[j].style.backgroundImage = "url(" + game.picpath + pictype[pos1[0]][pos1[1]] + "_over.gif";
                    class1[k].style.backgroundImage = "url(" + game.picpath + pictype[pos2[0]][pos2[1]] + "_over.gif";
                    play.findpic[0] = class1[j].id;
                    play.findpic[1] = class1[k].id;
                    return true;  //否则，修改两个块的状态，记录两个块的id，返回
                }
            }
        }
    }
    return false;
}

function settime() { //设置时间
    var min = parseInt(play.lefttime / 60), sec = parseInt(play.lefttime % 60);
    if(sec < 10)
        sec = 0 + sec.toString();
    if(min < 10)
        min = 0 + min.toString(); 
    $("#timer").html(min + ":" + sec);
    //获取分数和秒数然后设置文本内容
    $("#pro").attr("value", play.lefttime);  //设置进度条内容
}

function starttimer() {  //开始计时
    play.timer = setInterval(function () {
        play.lefttime -= 1 / 10;  //每隔一段时间，剩余时间需要减少
        settime();   //设置时间显示
        if(play.lefttime <= 0) {
            gameover();
        } //如果剩余时间小于等于0，游戏结束
        if(play.lefttime <= sound.clock && play.lefttime >= sound.clock - 0.2 && sound.soundEffect == true)
        		$("#alarm").attr("src", "./sound/alarm.wav");
        if(play.lefttime >= sound.clock)
        	document.getElementById("alarm").pause();
    }, 100)
}

function stoptimer() {  //暂停计时，用于暂停按钮
    clearInterval(play.timer);
}

function addtime(num) { //增加剩余时间，用于道具和用户奖励
	playSound("addTime");
    play.lefttime += num;
    if(play.lefttime > play.totaltime)  //防止时间超标
        play.lefttime = play.totaltime;
}

function changepicclass(id1, id2) {  //交换两个块的class
    var pos1 = getrelpos(id1);
    var class1 = "pic" + pictype[pos1[0]][pos1[1]];
    $("#" + id1).removeClass(class1);  //如果只有一个参数，移除第一个参数的图片类
    if(typeof id2 != "undefined") {  //否则，交换着两个参数的图片类
        var pos2 = getrelpos(id2);
        var class2 = "pic" + pictype[pos2[0]][pos2[1]];
        $("#" + id2).removeClass(class2);
        $("#" + id1).addClass(class2);
        $("#" + id2).addClass(class1);
    }
}

function changeblock(x1, y1, x2, y2) {  //交换两个块的内容
    if(x1 == x2 && y1 == y2)  //如果相等，不需要交换，直接退出
        return;
    var type1 = pictype[x1][y1], type2 = pictype[x2][y2];
    var name1 = getpicid(x1, y1), name2 = getpicid(x2, y2);
    changepicclass(name1, name2);  //先交换两个块的图片类
    if(type2 != 0) {
        $("#" + name1).css({
            "background-image": "url(" + game.picpath + type2 + ".gif)",
            "display": "block"
        });
    }
    else {
        $("#" + name1).css("display", "none");
    }  //将第二个块的是属性设置好
    if(type1 != 0) {
        $("#" + name2).css({
            "background-image": "url(" + game.picpath + type1 + ".gif)",
            "display": "block"
        });
    }
    else {
        $("#" + name2).css("display", "none");
    }  //将第一个块的属性设置好
    pictype[x1][y1] = type2;
    pictype[x2][y2] = type1;  //更改记录数组的参数
}

function refresh() {  //刷新函数，刷新道具使用这个函数
	playSound("refresh");
    play.prepic = 0;
    for(var i = 1; i < game.xnum; i++) {
        for(var j = 1; j < game.ynum; j++) {  //遍历所有的块
            var changex = parseInt(Math.random() * game.xnum) + 1, changey = parseInt(Math.random() * game.ynum) + 1;
            //随机产生一个新的块坐标
            if(changex != i || changey != j)  //如果坐标不相等，交换这两个块的内容
                changeblock(i, j, changex, changey);
        }
    }
    if(play.type == "hard")
        for(var i = 1; i <= game.xnum; i++)
            gravity(i);
}

function gameover() {  //时间结束函数
    if(play.lefttime < 0)
        play.lefttime = 0;
    play.lefttime = parseInt(play.lefttime);  //由于计时器间隔不为整，所以lefttime可能为小数，转换为整数
    if(play.nowtotal == 0)
        playSound("victory");
    else
        playSound("fail");
    document.getElementById("bgm").pause();
    document.getElementById("alarm").pause();
    stoptimer();  //停止计时
    $(".play").css("display", "none");  //隐藏游戏块
    $(".gameover").css("display", "block");  //显示游戏结束块
    $("#overtime").html("您的剩余时间：" + play.lefttime + "s");
    $("#overnums").html("您的剩余块数：" + play.nowtotal);
    var integ = (game.xnum * game.ynum - play.nowtotal) * 3 + play.lefttime + 7 * play.find + 15 * play.refresh + 25 * play.addtime;
    $("#overint").html("您的最终积分：" + integ);  //设置结束参数
    var top = 0;
    var over = setInterval(function () {  //用动画显示出游戏结束的界面，增加用户体验
        $("#over").css({"top": top + "px"});
        top += 2;
        if(top >= 150)
            clearInterval(over);  //到达指定位置停止
    }, 10);
    distroy();
}

function setbackground(id ,type1, type2) {  //设置背景
    if(type2 == 0) {
        $("#" + id).css("background-image", "url(" + game.picpath + type1 + ".gif)");
    }
    else {
        $("#" + id).css("background-image", "url(" + game.picpath + type1 + "_over.gif)");
    }
}

function gravity(xpos) {  //重力效果
    var nowpos = game.ynum, change = false;
    for(var i = game.ynum; i >= 0; i--) {
        if(pictype[xpos][i] != 0) {  //将一列的所有块都往下移，填补空白
            changeblock(xpos, i, xpos, nowpos);
            if(i != nowpos)  //由于两个数可能相等，而相等时重力实际没有发挥作用，所以此处需要保证两个数不相等
                change = true;
            nowpos--;
        }
    }
    return change;  //返回为真，说明重力发挥了作用
}

function mouseclick() {  //鼠标点击图标时的事件
    if(play.findpic[0] != "0") {  //将寻找道具改变的两个图片样式变为正常样式
        for(var i = 0; i < 2; i++) {
            var pos1 = getrelpos(play.findpic[i]);
            setbackground(play.findpic[i], pictype[pos1[0]][pos1[1]], 0);
            play.findpic[i] = "0";
        }
    }
    var id = $(this).attr("id");
    var pos = getrelpos(id);
    //console.log(play.prepic);
    if(play.prepic == "0") {  //如果之前没有点击图片，将现在点击的图片记录成之前点击的图片
        //console.log(id);
        $(this).css("background-image", "url(" + game.picpath + pictype[pos[0]][pos[1]] + "_over.gif)");
        play.prepic = id;
        playSound("click");
    }
    else {
        if (play.prepic == id) {  //如果和之前点击的图片相同，将这个图片复原
            $(this).css("background-image", "url(" + game.picpath + pictype[pos[0]][pos[1]] + ".gif)");
            play.prepic = "0";
            playSound("click");
        }
        else {
            prepos = getrelpos(play.prepic);
            var type1 = pictype[pos[0]][pos[1]], type2 = pictype[prepos[0]][prepos[1]];
            if (type1 == type2) {  //如果两个图片的类型相同
                var path = getpath(prepos, pos);  //寻找路径
                if (path != false) {  //如果路径存在
                    drawlines(path, prepos);
                    setTimeout(function () {
                        $(".line").remove();
                    }, 200);  //画线并移除线
                    play.nownum[type1]--;
                    play.nownum[type2]--;
                    addtime(2);
                    play.nowtotal -= 2;  
                    changepicclass(play.prepic);
                    changepicclass(id);
                    pictype[pos[0]][pos[1]] = 0;
                    pictype[prepos[0]][prepos[1]] = 0;  //改变记录数组的数值
                    $(this).css("display", "none");
                    $("#" + play.prepic).css("display", "none");
                    play.prepic = "0";
                    playSound("match");
                    if (play.type == "hard") {  //如果为困难模式，需要产生重力效果
                        setTimeout(function () {
                            var change1 = false, change2 = false;
                            change1 = gravity(pos[0]);
                            change2 = gravity(prepos[0]);
                            if(change1 == true || change2 == true)  //如果重力发挥作用，播放音乐
                                playSound("fall");
                        }, 200);
                    }
                    if (play.nowtotal == 0) {  //所有块消除时游戏结束
                        gameover();
                    }
                    return;
                }
            }
            //程序运行到这里，说明现在的块和之前的块之间没有路径连通，改变样式
            $("#" + play.prepic).css("background-image", "url(" + game.picpath + pictype[prepos[0]][prepos[1]] + ".gif)");
            $(this).css("background-image", "url(" + game.picpath + pictype[pos[0]][pos[1]] + "_over.gif)");
            play.prepic = id;
            playSound("click");
        }
    }
}

function init() {  //初始化函数
    $(".props").removeAttr("disabled");
    $("#bgm").attr("src", "./sound/bgm.mp3");
    basicinit();
    if(play.type == "easy") {
        play.addtime = 3;
        play.find = 4;
        play.refresh = 2;
        play.totaltime = 180;
        play.lefttime = 180;
    }
    else {
        play.addtime = 5;
        play.refresh = 3;
        play.find = 8;
        play.totaltime = 240;
        play.lefttime = 240;
    }
    //根据难度初始化不同的参数
    $(".start").css("display", "none");
    $(".gameover").css("display", "none");
    $("#pro").attr("max", play.totaltime);
    $("#addtime").html("时间道具(" + play.addtime + ")");
    $("#refresh").html("刷新道具(" + play.refresh + ")");
    $("#find").html("寻找道具(" + play.find + ")");
    //初始化设置
    settime();
    for(var i = 1; i <= game.xnum; i++) {  //这个循环是设置所有的游戏块
        for(var j = 1; j <= game.ynum; j++) {
            var img = getpicid(i, j);
            var type = parseInt(Math.random() * game.picnum) + 1;
            pictype[i][j] = type;
            play.nownum[type]++;
            play.nowtotal++;
            $("<div>", {id: img, class: "pic" + type}).appendTo($("#game"));
            $("#" + img).css({
                display: "block",
                position: "absolute",
                width: game.xdis + "px",
                height: game.ydis + "px",
                left: (game.left + (i - 1) * (game.xgap + game.xdis)) + "px",
                top: (game.top + (j - 1) * (game.ygap + game.ydis)) + "px",
                backgroundImage: "url(" + game.picpath + type + ".gif)",
                backgroundSize: "100% 100%",
            });  //游戏块的css样式设置
            $("#" + img).addClass("img").click(mouseclick);  //每个游戏块都绑定这个函数
        }
    }
    $(".play").css("display", "block");  //展示游戏块
    var odd = 0;
    for(var i = 1; i <= game.picnum; i++) {  //由于可能某种图片可能有奇数个，此处为将奇数个的图片转换成偶数个
        if(play.nownum[i] % 2 == 1) {
            if(odd == 0)
                odd = i;
            else {
                var obj1 = $(".pic" + odd);
                obj1[0].className = "play img pic" + i;
                play.nownum[odd]--;
                play.nownum[i]++;
                var pos1 = getrelpos(obj1[0].id);
                pictype[pos1[0]][pos1[1]] = i;
                obj1[0].style.backgroundImage = "url(" + game.picpath + i + ".gif";
                odd = 0;
            }
        }
    }
    starttimer(); //开始计时
}

function distroy() {
    $("#game").empty();  //清除所有的游戏块
    basicinit();
    clearInterval(play.timer);
}

function controlSound(target)  //声音控制
{
    if(target == "BGM")  //背景音乐
    {
        if(sound.BGM == true)
        {
            sound.BGM = false;
            $("#switch_BGM").html("开启音乐");
            document.getElementById("bgm").pause();
        }
        else
        {
            sound.BGM = true;
            $("#switch_BGM").html("关闭音乐");
            document.getElementById("bgm").play();
        }
    }
    else if(target == "soundEffect")  //音效
    {
        if(sound.soundEffect == true)
        {
            sound.soundEffect = false;
            document.getElementById("alarm").pause();
            $("#switch_soundEffect").html("开启音效");
        }
        else
        {
            if(play.lefttime <= sound.clock)
                document.getElementById("alarm").play();
            sound.soundEffect = true;
            $("#switch_soundEffect").html("关闭音效");
        }
    }
}

function playSound(type)  //音效控制
{
    if(sound.soundEffect == true)  //音效为真才能播放
    {
        if(type == "victory")
            $("#soundEffect").attr("src", "./sound/" + type +".mp3");
        else
            $("#soundEffect").attr("src", "./sound/" + type +".wav");
        document.getElementById("soundEffect").play();
    }
}

$("#addtime").click(function() {
    if(play.addtime > 0) {
        addtime(20);
        play.addtime--;
        $(this).html("时间道具(" + play.addtime + ")");
        if(play.addtime == 0)
            $(this).attr("disabled", "true");
    }
});
$("#refresh").click(function () {
    if(play.refresh > 0) {
        refresh();
        play.refresh--;
        $(this).html("刷新道具(" + play.refresh + ")");
        if(play.refresh == 0)
            $(this).attr("disabled", "true");
    }
});
$("#find").click(function () {
    if(play.find > 0) {
        if(findpath() != false) {
            play.find--;
            playSound("findpath");
            $(this).html("寻找道具(" + play.find + ")");
        }
        else {
            alert("已经不存在能够匹配的图片，请使用刷新道具！");
        }
        if(play.find == 0)
            $(this).attr("disabled", "true");
    }
});
$("#easy").click(function () {
    play.type = "easy";
    init();
    document.getElementById("bgm").volume=0.7;
});
$("#hard").click(function () {
    play.type = "hard";
    init();
    document.getElementById("bgm").volume=0.7;
});
$("#endgame").click(function () {
    gameover();
});
$("#back").click(function () {
    distroy();
    document.getElementById("bgm").pause();
    document.getElementById("alarm").pause();
    $(".play").css("display", "none");
    $(".start").css("display", "block");
});
$("#restart").click(function () {
    document.getElementById("alarm").pause();
    distroy();
    init();
});
$("#back1").click(function () {
    document.getElementById("bgm").pause();
    document.getElementById("alarm").pause();
    $(".gameover").css("display", "none");
    $(".play").css("display", "none");
    $(".start").css("display", "block");
});

