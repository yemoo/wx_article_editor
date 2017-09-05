$(function () {
    /* ==== start 公共函数 ==== */
    var dialogIndex = 1000;
    // 弹出层函数
    function createDialog(config) {
        var overlay = $('<div class="overlay"></div>').css('zIndex', ++dialogIndex);

        var header = config.header ? $('<div class="header">' + config.header + '</div>') : '';
        var body = config.body ? $('<div class="body">' + config.body + '</div>') : '';
        var footer = config.footer ? $('<div class="footer">' + config.footer + '</div>') : '';
        var dialog = $('<div class="dialog" id="' + config.id + '"></div>');
        dialog.css('zIndex', ++dialogIndex).append(header, body, footer);

        return {
            dialog: dialog,
            header: header,
            footer: footer,
            body: body,
            overlay: overlay,
            open: function () {
                overlay.appendTo(document.body);
                dialog.appendTo(document.body);
            },
            close: function () {
                overlay.detach();
                dialog.detach();
            }
        };
    }

    var loadingHTML = $('<div class="loading-cover"><div class="loading-info">上传中...</div></div>').appendTo(document.body);

    function showLoading() {
        loadingHTML.show();
    }

    function hideLoading() {
        loadingHTML.hide();
    }

    //对图片旋转处理 added by lzk
    function rotateImg(img, direction, canvas) {
        //最小与最大旋转方向，图片旋转4次后回到原方向
        var min_step = 0;
        var max_step = 3;
        if (img == null)return;
        //img的高度和宽度不能在img元素隐藏后获取，否则会出错
        var height = img.height;
        var width = img.width;
        var step = 2;
        if (step == null) {
            step = min_step;
        }
        if (direction == 'right') {
            step++;
            //旋转到原位置，即超过最大值
            step > max_step && (step = min_step);
        } else {
            step--;
            step < min_step && (step = max_step);
        }
        //旋转角度以弧度值为参数
        var degree = step * 90 * Math.PI / 180;
        var ctx = canvas.getContext('2d');
        switch (step) {
            case 0:
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0);
                break;
            case 1:
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(degree);
                ctx.drawImage(img, 0, -height);
                break;
            case 2:
                canvas.width = width;
                canvas.height = height;
                ctx.rotate(degree);
                ctx.drawImage(img, -width, -height);
                break;
            case 3:
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(degree);
                ctx.drawImage(img, -width, 0);
                break;
        }
    }

    // 压缩图片
    function processImg(result, orientation, callback) {
        var img = new Image();
        img.src = result;
        // 压缩比率（图片最大支持到500K）
        var ratio = 500 * 1024 / result.length;
        // 宽高限制在600px
        var maxWidth = 600;
        var maxHeight = 600;

        img.onload = function () {

            var width = img.width;
            var height = img.height;

            // 先压缩图片尺寸
            var sizeRatio = 1;
            if (width > height) {
                if (width > maxWidth) {
                    sizeRatio = maxWidth / width;
                    height = Math.round(height * sizeRatio);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    sizeRatio = maxHeight / height;
                    width = Math.round(width * maxHeight / height);
                    height = maxHeight;
                }
            }

            ratio = Math.min.call(Math, ratio, sizeRatio, 1);

            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            //利用canvas进行绘图
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            var base64;
            // if (navigator.userAgent.match(/Android/i)) {// 修复android
            //     var encoder = new JPEGEncoder();
            //     base64 = encoder.encode(ctx.getImageData(0, 0, width, height), ratio * 100);
            // } else {
            if (orientation != "" && orientation != 1) {
                switch (orientation) {
                    case 6://需要顺时针（向左）90度旋转
                        rotateImg(img, 'left', canvas);
                        break;
                    case 8://需要逆时针（向右）90度旋转
                        rotateImg(img, 'right', canvas);
                        break;
                    case 3://需要180度旋转
                        rotateImg(img, 'right', canvas);//转两次
                        rotateImg(img, 'right', canvas);
                        break;
                }
            }
            base64 = canvas.toDataURL("image/jpeg", ratio);
            // }
            //data url的形式
            callback && callback(base64);
        };
    }

    /* ==== end 公共函数 ==== */


    // 区块操作面板
    var menus = $('<div class="section-menus">' +
        '<ul>' +
        '<li class="btn-add-txt"><i class="icon-doc-text"></i>插文字</li>' +
        '<li class="btn-update-txt"><i class="icon-pencil"></i>改文字</li>' +
        '<li class="btn-add-pic"><i class="icon-picture"></i>插图片</li>' +
        '</ul><ul>' +
        '<li class="btn-add-video"><i class="icon-video"></i>插视频</li>' +
        '<li class="btn-delete"><i class="icon-trash-empty"></i>删除</li>' +
        '<li class="btn-cancel"><i class="icon-cancel-circled"></i>取消</li>' +
        '</ul>' +
        '</div>');

    // 取消区块编辑
    menus.on('click', '.btn-cancel:not(.disabled)', function () {
        SECTION_EDITOR.close();
    });
    // 删除区块
    menus.on('click', '.btn-delete:not(.disabled)', function () {
        SECTION_EDITOR.delete();
    });

    // 区块文本编辑工具
    var SECTION_EDITOR = {
        activeSectionWrapper: $('<div class="active-section"><div class="content"></div></div>').append(menus),
        activeSection: null,
        close: function () {
            if (this.activeSection) {
                // 同步修改浏览器 title
                if (this.activeSection.closest('.n_title').length) {
                    var title = this.activeSection.text();
                    document.title = title;
                    $('title').text(title);
                }
                this.activeSection.insertBefore(this.activeSectionWrapper);
            }
            this.activeSectionWrapper.detach();
            this.activeSection = null;
        },
        open: function (section, items) {
            section = $(section);
            // 点击当前编辑块，不处理
            if (section.closest('.active-section').length) return true;
            // 点击菜单区域
            if (section.closest('.section-menus').length) return true;

            if (section.is('.page-module')) {
                if (section.find('.active-section').length) return true;
                section = section.children(':last');
            }
            if (section.is('.btn-delete-module')) {
                section = $('<p>点击编辑该行</p>').appendTo(section.closest('.page-module'));
            }

            this.close();
            this.activeSection = section;
            this.activeSectionWrapper.insertBefore(section);
            this.activeSectionWrapper.find('.content').append(section);

            if (typeof items != 'undefined') {
                items = items || BASE_BTNS;
                menus.find('li').addClass('disabled').filter(items.join(',')).removeClass('disabled');
            } else {
                menus.find('li').removeClass('disabled');
            }
        },
        update: function (html, style) {
            style = style || '';
            this.activeSection.html(html || '').attr('style', style).data('style', style);
        },
        add: function (html, style) {
            style = style || '';
            $('<p style="' + style + '">' + (html || '') + '</p>').data('style', style).insertAfter(this.activeSectionWrapper);
        },
        delete: function () {
            var imgs = [];
            this.activeSection.find('img.upload-img').each(function(idx, img){
                imgs.push($(img).attr('src').split('/').pop())
            });
            $.post('/delimg', {img: imgs.join('|')});

            this.activeSection.remove();
            delete this.activeSection;
            this.close();
        }
    };

    // 标题编辑
    $('.n_title').click(function () {
        if (pageState == 'edit') {
            SECTION_EDITOR.open(this, ['.btn-update-txt', '.btn-cancel']);
        }
    });
    /* ==== 区块处理 ==== */
    var contentArea = $('.n_content').css('word-break', 'break-all');
    // 删除区块，按 p 为区块划分
    contentArea.on('click', '.btn-delete-module', function () {
        SECTION_EDITOR.close();

        var imgs = [];
        $(this).closest('.page-module').find('img.upload-img').each(function(idx, img){
            imgs.push($(img).attr('src').split('/').pop())
        });
        $.post('/delimg', {img: imgs.join('|')});

        $(this).closest('.page-module').remove();

        if (contentArea.html().trim() === '') {
            newLine();
        }
        return false;
    });
    // 编辑区块，可以编辑任意元素
    contentArea.on('click', '.page-module', function (e) {
        // 图片编辑
        if (e.target.tagName.toLowerCase() == 'img') {
            var imgParent = $(e.target).parent();
            var hasLink = imgParent.is('a');
            imgEditor.edit(e.target.outerHTML, hasLink ? imgParent.attr('href') : '', hasLink ? imgParent : e.target);
        } else {
            SECTION_EDITOR.open(e.target);
        }
        return false;
    });
    /* ==== END 区块处理 ==== */

    // 文字编辑面板
    var textEditor;
    (function () {
        textEditor = createDialog({
            id: 'text-panel',
            header: '<ul>' +
            '<li data-style="font-weight:bold"><span class="icon-bold"></span></li>' +
            '<li data-style="text-decoration:underline"><span class="icon-underline"></span></li>' +
            '<li data-style="font-style: italic"><span class="icon-italic"></span></li>' +
            '<li data-panel="bgcolor" data-attr="background:"><span class="icon-color-adjust"></span></li>' +
            '<li data-panel="fontsize" data-attr="font-size:"><span class="icon-font"></span></li>' +
            '<li data-group="align" data-style="text-align:left"><span class="icon-align-left"></span></li>' +
            '<li data-group="align" data-style="display:block;text-align:center"><span class="icon-align-center"></span></li>' +
            '<li data-group="align" data-style="display:block;text-align:right"><span class="icon-align-right"></span></li>' +
            '</ul>' +
            '<span class="btn-clear">清空</span>',
            body: '<textarea placeholder="请输入文字内容"></textarea><input type="text" name="link" placeholder="请输入文字链接地址（可选）" />',
            footer: '<button class="btn-cancel">取消</button><button class="btn-submit">提交</button>'
        });

        var panels = {
            'bgcolor': (function () {
                var colors = ['red', 'green', 'blue', 'yellow', '#993399', 'black', 'white', '#0099CC', '#0066CC', '#99CC33', '#CC9966', 'magenta', '#999900', 'lime', 'cyan'];
                colors = colors.map(function (color, idx) {
                    var extra = (idx != colors.length - 1) && ((idx + 1) % 5 == 0) ? '</ul><ul>' : '';
                    return '<li><span style="background-color: ' + color + '" data-color="' + color + '">&nbsp;</span></li>' + extra;
                }).join('');

                var colorEditor = createDialog({
                    id: 'bgcolor-panel',
                    header: '<h3>文字背景颜色</h3><span class="btn-clear">清空</span>',
                    body: '<ul>' + colors + '</ul>',
                    footer: '<button>标准颜色</button>'
                });

                colorEditor.body.on('click', 'li span', function () {
                    colorEditor.relBtn.data('style', 'background:' + $(this).data('color')).addClass('active');
                    colorEditor.close();
                    updateStyle();
                });
                colorEditor.header.on('click', '.btn-clear', function () {
                    colorEditor.relBtn.data('style', '').removeClass('active');
                    colorEditor.close();
                    updateStyle();
                });

                return colorEditor;
            }()),
            'fontsize': (function () {
                var fonts = ['0.8em', '1em', '1.2em', '1.4em', '1.6em', '1.8em', '2em'];
                fonts = fonts.map(function (fontsize) {
                    return '<li data-fontsize="' + fontsize + '">' + fontsize + '</li>';
                }).join('');

                var fontEditor = createDialog({
                    id: 'fontsize-panel',
                    header: '<h3>字体大小</h3>',
                    body: '<ul>' + fonts + '</ul>'
                });

                fontEditor.body.on('click', 'li', function () {
                    var fontsize = $(this).data('fontsize');

                    if (fontsize == '1em') {
                        fontEditor.relBtn.data('style', '').removeClass('active');
                    } else {
                        fontEditor.relBtn.data('style', 'font-size:' + fontsize).addClass('active');
                    }

                    fontEditor.close();
                    updateStyle();
                });

                return fontEditor;
            }())
        };


        var textarea = textEditor.body.find('textarea');
        var linkInput = textEditor.body.find('input');
        var btns = textEditor.header.find('li');

        function updateStyle() {
            var styles = $.map(btns.filter('.active'), function (btn) {
                return $(btn).data('style') || '';
            }).join(';');
            textarea.attr('style', styles);
        }

        // 修改文本样式
        textEditor.header.on('click', 'ul li', function () {
            var self = $(this);
            var panel = self.data('panel');
            if (self.data('style') && !panel) {
                // 互斥的分组，先清空所有选项
                var group = self.data('group');
                if (group) {
                    btns.filter('[data-group=' + group + ']').removeClass('active');
                }

                // 选中该项
                self.toggleClass('active');

                // 重新计算样式
                updateStyle();
            } else if (panel) {
                panel = panels[panel];
                if (panel) {
                    panel.relBtn = self;
                    panel.open();
                }
                // 弹出二级面板
            }
        });
        // 清空样式和内容
        textEditor.header.on('click', '.btn-clear', function () {
            btns.removeClass('active');
            textarea.val('');
            updateStyle();
        });
        // 取消
        textEditor.footer.on('click', '.btn-cancel', function () {
            textEditor.close();
        });
        // 提交
        textEditor.footer.on('click', '.btn-submit', function () {
            var style = textarea.attr('style');
            var html = textarea.val();
            var link = linkInput.val().trim();
            if (link) {
                html = '<a href="' + link + '" target="_blank">' + html + '</a>';
            }
            // 编辑
            SECTION_EDITOR[state](html, style);

            // 关闭文本编辑器
            textEditor.close();
            SECTION_EDITOR.close();
        });

        // 事件绑定
        var state;
        // 点击菜单：添加文字
        menus.on('click', '.btn-add-txt:not(.disabled)', function () {
            state = 'add';
            // 重置编辑框内容和样式
            textEditor.body.find('textarea').val('').removeAttr('style');
            btns.removeClass('active');
            textEditor.open();
        });
        // 点击菜单：修改文字
        menus.on('click', '.btn-update-txt:not(.disabled)', function () {
            state = 'update';
            var activeSection = SECTION_EDITOR.activeSection;
            var styles = activeSection.data('style') || '';
            var text = activeSection.text().trim();
            // 将样式和文本同步到编辑框
            textEditor.body.find('textarea').val(text).attr('style', styles);
            // 将已有的样式对应按钮高亮
            btns.removeClass('active').each(function () {
                var btn = $(this);
                var attr = btn.data('attr');
                var style = btn.data('style');

                if (attr && styles.indexOf(attr) > -1) {
                    style = styles.split(';').filter(function (item) {
                        return item.indexOf(attr) > -1;
                    })[0];
                    btn.data('style', style);
                }

                if (style && styles.indexOf(style) > -1) {
                    btn.addClass('active');
                }
            });
            textEditor.open();
        });
    }());

    var imgEditor;
    (function () {
        imgEditor = createDialog({
            id: 'img-panel',
            header: '图片上传' +
            '<span class="btn-delete">删除</span>',
            body: ' <div class="preview"></div>' +
            '<div class="upload">选择照片<input type="file" accept="image/*"></div>' +
            '<div class="link"><input type="text" name="link" placeholder="请输入图片链接地址（可选）"></div>',
            footer: '<button class="btn-cancel">取消</button><button class="btn-submit">确认上传</button>'
        });

        menus.on('click', '.btn-add-pic:not(.disabled)', function () {
            state = 'add';
            if ($('.upload-img').length >= window.MAX_UPLOAD_PICS) {
                swal('上传提示', '一篇文章最多只能上传' + window.MAX_UPLOAD_PICS + '张图片哦~', 'error');
                return false;
            }
            imgEditor.open();
            preview.html('');
            linkInput.val('');
        });

        // 图片上传
        $(document).on('change', '#img-panel .upload input', function () {
            var self = $(this);
            var file = this.files[0];   //读取文件
            if (!file) return false;
            showLoading();

            var reader = new FileReader();

            reader.onload = function () {
                var result = this.result;   //result为data url的形式

                // 大于5M，直接拒绝
                if (result.length > 5 * 1024 * 1024) {
                    hideLoading();
                    swal('上传提示', '您上传的图片过大，请上传不超过5M的图片！', 'error');
                    return false;
                }

                // 获取旋转信息
                EXIF.getData(file, function () {
                    processImg(result, EXIF.getTag(this, 'Orientation'), function (result) {
                        $.post('/upload', {
                            data: result
                        }, function (data) {
                            hideLoading();
                            if (data.code == 0) {
                                var imgUrl = data.msg;
                                if (window.ORIGIN_ARTICLE_PATH) {
                                    imgUrl = window.ORIGIN_ARTICLE_PATH + location.href.split('articles/')[1];
                                    imgUrl = imgUrl.split('/');
                                    imgUrl.pop();
                                    imgUrl.push(data.msg);
                                    imgUrl = imgUrl.join('/');
                                }

                                preview.html('<img style="display: block;margin: 0px auto;" class="upload-img" src="' + imgUrl + '">');
                            } else {
                                swal('上传提示', '上传失败，请重试！', 'error');
                            }
                            self.val('');
                        });
                    });
                });
            };

            reader.readAsDataURL(file);
        });

        var preview = imgEditor.body.find('.preview');
        var linkInput = imgEditor.body.find('.link input');

        var state, wrapper;
        // 编辑图片
        imgEditor.edit = function (img, link, el) {
            state = 'update';
            imgEditor.open();
            preview.html(img);
            linkInput.val(link || '');
            wrapper = $(el);
        };

        //  删除图片
        imgEditor.header.on('click', '.btn-delete', function () {
            $.post('/delimg', {
                img: $('.upload-img').attr('src')
            });
            preview.empty();
        });
        // 取消
        imgEditor.footer.on('click', '.btn-cancel', function () {
            imgEditor.close();
        });
        // 提交
        imgEditor.footer.on('click', '.btn-submit', function () {
            var html = preview.html();
            var link = linkInput.val().trim();
            if (link) {
                html = '<a href="' + link + '" target="_blank">' + html + '</a>';
            }

            // 添加图片到页面
            if (state == 'add') {
                SECTION_EDITOR.add(html);
            } else if (state == 'update') {
                wrapper.replaceWith(html);
            }

            // 关闭图片编辑器
            imgEditor.close();
            SECTION_EDITOR.close();
        });

    }());


    var videoEditor;
    (function () {
        videoEditor = createDialog({
            id: 'video-panel',
            header: '插入视频',
            body: '<input type="text" placeholder="支持优酷/土豆/腾讯/头条视频地址">',
            footer: '<button class="btn-cancel">取消</button><button class="btn-submit">提交</button>'
        });

        // 添加视频
        menus.on('click', '.btn-add-video:not(.disabled)', function () {
            videoEditor.open();
            video.val('');
        });

        var video = videoEditor.body.find('input');
        // 取消
        videoEditor.footer.on('click', '.btn-cancel', function () {
            videoEditor.close();
            video.val('');
        });
        // 提交
        videoEditor.footer.on('click', '.btn-submit', function () {
            var videoUrl = /.*?(https?:.+)$/.test(video.val()) && RegExp.$1;
            var posterUrl;
            var isMp4;

            var videoRoot = location.protocol + '//' + location.hostname + (location.port ? (':' + location.port) : '');
            var ratio = 253 / 375;
            var width = window.innerWidth || document.body.clientWidth;
            var height = (width * ratio).toFixed(2);
            // 优酷
            if (videoUrl.indexOf('youku.com') > -1) {
                if (/id_([\w=]+)\.html/.test(videoUrl)) {
                    videoUrl = 'http://player.youku.com/embed/' + RegExp.$1;
                } else {
                    alert('你输入的优酷地址无法解析！');
                    return false;
                }
            } else if (videoUrl.indexOf('tudou.com') > -1) {   // 土豆网
                if (/view\/(\w+)/.test(videoUrl)) {
                    videoUrl = 'http://www.tudou.com/programs/view/html5embed.action?type=0&code=' + RegExp.$1 + '&lcode=';
                } else if (/v\/([\w=]+==|\d{9})/.test(videoUrl)) {
                    isMp4 = true;
                    videoUrl = videoRoot + '/tudou-video-url?vid=' + encodeURIComponent(RegExp.$1);
                    posterUrl = videoRoot + '/tudou-video-poster?vid=' + encodeURIComponent(RegExp.$1);
                    ;
                } else if (/\/([^\/]+)\/([^\.\/]+)\.html/.test(videoUrl)) {
                    videoUrl = 'http://www.tudou.com/programs/view/html5embed.action?type=0&code=' + RegExp.$2 + '&lcode=' + RegExp.$1;
                } else {
                    alert('你输入的土豆地址无法解析！');
                    return false;
                }
            } else if (videoUrl.indexOf('v.qq.com') > -1) {
                if (/\/(\w{11})\.html/.test(videoUrl) || /vid=(\w{11})/.test(videoUrl)) {
                    videoUrl = 'http://v.qq.com/iframe/player.html?vid=' + encodeURIComponent(RegExp.$1);
                } else {
                    alert('你输入的腾讯视频地址无法解析！');
                    return false;
                }
            } else if (videoUrl.indexOf('365yg.com') > -1 || videoUrl.indexOf('toutiao.com') > -1) { // 今日头条
                isMp4 = true;
                posterUrl = videoRoot + '/toutiao-video-poster?url=' + encodeURIComponent(videoUrl);
                videoUrl = videoRoot + '/toutiao-video-url?url=' + encodeURIComponent(videoUrl);
            }

            var html;
            if (isMp4) {
                html = '<video class="video-wrapper" data-ratio="' + ratio + '" src="' + videoUrl + '" preload="true" controls style="width: 100%;height:' + height + 'px" preload="true" poster="' + posterUrl + '"></video>';
            } else {
                html = '<iframe class="video-wrapper" data-ratio="' + ratio + '" src="' + videoUrl + '" data-src="" frameborder="0" style="width: 100%;height:' + height + 'px"></iframe>';
            }

            SECTION_EDITOR.add(html);

            // 关闭图片编辑器
            videoEditor.close();
            SECTION_EDITOR.close();
        });
    }());
    window.onresize = function(){
        $('.video-wrapper').each(function(){
            var item = $(this);
            var ratio = item.data('ratio');
            var width = window.innerWidth || document.body.clientWidth;
            var height = (width * ratio).toFixed(2);
            item.css('height', height);
        });
    };

    var isEdit = false;

    function wrapItem(item) {
        if ($(item).html().trim() === '') {
            $(item).text('点击编辑该行');
        }
        return $(item).wrap('<div class="page-module"></div>').before('<span class="btn-delete-module">删除</span>');
    }

    // 编辑页面
    function startEdit() {
        if (isEdit) return;
        isEdit = true;

        // 便于提醒用户标题可编辑
        $('.n_title').addClass('title-edit');
        if (contentArea.html().trim() === '') {
            newLine();
        } else {
            var editArea = contentArea;
            do {
                editArea = editArea.find(' > *');
            } while (editArea.length == 1 && editArea.children().length > 1)

            // 区块处理：通过 page-module 标识，增加删除按钮
            editArea.each(function () {
                // var children = $(this).find(' > *');
                // wrapItem(children.length ? children : this);
                wrapItem(this);
            });
        }
    }

    // 取消编辑
    function cancelEdit() {
        if (!isEdit) return false;
        isEdit = false;

        $('.n_title').removeClass('title-edit');

        textEditor.close();
        SECTION_EDITOR.close();

        var pageModules = contentArea.find('.page-module');
        pageModules.find('.btn-delete-module').remove();
        pageModules.each(function () {
            var children = $(this).children();
            var self = this;
            $.each(children, function (idx, item) {
                item = $(item);
                if (item.html() !== '点击编辑该行') {
                    item.insertBefore(self);
                }
            });
            $(this).remove();
        });
    }

    function toggleState(state) {
        if (!state || ['view', 'edit'].indexOf(state) == -1) {
            state = pageState == 'view' ? 'edit' : 'view';
        }

        if (state == 'edit') {
            pageState = 'edit';
            $('.btn-edit').text('预览').removeClass('btn-edit').addClass('btn-preview');
            startEdit();
        } else {
            pageState = 'view';
            $('.btn-preview').text('编辑').removeClass('btn-preview').addClass('btn-edit');
            cancelEdit();
        }
    }

    // 创建新行
    function newLine() {
        startEdit();
        var lastLine = $('.page-module:last');
        var newLineEl = $('<p style="font-size:14px">点击编辑该行</p>');
        if (lastLine.length) {
            newLineEl.insertAfter(lastLine);
        } else {
            newLineEl.appendTo('.n_content');
        }
        wrapItem(newLineEl);

        lastLine = $('.page-module:last');
        lastLine.find('p').trigger('click');
        $(window).scrollTop(lastLine.position().top);
    }

    function savePage() {
        toggleState('view');

        var buttonArea = $('.edit-area').detach();

        $.post('/save', {
            page: location.pathname,
            content: $('.n_content').html(),
            title: $('.n_title').html()
        }, function (res) {
            buttonArea.appendTo(document.body);
            if (res.code == 0) {
                swal({
                    title: '操作提示',
                    text: '页面保存成功！',
                    type: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                swal('操作提示', '保存失败，请重试！', 'error');
            }
        }, 'json');
    }

    var bottomButtonArea = $('<div class="edit-area edit-area-bottom"></div>').appendTo(document.body);
    $('<button class="btn-edit">编辑</button>').on('click', toggleState).appendTo(bottomButtonArea);
    $('<button class="btn-save">保存</button>').on('click', savePage).appendTo(bottomButtonArea);
    $('<button class="btn-newline">新建一行</button>').on('click', newLine).appendTo(bottomButtonArea);

    // var topButtonArea = $('<div class="edit-area edit-area-top"></div>').appendTo(document.body);
    // $('<button class="btn-edit">编辑</button>').on('click', toggleState).appendTo(topButtonArea);
    // $('<button class="btn-save">保存</button>').on('click', savePage).appendTo(topButtonArea);
    // $('<button class="btn-newline">新建一行</button>').on('click', newLine).appendTo(topButtonArea);

    // 设置默认显示哪些编辑按钮
    var btnCfg = /[\?&]fn=([\w,]+)/gi.test(location.search) ? RegExp.$1.split(',') : [0, 1, 2];
    var baseItems = ['.btn-delete', '.btn-cancel'];
    var itemsMap = {
        10: [],
        0: ['.btn-add-txt', '.btn-update-txt'],
        1: ['.btn-add-pic'],
        2: ['.btn-add-video'],
    };
    var BASE_BTNS = btnCfg.reduce(function (arr, idx) {
        return arr.concat(itemsMap[idx]);
    }, baseItems);

    // 支持参数设置页面状态
    var pageState = /[\?&]state=(\w+)/gi.test(location.search) ? RegExp.$1 : 'view';
    toggleState(pageState);

    // 删除 body 上定义的 height
    if ($(document.body).css('height')) {
        $(document.body).css('height', 'auto');
    }

    window.savePage = savePage;
    window.toggleState = toggleState;
    window.newLine = newLine;
});
