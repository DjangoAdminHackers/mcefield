import os
from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.cache import never_cache
from pathlib import Path
from cms.admin_views import get_relative_media_url


_document_folder = 'documents'
_image_folder = os.path.join(_document_folder, "images")
relative_media_url = get_relative_media_url()

@never_cache
@staff_member_required
def imagelist(request):
    image_root = Path(os.path.join(settings.MEDIA_ROOT, _image_folder))

    # Create it if it doesn't exist
    try:
        image_root.makedirs()
    except:
        pass

    images = []
    extensions = ['jpg', 'jpeg', 'gif', 'png']
    extensions += [x.upper() for x in extensions]
    for ext in extensions:
        images += (x for x in image_root.glob('**/*.%s' % ext) if x.is_file())
    image_path_list = []
    for x in images:
        path_string = str(x)
        a = path_string.replace(str(image_root), '')[1:]
        b = path_string.replace(settings.MEDIA_ROOT, relative_media_url)
        image_path_list.append((a, b))
    image_path_list.sort()
    return render_to_response (
        'mcefield/imagelist.json',
            {
                'images':image_path_list,
             },
        RequestContext(request),
        )
