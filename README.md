# Full Stack Nano Degree - Project: Item Catalog
---
This is a one page web app running on Python backend with the Flask frame work.

### Functionalities
This is a model of a Item catalog in which authorised users can Create Read Update and Delete catagories and products.
Authorisation works with external accounts. Google and Facebook Oauth2 authorisation has been implemented.

It is made to be able to run locally with the included local vagrant server. 
---

### Requirements for local deployment ###

* Vagrant
* VirtualBox
* Modern Web Browser running Javascript
* Internet connection


---

### Quickstart (for local app) ###

1. Clone or download this repository from https://github.com/Kaisaurus/FSND_P05F
2. Install Vagrant and VirtualBox. [Detailed instructions can be found here](https://www.udacity.com/wiki/ud088/vagrant)
3. Launch terminal in the root directory
4. Run command 
```
vagrant up
```
then
```
vagrant ssh
```
then
```
python app.py
```
6. If all setup is correct the site is reachable by going to [Dhttp://localhost:5000](http://localhost:5000)
*If the port is changed from 5000 the oauth2 functionality will probably not work*
7. login to the app using your Google or Facebook account

---
