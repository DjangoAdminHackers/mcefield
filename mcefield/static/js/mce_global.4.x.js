($ || django.jQuery)(function($) {
    
    // per-site tinyMCE_config
    if (typeof(site_mce_config) == 'undefined'){
        var site_mce_config = {};
    }
    
    // var extra_styles = site_mce_config.extra_styles || "Regular=dummystyle"; // TODO make configurable
    var extra_styles = [{'title': 'Regular', 'classes': 'dummystyle'}];  // TODO merge site_mce_config.extra_styles 
    var extra_classes = site_mce_config.extra_classes || "class<dummystyle"; // TODO make configurable
    var content_width = site_mce_config.content_width || 690; // TODO this should relate to site's content width to give accurate idea of line lengths
    var table_controls = site_mce_config.table_controls || ", tablecontrols";
    var extra_plugins = site_mce_config.extra_plugins || ", table";
    var table_elements = site_mce_config.table_elements || ",table,tr,th,#td,thead,tbody";
    
    function CustomFileBrowser(field_name, url, type, win) {
    
        var cmsURL = mcefieldBrowseUrl + '?pop=2' + '&type=' + type;

        tinyMCE.activeEditor.windowManager.open({
            file: cmsURL,
            width: 980,  // Your dimensions may differ - toy around with them!
            height: 550,
            resizable: 'yes',
            scrollbars: 'yes',
            inline: 'yes',  // This parameter only has an effect if you use the inlinepopups plugin!
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
            file: mcefieldBrowseUrl + '?pop=1',
            width: 980,
            height: 550,
            resizable: "yes",
            scrollbars: "yes",
            inline: "yes",
            close_previous: "yes",
            popup_css: false 
        }, {});
    }

    function doShowUpload(dir) {
        return function() {
            tinyMCE.activeEditor.windowManager.open({
                file: mcefieldUploadUrl + '?pop=1&dir=' + dir,
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

    tinyMCE_config = {
        mode: "none",
        theme_advanced_resizing: true,
        theme_advanced_resize_horizontal: false,
        theme_advanced_path: false,
        theme_advanced_statusbar_location: "bottom",
        theme_advanced_styles: extra_styles,
        theme_advanced_blockformats: "p,h2,h3",
        cleanup_on_startup: true,
        convert_urls: false,
        fix_list_elements: true,
        fix_nesting: true,
        fix_table_elements: true,
        gecko_spellcheck: true,
        use_native_selects: false,
        external_link_list_url: "/admin/cms/linklist.js",
        auto_cleanup_word: true
    };
    
    tinyMCE_config = {
        selector: "textarea",
        //content_css: "/static/css/mce_styles.css",
        //cache_suffix: "?v=" + new Date().getTime(),  // TODO This is quick and dirty cache-busting
        plugins: "autolink, image, link, anchor, paste, searchreplace, visualchars, charmap, code, hr, media, preview, template, visualblocks, autoresize,  " + extra_plugins,
        external_plugins: {
            //"caption": "/static/plugins/caption/plugin.js",
        },
        style_formats: extra_styles,
        style_formats_merge: extra_styles,
        valid_elements: (
            "-h2/h1[___],-h3/h4/h5[___],"
                + "p[___],"
                + "ul[___],-li,-ol,"
                + "blockquote,"
                + "br,"
                + "-em/i,-strong/b,"
                + "-span[!___],-div[!___],"
                + "a[!name|!href|title|target],"
                + "hr,"
                + "img[src|class<left?right?center?floatleft?floatright|alt|title|height|width]"
                + table_elements
        ).replace(/___/g, extra_classes),
        paste_preprocess: function(pl, o) {
            o.content = o.content.replace(/<!(?:--[\s\S]*?--\s*)?>\s*/g, '');
        },
        save_callback: cleanup_html,
        link_list: "/admin/cms/linklist.json",
        image_list: "/admin/cms/imagelist.json",
        image_dimensions: false,
        image_class_list: [
            {title: 'None', value: ''},
            {title: 'Align left', value: 'left'},
            {title: 'Align right', value: 'right'},
            {title: 'Align to centre', value: 'center'},
            {title: 'Align left with text wrapping', value: 'floatleft'},
            {title: 'Align right with text wrapping', value: 'floatright'}
        ],
        target_list: false,
        toolbar: [
            "formatselect styleselect removeformat | bold italic | bullist numlist blockquote | undo redo",
            "link unlink anchor | image | imageUpload fileUpload fileBrowser"
            //"charmap hr | searchreplace | code visualchars visualblocks |" + table_controls
        ],
        menubar: false,
        //width: content_width + 18,
        
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
                    onclick: doShowUpload('images')
                });
            }

            if (mcefieldUploadUrl) {
                ed.addButton('fileUpload', {
                    title: 'Upload a document',
                    image: '/static/img/file_upload.png',
                    onclick: doShowUpload('documents')
                });
            }

            ed.on('PreInit', function(ed) {
                if (typeof(fontFaceCssTag) !== 'undefined') {
                    $(ed.contentDocument).find('head').append(fontFaceCssTag);
                }
            });
        }
    }

    // Alternate config for HTML snippets
    nonblocklevel_tinyMCE_config = $.extend(true, {}, tinyMCE_config);
    nonblocklevel_tinyMCE_config['theme_advanced_blockformats'] = "p";
    nonblocklevel_tinyMCE_config['theme_advanced_buttons1'] = "styleselect removeformat | bold italic | undo redo | link unlink anchor | fileBrowser";
    nonblocklevel_tinyMCE_config['theme_advanced_buttons2'] = "charmap | search replace | code showWhitespace |";
    nonblocklevel_tinyMCE_config['forced_root_block'] = '';
    nonblocklevel_tinyMCE_config['force_br_newlines'] = true;
    nonblocklevel_tinyMCE_config['force_p_newlines'] = false;

    //per site tinyMCE_config
    if (typeof(site_mce_config) != 'undefined') {
        $.extend(tinyMCE_config, site_mce_config)
    }

    //Parse the per field conf parameter
    //content = MCEField(blank=True, null=True, conf={'width':999})
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

    var scripts = document.getElementsByTagName('script');
    var current_ccript = scripts[scripts.length - 1];
    var query_string = current_ccript.src.replace(/^[^\?]+\??/, '');
    var field_mce_conf = parseQuery(query_string);
    for (attr in field_mce_conf) {
        tinyMCE_config[attr] = field_mce_conf[attr]
    }

    //document.domain = document.domain.replace('www.', '').replace('static.', '');
    tinyMCE.init(tinyMCE_config);

    function process_inline_mce(){
        $(".mce_fields").not('.empty-form .mce_fields').filter(':visible').not('[id*=__prefix__]').each(function(i) {
            tinyMCE.execCommand("mceAddControl", true, this.id);
            $(this).removeClass('mce_fields');
        });

    }

    function mce_init(){
        $(".mce_fields").not('.empty-form .mce_fields').not('.mce_inited').not('[id*=__prefix__]').each(function (i) {
            tinyMCE.execCommand("mceAddControl", true, this.id);
            $(this).removeClass('mce_fields').addClass('mce_inited');
        });
        $('.add-row').on('mouseup', 'a', function() {
            setTimeout('process_inline_mce()', 200)
        });
    }

    $(document).ready(function() {
        mce_init()
    });
});