//支付宝自动收能量
//1、android 版本大于7.0，无需root。
//2、要将蚂蚁森林放在支付宝首页。
//3、默认分辨率为1920*1080，其他分辨率会自动缩放，但是不保证正常运行。如果手机修改了分辨率，需要重启才能正确运行。
//4、请允许打开辅助功能和截屏功能。
//5、默认在7：00~7：30启动的话会一直循环运行到7点30分。如果电量少于20%且没有充电则不运行。
//6、全自动实现上一功能需要自己将脚本设置为定时任务，放入白名单，保险的办法是用Tasker。且不能有锁屏，脚本只能点亮屏幕，但是不会自己解锁（大部分手机即使不设锁也需要上划等操作，默认上划屏幕一次）。
//7、其他时间默认运行一次就结束。
//8、运行过程中，只需按返回键就可以结束脚本。
//9、运行过程中出错，会自动矫正，重新开始。
//10、哦，对了，如果遇到有人有能量护罩，手机会像傻子一样点下下去，我的解决办法是把那个人删除好友。
//
//如果需要720p版本（1280*720）请参照酷安ID@NoneNullNa，本版本基于720p版本修改而来
//默认分辨率为2960*1440

//获取手机分辨率
var _width = device.width
var _height = device.height
var zoomX = _width / 1440
var zoomY = _height / 2960

//判断电量是否充足
function power() {
if (device.isCharging()) {
return true
} else {
if (device.getBattery() > 20) {
return true
} else {
toastLog("电量不足")
return false
}
}
}
//判断时间是否合适
function time() {
var da = new Date();
var minutes = da.getMinutes();
var hours = da.getHours();
var time_ = hours * 60 + minutes - 420;
if (time_ >= 0 && time_ <= 30) {
return true
} else {
return false
}
}

//判断是否亮屏，并划开屏幕
function unlock() {
if (!device.isScreenOn()) {
device.wakeUp();
sleep(500);
swipe(_width * 0.5, _height * 0.8, _width * 0.5, _height * 0.2, 200);
}
}
//创建多线程对象，按键监听，按下返回键结束脚本
function over() {
threads.start(function() {
events.observeKey();
events.on("back", function(events) {
toast("退出收集");
exit();
});
});
}

//返回支付宝首页
function backHomePage() {
launchApp("支付宝");
sleep(1000);
while (!className("android.widget.TextView").text("首页").exists()) {
back();
sleep(1000);
};
var bhp = className("android.widget.TextView").text("首页").findOne().bounds()
click(bhp.centerX(), bhp.centerY());
click(bhp.centerX(), bhp.centerY());
sleep(500);
}

//进入蚂蚁森林
function enterForest() {
textEndsWith("蚂蚁森林").findOne(10000);
if (!textEndsWith("蚂蚁森林").exists()) {
toastLog("出错");
backHomePage();
main();
exit();
}
click("蚂蚁森林");
descContains("合种").findOne(20000);
if (!descContains("合种").exists()) {
toastLog("出错");
backHomePage();
main();
exit();
}
sleep(2000);
}

//收集自己能量
function myEnergy() {
while (descStartsWith("收集能量").exists()) {
var p = descStartsWith("收集能量").findOne().bounds();
click(p.centerX(), p.centerY());
sleep(1000);
click(p.centerX(), p.centerY());
};
}

//点击能量球
function clickBall(desc) {
while (descContains(desc).exists()) {
var b = descContains(desc).findOne().bounds();
click(b.centerX(), b.centerY() - 70 * zoomY);
sleep(500);
};
}

//进入排行榜
function enterRank(desc) {
if (descContains("查看更多好友").exists()) {
while (descContains("查看更多好友").exists()) {
var rank = descContains("查看更多好友").findOne(5000).bounds();
if (rank.centerY() > _height) {
swipe(_width * 0.5, _height * 0.8, _width * 0.5, _height * 0.2, 1000)
} else {
break
}
sleep(500);
};
sleep(1000);
click(rank.centerX(), rank.centerY());
} else {
toastLog("出错");
backHomePage();
main();
exit();
}
sleep(2000);
}

//判断可收取的好友返回y坐标
function rectY() {
var img = captureScreen();
sleep(500);
var y = 0;
var x = 1428 * zoomX;
while (y < 2916 * zoomY) {
var r1 = images.detectsColor(img, "#30BF6C", x, y);
var r2 = images.detectsColor(img, "#FFFFFF", x, y + 30 * zoomY);
var r3 = images.detectsColor(img, "#FFFFFF", x, y + 22 * zoomY);
var r4 = images.detectsColor(img, "#30BF6C", x, y + 38 * zoomY);
if (r1 && r2 && r3 && r4) {
return y;
break;
}
y += zoomY;
}
return null;
}

//判断可收集能量好友并收取
function getEnergy() {
while (true) {
var p = rectY();
if (p == null) {
break;
} else {
click(_width * 0.5, p + 60 * zoomY);
descContains("浇水").findOne();
sleep(500);
clickBall("可收取");
back();
sleep(1000);
}
}
}

//判断好友榜是否结束
function isRankEnd() {
if (descContains("没有更多了").exists()) {
var b = descContains("没有更多了").findOne().bounds()
if (b.centerY() < 2960 * zoomY) {
return true
} else {
return false
}
} else {
return false
}
}

//收集
function collect() {
while (!isRankEnd()) {
if (className("android.view.View").depth("13").desc("4").exists()) {
getEnergy();
swipe(_width * 0.5, _height * 0.8, _width * 0.5, _height * 0.2, 1000);
sleep(1000);
} else {
toastLog("出错");
backHomePage();
main();
exit();
}
}
};

//循环执行
function main() {
var n = 0
while (power()) {
launchApp("支付宝");
enterForest();
myEnergy();
enterRank("上校");
collect();
n += 1;
toastLog("收集完成" + n);
if (time() && power()) {
back();
sleep(1500);
back();
sleep(1500)
} else {
back();
sleep(1000);
back();
sleep(1000);
back();
break;
}
}

}

unlock();
auto.waitFor();
requestScreenCapture();
over();
toast("启动支付宝");
main();
exit();
