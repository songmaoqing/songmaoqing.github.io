var nums = 3, total = 3, admin = false, admincle, adminpic = "pic/admin.png";

window.addEventListener("load", function () {  //避免误操作，在页面载入完成后再进行有关的设置
    var mer = document.getElementById("announce");
    mer.onmouseover = function () {
        this.stop();
    };
    mer.onmouseout = function () {
        this.start();
    };  //以上为设置公告栏的滚动
    getlatest();  //获取最新的三条消息
    var socket = io.connect("https://wall.cgcgbcbc.com");  //连接服务器
    socket.on("new message", function (data) {
        addmessage(data["headimgurl"], data["nickname"], data['content']);
    })   //如果监听到新消息，就设置好
    socket.on("admin", function (data) {  //监听管理员消息
        if(admin == false)  //如果此前不存在管理员消息，直接添加
        {
            addmessage(adminpic, data["nickname"], data["content"]);
            admincle = setTimeout(clearadmin, 10000);  //10s后清除管理员消息
        }
        else   //如果此前存在管理员消息
        {
            clearTimeout(admincle);   //清除之前的计时
            setmessage(total, adminpic, data["nickname"], data["content"]);  //直接覆盖内容
            admincle = setTimeout(clearadmin, 10000);   //10s后清除管理员消息
        }
    })
} , false);

function changeid(oldid, newid) {
//更改一个消息显示块的所有id，因为我在消息更换过程中并没有增加和删除块，只是隐藏和显示块，所以需要id的改变
    document.getElementById("page" + oldid).id = "page" + newid.toString();
    document.getElementById("photo" + oldid).id = "photo" + newid.toString();
    document.getElementById("name" + oldid).id = "name" + newid.toString();
    document.getElementById("context" + oldid).id = "context" + newid.toString();
    document.getElementById("circle" + oldid).id = "circle" + newid.toString();
    document.getElementById("loading" + oldid).id = "loading" + newid.toString();
}

function addmessage(pic, name, context) {
    //添加消息
    var top = 170, distance = 160;
    document.getElementById("page1").style.display = 'none'; //将最后一页设为不可见
    var start = new Array();
    for(var i = nums; i > 1; i--)
        start[i] = top + (total - i) * distance;
    var replace = setInterval(function () {
        var obj;
        for(var i = 2; i <= nums; i++)
        {
            obj = document.getElementById("page" + i.toString());
            start[i] += 5;
            obj.style.top = start[i] + "px";
        }  //对剩余的几页进行滚动动画
        if(start[2] >= top + 2 * distance)  //如果已经到了这里，说明滚动需要结束了
        {
            for(var i = 1; i <= nums; i++)
                changeid(i, i - 1);
            changeid(0, nums);  //交换对应的id，因为滚动后div的位置改变了
            var obj1 = document.getElementById("page" + nums);
            obj1.style.top = top + (total - nums) * distance + "px";
            obj1.style.display = "block";  //显示出原先被隐藏的div块
            setmessage(nums, pic, name, context);  //设置消息内容
            if(pic == adminpic)  //如果是管理员，那么将nums设为total-1，admin设为true，这样子，下次滚动的时候就不会带上管理员消息，即只滚动total - 1 个
            {
                nums = total - 1;
                admin = true;
            }
            clearInterval(replace);  //结束滚动
        }
    },10)
}

function clearadmin(){  //清除管理员消息
    nums = total;  //滚动数目重新设为total
    document.getElementById("page" + total).style.backgroundColor = "black";
    document.getElementById("context" + total).style.color = "white";  //将背景和文字变回原态
    admin = false;  //管理员状态为假
    getlatest();  //获取最新的三条消息并显示
}
function setmessage(id, pic, name, context) {
    var obj1 = document.getElementById("photo" + id), obj2 = document.getElementById("name" + id), obj3 = document.getElementById("context" + id);
    obj1.style.display = "none";
    document.getElementById("circle" + id).style.display = "block";
    document.getElementById("loading" + id).style.display = "block";
    //在图片没有加载以前，先将显示动画的两个块显示出来
    obj1.src = pic;
    obj2.innerText = name;  //设置好图片和用户名
    if(context.length > 14 && obj3.tagName == "DIV")  //如果图片消息过长且目前为div块
    {
        obj3.parentNode.removeChild(obj3);
        var obj4 = document.createElement("marquee");
        obj4.id = "context" + id;
        obj4.className = "context";
        obj4.scrollAmount = 15;
        //以上消息为移除div块，新增marquee块（这个块可以滚动文字），并且二者的属性一样
        obj4.onmouseover = function () {
            this.stop();
        }
        obj4.onmouseout = function () {
            this.start();
        }
        obj4.innerText = context;
        obj2.parentNode.appendChild(obj4);
        //将新增的marquee块增加到元素中
    }
    else if(context.length <= 14 && obj3.tagName == "MARQUEE")  //同理，如果文字过短，需要移除滚动效果，在这里删除marquee块，增加div块即可
    {
        obj3.parentNode.removeChild(obj3);
        var obj4 = document.createElement("div");
        obj4.id = "context" + id;
        obj4.className = "context";
        obj4.innerText = context;
        obj2.parentNode.appendChild(obj4);
    }
    else   //否则，正常地添加文字
        obj3.innerText = context;
    if(pic == adminpic)  //如果是管理员，需要设计好管理员对应的样式
    {
        document.getElementById("page" + total).style.backgroundColor = "green";
        document.getElementById("context" + total).style.color = "red";
    }
    obj1.onload = function () {  //在头像图片载入成功后，显示头像图片，隐藏动画
        obj1.style.display = "block";
        document.getElementById("circle" + id).style.display = "none";
        document.getElementById("loading" + id).style.display = "none";
    }
}

function getlatest(){   //获取最新的几条消息
    var xhr = new XMLHttpRequest();
    xhr.open("get", "https://wall.cgcgbcbc.com/api/messages?num=3", true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4)   //如果已经成功接收消息
        {
            var data = xhr.responseText;
            var ele = JSON.parse(data);  //转换为数组
            for(var i = 0; i < total; i++)   //设置对应的消息
                setmessage(total - i, ele[i]["headimgurl"], ele[i]["nickname"], ele[i]['content'])
        }
    }
}
