tinymce.PluginManager.add('ixxy_image', function(editor) {
	
	function isEditableImage(img) {
        
        // Selecting the figure created to wrap a caption should always work
        if (editor.dom.is(img, 'figure')) {
            return true;
        }
        
		var selectorMatched = editor.dom.is(img, 'img:not([data-mce-object],[data-mce-placeholder])');

		return selectorMatched && (isLocalImage(img) || isCorsImage(img) || editor.settings.imagetools_proxy);
	}
	
	function isLocalImage(img) {
		var url = img.src;
		return url.indexOf('data:') === 0 || url.indexOf('blob:') === 0 || new tinymce.util.URI(url).host === editor.documentBaseURI.host;
	}
	
	function isCorsImage(img) {
		return tinymce.util.Tools.inArray(editor.settings.imagetools_cors_hosts, new tinymce.util.URI(img.src).host) !== -1;
	}
	
	function addToolbars() {
		//var selectedNode = editor.selection.getNode(), name = '';
		var toolbarItems = 'editimage';
		editor.addContextToolbar(
			isEditableImage,
			toolbarItems
		);
		
	}

	function addButtons() {
		
		//editor.addButton('flip', {
		//	title: 'Listbox',
		//	type: 'listbox',
		//	icon: false,
		//	text: 'My listbox',
		//	onclick: flip('h'),
		//	values: [
		//		{ text: 'Menu item 1', value: '&nbsp;<strong>Some bold text!</strong>', disabledStateSelector: isSelected }, // TODO isSelected
		//		{ text: 'Menu item 2', value: '&nbsp;<em>Some italic text!</em>' },
		//		{ text: 'Menu item 3', value: '&nbsp;Some plain text ...' }
		//	],
		//	onselect: function (e) {
		//		editor.insertContent(this.value());
		//	},
		//	onPostRender: function () {
		//		// Select the second item by default
		//		this.value('&nbsp;<em>Some italic text!</em>');
		//	}
		//});

		//editor.addButton('flip', {
		//	title: 'Textbox',
		//	type: 'textbox',
		//	icon: 'emoticon',
		//	text: 'My listbox',
		//	tooltip: 'Some helpful text'
		//});
		
		//editor.addButton('flip', {
		//	title: 'Buttongroup',
		//	type: 'buttongroup',
		//	icon: 'emoticon',
		//	text: 'My buttongroup',
		//	tooltip: 'Some helpful text',
		//	items: [
		//		{text: 'Button A'},
		//		{text: 'Button B'}
		//	]
		//});
		
		//editor.addButton('flip', {
		//	title: 'Combobox',
		//	type: 'combobox',
		//	icon: 'emoticons',
		//	text: 'Combobox',
		//	tooltip: 'Some helpful text',
		//	values: [
		//		{icon: 'options', text: 'Option 1'},
		//		{icon: 'hr', text: 'Option 2'}
		//	]
		//});
		
		//editor.addButton('flip', {
		//	text: 'My label',
		//	type: 'label'
		//});
		
		editor.addButton('editimage', {
			title: 'Image properties',
			onclick: showIxxyImageDialog
		});

	}

	function showIxxyImageDialog() {
    
        var win, data = {}, dom = editor.dom, imgElm, figureElm;
    
    
        function onSubmitForm() {
            
            var figureElm, oldImg;
    
            function waitLoad(imgElm) {
                
                function selectImage() {
                    
                    imgElm.onload = imgElm.onerror = null;
    
                    if (editor.selection) {
                        editor.selection.select(imgElm);
                        editor.nodeChanged();
                    }
                }
    
                imgElm.onload = function() {
                    
                    dom.setAttribs(imgElm, {
                        width: imgElm.clientWidth,
                        height: imgElm.clientHeight
                    });
    
                    selectImage();
                };
    
                imgElm.onerror = selectImage;
            }
    
            updateStyle();
            
            data = tinymce.extend(data, win.toJSON());
    
            if (!data.alt) {
                data.alt = '';
            }
    
            if (!data.title) {
                data.title = '';
            }
    
            if (!data.style) {
                data.style = null;
            }
    
            // Setup new data excluding style properties
            /*eslint dot-notation: 0*/
            data = {
                src: data.src,
                alt: data.alt,
                title: data.title,
                style: data.style,
                caption: data.caption,
                "class": data["class"]
            };
    
            editor.undoManager.transact(function() {
                
                if (!data.src) {
                    if (imgElm) {
                        dom.remove(imgElm);
                        editor.focus();
                        editor.nodeChanged();
                    }
    
                    return;
                }
    
                if (data.title === "") {
                    data.title = null;
                }
    
                if (!imgElm) {
                    data.id = '__mcenew';
                    editor.focus();
                    editor.selection.setContent(dom.createHTML('img', data));
                    imgElm = dom.get('__mcenew');
                    dom.setAttrib(imgElm, 'id', null);
                } else {
                    dom.setAttribs(imgElm, data);
                }
    
                editor.editorUpload.uploadImagesAuto();
    
                if (data.caption === false) {
                    if (dom.is(imgElm.parentNode, 'figure.imageCaption')) {
                        figureElm = imgElm.parentNode;
                        dom.insertAfter(imgElm, figureElm);
                        dom.remove(figureElm);
                    }
                }
    
                function isTextBlock(node) {
                    return editor.schema.getTextBlockElements()[node.nodeName];
                }
    
                if (data.caption === true) {
                    if (!dom.is(imgElm.parentNode, 'figure.imageCaption')) {
                        oldImg = imgElm;
                        imgElm = imgElm.cloneNode(true);
                        figureElm = dom.create('figure');
                        figureElm.appendChild(imgElm);
                        figureElm.appendChild(dom.create('figcaption', {contentEditable: true}, 'Caption'));
                        figureElm.contentEditable = false;
    
                        var textBlock = dom.getParent(oldImg, isTextBlock);
                        if (textBlock) {
                            dom.split(textBlock, oldImg, figureElm);
                        } else {
                            dom.replace(figureElm, oldImg);
                        }
    
                        editor.selection.select(figureElm);
                    }
                    // imgElm.parentNode should always be a caption as the above conditional creates it if it isn't
                    $(imgElm.parentNode).addClass("imageCaption " + data["class"]);

                    return;
                }
    
                waitLoad(imgElm);
            });
        }
    
        function removePixelSuffix(value) {
            if (value) {
                value = value.replace(/px$/, '');
            }
    
            return value;
        }
    
        function srcChange(e) {
            var srcURL, prependURL, absoluteURLPattern, meta = e.meta || {};
    
            tinymce.each(meta, function(value, key) {
                win.find('#' + key).value(value);
            });
    
            if (!meta.width && !meta.height) {
                srcURL = editor.convertURL(this.value(), 'src');
    
                // Pattern test the src url and make sure we haven't already prepended the url
                prependURL = editor.settings.image_prepend_url;
                absoluteURLPattern = new RegExp('^(?:[a-z]+:)?//', 'i');
                if (prependURL && !absoluteURLPattern.test(srcURL) && srcURL.substring(0, prependURL.length) !== prependURL) {
                    srcURL = prependURL + srcURL;
                }
    
                this.value(srcURL);
    
            }
        }
    
        function buildListItems(inputList, itemCallback, startItems) {
            function appendItems(values, output) {
                output = output || [];
    
                tinymce.each(values, function(item) {
                    var menuItem = {text: item.text || item.title};
    
                    if (item.menu) {
                        menuItem.menu = appendItems(item.menu);
                    } else {
                        menuItem.value = item.value;
                        itemCallback(menuItem);
                    }
    
                    output.push(menuItem);
                });
    
                return output;
            }
    
            return appendItems(inputList, startItems || []);
        }
            
        imgElm = editor.selection.getNode();
        figureElm = dom.getParent(imgElm, 'figure.imageCaption');
        if (figureElm) {
            imgElm = dom.select('img', figureElm)[0];
        }
    
        if (imgElm && (imgElm.nodeName != 'IMG' || imgElm.getAttribute('data-mce-object') || imgElm.getAttribute('data-mce-placeholder'))) {
            imgElm = null;
        }
    
        if (imgElm) {
            width = dom.getAttrib(imgElm, 'width');
            height = dom.getAttrib(imgElm, 'height');
    
            data = {
                src: dom.getAttrib(imgElm, 'src'),
                alt: dom.getAttrib(imgElm, 'alt'),
                title: dom.getAttrib(imgElm, 'title'),
                "class": dom.getAttrib(imgElm, 'class'),
                width: width,
                height: height,
                caption: !!figureElm
            };
        }
        
        if (editor.settings.image_class_list) {
            classListCtrl = {
                name: 'class',
                type: 'listbox',
                label: 'Class',
                values: buildListItems(
                    editor.settings.image_class_list,
                    function(item) {
                        if (item.value) {
                            item.textStyle = function() {
                                return editor.formatter.getCssText({inline: 'img', classes: [item.value]});
                            };
                        }
                    }
                )
            };
        }
    
        var generalFormItems = [];
        generalFormItems.push({name: 'alt', type: 'textbox', label: 'Image description'});
        generalFormItems.push({name: 'title', type: 'textbox', label: 'Image Title'});
        generalFormItems.push(classListCtrl);
        generalFormItems.push({name: 'caption', type: 'checkbox', label: 'Caption'});
    
        function mergeMargins(css) {
            if (css.margin) {
    
                var splitMargin = css.margin.split(" ");
    
                switch (splitMargin.length) {
                    case 1: //margin: toprightbottomleft;
                        css['margin-top'] = css['margin-top'] || splitMargin[0];
                        css['margin-right'] = css['margin-right'] || splitMargin[0];
                        css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
                        css['margin-left'] = css['margin-left'] || splitMargin[0];
                        break;
                    case 2: //margin: topbottom rightleft;
                        css['margin-top'] = css['margin-top'] || splitMargin[0];
                        css['margin-right'] = css['margin-right'] || splitMargin[1];
                        css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
                        css['margin-left'] = css['margin-left'] || splitMargin[1];
                        break;
                    case 3: //margin: top rightleft bottom;
                        css['margin-top'] = css['margin-top'] || splitMargin[0];
                        css['margin-right'] = css['margin-right'] || splitMargin[1];
                        css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
                        css['margin-left'] = css['margin-left'] || splitMargin[1];
                        break;
                    case 4: //margin: top right bottom left;
                        css['margin-top'] = css['margin-top'] || splitMargin[0];
                        css['margin-right'] = css['margin-right'] || splitMargin[1];
                        css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
                        css['margin-left'] = css['margin-left'] || splitMargin[3];
                }
                delete css.margin;
            }
            return css;
        }
    
        function updateStyle() {
            function addPixelSuffix(value) {
                if (value.length > 0 && /^[0-9]+$/.test(value)) {
                    value += 'px';
                }
    
                return value;
            }
    
            if (!editor.settings.image_advtab) {
                return;
            }
    
            var data = win.toJSON(),
                css = dom.parseStyle(data.style);
    
            css = mergeMargins(css);
    
            win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
        }
    
        // Simple default dialog
        win = editor.windowManager.open({
            title: 'Image settings',
            data: data,
            body: generalFormItems,
            onSubmit: onSubmitForm
        });
        
    }
    
	//function showCatDialog() {
	//	
	//	var selectedNode = editor.selection.getNode(), name = '';
	//	var isEditableImage = selectedNode.tagName == 'IMG';
    //
	//	if (isEditableImage) {
	//		name = selectedNode.title || selectedNode.id || '';
	//	}
    //
	//	editor.windowManager.open({
	//		title: 'Ixxy Image',
	//		body: {type: 'textbox', name: 'name', size: 40, label: 'Name', value: name},
	//		onsubmit: function(e) {
	//			var id = e.data.name;
    //
	//			if (isEditableImage) {
	//				selectedNode.id = id;
	//				selectedNode.title = id;
	//				selectedNode.src = 'http://thecatapi.com/api/images/get?format=src&type=gif';
	//			} else {
	//				editor.selection.collapse(true);
	//				editor.execCommand('mceInsertContent', false, editor.dom.createHTML('img', {
	//					title: id,
	//					id: id,
	//					src: 'http://thecatapi.com/api/images/get?format=src&type=gif'
	//				}));
	//			}
	//		}
	//	});
	//}

	editor.on('preInit', function() {
		
		function hasImageClass(node) {
			var className = node.attr('class');
			return className && /\bimageCaption\b/.test(className);
		}
	
		function toggleContentEditableState(state) {
			return function(nodes) {
				var i = nodes.length, node;
	
				function toggleContentEditable(node) {
					node.attr('contenteditable', state ? 'true' : null);
				}
	
				while (i--) {
					node = nodes[i];
	
					if (hasImageClass(node)) {
						node.attr('contenteditable', state ? 'false' : null);
						tinymce.each(node.getAll('figcaption'), toggleContentEditable);
					}
				}
			};
		}
	
		editor.parser.addNodeFilter('figure', toggleContentEditableState(true));
		
		editor.serializer.addNodeFilter('figure', toggleContentEditableState(false));
		
	});

	editor.addCommand('mceIxxyImage', showIxxyImageDialog);
	
	//editor.addButton('ixxy_image', {
	//	icon: 'image',
	//	tooltip: 'Image properties',
	//	onclick: showIxxyImageDialog,
     //   disabledStateSelector: '*:not(img)' // TODO figure this out
	//	//stateSelector: 'img:not([data-mce-object],[data-mce-placeholder]),figure.imageCaption'
	//});
	//
	//editor.addMenuItem('ixxy_image', {
	//	icon: 'image',
	//	text: 'Ixxy Image',
	//	onclick: showIxxyImageDialog,
	//	context: 'insert',
	//	prependToContext: true
	//});
	
	addButtons();
	addToolbars();
	
});


// save                 
// newdocument          
// fullpage             
// alignleft            
// aligncenter          
// alignright           
// alignjustify         
// alignnone            
// cut                  
// paste                
// searchreplace        
// bullist              
// numlist              
// indent               
// outdent              
// blockquote           
// undo                 
// redo                 
// link                 
// unlink               
// anchor               
// image                
// media                
// help                 
// code                 
// insertdatetime       
// preview              
// forecolor            
// backcolor            
// table                
// hr                   
// removeformat         
// subscript            
// superscript          
// charmap              
// emoticons            
// print                
// fullscreen           
// spellchecker         
// nonbreaking          
// template             
// pagebreak            
// restoredraft         
// untitled             
// bold                 
// italic               
// underline            
// strikethrough        
// visualchars          
// visualblocks         
// ltr                  
// rtl                  
// copy                 
// resize               
// browse               
// pastetext            
// rotateleft           
// rotateright          
// crop                 
// editimage            
// options              
// flipv                
// fliph                
// zoomin               
// zoomout              
// sun                  
// moon                 
// arrowleft            
// arrowright           
// drop                 
// contrast             
// sharpen              
// palette              
// resize2              
// orientation          
// invert               
// gamma                
// remove               
// tablerowprops        
// tablecellprops       
// table2               
// tablemergecells      
// tableinsertcolbefore 
// tableinsertcolafter  
// tableinsertrowbefore 
// tableinsertrowafter  
// tablesplitcells      
// tabledelete          
// tableleftheader      
// tabletopheader       
// tabledeleterow       
// tabledeletecol       
// codesample           
