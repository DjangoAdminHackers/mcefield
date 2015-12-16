($ || django.jQuery)(function($) {
    
    // per-site tinyMCE_config
    if (typeof(window.site_mce_config) == 'undefined'){
        window.site_mce_config = {};
    }
    
    var extra_styles = window.site_mce_config.extra_styles || []; // e.g. {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}}
    var extra_classes = window.site_mce_config.extra_classes || ''; // e.g. class<dummystyle
    var extra_image_classes = window.site_mce_config.extra_image_classes || []; // e.g. [{title: 'Left', value: 'left'}, {title: 'Right', value: 'right'}]
    var extra_plugins = window.site_mce_config.extra_plugins || ''; // e.g. ", table"
    var content_width = window.site_mce_config.content_width || 800; // TODO this should relate to site's content width to give accurate idea of line lengths
    
    var valid_elements = "-h2/h1[___],-h3/h4/h5[___],"
        + "p[___],"
        + "ul[___],-li,-ol,"
        + "blockquote,"
        + "br,"
        + "-em/i,-strong/b,"
        + "-span[!___],-div[!___],"
        + "a[!name|!href|title|target],"
        + "hr,"
        + "iframe[src|allowfullscreen],"
        + "figure,figcaption,"
        + "img[src|class<left?right?center?floatleft?floatright|alt|title|height|width]";
    
    valid_elements.replace(/___/g, extra_classes);
    
    function CustomFileBrowser(field_name, url, type, win) {
    
        var cmsURL = mcefieldBrowseUrl + '?pop=2' + '&type=' + type;

        tinyMCE.activeEditor.windowManager.open({
            file: cmsURL,
            width: 980,
            height: 550,
            resizable: 'yes',
            scrollbars: 'yes',
            inline: 'yes',
            close_previous: 'no'
        }, {
            window: win,
            input: field_name,
            editor_id: tinyMCE.selectedInstance.editorId
        });
        return false;
    }

    function cleanup_html(element_id, html, body) {

        html = html.replace(/<!--[\s\S]+?-->/gi, ''); // Remove Word comments like conditional comments etc
        content = $(html);
        content.find('a[href]').each(function() {
            // Remove empty links
            // If there is nothing left after removing <br />, &nbsp; and whitespace characters then the a tag is empty
            if ($(this).html().replace(/<br>/g, '').replace(/\s+/g, '').replace(/&nbsp;/g, '') == '') {
                $(this).replaceWith($(this).html());
            }
        });
        return $('<div>').append(content.clone()).html();
    }

    function doShowWhitespace() {
        var setStyle = tinyMCE.activeEditor.dom.setStyle;
        var domSelect = tinyMCE.activeEditor.dom.select;
        if (!tinyMCE.activeEditor.show_paragraphs) {
            setStyle(domSelect('p, h1, h2, h3, h4, ul, li, ol'), 'background-color', '#FFFFBB');
            setStyle(domSelect('p, h1, h2, h3, h4, ul, ol'), 'margin-bottom', '5px');
            setStyle(domSelect('a'), 'background-color', '#AAF');
            setStyle(domSelect('a'), 'border', '1px solid blue');
            setStyle(domSelect('a'), 'margin', '2px');
            setStyle(domSelect('a'), 'padding', '2px');
            tinyMCE.activeEditor.show_paragraphs = true;
        } else {
            setStyle(domSelect('p, h1, h2, h3, h4, ul, li, ol'), 'background-color', 'transparent');
            setStyle(domSelect('p, h1, h2, h3, h4, ul, ol'), 'margin-bottom', '0');
            setStyle(domSelect('a'), 'background-color', '#FFF');
            setStyle(domSelect('a'), 'border', 'none');
            setStyle(domSelect('a'), 'margin', '0');
            setStyle(domSelect('a'), 'padding', '0');
            tinyMCE.activeEditor.show_paragraphs = false;
        }
    }

    function doShowFileBrowser() {
        tinyMCE.activeEditor.windowManager.open({
            file: mcefieldBrowseUrl + '?pop=1&ixxy_mce=1&type=file',
            width: 980,
            height: 550,
            resizable: "yes",
            scrollbars: "yes",
            inline: "yes",
            close_previous: "yes",
            popup_css: false 
        }, {});
    }

    function doShowUpload(dir, format) {
        return function() {
            tinyMCE.activeEditor.windowManager.open({
                file: mcefieldUploadUrl + '?pop=1&dir=' + dir + '&type=' + format,
                width: 980,
                height: 550,
                resizable: "yes",
                scrollbars: "yes",
                inline: "yes",
                close_previous: "yes",
                popup_css: false
            }, {});
        }
    }

    //tinyMCE_config = {
    //    theme_advanced_resizing: true,
    //    theme_advanced_resize_horizontal: false,
    //    theme_advanced_path: false,
    //    cleanup_on_startup: true,
    //    convert_urls: false,
    //    fix_list_elements: true,
    //    fix_nesting: true,
    //    fix_table_elements: true,
    //    gecko_spellcheck: true,
    //    auto_cleanup_word: true
    //};
    
    var tinyMCE_config = {
        block_formats: "Paragraph=p;Heading=h2;Sub-heading=h3",
        formats : {
                alignleft : {selector : 'img', classes : 'left'},
                aligncenter : {selector : 'img', classes : 'center'},
                alignright : {selector : 'img', classes : 'right'},
                alignfull : {selector : 'img', classes : 'full'}
                //bold : {inline : 'span', 'classes' : 'bold'},
                //italic : {inline : 'span', 'classes' : 'italic'},
                //underline : {inline : 'span', 'classes' : 'underline', exact : true},
                //strikethrough : {inline : 'del'},
                //forecolor : {inline : 'span', classes : 'forecolor', styles : {color : '%value'}},
                //hilitecolor : {inline : 'span', classes : 'hilitecolor', styles : {backgroundColor : '%value'}},
                //custom_format : {block : 'h1', attributes : {title : "Header"}, styles : {color : red}}
        },
        style_formats: [/* Do we want any global styles? */].concat(extra_styles), 
        style_formats_merge: false,
        content_css: "/static/css/mce_styles.css",
        cache_suffix: "?v=" + new Date().getTime(),  // TODO This is quick and dirty cache-busting
        convert_urls: false,
        plugins: "media, autolink, image, link, anchor, paste, searchreplace, visualchars, charmap, code, hr, media, preview, template, visualblocks, autoresize" + extra_plugins,
        external_plugins: {
            "caption": "/static/js/mce_plugins/ixxy_image/plugin.js"
        },
        image_caption: true,
        media_alt_source: false,
        media_poster: false,
        media_dimensions: false,
        media_live_embeds: true,
        object_resizing: false,
        valid_elements: valid_elements,
        paste_preprocess: function(pl, o) {
            o.content = o.content.replace(/<!(?:--[\s\S]*?--\s*)?>\s*/g, '');
        },
        save_callback: cleanup_html,
        link_list: "/admin/cms/linklist.json",
        image_list: "/admin/cms/imagelist.json",
        image_dimensions: false,
        image_class_list: [
            {title: 'None', value: ''}
        ].concat(extra_image_classes),
        target_list: false,
        toolbar: [
            "formatselect styleselect | bold italic removeformat | bullist numlist blockquote hr | link unlink anchor | image media | imageUpload fileUpload fileBrowser | code"
            //"undo redo | charmap hr | searchreplace | visualchars visualblocks"
        ],
        menubar: false,
        width: content_width + 18,
        
        setup: function(ed) {

            ed.addButton('showWhitespace', {
                title: 'Show Whitespace',
                image: '/static/images/admin/show_whitespace.gif', // TODO make a proper icon
                onclick: doShowWhitespace
            });
            
            if (mcefieldBrowseUrl) {
                ed.addButton('fileBrowser', {
                    title: 'Open Filebrowser',
                    image: '/static/filebrowser/img/filebrowser_icon_show.gif',
                    onclick: doShowFileBrowser
                });
            }

            if (mcefieldUploadUrl) {
                ed.addButton('imageUpload', {
                    title: 'Upload an image',
                    image: '/static/img/image_upload.png',
                    onclick: doShowUpload('images', 'image')
                });
            }

            if (mcefieldUploadUrl) {
                ed.addButton('fileUpload', {
                    title: 'Upload a document',
                    image: '/static/img/file_upload.png',
                    onclick: doShowUpload('documents', 'file')
                });
            }

            ed.on('PreInit', function(ed) {
                if (typeof(fontFaceCssTag) !== 'undefined') {
                    $(ed.contentDocument).find('head').append(fontFaceCssTag);
                }
            });
        }
    }

    $.extend(tinyMCE_config, window.site_mce_config);

    // Parse the per field conf parameter
    // content = MCEField(blank=True, null=True, conf={'width':999})
    function parseQuery(query) {
        var Params = new Object();
        if (!query) return Params; // return empty object
        var Pairs = query.split(/[;&]/);
        for (var i = 0; i < Pairs.length; i++) {
            var KeyVal = Pairs[i].split('=');
            if (!KeyVal || KeyVal.length != 2) continue;
            var key = unescape(KeyVal[0]);
            var val = unescape(KeyVal[1]);
            val = val.replace(/\+/g, ' ');
            Params[key] = val;
        }
        return Params;
    }

    // document.domain = document.domain.replace('www.', '').replace('static.', '');

    window.process_inline_mce = function(){
        $(".mce_fields")
            .not('.empty-form .mce_fields')
            .filter(':visible')
            .not('[id*=__prefix__]')
            .each(function(i) {
                tinyMCE.execCommand("mceAddControl", true, this.id);
                $(this).removeClass('mce_fields');
            });

    }

    function mce_init() {
        
        var mceFields = $(".mce_fields")
            .not('.empty-form .mce_fields')
            .filter(':visible')
            .not('.mce_inited')
            .not('[id*=__prefix__]');
            
        mceFields.each(function(i) {
            
            var selector = '#' + this.id;
            var field_tinyMCE_config = {'selector': '#' + this.id};
            $.extend(field_tinyMCE_config, tinyMCE_config);
            $.extend(
                field_tinyMCE_config,
                $(selector).parent().data()['mceConf']
            );
            tinymce.init(field_tinyMCE_config);
            $(this).removeClass('mce_fields').addClass('mce_inited');
        });

        // 'Add another' on inlines triggers a check to reinit MCE fields
        $('.add-row').on('mouseup', 'a', function() {
            setTimeout('window.process_inline_mce()', 200)
        });

    }
    
    $(document).ready(function() {
        mce_init();
    });
});