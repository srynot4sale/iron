from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Home page
    url(r'^$', 'frontend.views.home', name='home'),

    # Logout
    url(r'^logout$', 'frontend.views.logout'),

    # Children
    url(r'^json/(\d+)$', 'frontend.views.return_json_children'),

    # Create item
    url(r'^new/(\d+)$', 'frontend.views.create_item'),

    # Archive item
    url(r'^archive/(\d+)$', 'frontend.views.archive_item'),

    # Move item
    url(r'^move/(\d+)$', 'frontend.views.move_item'),

    # Reparent item
    url(r'^reparent/(\d+)$', 'frontend.views.reparent_item'),

    # Edit item
    url(r'^edit/(\d+)$', 'frontend.views.edit_item'),

    # Search items
    url(r'^search/(.+)$', 'frontend.views.search_items'),

    # url(r'^frontend/', include('frontend.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^ironadmin/', include(admin.site.urls)),
)
