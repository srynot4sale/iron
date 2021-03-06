import os, os.path

import bottle

cwd = os.path.dirname(os.path.dirname(__file__))

# Toggle mobile version for the client
def togglemobile(status):
    if status:
        bottle.response.set_cookie('mobile', '1')
    else:
        bottle.response.set_cookie('mobile', '0')


# Check to see if this is the mobile version
def ismobile():
    if bottle.request.COOKIES.get('mobile', '0') == '1':
        return True
    else:
        return False
