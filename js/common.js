layui.config({
    base: "/js/",
}).use(["zadmin", "tabRightMenu"], function () {
    var zadmin = layui.zadmin;
    var tabRightMenu = layui.tabRightMenu;

    // 渲染 tab 右键菜单.
    tabRightMenu.render({
        filter: "lay-tab",
        pintabIDs: ["main"],
        width: 110,
    });
});