($ || django.jQuery)(function($) {
    
    // per-site tinyMCE_config
    if (typeof(window.site_mce_config) == 'undefined'){
        window.site_mce_config = {};
    }
    
    var text_styles = window.site_mce_config.text_styles || []; // e.g. {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}}
    var text_classes = window.site_mce_config.text_classes || []; // e.g. ['myclass1','myclass2']
    var image_styles = window.site_mce_config.image_styles || []; // e.g. [{title: 'Left', value: 'left'}, {title: 'Right', value: 'right'}]
    var image_classes = window.site_mce_config.image_classes || []; // e.g. ['myclass1', 'myclass2']
    var extra_plugins = window.site_mce_config.extra_plugins || ''; // e.g. ", table"
    var content_width = window.site_mce_config.content_width || 800; // TODO this should relate to site's content width to give accurate idea of line lengths
    var extra_img_attributes = window.site_mce_config.extra_img_attributes || '';
    
    var valid_elements = "-h2/h1[id|__text_classes__],-h3/h4[id|__text_classes__],-h3/h5[id|__text_classes__],"
        + "p[__text_classes__],"
        + "ul[__text_classes__],-li,-ol,"
        + "blockquote,"
        + "br,"
        + "-em/i,-strong/b,"
        + "-span[__required_text_classes__],-div[__required_text_classes__],"
        + "a[!id|!href|title|target],"
        + "hr,"
        + "iframe[src|allowfullscreen],"
        + "figure[*],figcaption," // TODO imageCaption is specific to ixxy_image plugin
        + "img[__image_attributes__src|alt|title]";
    
    var validElementsText = '';
    var requiredValidElementsText = '';
    var validElementsImage = '';
    
    if (text_classes.length > 0) {
        validElementsText = 'class<' + text_classes.join('?');
        // Tags without one of these classes will be entirely stripped
        requiredValidElementsText = '!' + validElementsText;
    }
    if (image_classes.length > 0) {
        validElementsImage = 'class<' + image_classes.join('?') + '|';
    }
    if (extra_img_attributes.length > 0) {
        validElementsImage += extra_img_attributes.join('|') + '|';
    }
    
    valid_elements = valid_elements.replace(/__text_classes__/g, validElementsText);
    valid_elements = valid_elements.replace(/__required_text_classes__/g, requiredValidElementsText);
    valid_elements = valid_elements.replace(/__image_attributes__/g, validElementsImage);
    
    console.log(valid_elements);
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

    function doShowFileBrowser(ed) {
        ed.windowManager.open({
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

    function doShowUpload(ed, dir, format) {
        ed.windowManager.open({
            file: mcefieldUploadUrl + '?pop=1&ixxy_mce=1&dir=' + dir + '&type=' + format,
            width: 980,
            height: 550,
            resizable: "yes",
            scrollbars: "yes",
            inline: "yes",
            close_previous: "yes",
            popup_css: false
        }, {});
    }

    
    var tinyMCE_config = {
        block_formats: "Paragraph=p;Heading=h2;Sub-heading=h3",
        style_formats: [
            {title: 'None', inline: 'span', attributes: {class: ''}}
        ].concat(text_styles), 
        style_formats_merge: false,
        style_formats_autohide: true,
        content_css: "/static/css/mce_styles.css",
        cache_suffix: "?v=" + new Date().getTime(),  // TODO This is quick and dirty cache-busting
        convert_urls: false,
        element_format: 'html',
        plugins: "media, autolink, link, lists, anchor, paste, searchreplace, toc, visualchars, charmap, code, hr, preview, template, visualblocks" + extra_plugins,
        external_plugins: {
            "ixxy_image": "/static/js/mce_plugins/ixxy_image/plugin.js"
        },
        browser_spellcheck: true,
        height: 500,
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
        link_title: false,
        target_list: false,
        image_class_list: [
            {title: 'None', value: ''}
        ].concat(image_styles),
        toolbar: [
            "formatselect styleselect | bold italic removeformat | bullist numlist blockquote hr | toc charmap | link unlink anchor | fileBrowser imageUpload fileUpload media | code"
            //"undo redo | charmap hr | searchreplace | visualchars visualblocks"
        ],
        menubar: false,
        width: content_width + 18,
        
        setup: function(ed) {

            if (mcefieldBrowseUrl) {
                ed.addButton('fileBrowser', {
                    title: 'Open Filebrowser',
                    icon: 'browse',
                    onclick: function(){
                        doShowFileBrowser(ed);
                    }
                });
            }

            if (mcefieldUploadUrl) {
                ed.addButton('imageUpload', {
                    title: 'Upload an image',
                    image: '/static/img/document_image_add_32.png',
                    onclick: function(){
                        doShowUpload(ed, 'images', 'image');
                    }
                });
            }

            if (mcefieldUploadUrl) {
                ed.addButton('fileUpload', {
                    title: 'Upload a document',
                    image: '/static/img/notes_add_32.png',
                    onclick: function(){
                        doShowUpload(ed, 'documents', 'file')
                    }
                });
            }
            
        }
    };

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

    function mce_init() {
        
        var mceFields = $(".mce_fields")
            .not('.empty-form .mce_fields')
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
            setTimeout(function(){mce_init()}, 200)
        });

    }
    
    $(document).ready(function() {
        mce_init();
    });
});