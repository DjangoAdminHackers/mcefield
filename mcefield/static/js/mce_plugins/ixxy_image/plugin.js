tinymce.PluginManager.add('ixxy_image', function(editor) {
	
	function isEditableImage(img) {
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
		var toolbarItems = 'flip | editimage imageoptions';
		editor.addContextToolbar(
			isEditableImage,
			toolbarItems
		);
		
	}

	function flip(axis) {
		return function() {
			console.log('flip!' + axis);
		};
	}

	function addButtons() {
		
		editor.addButton('flip', {
			title: 'Flip',
			icon: 'emoticons',
			onclick: flip('h')
		});

		editor.addButton('editimage', {
			title: 'Edit image',
			onclick: showDialog
		});

		editor.addButton('imageoptions', {
			title: 'Image options',
			icon: 'options',
			cmd: 'mceImage'
		});


	}

	function showDialog() {
		
		var selectedNode = editor.selection.getNode(), name = '';
		var isEditableImage = selectedNode.tagName == 'IMG';

		if (isEditableImage) {
			name = selectedNode.title || selectedNode.id || '';
		}

		editor.windowManager.open({
			title: 'Ixxy Image',
			body: {type: 'textbox', name: 'name', size: 40, label: 'Name', value: name},
			onsubmit: function(e) {
				var id = e.data.name;

				if (isEditableImage) {
					selectedNode.id = id;
					selectedNode.title = id;
					selectedNode.src = 'http://thecatapi.com/api/images/get?format=src&type=gif';
				} else {
					editor.selection.collapse(true);
					editor.execCommand('mceInsertContent', false, editor.dom.createHTML('img', {
						title: id,
						id: id,
						src: 'http://thecatapi.com/api/images/get?format=src&type=gif'
					}));
				}
			}
		});
	}

	editor.addCommand('mceIxxyImage', showDialog);

	editor.addButton('ixxy_image', {
		icon: 'image',
		tooltip: 'Ixxy Image',
		onclick: showDialog,
		stateSelector: 'img'
	});

	editor.addMenuItem('ixxy_image', {
		icon: 'image',
		text: 'Ixxy Image',
		context: 'insert',
		onclick: showDialog
	});
	
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
