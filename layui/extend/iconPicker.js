/**
 * Layui图标选择器
 * @author wujiawei0926@yeah.net
 * @version 1.1
 */

layui.define(['laypage', 'form'], function (exports) {
    "use strict";

    var IconPicker =function () {
        this.v = '1.1';
    }, _MOD = 'iconPicker',
        _this = this,
        $ = layui.jquery,
        laypage = layui.laypage,
        form = layui.form,
        BODY = 'body',
        TIPS = '请选择图标';

    /**
     * 渲染组件
     */
    IconPicker.prototype.render = function(options){
        var opts = options,
            // DOM选择器
            elem = opts.elem,
            // 数据类型：fontClass/unicode
            type = opts.type == null ? 'fontClass' : opts.type,
            // 是否分页：true/false
            page = opts.page == null ? true : opts.page,
            // 每页显示数量
            limit = opts.limit == null ? 12 : opts.limit,
            // 是否开启搜索：true/false
            search = opts.search == null ? true : opts.search,
            // 每个图标格子的宽度：'43px'或'20%'
            cellWidth = opts.cellWidth,
            // 点击回调
            click = opts.click,
            // 渲染成功后的回调
            success = opts.success,
            // json数据
            data = {},
            // 唯一标识
            tmp = new Date().getTime(),
            // 是否使用的class数据
            isFontClass = opts.type === 'fontClass',
            // 初始化时input的值
            ORIGINAL_ELEM_VALUE = $(elem).val(),
            TITLE = 'layui-select-title',
            TITLE_ID = 'layui-select-title-' + tmp,
            ICON_BODY = 'layui-iconpicker-' + tmp,
            PICKER_BODY = 'layui-iconpicker-body-' + tmp,
            PAGE_ID = 'layui-iconpicker-page-' + tmp,
            LIST_BOX = 'layui-iconpicker-list-box',
            selected = 'layui-form-selected',
            unselect = 'layui-unselect';

        var a = {
            init: function () {
                data = common.getData[type]();

                a.hideElem().createSelect().createBody().toggleSelect();
                a.preventEvent().inputListen();
                common.loadCss();
                
                if (success) {
                    success(this.successHandle());
                }

                return a;
            },
            successHandle: function(){
                var d = {
                    options: opts,
                    data: data,
                    id: tmp,
                    elem: $('#' + ICON_BODY)
                };
                return d;
            },
            /**
             * 隐藏elem
             */
            hideElem: function () {
                $(elem).hide();
                return a;
            },
            /**
             * 绘制select下拉选择框
             */
            createSelect: function () {
                var oriIcon = '<i class="zadmin-icon">';
                
                // 默认图标
                if(ORIGINAL_ELEM_VALUE === '') {
                    if(isFontClass) {
                        ORIGINAL_ELEM_VALUE = 'zadmin-icon-shouye';
                    } else {
                        ORIGINAL_ELEM_VALUE = 'amp;#xe6cb;';
                    }
                }

                if (isFontClass) {
                    oriIcon = '<i class="zadmin-icon '+ ORIGINAL_ELEM_VALUE +'">';
                } else {
                    oriIcon += ORIGINAL_ELEM_VALUE; 
                }
                oriIcon += '</i>';

                var selectHtml = '<div class="layui-iconpicker layui-unselect layui-form-select" id="'+ ICON_BODY +'">' +
                    '<div class="'+ TITLE +'" id="'+ TITLE_ID +'">' +
                        '<div class="layui-iconpicker-item">'+
                            '<span class="layui-iconpicker-icon layui-unselect">' +
                                oriIcon +
                            '</span>'+
                            '<i class="layui-edge"></i>' +
                        '</div>'+
                    '</div>' +
                    '<div class="layui-anim layui-anim-upbit" style="">' +
                        '123' +
                    '</div>';
                $(elem).after(selectHtml);
                return a;
            },
            /**
             * 展开/折叠下拉框
             */
            toggleSelect: function () {
                var item = '#' + TITLE_ID + ' .layui-iconpicker-item,#' + TITLE_ID + ' .layui-iconpicker-item .layui-edge';
                a.event('click', item, function (e) {
                    var $icon = $('#' + ICON_BODY);
                    if ($icon.hasClass(selected)) {
                        $icon.removeClass(selected).addClass(unselect);
                    } else {
                        // 隐藏其他picker
                        $('.layui-form-select').removeClass(selected);
                        // 显示当前picker
                        $icon.addClass(selected).removeClass(unselect);
                    }
                    e.stopPropagation();
                });
                return a;
            },
            /**
             * 绘制主体部分
             */
            createBody: function () {
                // 获取数据
                var searchHtml = '';

                if (search) {
                    searchHtml = '<div class="layui-iconpicker-search">' +
                        '<input class="layui-input">' +
                        '<i class="zadmin-icon layui-icon-picker-search"></i>' +
                        '</div>';
                }

                // 组合dom
                var bodyHtml = '<div class="layui-iconpicker-body" id="'+ PICKER_BODY +'">' +
                    searchHtml +
                        '<div class="'+ LIST_BOX +'"></div> '+
                     '</div>';
                $('#' + ICON_BODY).find('.layui-anim').eq(0).html(bodyHtml);
                a.search().createList().check().page();

                return a;
            },
            /**
             * 绘制图标列表
             * @param text 模糊查询关键字
             * @returns {string}
             */
            createList: function (text) {
                var d = data,
                    l = d.length,
                    pageHtml = '',
                    listHtml = $('<div class="layui-iconpicker-list">')//'<div class="layui-iconpicker-list">';

                // 计算分页数据
                var _limit = limit, // 每页显示数量
                    _pages = l % _limit === 0 ? l / _limit : parseInt(l / _limit + 1), // 总计多少页
                    _id = PAGE_ID;

                // 图标列表
                var icons = [];

                for (var i = 0; i < l; i++) {
                    var obj = d[i];

                    // 判断是否模糊查询
                    if (text && obj.indexOf(text) === -1) {
                        continue;
                    }

                    // 是否自定义格子宽度
                    var style = '';
                    if (cellWidth !== null) {
                        style += ' style="width:' + cellWidth + '"';
                    }

                    // 每个图标dom
                    var icon = '<div class="layui-iconpicker-icon-item" title="'+ obj +'" '+ style +'>';
                    if (isFontClass){
                        icon += '<i class="zadmin-icon '+ obj +'"></i>';
                    } else {
                        icon += '<i class="zadmin-icon">'+ obj.replace('amp;', '') +'</i>';
                    }
                    icon += '</div>';

                    icons.push(icon);
                }

                // 查询出图标后再分页
                l = icons.length;
                _pages = l % _limit === 0 ? l / _limit : parseInt(l / _limit + 1);
                for (var i = 0; i < _pages; i++) {
                    // 按limit分块
                    var lm = $('<div class="layui-iconpicker-icon-limit" id="layui-iconpicker-icon-limit-' + tmp + (i+1) +'">');

                    for (var j = i * _limit; j < (i+1) * _limit && j < l; j++) {
                        lm.append(icons[j]);
                    }

                    listHtml.append(lm);
                }

                // 无数据
                if (l === 0) {
                    listHtml.append('<p class="layui-iconpicker-tips">无数据</p>');
                }

                // 判断是否分页
                if (page){
                    $('#' + PICKER_BODY).addClass('layui-iconpicker-body-page');
                    pageHtml = '<div class="layui-iconpicker-page" id="'+ PAGE_ID +'">' +
                        '<div class="layui-iconpicker-page-count">' +
                        '<span id="'+ PAGE_ID +'-current">1</span>/' +
                        '<span id="'+ PAGE_ID +'-pages">'+ _pages +'</span>' +
                        ' (<span id="'+ PAGE_ID +'-length">'+ l +'</span>)' +
                        '</div>' +
                        '<div class="layui-iconpicker-page-operate">' +
                        '<i class="layui-icon" id="'+ PAGE_ID +'-prev" data-index="0" prev>&#xe603;</i> ' +
                        '<i class="layui-icon" id="'+ PAGE_ID +'-next" data-index="2" next>&#xe602;</i> ' +
                        '</div>' +
                        '</div>';
                }


                $('#' + ICON_BODY).find('.layui-anim').find('.' + LIST_BOX).html('').append(listHtml).append(pageHtml);
                return a;
            },
            // 阻止Layui的一些默认事件
            preventEvent: function() {
                var item = '#' + ICON_BODY + ' .layui-anim';
                a.event('click', item, function (e) {
                    e.stopPropagation();
                });
                return a;
            },
            // 分页
            page: function () {
                var icon = '#' + PAGE_ID + ' .layui-iconpicker-page-operate .layui-icon';

                $(icon).unbind('click');
                a.event('click', icon, function (e) {
                   var elem = e.currentTarget,
                       total = parseInt($('#' +PAGE_ID + '-pages').html()),
                       isPrev = $(elem).attr('prev') !== undefined,
                       // 按钮上标的页码
                       index = parseInt($(elem).attr('data-index')),
                       $cur = $('#' +PAGE_ID + '-current'),
                       // 点击时正在显示的页码
                       current = parseInt($cur.html());

                    // 分页数据
                    if (isPrev && current > 1) {
                        current=current-1;
                        $(icon + '[prev]').attr('data-index', current);
                    } else if (!isPrev && current < total){
                        current=current+1;
                        $(icon + '[next]').attr('data-index', current);
                    }
                    $cur.html(current);

                    // 图标数据
                    $('#'+ ICON_BODY + ' .layui-iconpicker-icon-limit').hide();
                    $('#layui-iconpicker-icon-limit-' + tmp + current).show();
                    e.stopPropagation();
                });
                return a;
            },
            /**
             * 搜索
             */
            search: function () {
                var item = '#' + PICKER_BODY + ' .layui-iconpicker-search .layui-input';
                a.event('input propertychange', item, function (e) {
                    var elem = e.target,
                        t = $(elem).val();
                    a.createList(t);
                });
                return a;
            },
            /**
             * 点击选中图标
             */
            check: function () {
                var item = '#' + PICKER_BODY + ' .layui-iconpicker-icon-item';
                a.event('click', item, function (e) {
                    var el = $(e.currentTarget).find('.zadmin-icon'),
                        icon = '';
                    if (isFontClass) {
                        var clsArr = el.attr('class').split(/[\s\n]/),
                            cls = clsArr[1],
                            icon = cls;
                        $('#' + TITLE_ID).find('.layui-iconpicker-item .zadmin-icon').html('').attr('class', clsArr.join(' '));
                    } else {
                        var cls = el.html(),
                            icon = cls;
                        $('#' + TITLE_ID).find('.layui-iconpicker-item .zadmin-icon').html(icon);
                    }

                    $('#' + ICON_BODY).removeClass(selected).addClass(unselect);
                    $(elem).val(icon).attr('value', icon);
                    // 回调
                    if (click) {
                        click({
                            icon: icon
                        });
                    }

                });
                return a;
            },
            // 监听原始input数值改变
            inputListen: function(){
                var el = $(elem);
                a.event('change', elem, function(){
                    var value = el.val();
                });
                // el.change(function(){
                    
                // });
                return a;
            },
            event: function (evt, el, fn) {
                $(BODY).on(evt, el, fn);
            }
        };

        var common = {
            /**
             * 加载样式表
             */
            loadCss: function () {
                var css = '.layui-iconpicker {max-width: 280px;}.layui-iconpicker .layui-anim{display:none;position:absolute;left:0;top:42px;padding:5px 0;z-index:899;min-width:100%;border:1px solid #d2d2d2;max-height:300px;overflow-y:auto;background-color:#fff;border-radius:2px;box-shadow:0 2px 4px rgba(0,0,0,.12);box-sizing:border-box;}.layui-iconpicker-item{border:1px solid #e6e6e6;width:90px;height:38px;border-radius:4px;cursor:pointer;position:absolute;}.layui-iconpicker-icon{border-right:1px solid #e6e6e6;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;width:60px;height:100%;float:left;text-align:center;background:#fff;transition:all .3s;}.layui-iconpicker-icon i{line-height:38px;font-size:18px;}.layui-iconpicker-item > .layui-edge{left:70px;}.layui-iconpicker-item:hover{border-color:#D2D2D2!important;}.layui-iconpicker-item:hover .layui-iconpicker-icon{border-color:#D2D2D2!important;}.layui-iconpicker.layui-form-selected .layui-anim{display:block;}.layui-iconpicker-body{padding:6px;}.layui-iconpicker .layui-iconpicker-list{background-color:#fff;border:1px solid #ccc;border-radius:4px;}.layui-iconpicker .layui-iconpicker-icon-item{display:inline-block;width:21.1%;line-height:36px;text-align:center;cursor:pointer;vertical-align:top;height:36px;margin:4px;border:1px solid #ddd;border-radius:2px;transition:300ms;}.layui-iconpicker .layui-iconpicker-icon-item i.layui-icon{font-size:17px;}.layui-iconpicker .layui-iconpicker-icon-item:hover{background-color:#eee;border-color:#ccc;-webkit-box-shadow:0 0 2px #aaa,0 0 2px #fff inset;-moz-box-shadow:0 0 2px #aaa,0 0 2px #fff inset;box-shadow:0 0 2px #aaa,0 0 2px #fff inset;text-shadow:0 0 1px #fff;}.layui-iconpicker-search{position:relative;margin:0 0 6px 0;border:1px solid #e6e6e6;border-radius:2px;transition:300ms;}.layui-iconpicker-search:hover{border-color:#D2D2D2!important;}.layui-iconpicker-search .layui-input{cursor:text;display:inline-block;width:86%;border:none;padding-right:0;margin-top:1px;}.layui-iconpicker-search .layui-icon{position:absolute;top:11px;right:4%;}.layui-iconpicker-tips{text-align:center;padding:8px 0;cursor:not-allowed;}.layui-iconpicker-page{margin-top:6px;margin-bottom:-6px;font-size:12px;padding:0 2px;}.layui-iconpicker-page-count{display:inline-block;}.layui-iconpicker-page-operate{display:inline-block;float:right;cursor:default;}.layui-iconpicker-page-operate .layui-icon{font-size:12px;cursor:pointer;}.layui-iconpicker-body-page .layui-iconpicker-icon-limit{display:none;}.layui-iconpicker-body-page .layui-iconpicker-icon-limit:first-child{display:block;}';
                var $style = $('head').find('style[iconpicker]');
                if ($style.length === 0) {
                    $('head').append('<style rel="stylesheet" iconpicker>'+css+'</style>');
                }
            },
            /**
             * 获取数据
             */
            getData: {
                fontClass: function () {
                    return ['zadmin-icon-shouye', 'zadmin-icon-quanxianguankong', 'zadmin-icon-quanxian', 'zadmin-icon-GitHub', 'zadmin-icon-tiaoshi', 'zadmin-icon-changjingguanli', 'zadmin-icon-bianji', 'zadmin-icon-guanlianshebei', 'zadmin-icon-guanfangbanben', 'zadmin-icon-gongnengdingyi', 'zadmin-icon-jichuguanli', 'zadmin-icon-jishufuwu', 'zadmin-icon-hezuohuobanmiyueguanli', 'zadmin-icon-ceshishenqing', 'zadmin-icon-jiedianguanli', 'zadmin-icon-jinggao', 'zadmin-icon-peiwangyindao', 'zadmin-icon-renjijiaohu', 'zadmin-icon-shiyongwendang', 'zadmin-icon-quanxianshenpi', 'zadmin-icon-yishouquan', 'zadmin-icon-tianshenpi', 'zadmin-icon-shujukanban', 'zadmin-icon-yingyongguanli', 'zadmin-icon-yibiaopan', 'zadmin-icon-zhanghaoquanxianguanli', 'zadmin-icon-yuanquyunwei', 'zadmin-icon-jizhanguanli', 'zadmin-icon-guanbi', 'zadmin-icon-zidingyi', 'zadmin-icon-xiajiantou', 'zadmin-icon-shangjiantou', 'zadmin-icon-icon_loading', 'zadmin-icon-icon_renwujincheng', 'zadmin-icon-icon_rukou', 'zadmin-icon-icon_yiwenkongxin', 'zadmin-icon-icon_fabu', 'zadmin-icon-icon_tianjia', 'zadmin-icon-icon_yulan', 'zadmin-icon-icon_zhanghao', 'zadmin-icon-icon_wangye', 'zadmin-icon-icon_shezhi', 'zadmin-icon-icon_baocun', 'zadmin-icon-icon_yingyongguanli', 'zadmin-icon-icon_shiyongwendang', 'zadmin-icon-icon_bangzhuwendang', 'zadmin-icon-biaodanzujian-shurukuang', 'zadmin-icon-biaodanzujian-biaoge', 'zadmin-icon-biaodanzujian-xialakuang', 'zadmin-icon-tubiao-bingtu', 'zadmin-icon-biaodanzujian-anniu', 'zadmin-icon-gongyezujian-yibiaopan', 'zadmin-icon-tubiao-qiapian', 'zadmin-icon-gongyezujian-zhishideng', 'zadmin-icon-tubiao-zhexiantu', 'zadmin-icon-xingzhuang-juxing', 'zadmin-icon-xingzhuang-jianxing', 'zadmin-icon-gongyezujian-kaiguan', 'zadmin-icon-tubiao-zhuzhuangtu', 'zadmin-icon-xingzhuang-tupian', 'zadmin-icon-xingzhuang-wenzi', 'zadmin-icon-xingzhuang-tuoyuanxing', 'zadmin-icon-xingzhuang-sanjiaoxing', 'zadmin-icon-xingzhuang-xingxing', 'zadmin-icon-xinzeng', 'zadmin-icon-guize', 'zadmin-icon-shebeiguanli', 'zadmin-icon-gongnengdingyi1', 'zadmin-icon-jishufuwu1', 'zadmin-icon-yunyingzhongxin', 'zadmin-icon-yunyingguanli', 'zadmin-icon-zuzhixiaxia', 'zadmin-icon-zuzhizhankai', 'zadmin-icon-zuzhiqunzu', 'zadmin-icon-dakai', 'zadmin-icon-yingwen', 'zadmin-icon-zhongwen', 'zadmin-icon-miwen', 'zadmin-icon-xianhao', 'zadmin-icon-kongxinduigou', 'zadmin-icon-huixingzhen', 'zadmin-icon-duigou', 'zadmin-icon-xiayibu', 'zadmin-icon-shangyibu', 'zadmin-icon-kongjianxuanzhong', 'zadmin-icon-kongjianweixuan', 'zadmin-icon-kongjianyixuan', 'zadmin-icon--diangan', 'zadmin-icon-rongxuejirongjiechi', 'zadmin-icon-lubiantingchechang', 'zadmin-icon--lumingpai', 'zadmin-icon-jietouzuoyi', 'zadmin-icon--zhongdaweixian', 'zadmin-icon--jiaotongbiaozhipai', 'zadmin-icon-gongcezhishipai', 'zadmin-icon-fangkuai', 'zadmin-icon-fangkuai-', 'zadmin-icon-shuaxin', 'zadmin-icon-baocun', 'zadmin-icon-fabu', 'zadmin-icon-xiayibu1', 'zadmin-icon-shangyibu1', 'zadmin-icon-xiangxiazhanhang', 'zadmin-icon-xiangshangzhanhang', 'zadmin-icon-tupianjiazaishibai', 'zadmin-icon-fuwudiqiu', 'zadmin-icon-setting', 'zadmin-icon-edit-square', 'zadmin-icon-delete', 'zadmin-icon-minus', 'zadmin-icon-suoxiao', 'zadmin-icon-fangda', 'zadmin-icon-huanyuanhuabu', 'zadmin-icon-quanping', 'zadmin-icon-biaodanzujian-biaoge1', 'zadmin-icon-APIshuchu', 'zadmin-icon-APIjieru', 'zadmin-icon-wenjianjia', 'zadmin-icon-DOC', 'zadmin-icon-BMP', 'zadmin-icon-GIF', 'zadmin-icon-JPG', 'zadmin-icon-PNG', 'zadmin-icon-weizhigeshi', 'zadmin-icon-gengduo', 'zadmin-icon-yunduanxiazai', 'zadmin-icon-yunduanshangchuan', 'zadmin-icon-dian', 'zadmin-icon-mian', 'zadmin-icon-xian', 'zadmin-icon-clean', 'zadmin-icon-shebeizhuangtai', 'zadmin-icon-fenzuguanli', 'zadmin-icon-kuaisubianpai', 'zadmin-icon-APPkaifa', 'zadmin-icon-wentijieda', 'zadmin-icon-kefu', 'zadmin-icon-ruanjiankaifabao', 'zadmin-icon-shangyimian', 'zadmin-icon-xiayimian', 'zadmin-icon-zhidimian', 'zadmin-icon-zhidingmian', 'zadmin-icon-sousuobianxiao', 'zadmin-icon-sousuofangda', 'zadmin-icon-dingwei', 'zadmin-icon-wumoxing', 'zadmin-icon-gaojing', 'zadmin-icon-renwujincheng', 'zadmin-icon-xiaoxitongzhi', 'zadmin-icon-youhui', 'zadmin-icon-gaojing1', 'zadmin-icon-zhihangfankui', 'zadmin-icon-gongdanqueren', 'zadmin-icon-guangbo', 'zadmin-icon-gongdan', 'zadmin-icon-xiaoxi', 'zadmin-icon-ditu-qi', 'zadmin-icon-ditu-dibiao', 'zadmin-icon-ditu-cha', 'zadmin-icon-ditu-qipao', 'zadmin-icon-ditu-tuding', 'zadmin-icon-ditu-huan', 'zadmin-icon-ditu-xing', 'zadmin-icon-ditu-yuan', 'zadmin-icon-chehuisekuai', 'zadmin-icon-shanchusekuai', 'zadmin-icon-fabusekuai', 'zadmin-icon-xinhao', 'zadmin-icon-lanya', 'zadmin-icon-Wi-Fi', 'zadmin-icon-chaxun', 'zadmin-icon-dianbiao', 'zadmin-icon-anquan', 'zadmin-icon-daibanshixiang', 'zadmin-icon-bingxiang', 'zadmin-icon-fanshe', 'zadmin-icon-fengche', 'zadmin-icon-guandao', 'zadmin-icon-guize1', 'zadmin-icon-guizeyinqing', 'zadmin-icon-huowudui', 'zadmin-icon-jianceqi', 'zadmin-icon-jinggai', 'zadmin-icon-liujisuan', 'zadmin-icon-hanshu', 'zadmin-icon-lianjieliu', 'zadmin-icon-ludeng', 'zadmin-icon-shexiangji', 'zadmin-icon-rentijiance', 'zadmin-icon-moshubang', 'zadmin-icon-shujuwajue', 'zadmin-icon-wangguan', 'zadmin-icon-shenjing', 'zadmin-icon-chucun', 'zadmin-icon-wuguan', 'zadmin-icon-yunduanshuaxin', 'zadmin-icon-yunhang', 'zadmin-icon-luyouqi', 'zadmin-icon-bug', 'zadmin-icon-get', 'zadmin-icon-PIR', 'zadmin-icon-zhexiantu', 'zadmin-icon-shuibiao', 'zadmin-icon-js', 'zadmin-icon-zihangche', 'zadmin-icon-liebiao', 'zadmin-icon-qichedingwei', 'zadmin-icon-dici', 'zadmin-icon-mysql', 'zadmin-icon-qiche', 'zadmin-icon-shenjing1', 'zadmin-icon-chengshi', 'zadmin-icon-tixingshixin', 'zadmin-icon-menci', 'zadmin-icon-chazuo', 'zadmin-icon-ranqijianceqi', 'zadmin-icon-kaiguan', 'zadmin-icon-chatou', 'zadmin-icon-xiyiji', 'zadmin-icon-yijiankaiguan', 'zadmin-icon-yanwubaojingqi', 'zadmin-icon-wuxiandianbo', 'zadmin-icon-fuzhi', 'zadmin-icon-shanchu', 'zadmin-icon-wuquanxian', 'zadmin-icon-bianjisekuai', 'zadmin-icon-ishipinshixiao', 'zadmin-icon-iframetianjia', 'zadmin-icon-tupiantianjia', 'zadmin-icon-liebiaomoshi_kuai', 'zadmin-icon-qiapianmoshi_kuai', 'zadmin-icon-fenlan', 'zadmin-icon-fengexian', 'zadmin-icon-dianzan', 'zadmin-icon-charulianjie', 'zadmin-icon-charutupian', 'zadmin-icon-quxiaolianjie', 'zadmin-icon-wuxupailie', 'zadmin-icon-juzhongduiqi', 'zadmin-icon-yinyong', 'zadmin-icon-youxupailie', 'zadmin-icon-youduiqi', 'zadmin-icon-zitidaima', 'zadmin-icon-xiaolian', 'zadmin-icon-zitijiacu', 'zadmin-icon-zitishanchuxian', 'zadmin-icon-zitishangbiao', 'zadmin-icon-zitibiaoti', 'zadmin-icon-zitixiahuaxian', 'zadmin-icon-zitixieti', 'zadmin-icon-zitiyanse', 'zadmin-icon-zuoduiqi', 'zadmin-icon-zitiyulan', 'zadmin-icon-zitixiabiao', 'zadmin-icon-zuoyouduiqi', 'zadmin-icon-tianxie', 'zadmin-icon-huowudui1', 'zadmin-icon-yingjian', 'zadmin-icon-shebeikaifa', 'zadmin-icon-dianzan_kuai', 'zadmin-icon-zhihuan', 'zadmin-icon-tuoguan', 'zadmin-icon-search', 'zadmin-icon-duigoux', 'zadmin-icon-guanbi1', 'zadmin-icon-aixin_shixin', 'zadmin-icon-ranqixieloubaojingqi', 'zadmin-icon-dianbiao_shiti', 'zadmin-icon-aixin', 'zadmin-icon-shuibiao_shiti', 'zadmin-icon-zhinengxiaofangshuan', 'zadmin-icon-ranqibiao_shiti', 'zadmin-icon-shexiangtou_shiti', 'zadmin-icon-shexiangtou_guanbi', 'zadmin-icon-shexiangtou', 'zadmin-icon-shengyin_shiti', 'zadmin-icon-shengyinkai', 'zadmin-icon-shoucang_shixin', 'zadmin-icon-shoucang', 'zadmin-icon-shengyinwu', 'zadmin-icon-shengyinjingyin', 'zadmin-icon-zhunbeiliangchan', 'zadmin-icon-shebeikaifa1', 'zadmin-icon-quanxianguanli', 'zadmin-icon-wuquanxianfangwen', 'zadmin-icon-plus', 'zadmin-icon-kongxinwenhao', 'zadmin-icon-cuowukongxin', 'zadmin-icon-fangkuai1', 'zadmin-icon-fangkuai2', 'zadmin-icon-kongjianxuanzhong1', 'zadmin-icon-kongxinduigou1', 'zadmin-icon-xinxikongxin', 'zadmin-icon-kongjian', 'zadmin-icon-gaojingkongxin', 'zadmin-icon-duigou_kuai', 'zadmin-icon-cuocha_kuai', 'zadmin-icon-jia_sekuai', 'zadmin-icon-jian_sekuai', 'zadmin-icon-fenxiangfangshi', 'zadmin-icon-icon_qiangzhixiaxian', 'zadmin-icon-icon-test', 'zadmin-icon-icon-test1', 'zadmin-icon-icon-test2', 'zadmin-icon-icon-test3', 'zadmin-icon-icon-test4', 'zadmin-icon-icon-test5', 'zadmin-icon-icon-test6', 'zadmin-icon-icon-test7', 'zadmin-icon-icon-test8', 'zadmin-icon-icon-test9', 'zadmin-icon-icon-test10', 'zadmin-icon-icon-test11', 'zadmin-icon-icon-test12', 'zadmin-icon-icon-test13', 'zadmin-icon-icon-test14', 'zadmin-icon-icon-test15', 'zadmin-icon-icon-test16', 'zadmin-icon-icon-test17', 'zadmin-icon-icon-test18', 'zadmin-icon-icon-test19', 'zadmin-icon-icon-test20', 'zadmin-icon-icon-test21', 'zadmin-icon-icon-test22', 'zadmin-icon-icon-test23', 'zadmin-icon-icon-test24', 'zadmin-icon-icon-test25', 'zadmin-icon-icon-test26', 'zadmin-icon-icon-test27', 'zadmin-icon-icon-test28', 'zadmin-icon-icon-test29', 'zadmin-icon-icon-test30', 'zadmin-icon-icon-test31', 'zadmin-icon-icon-test32', 'zadmin-icon-icon-test33', 'zadmin-icon-icon-test34', 'zadmin-icon-icon-test35', 'zadmin-icon-icon-test36', 'zadmin-icon-icon-test37', 'zadmin-icon-icon-test38', 'zadmin-icon-icon-test39', 'zadmin-icon-icon-test40', 'zadmin-icon-icon-test41', 'zadmin-icon-icon-test42', 'zadmin-icon-icon-test43', 'zadmin-icon-icon-test44', 'zadmin-icon-icon-test45', 'zadmin-icon-icon-test46', 'zadmin-icon-icon-test47', 'zadmin-icon-icon-test48', 'zadmin-icon-icon-test49', 'zadmin-icon-icon-test50', 'zadmin-icon-icon-test51', 'zadmin-icon-icon-test52', 'zadmin-icon-icon-test53', 'zadmin-icon-icon-test54', 'zadmin-icon-icon-test55', 'zadmin-icon-icon-test56', 'zadmin-icon-icon-test57', 'zadmin-icon-icon-test58', 'zadmin-icon-icon-test59', 'zadmin-icon-icon-test60', 'zadmin-icon-icon-test61', 'zadmin-icon-icon-test62', 'zadmin-icon-icon-test63', 'zadmin-icon-icon-test64', 'zadmin-icon-icon-test65', 'zadmin-icon-icon-test66', 'zadmin-icon-icon-test67', 'zadmin-icon-icon-test68', 'zadmin-icon-icon-test69', 'zadmin-icon-icon-test70', 'zadmin-icon-icon-test71', 'zadmin-icon-icon-test72', 'zadmin-icon-icon-test73', 'zadmin-icon-icon-test74', 'zadmin-icon-icon-test75', 'zadmin-icon-icon-test76', 'zadmin-icon-icon-test77', 'zadmin-icon-icon-test78', 'zadmin-icon-icon-test79', 'zadmin-icon-icon-test80', 'zadmin-icon-icon-test82', 'zadmin-icon-icon-test83', 'zadmin-icon-icon-test84', 'zadmin-icon-alipay', 'zadmin-icon-taobao'];
                },
                unicode: function () {
                    return ['amp;#xe6cb;','amp;#xe67d;','amp;#xe612;','amp;#xea0a;','amp;#xeb61;','amp;#xeb62;','amp;#xeb63;','amp;#xeb64;','amp;#xeb65;','amp;#xeb66;','amp;#xeb67;','amp;#xeb68;','amp;#xeb69;','amp;#xeb6a;','amp;#xeb6b;','amp;#xeb6c;','amp;#xeb6d;','amp;#xeb6e;','amp;#xeb6f;','amp;#xeb70;','amp;#xeb71;','amp;#xeb72;','amp;#xeb73;','amp;#xeb74;','amp;#xeb75;','amp;#xeb76;','amp;#xeb77;','amp;#xeb78;','amp;#xeb79;','amp;#xeb7a;','amp;#xeb7b;','amp;#xeb7c;','amp;#xeb80;','amp;#xeb88;','amp;#xeb89;','amp;#xeb8a;','amp;#xeb8b;','amp;#xeb8c;','amp;#xeb8d;','amp;#xeb8e;','amp;#xeb8f;','amp;#xeb90;','amp;#xeb91;','amp;#xeb92;','amp;#xeb93;','amp;#xeb94;','amp;#xeb95;','amp;#xeb96;','amp;#xeb97;','amp;#xeb98;','amp;#xeb99;','amp;#xeb9a;','amp;#xeb9b;','amp;#xeb9c;','amp;#xeb9d;','amp;#xeb9e;','amp;#xeb9f;','amp;#xeba0;','amp;#xeba1;','amp;#xeba2;','amp;#xeba3;','amp;#xeba4;','amp;#xeba5;','amp;#xeba6;','amp;#xe600;','amp;#xebb7;','amp;#xebb8;','amp;#xebb9;','amp;#xebce;','amp;#xebd0;','amp;#xebd1;','amp;#xebd8;','amp;#xebd9;','amp;#xebda;','amp;#xebdf;','amp;#xebe0;','amp;#xebe2;','amp;#xebe3;','amp;#xebe4;','amp;#xebe5;','amp;#xebe6;','amp;#xebe7;','amp;#xebef;','amp;#xebf0;','amp;#xebf1;','amp;#xebf2;','amp;#xebf3;','amp;#xebfb;','amp;#xebfc;','amp;#xebfd;','amp;#xebfe;','amp;#xebff;','amp;#xec00;','amp;#xec01;','amp;#xec02;','amp;#xec06;','amp;#xec07;','amp;#xec08;','amp;#xec09;','amp;#xec0a;','amp;#xec0b;','amp;#xec0c;','amp;#xec0d;','amp;#xec0e;','amp;#xec0f;','amp;#xec10;','amp;#xe7a3;','amp;#xe7a6;','amp;#xe7f8;','amp;#xe88c;','amp;#xec13;','amp;#xec14;','amp;#xec15;','amp;#xec16;','amp;#xec17;','amp;#xec18;','amp;#xec19;','amp;#xec1a;','amp;#xec1b;','amp;#xec1c;','amp;#xec1d;','amp;#xec1e;','amp;#xec1f;','amp;#xec20;','amp;#xec21;','amp;#xec22;','amp;#xec23;','amp;#xec24;','amp;#xec25;','amp;#xec26;','amp;#xe6d5;','amp;#xec27;','amp;#xec28;','amp;#xec29;','amp;#xec2a;','amp;#xec2e;','amp;#xec2f;','amp;#xec30;','amp;#xe610;','amp;#xe611;','amp;#xe61a;','amp;#xe61b;','amp;#xec32;','amp;#xec33;','amp;#xec34;','amp;#xec35;','amp;#xec36;','amp;#xec37;','amp;#xec38;','amp;#xec39;','amp;#xec3a;','amp;#xec3b;','amp;#xec3c;','amp;#xec3d;','amp;#xec3e;','amp;#xec3f;','amp;#xec40;','amp;#xec41;','amp;#xec42;','amp;#xec43;','amp;#xec44;','amp;#xec45;','amp;#xec46;','amp;#xec47;','amp;#xec48;','amp;#xec49;','amp;#xec4a;','amp;#xec4b;','amp;#xec4c;','amp;#xec4d;','amp;#xec4e;','amp;#xec4f;','amp;#xec50;','amp;#xec51;','amp;#xec52;','amp;#xec53;','amp;#xec54;','amp;#xec55;','amp;#xec56;','amp;#xec57;','amp;#xec58;','amp;#xec59;','amp;#xec5a;','amp;#xec5b;','amp;#xec5c;','amp;#xec5d;','amp;#xec5e;','amp;#xec5f;','amp;#xec60;','amp;#xec61;','amp;#xec62;','amp;#xec63;','amp;#xec64;','amp;#xec65;','amp;#xec66;','amp;#xec67;','amp;#xec68;','amp;#xec69;','amp;#xec6a;','amp;#xec6b;','amp;#xec6c;','amp;#xec6d;','amp;#xec6e;','amp;#xec6f;','amp;#xec70;','amp;#xec71;','amp;#xec72;','amp;#xec73;','amp;#xec74;','amp;#xec75;','amp;#xec76;','amp;#xec77;','amp;#xec78;','amp;#xec79;','amp;#xec7a;','amp;#xec7b;','amp;#xec7c;','amp;#xec7d;','amp;#xec7e;','amp;#xec7f;','amp;#xec80;','amp;#xec81;','amp;#xec82;','amp;#xec83;','amp;#xe64c;','amp;#xec84;','amp;#xec85;','amp;#xec86;','amp;#xec87;','amp;#xec88;','amp;#xec89;','amp;#xec8a;','amp;#xec8b;','amp;#xec8c;','amp;#xec8d;','amp;#xec8e;','amp;#xec8f;','amp;#xec90;','amp;#xec91;','amp;#xec92;','amp;#xec93;','amp;#xec94;','amp;#xec95;','amp;#xec96;','amp;#xec97;','amp;#xec98;','amp;#xec99;','amp;#xec9a;','amp;#xec9b;','amp;#xec9c;','amp;#xec9d;','amp;#xec9e;','amp;#xec9f;','amp;#xeca0;','amp;#xeca1;','amp;#xeca2;','amp;#xeca3;','amp;#xeca4;','amp;#xeca5;','amp;#xeca6;','amp;#xeca7;','amp;#xeca8;','amp;#xe9a1;','amp;#xeca9;','amp;#xecaa;','amp;#xecab;','amp;#xecac;','amp;#xecad;','amp;#xecae;','amp;#xecaf;','amp;#xecb0;','amp;#xecb1;','amp;#xecb2;','amp;#xecb3;','amp;#xecb4;','amp;#xecb5;','amp;#xecb6;','amp;#xecb7;','amp;#xecb8;','amp;#xecb9;','amp;#xecba;','amp;#xecbb;','amp;#xecbc;','amp;#xe670;','amp;#xea2f;','amp;#xe9a9;','amp;#xed19;','amp;#xed1a;','amp;#xed1b;','amp;#xed1c;','amp;#xed1d;','amp;#xed1e;','amp;#xed1f;','amp;#xed20;','amp;#xed21;','amp;#xed22;','amp;#xed23;','amp;#xed24;','amp;#xed25;','amp;#xed2e;','amp;#xe7c2;','amp;#xe633;','amp;#xe634;','amp;#xe635;','amp;#xe636;','amp;#xe637;','amp;#xe638;','amp;#xe639;','amp;#xe63a;','amp;#xe63b;','amp;#xe63c;','amp;#xe63d;','amp;#xe63e;','amp;#xe63f;','amp;#xe640;','amp;#xe641;','amp;#xe642;','amp;#xe643;','amp;#xe644;','amp;#xe645;','amp;#xe646;','amp;#xe647;','amp;#xe648;','amp;#xe649;','amp;#xe64a;','amp;#xe64b;','amp;#xe64d;','amp;#xe64e;','amp;#xe64f;','amp;#xe650;','amp;#xe651;','amp;#xe652;','amp;#xe653;','amp;#xe654;','amp;#xe655;','amp;#xe656;','amp;#xe657;','amp;#xe658;','amp;#xe659;','amp;#xe65a;','amp;#xe65b;','amp;#xe65c;','amp;#xe65d;','amp;#xe65e;','amp;#xe65f;','amp;#xe660;','amp;#xe661;','amp;#xe662;','amp;#xe663;','amp;#xe664;','amp;#xe665;','amp;#xe666;','amp;#xe667;','amp;#xe668;','amp;#xe669;','amp;#xe66a;','amp;#xe66b;','amp;#xe66c;','amp;#xe66d;','amp;#xe66e;','amp;#xe66f;','amp;#xe671;','amp;#xe672;','amp;#xe673;','amp;#xe674;','amp;#xe675;','amp;#xe676;','amp;#xe677;','amp;#xe678;','amp;#xe679;','amp;#xe67a;','amp;#xe67b;','amp;#xe67c;','amp;#xe67e;','amp;#xe67f;','amp;#xe680;','amp;#xe681;','amp;#xe682;','amp;#xe683;','amp;#xe684;','amp;#xe685;','amp;#xe686;','amp;#xe688;','amp;#xe689;','amp;#xe68a;','amp;#xe68c;','amp;#xe68d;'];
                }
            }
        };

        a.init();
        return new IconPicker();
    };

    /**
     * 选中图标
     * @param filter lay-filter
     * @param iconName 图标名称，自动识别fontClass/unicode
     */
    IconPicker.prototype.checkIcon = function (filter, iconName){
        var el = $('*[lay-filter='+ filter +']'),
            p = el.next().find('.layui-iconpicker-item .zadmin-icon'),
            c = iconName;

        if (c.indexOf('#xe') > 0){
            p.html(c);
        } else {
            p.html('').attr('class', 'zadmin-icon ' + c);
        }
        el.attr('value', c).val(c);
    };

    var iconPicker = new IconPicker();
    exports(_MOD, iconPicker);
});