//per site tinyMCE_config
if (typeof(site_mce_config) == 'undefined'){
    var site_mce_config = {}
}
var extra_styles = site_mce_config.extra_styles || "Grey text=grey"; // TODO make configurable
var extra_classes = site_mce_config.extra_classes || "class<grey"; // TODO make configurable
var content_width = site_mce_config.content_width || 690; // TODO this should relate to site's content width to give accurate idea of line lengths
var table_controls =  site_mce_config.table_controls || ", tablecontrols";
var extra_plugins = site_mce_config.extra_plugins || ", table";
var table_elements = site_mce_config.table_elements || ",table,tr,th,#td,thead,tbody";

function fix_banner() { //TODO this is specific to my admin CSS which has a position:fixed header
    // Bigger offset if two toolbars are visible
    if ($('.mceToolbarRow1:visible').length) {
        if ($('.mceToolbarRow2:visible').length) {
            offset = '153px';
        } else {
            offset = '123px';
        }
    } else {
        offset = '88px';
    }
    $('#content').css('margin-top', offset);
}

function cleanup_html(element_id, html, body) {
    html = html.replace(/<!--[\s\S]+?-->/gi,'');//remove Word comments like conditional comments etc
    
    content = $(html)
    content.find('a[href]').each(function(){
        // remove empty links
        // if there is nothing left after removing <br />, &nbsp; and whitespace characters then the a tag is empty
        if ($(this).html().replace(/<br>/g,'').replace(/\s+/g,'').replace(/&nbsp;/g,'')==''){
            $(this).replaceWith($(this).html());
        }
    });
    return $('<div>').append(content.clone()).html();
}

function CustomFileBrowser(field_name, url, type, win) {

    var cmsURL = "/admin/filebrowser/browse/?pop=2&dir=images";
    cmsURL = cmsURL + "&type=" + type;

    tinyMCE.activeEditor.windowManager.open({
        file: cmsURL,
        width: 820,  // Your dimensions may differ - toy around with them!
        height: 500,
        resizable: "yes",
        scrollbars: "yes",
        inline: "yes",  // This parameter only has an effect if you use the inlinepopups plugin!
        close_previous: "no"
    }, {
        window: win,
        input: field_name,
        editor_id: tinyMCE.selectedInstance.editorId
    });
    return false;
}

tinyMCE_config = {
	mode : "none",
	theme : "advanced",
    skin : "thebigreason",
    //skin_variant : "clean",
	theme_advanced_resizing : true,
	theme_advanced_resize_horizontal : false,
	theme_advanced_path : false,
	theme_advanced_statusbar_location : "bottom",
	content_css : "/static/stylesheets/mcestyles.css?" + new Date().getTime(),
    theme_advanced_styles : extra_styles,
	theme_advanced_toolbar_location : "external",
	theme_advanced_toolbar_align : "left",
	theme_advanced_buttons1 : "formatselect,styleselect,removeformat,|,bold,italic,|,bullist,numlist,blockquote,|,undo,redo,|,link,unlink,anchor,|,image,fileBrowser,|,pdw_toggle",
	theme_advanced_buttons2 : "charmap,hr,|,search,replace,|,code,visualchars,|"+table_controls,
	theme_advanced_buttons3 : "",
	theme_advanced_blockformats : "p,h2,h3",
    width : content_width+18,
	cleanup_on_startup : true,
	convert_urls : false,
    fix_list_elements : true,
    fix_nesting : true,
    fix_table_elements : true,
	gecko_spellcheck : true,
    use_native_selects: false,
	external_image_list_url : "/admin/cms/imagelist.js",
	external_link_list_url : "/admin/cms/linklist.js",
	auto_cleanup_word : true,
    //plugins : "inlinepopups, paste, searchreplace, advimagescale, visualchars, autoresize, pdw"+extra_plugins,
    plugins : "inlinepopups, paste, searchreplace, advimagescale, visualchars, autoresize, pdw"+extra_plugins,
	valid_elements : ("-h2/h1[___],-h3/h4/h5[___],p[___],ul[___],-li,-ol,blockquote,br,-em/i,-strong/b,-span[!___],-div[!___],a[!name|!href|title|target],hr,img[src|class<left?right?center?floatleft?floatright|alt|title|height|width]"+table_elements).replace(/___/g, extra_classes),
    paste_preprocess : function(pl, o) {
        o.content = o.content.replace(/<!(?:--[\s\S]*?--\s*)?>\s*/g,'');
    },
    save_callback : cleanup_html,
    // file_browser_callback: "CustomFileBrowser", //TODO
    pdw_toggle_on : 1,
    pdw_toggle_toolbars : "2",
    setup : function(ed) {
        ed.addButton('showWhitespace', {
            title : 'Show Whitespace',
            image : '/static/images/admin/show_whitespace.gif', // TODO make a proper icon
            onclick : function() {
                if (!tinyMCE.activeEditor.show_paragraphs) {
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('p, h1, h2, h3, h4, ul, li, ol'), 'background-color', '#FFFFBB');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('p, h1, h2, h3, h4, ul, ol'), 'margin-bottom', '5px');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('a'), 'background-color', '#AAF');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('a'), 'border', '1px solid blue');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('a'), 'margin', '2px');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('a'), 'padding', '2px');
                    tinyMCE.activeEditor.show_paragraphs = true;
                } else {
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('p, h1, h2, h3, h4, ul, li, ol'), 'background-color', 'transparent');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('p, h1, h2, h3, h4, ul, ol'), 'margin-bottom', '0');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('a'), 'background-color', '#FFF');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('a'), 'border', 'none');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('a'), 'margin', '0');
                    tinyMCE.activeEditor.dom.setStyle(tinyMCE.activeEditor.dom.select('a'), 'padding', '0');
                    tinyMCE.activeEditor.show_paragraphs = false;
                }
            }
        });
        ed.addButton('fileBrowser', {
            title : 'Open Filebrowser',
            image : '/static/filebrowser/img/filebrowser_icon_show.gif',
            onclick : function() {
                //window.open('/admin/filebrowser/browse/?pop=ixxy', 'Filebrowser', 'height=500,width=980,resizable=yes,scrollbars=yes');
                //window.open('/admin/filebrowser/browse/?pop=tinymce', 'Filebrowser', 'height=500,width=980,resizable=yes,scrollbars=yes');
//                if (!$('a#fancylink').length) {
//                    $('div:first').after('<a style="display: none" id="fancylink" class="iframe" href="/admin/filebrowser/browse/?pop=tinymce&dir=images"></a>');
//                }
//                $("a#fancylink")
//                        .fancybox({
//                            padding: 0,
//                            width: 820,
//                            height: 500,
//                            titleShow: false
//                        })
//                        .trigger("click");
                tinyMCE.activeEditor.windowManager.open({
                    file: "/admin/filebrowser/browse/?pop=0",
                    //andyb mce filebrowser integration: file: "/admin/filebrowser/browse/?pop=2&ixxy=1&dir=images",
                    width: 820,
                    height: 500,
                    resizable: "yes",
                    scrollbars: "yes",
                    inline: "yes",
                    close_previous: "no"
                }, {});
            }
        });

        ed.onActivate.add(function(ed) {
            fix_banner();
        });

        ed.onClick.add(function(ed) {
            fix_banner();
        });

        ed.onPreInit.add(function(ed){
            if(typeof(fontFaceCssTag) !== 'undefined') {
                $(ed.contentDocument).find('head').append(fontFaceCssTag);
            }
        });
    }
};

// Alternate config for HTML snippets
nonblocklevel_tinyMCE_config = jQuery.extend(true, {}, tinyMCE_config);
nonblocklevel_tinyMCE_config['theme_advanced_blockformats'] = "p";
nonblocklevel_tinyMCE_config['theme_advanced_buttons1'] = "styleselect,removeformat,|,bold,italic,|,undo,redo,|,link,unlink,anchor,|,fileBrowser,|,pdw_toggle";
nonblocklevel_tinyMCE_config['theme_advanced_buttons2'] = "charmap,|,search,replace,|,code,showWhitespace,|";
nonblocklevel_tinyMCE_config['forced_root_block'] = '';
nonblocklevel_tinyMCE_config['force_br_newlines'] = true;
nonblocklevel_tinyMCE_config['force_p_newlines'] = false;

//per site tinyMCE_config
if (typeof(site_mce_config) != 'undefined'){
    $.extend(tinyMCE_config, site_mce_config)
}

//Parse the per field conf parameter
//content = MCEField(blank=True, null=True, conf={'width':999})
function parseQuery ( query ) {
    var Params = new Object ();
    if ( ! query ) return Params; // return empty object
    var Pairs = query.split(/[;&]/);
    for ( var i = 0; i < Pairs.length; i++ ) {
        var KeyVal = Pairs[i].split('=');
        if ( ! KeyVal || KeyVal.length != 2 ) continue;
        var key = unescape( KeyVal[0] );
        var val = unescape( KeyVal[1] );
        val = val.replace(/\+/g, ' ');
        Params[key] = val;
    }
    return Params;
}

var scripts = document.getElementsByTagName('script');
var current_ccript = scripts[scripts.length - 1];
var query_string = current_ccript.src.replace(/^[^\?]+\??/,'');
var field_mce_conf = parseQuery(query_string);
for (attr in field_mce_conf){
    tinyMCE_config[attr] = field_mce_conf[attr]
}

document.domain = document.domain.replace('www.', '').replace('static.', '');
tinyMCE.init(tinyMCE_config);

function process_inline_mce(){
    $(".mce_fields").not('.empty-form .mce_fields').filter(':visible').each(function(i) {
        tinyMCE.execCommand("mceAddControl",true,this.id);
        $(this).removeClass('mce_fields');
    });

}

//$(document).ready(function() {
function mce_init(){
    $(".mce_fields").not('.empty-form .mce_fields').each(function(i) {
        tinyMCE.execCommand("mceAddControl",true,this.id);
        $(this).removeClass('mce_fields');
    });
    $('.add-row a').live('mouseup', function() {
        setTimeout('process_inline_mce()', 200)
    });
}
