import random
from django import forms
from django.conf import settings
from django.db import models
from django.forms.widgets import Textarea
from django.utils.http import urlencode
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

    def render(self, *args, **kwargs):
        help_text = random.choice(help_list)
        return mark_safe(
            "<div class='mcefield-wrapper'>{}<div class='mcefield-tip'>{}</div></div>".format(
                super(MCEWidget, self).render(*args, **kwargs),
                help_text,
            )
        )

    def _media(self):
        
        if getattr(settings, 'MCEFIELD_MCEVERSION', False) == '4.x':
            mce_url = '//tinymce.cachefly.net/4.2/tinymce.min.js'
            mce_config_url = 'js/mce_global.4.x.js'
        else:
            mce_url = 'js/tiny_mce/tiny_mce.js'
            mce_config_url = 'js/mce_global.js'
            
        js_list = [
            mce_url,
            'js/mce_site.js'
        ]
        
        if self.config_js_file:
            js_list.append(self.config_js_file)
            
        if self.conf:
            conf_string = urlencode(self.conf)
            js_list.append('{}?{}'.format(mce_config_url, conf_string))
        else:
            js_list.append(mce_config_url)
            
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


if 'south' in settings.INSTALLED_APPS:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], ["^mcefield\.custom_fields\.MCEField"])
