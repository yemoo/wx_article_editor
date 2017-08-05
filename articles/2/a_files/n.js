/// <reference path="jquery-1.9.1.js" />
/// <reference path="http://res.wx.qq.com/open/js/jweixin-1.0.0.js" />


var id = $("#nid").text().trim();
var title = $(".n_title").text().trim();
var link = $("#link").text().trim();
var sl_img = $("#sl_img").text().trim();
var desc = $(".n_content").text().trim();
var url1;
var yhj_name = $("#yhj_name").text().trim();
var yhj_tel = $("#yhj_tel").text().trim();
/**
 * 注册微信配置信息
 */
$(document).ready(function() {
        url1 = location.href.split('#')[0];
        url1 = encodeURIComponent(url1);
    $.ajax({
        type : "post",
        url : "../../../servlet/wx?url="+url1,
        dataType : "json",
        success : function(data) {
            var obj = eval(data[0]);
            wx.config({
                debug : false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId : obj.appId, // 必填，公众号的唯一标识
                timestamp : obj.timestamp, // 必填，生成签名的时间戳
                nonceStr : obj.nonceStr, // 必填，生成签名的随机串
                signature : obj.signature,// 必填，签名，见附录1
                jsApiList : ['onMenuShareTimeline',
                             'onMenuShareAppMessage',
                             'onMenuShareQQ']
            });
            

            wx.ready(function () {
            	
            	//分享到qq空间
                wx.onMenuShareQQ({
                    title: title, // 分享标题
                    desc: desc, // 分享描述
                    link: link, // 分享链接,将当前登录用户转为puid,以便于发展下线
                    imgUrl:sl_img, // 分享图标
                    success: function () { 
                        // 用户确认分享后执行的回调函数
                	$.post("../../../servlet/nj", {type:2, id: id }, function (d) {
                		
                     }, "json");
                    }
                });
            	//分享到朋友圈
                wx.onMenuShareTimeline({
                    title: title, // 分享标题
                    desc: desc, // 分享描述
                    link: link, // 分享链接,将当前登录用户转为puid,以便于发展下线
                    imgUrl:sl_img, // 分享图标
                    success: function () { 
                        // 用户确认分享后执行的回调函数
                	$.post("../../../servlet/nj", {type:2, id: id }, function (d) {

                     }, "json");
                    }
                });
                //给朋友
                wx.onMenuShareAppMessage({
                	   title: title, // 分享标题
                       desc: desc, // 分享描述
                       link: link, // 分享链接,将当前登录用户转为puid,以便于发展下线
                       imgUrl:sl_img, // 分享图标
                      success: function () { 
                          // 用户确认分享后执行的回调函数
                  	 $.post("../../../servlet/nj", {type:2, id: id }, function (d) {
 
                       }, "json");
                      }
                });
                
          
            });

        }
    });
  
});

(function () {
	//如果是b.html?edit证明是手机端打开的，隐藏头部广告和底部广告div
	if(location.href.indexOf("b.html?edit")>0)
	{
		$('#mySwipe2').attr('style', 'display:none;');
		$('#mySwipe3').attr('style', 'display:none;');
		$('#mySwipe4').attr('style', 'display:none;');
		$('#hb').attr('style', 'display:none;');
		$('#down').attr('style', 'display:none;');
		$('#tj').attr('style', 'display:none;');
	}
	
	//更改优惠卷消息
	$("#quan-amount").text(yhj_name);
	$("#quan-tel").text(yhj_tel);
	$("#getYouYou").click(function(){
		 window.location.href = "tel:" + yhj_tel;
	});
	
	//如果有红包元素，才显示#hb
	if ( $("#yhj_tel").length > 0&& location.href.indexOf("b.html?edit")<=0) { 
		  $("#hb").attr("style", "display:block;");
		} 
    document.write("<script src=\"http://res.wx.qq.com/open/js/jweixin-1.0.0.js\"></script>");
    $.extend({

        /**  
         1. 设置cookie的值，把name变量的值设为value    
        example $.cookie(’name’, ‘value’); 
         2.新建一个cookie 包括有效期 路径 域名等 
        example $.cookie(’name’, ‘value’, {expires: 7, path: ‘/’, domain: ‘jquery.com’, secure: true}); 
        3.新建cookie 
        example $.cookie(’name’, ‘value’); 
        4.删除一个cookie 
        example $.cookie(’name’, null); 
        5.取一个cookie(name)值给myvar 
        var account= $.cookie('name'); 
        **/
        cookieHelper: function (name, value, options) {
            if (typeof value != 'undefined') { // name and value given, set cookie 
                options = options || {};
                if (value === null) {
                    value = '';
                    options.expires = -1;
                }
                var expires = '';
                if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                    var date;
                    if (typeof options.expires == 'number') {
                        date = new Date();
                        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                    } else {
                        date = options.expires;
                    }
                    expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE 
                }
                var path = options.path ? '; path=' + options.path : '';
                var domain = options.domain ? '; domain=' + options.domain : '';
                var secure = options.secure ? '; secure' : '';
                document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
            } else { // only name given, get cookie 
                var cookieValue = null;
                if (document.cookie && document.cookie != '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = jQuery.trim(cookies[i]);
                        // Does this cookie string begin with the name we want? 
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
        }

    });


    var article = {
    		load: function (call) {
		    	if(location.href.indexOf("b.html")>0)
				{
		    		//判断不是手机端打开才有推荐列表
		    		if(location.href.indexOf("b.html?edit")<0)
		    		{
				            $.post("../../../servlet/nj", {type:1,id:id }, function (data) {
				            	  $("#tj").html(data);
				            }, "text");
		    		}
    		    }
        },
        click: function (call) {
            $.post("../../../servlet/nj",{type:0,id:id}, function (data) {
              call(data);
            }, "text");

        }
    };
    article.load();
    /**
     * 
     * @param [Array] array
     */
    String.prototype.contains = function (array) {
        for (var i = 0; i < array.length; i++) {
            if (this.toLowerCase().indexOf(array[i]) > -1)
                return true;
        }
        return false;

    }

    String.prototype.format = function (args) {
        var result = this;
        if (arguments.length > 0) {
            if (arguments.length == 1 && typeof (args) == "object") {
                for (var key in args) {
                    if (args[key] != undefined) {
                        var reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
            }
            else {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] != undefined) {
                        //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
                        var reg = new RegExp("({)" + i + "(})", "g");
                        result = result.replace(reg, arguments[i]);
                    }
                }
            }
        }
        return result;
    }

    /**
     * 打开链接
     * @param link
     */
    function openLink(link) {
        article.click(function () {
            var _link = link.replace("-", "");
            _link = link.replace("http://", "");
 /*           if(link.indexOf("0")==0)
            {
            	 window.location.href = "tel:" + link;
            }
            else if(!isNaN(_link)){  
            	 window.location.href = "tel:" + link;
            }
            else
            {
            	if(link.indexOf("http://")>0||link.indexOf("https://")>0)
            	{
            		 window.location.href = link;
            	}
            	else
            	{
            		link = "http://"+link;
            		window.location.href = link;
            	}
            }*/
           if (RegExp(/^(0|86|17951)?(1[0-9][0-9])[0-9]{8}$/).test(_link)) {
                window.location.href = "tel:" + _link;
            }
            else {
                window.location.href = link;
            }
        });
    }
    window.openLink = openLink;

    /*
    * 弹窗打开图片
    * */
    function openImage(src) {
        article.click(function () {
            var dialog = $("<div class='msg_tcbg' style='display: block;'><div class='msg_tc' ><img src='' ><span>长按二维码识别</span><ul class='sp_close'>关闭</ul></div></div>");
            dialog.find("img").attr("src", src);
            dialog.find(".sp_close").click(function () {
                dialog.remove();
            });
            $("body").append(dialog);
        });
    }
    window.openImage = openImage;

    // 通用事件绑定
    function pageEvent() {
        var elloads = $(".wz_meta i");
        var elzans = $("#zans");

        var elzan = $(".wz_meta .zan").parent();
        var eljubao = $(".jubao");
        
        




        // 文章赞+1
        var zanicon = elzan.parent().find(".zan");
        if (!$.cookieHelper("article" + id)) {
            zanicon.removeClass("zan");
        }
        elzan.click(function () {
            if ($.cookieHelper("article" + id)) {
                return;
            }
            zanicon.addClass("zan");
            $.cookieHelper("article" + id, "agree");
     /*       article.agree(function () {
                getDetail();
            });*/

        });

     /*   var itg = $(".tg_close");
        itg.click(function () {
            window.location.href = "/merchant/agency?merchantarticleid=" + id;
        });*/


        imageDeal();
        videoDeal();
    }

    /**
     * 处理界面上的图片地址
     */
    function imageDeal() {
        var vf = $("img");
        vf.each(function () {
            img = $(this);
            var src = img.attr("src");
            if (!src) {
                src = img.attr("data-src");
                img.attr("src", src);
            }
        });
    }



    /**
     * 处理界面上的视频尺寸
     */
    function videoDeal() {
    	var vfs = $(".video_iframe");

    	if (vfs.length == 0){

    		var ifr = $("iframe");

    		ifr.each(function () {
    			var temp = $(this).attr("data-src");
    			if(temp.indexOf("player.html") >= 0 || temp.indexOf("preview.html") >= 0){
    				var vf = $(this);
    				var oh = parseFloat(vf.attr("height"));
    				var ow = parseFloat(vf.attr("width"));
					
    				var winw = $(window).width() - 30;
    				var iw = winw > ow ? ow : winw;
    				var ih = oh * iw / ow;
					
					if(isNaN(oh)){
						alert(oh);
						ih = '300';
					}

    				var src = vf.attr("src");
    				if (!src) {
    					src = vf.attr("data-src");
    				}
        			src = src.replace('preview.html','player.html');

    				src = src.replace('width=', '').replace('height=', '');

    				vf.attr("src", src);
    				var _oldStyle = vf.attr("style"), style;
    				if (_oldStyle)
    					style = _oldStyle.replace(oh, ih).replace(ow, iw);
    				else
    					style = "width: {0}px; height: {1}px;".format(iw, ih);
    				vf.attr("style", style);

    				vf.attr("width", iw);
    				vf.attr("height", ih);
    			}
    		});
    	}else{
    		vfs.each(function () {
    			var vf = $(this);

    			var oh = parseFloat(vf.attr("height"));
    			var ow = parseFloat(vf.attr("width"));

    			var winw = $(window).width() - 30;
    			var iw = winw > ow ? ow : winw;
    			var ih = oh * iw / ow;

    			var src = vf.attr("src");
    			if (!src) {
    				src = vf.attr("data-src");
    			}
    			src = src.replace('preview.html','player.html');

    			src = src.replace('width=', '').replace('height=', '');

    			vf.attr("src", src);
    			var _oldStyle = vf.attr("style"), style;
    			if (_oldStyle)
    				style = _oldStyle.replace(oh, ih).replace(ow, iw);
    			else
    				style = "width: {0}px; height: {1}px;".format(iw, ih);
    			vf.attr("style", style);

    			vf.attr("width", iw);
    			vf.attr("height", ih);

    		});
    	}
    }
    
    pageEvent();

    function setSliderHeight(slider) {
        slider.find(".tl_tg img").height(slider.width() / 4 + "px");

        var ul = slider.find(">ul");
        var len = slider.find(".sw_wrap>div").length;
        if (len == 0)
            slider.remove();

        for (var i = 0; i < len; i++) {
            ul.append("<li>");
        }

    }

    var top = $("#mySwipe2");
    setSliderHeight(top);
    var topslider = Swipe(top[0], {
        auto: 2000,
        continuous: true,
        disableScroll: true,
        callback: function (pos) {
            top.find(">ul>li").removeClass("on");
            $(top.find(">ul>li")[pos]).addClass("on");

        }
    });

    var bot = $("#mySwipe3");
    setSliderHeight(bot);
    Swipe(bot[0], {
        auto: 2000,
        continuous: true,
        disableScroll: true,
        callback: function (pos) {
            bot.find(">ul>li").removeClass("on");
            $(bot.find(">ul>li")[pos]).addClass("on");

        }
    });

    var fixedslider = $("#mySwipe4");
    setSliderHeight(fixedslider);
    fixedslider.Swipe({
        auto: 2500,
        continuous: true,
        callback: function (pos) {
            fixedslider.find(">ul>li").removeClass("on");
            $(fixedslider.find(">ul>li")[pos]).addClass("on");
        }
    });

    var tg = $(".tg_close").hide(); //$("<div class=\"tg_close fixed_close\">我要推广<span></span></div>").hide();
    tg.find("span").click(function () { tg.remove();$("#mySwipe4").hide() });

	var flag = true;

    $(document).ready(function () {
        var $window = $(window);
		
		/*点击广告图片字样*/
		$("#ad_page").click(function(){
				window.location.href = "http://www.51app1.com/down/ad/";
		});
		/*点击广告关闭图样*/
		$("#close_ad").click(function(){
					flag = false;
					fixedslider.removeClass("show");
                tg.hide();
		});

        // 定位图文、名片、二维码
        var tw = $(".sw_wrap .tw_tg");
        var mp = $(".sw_wrap .mp_tg");
        var ewm = $(".sw_wrap .ewm_tg");

        function setBannerMargintop(els) {
            els.each(function () {
                var tw = $(this);
                //tw.css({ marginTop: ($(".wrw_ban2 .sw_wrap").height() - tw.height()) / 2 });
            })
        }

        $window.scroll(function (e) {
            var top = $window.scrollTop();

            var min = 0;//self.height();
            var max = bot.offset().top - $window.height();

            if (top > min && top < max && flag) {
                fixedslider.addClass("show");
                var bHei = fixedslider.height();
                // bHei = bHei <= 80 ? 80 : bHei;
                tg.show();
                //if (!fixedslider.hasClass("show")) {
                //}
                setBannerMargintop(tw);
                setBannerMargintop(mp);
                setBannerMargintop(ewm);
            }
            else {
                fixedslider.removeClass("show");
                tg.hide();
            }
        });
    })

})(jQuery);

$(function () {
    var a_number=$("#ps_ition2").children().length;
      var a_w=$("#ps_ition2").width();
      var li_w=(a_w)/a_number
      $("#ps_ition2 li").css("width",li_w);

      var a_number=$("#ps_ition").children().length;
      var a_w=$("#ps_ition").width();
      var li_w=(a_w)/a_number
      $("#ps_ition li").css("width",li_w);

        //var data = {
                    //'imgurl':'http://192.168.1.200:81/upload/2016/04/d295d75f-bcc3-4805-bc6c-919c6ca9da44.png'
                 // };
       // $.get("",function (date) {
              //$(".wz_content").prepend("<div class='add_info'><img src=''></div>");
            // $(".add_info img").attr("src",data.imgurl)
       // })
    $(".twdesc").each(function() {
            $(this).find("h4:eq(0)").css({"display":"inline-block","color":"#86888a","width":"initial"})
        });
    $(".wrw_ban2 .twdesc").each(function() {
            $(this).find("h4:eq(0)").css({"display":"inline-block","color":"red","width":"initial"})
        });
    var a_h=$(window).height();
        $("body").css("height",a_h);

        if(a_h>667){
            $(".wz_tg .mp_tg .twdesc h2").css("max-width","49%");
            $(".wrw_ban2 .mp_tg .twdesc h2").css("max-width","49%");
        }
        else if(a_h<=568){
           $(this).find("h4:eq(0)").hide();
           $(".wz_tg .mp_tg .twdesc h2").css("max-width","100%");
            $(".wrw_ban2 .mp_tg .twdesc h2").css("max-width","100%");
        }

    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { 
            
            $(".wrw_ban2").addClass('iphone')
          } 
            else if (/(Android)/i.test(navigator.userAgent)) { 
              $(".wrw_ban2").removeClass('iphone')
            $(".wrw_ban2").addClass('andio');
          } 
            else { 
              
            };


        
})

$(".video-holder").on("click",".play-icon",function(){var a=$(this).parent().find("video");$(this).attr("style","display:none");$(this).parent().find("img").attr("style","display:none");a.width("100%"),a.height("100%"),a[0].play()}),!function(){var b=document.documentElement.dataset.width,c=Math.floor(6.9*b/7.5);$(".js-img").each(function(b){var d=this.dataset,e=d.width,f=d.height,g=d.echo,h=Math.floor(c/e*f),i=a.optImage(g,690);this.width=c,this.height=h,this.dataset.echo=i})}();
 
