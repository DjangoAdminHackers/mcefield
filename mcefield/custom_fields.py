import json
import random
from django import forms
from django.conf import settings
from django.db import models
from django.forms.widgets import Textarea
from django.utils.html import escape
from django.utils.safestring import mark_safe


help_list = [
    # One tip is randomly shown each time the page is visited
    'Tip: Press shift and Return to add a single line break instead of a paragraph break',
    'Tip: pasting content from Word will preserve headings and list styles',
]


class MCEWidget(Textarea):
    
    def __init__(self, attrs=None, *args, **kwargs):
        self.config_js_file = kwargs.pop('config_js_file', '')
        default_conf = {}
        if getattr(settings, 'MCE_FIELD_WIDTH', ''):
            default_conf.update({'width': settings.MCE_FIELD_WIDTH})
        conf = kwargs.pop('conf', {})
        default_conf.update(conf)
        self.conf = default_conf
        default_attrs = {
            'class': 'mce_fields',
            'style': 'width: 500px; height: 200px',
        }
        if attrs is not None:
            attrs = attrs.copy()
            default_attrs.update(attrs)
        else:
            pass
        super(MCEWidget, self).__init__(attrs=default_attrs, *args, **kwargs)

    def render(self, name, value, attrs=None, renderer=None):
        
        help_text = random.choice(help_list)

        return mark_safe(
            '<div data-mce-conf="{}" class="mcefield-wrapper">{}'
            '    <div class="mcefield-tip">{}</div>'
            "</div>".format(
                escape(json.dumps(self.conf)),
                super(MCEWidget, self).render(name, value, attrs),
                help_text,
            )
        )

    def _media(self):
        
        if getattr(settings, 'MCEFIELD_MCEVERSION', False) == '4.x':
            mce_url = 'js/tinymce4.6/tinymce.min.js'
            mce_config_url = 'js/mce_global.4.x_v1.js'
        else:
            mce_url = 'js/tiny_mce/tiny_mce.js'
            mce_config_url = 'js/mce_global_v1.js'
            
        js_list = [
            mce_url,
            'js/mce_site.js',
            mce_config_url,
        ]
        
        if self.config_js_file:
            js_list.append(self.config_js_file)
            
        return forms.Media(js=js_list)
    
    media = property(_media)


class MCEFormField(forms.CharField):
    widget = MCEWidget

    def __init__(self, *args, **kwargs):
        config_js_file = kwargs.pop('config_js_file', '')
        conf = kwargs.pop('conf', '')
        kwargs.update({'widget':MCEWidget(config_js_file=config_js_file, conf=conf), })
        super(MCEFormField, self).__init__(*args, **kwargs)


class MCEField(models.TextField):
    def __init__(self, *args, **kwargs):
        self.config_js_file = kwargs.pop('js', '')
        self.conf = kwargs.pop('conf', '')
        models.TextField.__init__(self, *args, **kwargs)

    def formfield(self, **kwargs):
        defaults = {'form_class': MCEFormField, 'config_js_file': self.config_js_file, 'conf': self.conf}
        defaults.update(kwargs)
        return super(MCEField, self).formfield(**defaults)

