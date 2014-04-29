from django.conf.urls import *

urlpatterns = patterns('mcefield.views',
    url(r'^imagelist.json$', 'imagelist', name="imagelist"),
)
