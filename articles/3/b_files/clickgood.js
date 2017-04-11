$(function(){
		var reg = /^1(3|4|5|7|8)\d{9}$/;
		
		/*
		//小车  s
		drive_animation();
		function drive_animation() {
			$(".drive-ad .drive-car").css({
				"-webkit-transition": "-webkit-transform 20s cubic-bezier(0.2,0.5,0.8,0.8)"
			});
			$(".drive-ad .drive-car").css({
				"-webkit-transform": "translateX(" + $(window).width() + "px)"
			});
			setTimeout(function() {
				$(".drive-ad .drive-car").css({
					"-webkit-transition": "none"
				});
				$(".drive-ad .drive-car").css({
					"-webkit-transform": "translateX(" + -$(window).width() + "px)"
				});
				setTimeout(function() {
					drive_animation();
				},
				300);
			},
			20000)
		}
		$(".car-ad-con").on("touchstart",function(){
	    	//取得hidden里的值
	    	var drive_link = $("#drive_hidden").val();
	    	if(drive_link != null && drive_link.match(reg)){
	    		location.href="tel:"+drive_link;
	    	}else{
	    		window.location.href=drive_link;
	    	}
	    });
		//小车  e
		

		// 对话框 
		var _npcHeight = $(".dialog-npc").height();
		var _this = $(".dialog-con")[0];
		var _tranTop = $(".tran-top")[0];
		
		//准备回复的对话框
		var _dialog1 = '<div class="dialog dialog-user clear user1"><img class="user-head" src="./b_files/image/persion.png"/><div class="user-con"><p></p></div></div><div class="dialog dialog-npc clear npc2"><img class="npc-head" src="./b_files/image/persion.png"/><div class="npc-con"><p>收到您的咨询，请您留下手机号码，我们将第一时间与您联系。或者您可拨打或添加微信<i id="user-phone">用户的手机号</i>与我联系。<a id="webUrl" href="tel:">用户的手机号</a></p></div></div>';
        var _dialog2 = '<div class="dialog dialog-user clear user2"><img class="user-head" src="./b_files/image/persion.png"/><div class="user-con"><p></p></div></div><div class="dialog dialog-npc clear npc3"><img class="npc-head" src="./b_files/image/persion.png"/><div class="npc-con"><p>收到，我们将尽快与您联系</p></div></div>';
       
        //页面上的灰色对话，不包括输入框
        $(".dialog-con").css({
            'height': _npcHeight + 5,
            'padding-top': '10px'
        });
		

		 $(".npc1 .npc-con").addClass('active');
        _this.style.webkitTransition = 'height 0.3s ease-in';
        _this.addEventListener('webkitTransitionEnd',
        function(event) {
            _this.style.webkitTransition = 'none';
        },
        false);
        _tranTop.addEventListener('webkitTransitionEnd',
        function(event) {
            //_tranTop.style.webkitTransition = 'none';
        },
        false);

        var _sendClickNum = 1,_sendFlag = false;

        $(".btn-send").on('touchstart', //当手指触摸屏幕时候触发，即使已经有一个手指放在屏幕上也会触发
        function() {
            $(this).css({
                'font-size': '15px'
            });
        });
        //隐藏对话
		$('#dialog-close').on('touchend',//当手指从屏幕上离开的时候触发
			function(e) {
				e.preventDefault();//取消事件的默认动作。
				$(".dialog-con").css({//hidden
					'opacity': 0,
					'transform': 'scale(0,0)'
				});
				_this.style.webkitTransition = 'opacity 0.7s linear,transform 0.7s linear';//属性渐变
				$(".dialog-con").addClass('hideActive');
        });
		//显示对话
		$("#sendtit").on('touchend',
			function() {
				if ($(".dialog-con").hasClass('hideActive')) {
					$(".dialog-con").css({//show
						'opacity': 1,
						'transform': 'scale(1,1)'
					});
					_this.style.webkitTransition = 'opacity 0.7s linear,transform 0.7s linear';
					$(".dialog-con").removeClass('hideActive');
				}
        });
		//对于iOS的处理  不知道有什么用！？
		var _u = navigator.userAgent,
        app = navigator.appVersion;
        var _isiOS = !!_u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (_isiOS) {
            $("#sendtit").on('focus',
            function() {
                $("body").animate({
                    'scrollTop': document.body.scrollTop + $(window).height() * 0.5
                },
                200);
            });
        }
    
     var  _question = "";
    //点击发送
	$(".btn-send").on('touchend',
        function() {
            $(this).css({
                'font-size': '14px'
            });
            if (_sendClickNum == 1) {//第一次点击的时候
                $('.tran-top').append(_dialog1);
                _question = $("#sendtit").val().trim();
                dialogAnimotion(_this, _tranTop, _sendClickNum);
                $("#sendtit").val('');
                $("#sendtit").attr('placeholder', '请输入您的手机号码...');
                _sendClickNum += 1;
            } else if (_sendClickNum == 2) {
                $('.tran-top').append(_dialog2);
                var _phone = $("#sendtit").val().trim();
                if (_phone.match(reg)) {
                	layer.msg("手机号正确。下一步访问服务端，发送短信。");
                	
                    dialogAnimotion(_this, _tranTop, _sendClickNum, '.npc1', '.user1');
                    _sendClickNum += 1;
                   $("#sendtit").val('');
                   $("#sendtit").attr('placeholder', '请等待电话联系...');
                } else {
                	layer.msg("请输入正确的手机号。");
                }
            }else{
            	layer.msg("请等待电话联系。");
            }
    });
	 var _tranNum = 0;
	 var dialogAnimotion = function(_this, _tranTop, _index, _opacityNum1, _opacityNum2) {
	        var index = parseInt(_index);
	        var _npcNum = index + 1;
	        $(".user" + index + " .user-con p").html($("#sendtit").val());
	        if (($('.user' + index).height() + $(".dialog-con").height()) >= 220) {
	            $(".dialog-con").css({
	                'height': '220px'
	            });
	            _this.style.webkitTransition = 'height 0.3s ease-in';
	            _tranNum = -($('.user' + index).height() + $(".dialog-con").height() - 220) + _tranNum - 4;
	            $(".tran-top").css({
	                '-webkit-transform': 'translateY(' + _tranNum + 'px)'
	            });
	            _tranTop.style.webkitTransition = '-webkit-transform 0.3s ease-in';
	        } else {
	            $(".dialog-con").css({
	                'height': $(".dialog-con").height() + $('.user' + index).height() + 5
	            });
	            _this.style.webkitTransition = 'height 0.3s ease-in';
	        }
	        $(".user" + index + " .user-con").addClass('active');
	        $(".user" + index + " .user-con").addClass('active');
	        if (_opacityNum1) {
	            $(_opacityNum1 + " .npc-con").removeClass('active');
	        }
	        setTimeout(function() {
	            if (($('.npc' + _npcNum).height() + $(".dialog-con").height()) >= 220) {
	                $(".dialog-con").css({
	                    'height': 220
	                });
	                _this.style.webkitTransition = 'height 0.3s ease-in';
	                _tranNum = -($('.npc' + _npcNum).height() + $(".dialog-con").height() - 220) + _tranNum - 4;
	                $(".tran-top").css({
	                    '-webkit-transform': 'translateY(' + _tranNum + 'px)'
	                });
	                _tranTop.style.webkitTransition = '-webkit-transform 0.3s ease-in';
	            } else {
	                $(".dialog-con").css({
	                    'height': $(".dialog-con").height() + $('.npc' + _npcNum).height() + 5
	                });
	                _this.style.webkitTransition = 'height 0.3s ease-in';
	            }
	            $(".npc" + _npcNum + " .npc-con").addClass('active');
	            if (_opacityNum2) {
	                $(_opacityNum2 + " .user-con").removeClass('active');
	            }
	        },
	        2000);
	    }
	 
	 	//水平仪
	 	window.addEventListener('devicemotion', deviceMotionHandler, false);
	 	
	 	//水平仪
	    function deviceMotionHandler(eventData) {
	        var acceleration = eventData.accelerationIncludingGravity;
	        var facingUp = -1;
	        if (acceleration.z > 0) {
	            facingUp = +1;
	        }
	        var tiltLR = Math.round(((acceleration.x) / 140) * -90);
	        var tiltFB = Math.round(((acceleration.y + 9.81) / 9.81) * 90 * facingUp);
	        //document.getElementById("moCalcTiltLR").innerHTML = tiltLR;
	        //document.getElementById("moCalcTiltFB").innerHTML = tiltFB;
	        tiltLR = tiltLR > 2 ? 2 : tiltLR < -2 ? -2 : tiltLR;
	        var rotation = "rotate(" + tiltLR + "deg)";

	        $("#water-wave").css({
	            "height": $(window).width()
	        });
	        document.getElementById("water-wave").style.webkitTransform = rotation;
	    }

		//水平仪点击事件
	    $("#level-title").on("touchstart",function(){
	    	//取得hidden里的值
	    	var level_link = $("#level_hidden").val();
	    	if(level_link != null && level_link.match(reg)){
	    		location.href="tel:"+level_link;
	    	}else{
	    		window.location.href=level_link;
	    	}
	    });
		
	
		// 语音广告   s
		var _audio = $('#audio')[0];
        var _audioPlay = true;
		$(".audiotime").html(parseInt(_audio.duration)+"\"");
        $(".audiobox").on('touchend',
        function() {
            if (_audioPlay) {
                _audio.play();
                _audioPlay = false;
            } else {
                _audio.pause();
                _audioPlay = true;
            }
        });
        $('#audio').on('play',
        function(e) {
			layer.msg('听完有彩蛋哦~~~~');
            e.stopPropagation();
			$(".bar-play").addClass('active');
        });
        $('#audio').on('pause',
        function(e) {
            e.stopPropagation();
            $(".bar-play").removeClass('active');
            _audioPlay = true
        });
        $('#audio').on('ended',
        function(e) {
			layer.msg('冬至快乐~~~~~~',function(){
				 e.stopPropagation();
            $(".bar-play").removeClass('active');
            _audioPlay = true;
			//取得hidden里的值
	    	var voicead_link = $("#voicead_hidden").val();
	    	if(voicead_link != null && voicead_link.match(reg)){
	    		location.href="tel:"+voicead_link;
	    	}else{
	    		window.location.href=voicead_link;
	    	}
			});
        });
		// 语音广告  e
		

		// 文字滚动  s
	    $("#marquee").on("touchstart",function(){
	    	//取得hidden里的值
	    	var marquee_link = $("#marquee_hidden").val();
	    	if(marquee_link != null && marquee_link.match(reg)){
	    		location.href="tel:"+marquee_link;
	    	}else{
	    		window.location.href=marquee_link;
	    	}
	    });
		//文字滚动  e
		*/
		//名片广告  s
			//短信咨询
			$(".consolt-sms").on("touchstart",function(){
				var user_tel = $("#mobile").text().trim();
				location.href="sms:"+user_tel;
			});
			//电话咨询
			$(".consolt-tel").on("touchstart",function(){
				var user_tel = $("#mobile").text().trim();
				location.href="tel:"+user_tel;
			});
		//名片广告  e


		/* 优惠券广告  s */
			//领取优惠
			$(".youGet").on("touchstart",function(){
					EV_modeAlert('quan-red');
			});
			//关闭优惠
			$("#closeYou").on("touchstart",function(){
					EV_closeAlert('quan-red');
			});
			//立即领取
			$("#getYouYou").on("touchstart",function(){
				var _phone = $("#coupon-mobile").val().trim();
                if (_phone.match(reg)) {
                	layer.msg("手机号正确。下一步访问服务端，发送短信。");
                	/*
                    $.ajax({
                        url: baseUrl + '/api/send/question/',
                        data: {
                            uid: uid,
                            mobile: _phone,
                            question: _question,
                            _host: document.domain.toLowerCase()
                        },
                        type: 'get',
                        dataType: 'json',
                        success: function(data) {}
                    });*/
                } else {
                	layer.msg("请输入正确的手机号。");
                }
			});

		//用来记录要显示的DIV的ID值
		var EV_MsgBox_ID=""; //重要
		//弹出对话窗口(msgID-要显示的div的id)
		function EV_modeAlert(msgID){
			//创建大大的背景框
			var bgObj=document.createElement("div");
			bgObj.setAttribute('id','EV_bgModeAlertDiv');
			bgObj.setAttribute('onClick','EV_closeAlert()');
			document.body.appendChild(bgObj);
			//背景框满窗口显示
			EV_Show_bgDiv();
		   //把要显示的div居中显示
			EV_MsgBox_ID=msgID;
			EV_Show_msgDiv();
		}


		//关闭对话窗口
		function EV_closeAlert(){
			var msgObj=document.getElementById(EV_MsgBox_ID);
			var bgObj=document.getElementById("EV_bgModeAlertDiv");
			msgObj.style.display="none";
			document.body.removeChild(bgObj);
			EV_MsgBox_ID="";
		}


		//窗口大小改变时更正显示大小和位置
		window.onresize=function(){
			if (EV_MsgBox_ID.length>0){
				EV_Show_bgDiv();
				EV_Show_msgDiv();
			}
		}

		//窗口滚动条拖动时更正显示大小和位置
		window.onscroll=function(){
			if (EV_MsgBox_ID.length>0){
				EV_Show_bgDiv();
				EV_Show_msgDiv();
			}
		}

		//把要显示的div居中显示
		function EV_Show_msgDiv(){
			var msgObj   = document.getElementById(EV_MsgBox_ID);
			msgObj.style.display  = "block";
			var msgWidth = msgObj.scrollWidth;
			var msgHeight= msgObj.scrollHeight;
			var bgTop=EV_myScrollTop();
			var bgLeft=EV_myScrollLeft();
			var bgWidth=EV_myClientWidth();
			var bgHeight=EV_myClientHeight();
			var msgTop=bgTop+Math.round((bgHeight-msgHeight)/2);
			var msgLeft=bgLeft+Math.round((bgWidth-msgWidth)/2);
			msgObj.style.position = "absolute";
			msgObj.style.top      = msgTop+"px";
			msgObj.style.left     = msgLeft+"px";
			msgObj.style.zIndex   = "10001";

		}

		//背景框满窗口显示
		function EV_Show_bgDiv(){
			var bgObj=document.getElementById("EV_bgModeAlertDiv");
			var bgWidth=EV_myClientWidth();
			var bgHeight=EV_myClientHeight();
			var bgTop=EV_myScrollTop();
			var bgLeft=EV_myScrollLeft();
			bgObj.style.position   = "absolute";
			bgObj.style.top        = bgTop+"px";
			bgObj.style.left       = bgLeft+"px";
			bgObj.style.width      = bgWidth + "px";
			bgObj.style.height     = bgHeight + "px";
			bgObj.style.zIndex     = "10000";
			bgObj.style.background = "#000";
			bgObj.style.filter     = "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=50,finishOpacity=50);";
			bgObj.style.opacity    = "0.5";
		}
		//网页被卷去的上高度
		function EV_myScrollTop(){
			var n=window.pageYOffset
			|| document.documentElement.scrollTop
			|| document.body.scrollTop || 0;
		   return n;
		}
		//网页被卷去的左宽度
		function EV_myScrollLeft(){
			var n=window.pageXOffset
			|| document.documentElement.scrollLeft
			|| document.body.scrollLeft || 0;
			return n;
		}
		//网页可见区域宽
		function EV_myClientWidth(){
			var n=document.documentElement.clientWidth
			|| document.body.clientWidth || 0;
			return n;
		}
		//网页可见区域高
		function EV_myClientHeight(){
			var n=document.documentElement.clientHeight
			|| document.body.clientHeight || 0;
			return n;
		}


		/* 优惠券广告  e */


		/* 图文广告 s*/
		$("#ad-title").on("touchstart",function(){
	    	//取得hidden里的值
	    	var marquee_link = $("#twad_hidden").val();
	    	if(marquee_link != null && marquee_link.match(reg)){
	    		location.href="tel:"+marquee_link;
	    	}else{
	    		window.location.href=marquee_link;
	    	}
	    });
		/* 图文广告 e */

	
	
		//video-play
		var datasrc = $(".video_iframe").attr("src");
		if(datasrc != null && datasrc != ''){
			datasrc = datasrc.replace('preview.html','player.html');
			$(".video_iframe").attr("data-src","");
			$(".video_iframe").attr("src",datasrc);
		}

		//阅读量
		var read = getCookie("read");
		if(read != null && read !=''){
  			//cookie��ֵ
			read =  parseInt(read) + 1;
  			$("#loads").text(read);
			document.cookie="read="+read;
  		}else{
  			//cookieûֵ
  			read = parseInt($("#loads").text()) + 1;
			$("#loads").text(read);
			document.cookie="read="+read;
  		}


		//点赞
  		var like = 0;
  		var zans = getCookie("zan");
  		if(zans != null && zans !=''){
  			//cookie��ֵ
  			$("#clicklike").attr("src","./b_files/image/yetlike.png");
  			$("#zans").text(zans);
  			like = 1;
  		}else{
  			//cookieûֵ
  			zans = $("#zans").text();
  		}
  		$("#clicklike").click(function(){
  			if(like == 0){
  				like = 1;
  				zans = parseInt(zans) + 1;
  				$("#zans").text(zans);
  				$(this).attr("src","./b_files/image/yetlike.png");
  				document.cookie="zan="+parseInt(zans);
  			}else{
  				like = 0;
  				zans = parseInt(zans) - 1;
  				$("#zans").text(zans);
  				$(this).attr("src","./b_files/image/like.png");
  				delCookie("zan");
  			}
  		});
  	});

  	function getCookie(name)
	{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
	return unescape(arr[2]);
	else
	return null;
	}

	function delCookie(name)
	{
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval=getCookie(name);
	if(cval!=null)
	document.cookie= name + "="+cval+";expires="+exp.toGMTString();
	}