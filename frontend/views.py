from django.template import Context, loader
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

from django.views.decorators.csrf import csrf_protect

import django.contrib.auth
from django.contrib.auth.forms import AuthenticationForm

import frontend.lib.items as items

@csrf_protect
def home(request):

    if request.user.is_authenticated():
        return display_list(request)

    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)

        if form.is_valid():
            # Okay, security checks complete. Log the user in.
            django.contrib.auth.login(request, form.get_user())

            if request.session.test_cookie_worked():
                request.session.delete_test_cookie()

            return HttpResponseRedirect('/')
    else:
        form = AuthenticationForm(request)

    request.session.set_test_cookie()

    c = Context({
        'form': form,
        'loggedin': False
    })

    return render_to_response('index.html', c, context_instance=RequestContext(request))


def logout(request):

    if request.user.is_authenticated():
        django.contrib.auth.logout(request)

    return HttpResponseRedirect('/')


def display_list(request):

    items.setowner(request.user.id)

    c = Context({
        'json': items.createjson('0'),
        'loggedin': True,
        'username': request.user.username
    })

    return render_to_response('app.html', c, context_instance=RequestContext(request))


def return_json_children(request, parentid):

    items.setowner(request.user.id)

    json = items.createjson(str(parentid))

    return HttpResponse(json)


def create_item(request, parentid):

    items.setowner(request.user.id)

    item = items.item()
    item.set_data(request.POST)

    # Check text was actually entered
    if item.validate():
        item.save(parentid)

    return HttpResponseRedirect('/')


def archive_item(request, itemid):

    items.setowner(request.user.id)

    item = items.item()
    item.load(itemid)
    item.set_archived()

    return HttpResponseRedirect('/')
