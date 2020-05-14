#!/usr/bin/env python
# coding: utf-8

# In[5]:


import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')
from matplotlib import colors as plt_colors

import matplotlib.pyplot as plt


from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
app = Flask(__name__)

@app.route("/")
def home():
    return "hi"
@app.route("/index")

@app.route('/getdata', methods=['GET', 'POST'])
def login():
   message = None
   if request.method == 'POST':
        filename = request.form['mydata']
        data = pd.read_excel(filename,sheet_name=1)
        reduce_by = 2
        data = data.groupby(data.index//reduce_by,as_index=False).first()
        result = data.to_json()
        result = "return this"
        resp = make_response('{"response": '+result+'}')
        resp.headers['Content-Type'] = "application/json"
        return resp
        return render_template('login.html', message='')

if __name__ == "__main__":
    app.run(debug = True)



