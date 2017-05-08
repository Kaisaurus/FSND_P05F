from flask import Flask, render_template, request, redirect, \
    url_for, flash, jsonify, make_response
from flask import session as login_session
import random
import string
import httplib2
import json
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_setup import Base, Category, Brand, Item, User
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
from os import path

# from handlers.bloghandler import BlogHandler

app = Flask(__name__)
engine = create_engine('postgresql://catalog:catalog@localhost/catalog')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()

CLIENT_ID = json.loads(
    open('/var/www/FSND_P05F/client_secret_g.json',
         'r').read())['web']['client_id']


@app.context_processor
def utility_processor():
    # utility function to check if image is valid (called in templates)
    def exists(path, placeholder):
        try:
            r = requests.head(path)
            if r.status_code == requests.codes.ok:
                return path
            else:
                return placeholder
        except Exception as e:
            return placeholder
    return dict(exists=exists)


@app.route('/')
def showHome():
    # reversed order is used so new shows first and also makes sense with new
    # dynamic content that is added by the user
    #
    # list is used so it can be iterated more than once easily
    categories = list(reversed(session.query(Category).all()))
    brands = list(reversed(session.query(Brand).all()))
    products = list(reversed(session.query(Item).all()))
    # check if user is logged in
    try:
        user = getUserInfo(getSessionUserID())
    except Exception as e:
        user = None

    # pass a state string for extra security
    state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                    for x in xrange(32))
    login_session['state'] = state

    return render_template('index.html',
                           categories=categories,
                           brands=brands,
                           products=products,
                           user=user,
                           state=state)


@app.route('/categories')
def showCategories():
    # check if user is logged in
    try:
        user = getUserInfo(getSessionUserID())
    except Exception as e:
        user = None

    categories = list(reversed(session.query(Category).all()))
    return render_template('partials/panel_category.html',
                           user=user,
                           categories=categories)


@app.route('/products')
def showProducts():
    # populate products with items of selected categories
    category_id = request.args.get('category_id').split(",")
    products = []
    if '' in category_id:
        products = list(reversed(session.query(Item).all()))
    else:
        for i in category_id:
            products.extend(session.query(Item).filter_by(category_id=i).all())

    try:
        # check if user is logged in
        try:
            user = getUserInfo(getSessionUserID())
        except Exception as e:
            user = None

        return render_template('partials/block_products.html',
                               user=user,
                               products=products)
    except Exception as e:
        return jsonify(success=0, msg=str(e))


@app.route('/new_product', methods=['POST'])
def newProduct():
    if request.method == 'POST':
        if not login_session['state']:
            return jsonify(success=0, msg='Not correctly logged in: \
            Login session state not set.')
        try:
            name = request.json['name']
            category = session.query(Category).filter_by(
                id=request.json['category']).one()
            newItem = Item(
                name=name,
                category=category,
                img_url=request.json['img_url'],
                description=request.json['description'],
                user_id=login_session['user_id'])
            session.add(newItem)
            session.commit()
            return jsonify(success=1,
                           id=newItem.id,
                           msg="Product " + name + " added!")
        except Exception as e:
            return jsonify(success=0, msg=str(e))


@app.route('/edit_product', methods=['POST'])
def editProduct():
    if request.method == 'POST':
        if not login_session['state']:
            return jsonify(success=0, msg='Login session state not set.')
        try:
            productID = request.json['id']
            product = session.query(Item).filter_by(id=productID).one()
            if product.user_id != login_session['user_id']:
                return jsonify(success=0,
                               msg='Product cannot be edited because'
                               'user id did not match.')
            productName = request.json['name']
            product.name = productName
            product.img_url = request.json['img_url']
            product.description = request.json['description']
            category = session.query(Category).filter_by(
                id=request.json['category']).one()
            product.category = category

            session.add(product)
            session.commit()
            return jsonify(success=1,
                           msg='Product ' + productName +
                           ' succesfully edited.')
        except Exception as e:
            return jsonify(success=0, msg=str(e))


@app.route('/delete_product', methods=['POST'])
def deleteProduct():
    if request.method == 'POST':
        if not login_session['state']:
            return jsonify(success=0, msg='Login session state not set.')
        try:
            productID = request.json['id']
            product = session.query(Item).filter_by(id=productID).one()
            if product.user_id != login_session['user_id']:
                return jsonify(success=0,
                               msg='Product cannot be deleted because'
                               'user id did not match.')
            session.delete(product)
            session.commit()
            return jsonify(success=1,
                           id=productID,
                           msg='Product ' + product.name + ' deleted.')
        except Exception as e:
            return jsonify(success=0, msg=str(e))


@app.route('/new_category', methods=['POST'])
def newCategory():
    if request.method == 'POST':
        if not login_session['state']:
            return jsonify(success=0, msg='Login session state not set.')
        try:
            name = request.json['name']
            newCat = Category(
                name=name,
                user_id=login_session['user_id'])
            session.add(newCat)
            session.commit()
            return jsonify(success=1,
                           id=newCat.id,
                           name=name,
                           msg="Category " + name + " added!")
        except Exception as e:
            return jsonify(success=0, msg=str(e))


@app.route('/delete_category', methods=['POST'])
def deleteCategory():
    if request.method == 'POST':
        try:
            catID = request.json['id']
            itemsWithCat = session.query(
                Item).filter_by(category_id=catID).all()
            if itemsWithCat:
                return jsonify(success=0,
                               msg='Category cannot be deleted because it'
                               'is used by a product.')
            cat = session.query(Category).filter_by(id=catID).one()
            if cat.user_id != login_session['user_id']:
                return jsonify(success=0,
                               msg='Category cannot be deleted because'
                               'user id did not match.')
            session.delete(cat)
            session.commit()
            return jsonify(success=1,
                           id=catID,
                           msg="Category " + cat.name + " deleted.")
        except Exception as e:
            return jsonify(success=0, msg=str(e))


@app.route('/edit_category', methods=['POST'])
def editCategory():
    if request.method == 'POST':
        try:
            catID = request.json['id']
            editCat = session.query(Category).filter_by(id=catID).one()
            if editCat.user_id != login_session['user_id']:
                return jsonify(success=0,
                               msg='Category cannot be edited because'
                               'user id did not match.')
            oldName = editCat.name
            newName = request.json['name']
            editCat.name = newName
            session.add(editCat)
            session.commit()
            return jsonify(success=1,
                           id=catID,
                           msg='Category ' + oldName + ' changed to ' +
                           newName + '.')
        except Exception as e:
            return jsonify(success=0, msg=str(e))


@app.route('/gconnect', methods=['POST'])
def gconnect():
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('invalid'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    code = request.data
    try:
        # Upgrade the authorization code into a credentials object
        oauth_flow = flow_from_clientsecrets(
            '/var/www/FSND_P05F/client_secret_g.json', scope='')
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)

    except FlowExchangeError:
        response = make_response(
            json.dumps('Failed to upgrade the authorization code.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Check that the access token is valid.
    access_token = credentials.access_token
    url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
           % access_token)
    h = httplib2.Http()
    result = json.loads(h.request(url, 'GET')[1])
    # If there was an error in the access token info, abort.
    if result.get('error') is not None:
        response = make_response(json.dumps(result.get('error')), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is used for the intended user.
    gplus_id = credentials.id_token['sub']
    if result['user_id'] != gplus_id:
        response = make_response(
            json.dumps("Token's user ID doesn't match given user ID."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is valid for this app.
    if result['issued_to'] != CLIENT_ID:
        response = make_response(
            json.dumps("Token's client ID does not match app's."), 401)
        print "Token's client ID does not match app's."
        response.headers['Content-Type'] = 'application/json'
        return response

    stored_credentials = login_session.get('credentials')
    stored_gplus_id = login_session.get('gplus_id')

    if stored_credentials is not None and\
            gplus_id == stored_gplus_id and\
            stored_credentials.access_token == credentials.access_token:
        response = make_response(json.dumps('Current usr is alrdy connected.'),
                                 200)
        print stored_credentials.access_token
        response.headers['Content-Type'] = 'application/json'
        return response

    # Store the access token in the session for later use.
    login_session['provider'] = 'google'
    login_session['credentials'] = credentials.access_token
    login_session['gplus_id'] = gplus_id

    # Get user info
    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)
    data = answer.json()

    login_session['username'] = data['name']
    login_session['picture'] = data['picture']
    login_session['email'] = data['email']

    user_id = getUserID(login_session['email'])
    if not user_id:
        user_id = createUser(login_session)
    login_session['user_id'] = user_id

    return jsonify(username=login_session['username'],
                   picture=login_session['picture'])


@app.route('/fbconnect', methods=['POST'])
def fbconnect():
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('invalid'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    access_token = request.data
    app_id = json.loads(open('/var/www/FSND_P05F/client_secrets_fb.json',
                             'r').read())['web']['app_id']
    app_secret = json.loads(open('/var/www/FSND_P05F/client_secrets_fb.json',
                                 'r').read())['web']['app_secret']
    url = 'https://graph.facebook.com/oauth/access_token?grant_type=fb_exch' \
        'ange_token&client_id={}&client_secret={}&fb_exchange_token={}'.format(
            app_id, app_secret, access_token)
    h = httplib2.Http()
    result = h.request(url, 'GET')[1]

    userinfo_url = "https://graph.facebook.com/v2.5/me"
    token = result.split("&")[0]

    url = 'https://graph.facebook.com/me?%s&fields=name,id' % token

    h = httplib2.Http()
    result = h.request(url, 'GET')[1]
    data = json.loads(result)
    login_session['provider'] = 'facebook'
    login_session['username'] = data['name']
    login_session['facebook_id'] = data['id']

    try:
        login_session['email'] = data['email']
    except KeyError as e:
        # No FB account available
        print 'KeyError "%s"' % str(e)
        list_name = data['name'].split(' ')
        l_name = list_name[0].lower()
        f_name = list_name[1].lower()
        login_session['email'] = l_name + '.' + f_name + '@facebook.com'

    url = 'https://graph.facebook.com/v2.5/me/picture?%s&redirect=0&height=' \
        '200&weight=200' % token
    h = httplib2.Http()
    result = h.request(url, 'GET')[1]
    data = json.loads(result)

    login_session['picture'] = data['data']['url']

    user_id = getFbUserID(login_session['facebook_id'])
    if not user_id:
        user_id = createUser(login_session)
    login_session['user_id'] = user_id

    return jsonify(username=login_session['username'],
                   picture=login_session['picture'])


@app.route('/fbdisconnect')
def fbdisconnect():
    facebook_id = login_session['facebook_id']
    url = 'https://graph.facebook.com/%s/permissions' % facebook_id
    h = httplib2.Http()
    result = h.request(url, 'DELETE')[1]


@app.route('/gdisconnect')
def gdisconnect():
    credentials = login_session.get('credentials')

    if credentials is None:
        response = make_response(
            json.dumps('Current user not connected.'), 401)
        response.headers['Content-Type'] = 'application/json'
        print response
    access_token = credentials
    url = 'https://accounts.google.com/o/oauth2/revoke?token={}'.format(
        access_token)
    h = httplib2.Http()
    result = h.request(url, 'GET')[0]
    print access_token
    if not result['status'] == '200':
        response = make_response(
            json.dumps('Failed to revoke token for given user.', 400))
        response.headers['Content-Type'] = 'application/json'
        print response


@app.route('/disconnect')
def disconnect():
    if 'provider' in login_session:
        if login_session['provider'] == 'google':
            gdisconnect()
            del login_session['credentials']
            del login_session['gplus_id']

        if login_session['provider'] == 'facebook':
            fbdisconnect()
            del login_session['facebook_id']

        if login_session['email']:
            del login_session['email']

        del login_session['username']
        del login_session['picture']
        del login_session['user_id']
        del login_session['provider']
        return jsonify(success=1,
                       msg="User successfully disconnected")
    else:
        return jsonify(success=0,
                       msg="Unable to disconnect because no \
                       user was connected.")


# API endpoint (GET request)


@app.route('/products/JSON')
def productsJSON():
    products = session.query(Item).all()
    return jsonify(products=[i.serialize for i in products])


@app.route('/products/<int:product_id>/JSON')
def singleProductJSON(product_id):
    product = session.query(Item).filter_by(id=product_id).one()
    return jsonify(product=product.serialize)


def getSessionUserID():
    try:
        user_id = login_session['user_id']
        return user_id
    except Exception as e:
        return None


def getFbUserID(fb_id):
    try:
        user = session.query(User).filter_by(fb_id=fb_id).one()
        return user.id
    except Exception as e:
        return None


def getUserID(email):
    try:
        user = session.query(User).filter_by(email=email).one()
        return user.id
    except Exception as e:
        return None


def getUserInfo(user_id):
    user = session.query(User).filter_by(id=user_id).one()
    return user


def createUser(login_session):
    try:
        fb_id = login_session['facebook_id']
    except Exception as e:
        fb_id = ""
    newUser = User(name=login_session['username'],
                   email=login_session['email'],
                   picture=login_session['picture'],
                   fb_id=fb_id)
    session.add(newUser)
    session.commit()
    user = session.query(User).filter_by(email=login_session['email']).one()
    return user.id


if __name__ == '__main__':
    app.config.update(
        TEMPLATES_AUTO_RELOAD=True,
        DEBUG=True,
        SECRET_KEY='super_secret_key')
    app.run(host='0.0.0.0', port=5000)
