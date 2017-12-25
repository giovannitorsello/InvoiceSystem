var config  = require("./config.js");
var async = require("async");
var express = require('express');
var formidable = require('formidable');
var bodyParser = require('body-parser');
var orm = require('orm');
var app = express();
var cors = require('cors')
var path = require('path');
var custlib = require('./CustomerRestService');
var invlib = require('./InvoiceRestService');

var Invoice={};
var Customer={};

//enable cross origin
app.use(cors());
//covert body to JSON
app.use(bodyParser.json());
//parsing request object data during post
app.use(bodyParser.urlencoded({extended: true}));
//static contents folders
app.use(express.static('cache'));
app.use(config.server.cachefolder, express.static('cache'));

app.use(orm.express(config.database.connectionstring, {
    define: function (db, models, next) {

        Invoice=db.define("invoice", {
            code:   String,
            name:   String,
            codfis: String,
            pariva: String,
            address:String,
            postcode: String,
            tel: String,
            mobile: String,
            email: String,
            number: String,
            numbering: String,
            date:   Date,
            data:   Object
        });


        Customer=db.define("customer", {
            CustomerName:   String,
            CustomerFiscalCode: String,
            CustomerVatCode: String,
            CustomerAddress:String,
            CustomerPostcode: String,
            CustomerAddress: String,
            CustomerEmail: String,
            CustomerCellPhone: String,
            CustomerTel: String,
            CustomerSite: String,
            CustomerDateCreation:   Date,
            CustomerUsername: String,
            CustomerPassword: String,
            CustomerAuthTokenCode: String
        });


        models.Invoice=Invoice;
        models.Customer=Customer;

        db.sync(function(err) {
            if (err) throw err;
             next();
        });
    }
}));

process.chdir(__dirname);
app.listen(config.server.port);


app.get("/", function (req, res) {
    //process.env.PWD
    file_html=path.join(__dirname,"/forms/upload_def_xml.html");
    res.sendFile(file_html);
});

app.post('/upload_file_def_xml', function(req, res) {});
app.get('/customerLogin',  function(req, res) {custlib.customerLogin(req, res, Customer)});

app.post('/customerLogin',  function(req, res) {custlib.customerLogin(req, res, Customer)});
app.post('/customerLogout', function(req, res) {custlib.customerLogout(req, res, Customer)});
app.post('/customerStore',  function(req, res) {custlib.customerStore(req, res, Customer)});
app.post('/customerDelete', function(req, res) {custlib.customerDelete(req, res, Customer)});


app.post('/getInvoices', function(req, res) {invlib.getInvoices(req, res, Invoice)});
app.post('/printInvoice', function(req, res) {invlib.printInvoice(req, res, Invoice)});
