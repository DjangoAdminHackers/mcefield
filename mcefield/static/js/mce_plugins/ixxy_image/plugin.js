tinymce.PluginManager.add('caption', function(editor, url) {
    
    //editor.on('GetContent', function(e) {
    //    console.log('ExecCommand');
    //    console.log(e.content);
    //});
    //editor.on('ExecCommand', function(e) {
    //    console.log('GetContent');
    //    console.log(e.command, e.ui, e.value);
    //});
    
    editor.on('ObjectSelected', function(e) {
        console.log('ObjectSelected event', e);
    });

    //var ev = '';
    //var out = [];
    //for (ev in ed) {
    //    if (/^on/.test(ev)) { 
    //        console.log(ev);
    //    }
    //}
    
    
    //editor.addButton('caption', {
    //    text: 'Caption',
    //    icon: false,
    //    onclick: function() {
    //        editor.windowManager.open({
    //            title: 'Add caption',
    //            body: [
    //                {type: 'textbox', name: 'caption', label: 'Caption'}
    //            ],
    //            onsubmit: function(e) {
    //                var element = editor.selection.getNode();
    //                var parent = element.parentElement;
    //
    //                if(parent.className === 'image-container') {
    //                    parent.setAttribute('data-label', e.data.caption);
    //                    return;
    //                }
    //                var dom = editor.dom;
    //                var container = dom.create('div', {'class': 'image-container', 
    //                                                   'data-label': e.data.caption, 
    //                                                   'style': element.getAttribute('style')});
    //                element.setAttribute('style', '');
    //                dom.insertAfter(container, element);
    //                container.appendChild(element);
    //            }
    //        });
    //    }
    //});
});