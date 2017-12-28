var config  = require("./config.js");

var express = require('express');
var multer  = require('multer');
var bodyParser = require('body-parser');
var orm = require('orm');
var cors = require('cors')
var custlib = require('./CustomerRestService');
var invlib = require('./InvoiceRestService');

var app = express();
var Invoice={};
var Customer={};

//enable cross origin
app.use(cors());
//covert body to JSON
app.use(bodyParser.json());
//parsing request object data during post
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies.
app.use(bodyParser.json({limit: '20mb'}));
//static contents folders
app.use(express.static('cache'));
app.use(config.server.cachefolder, express.static('cache'));

var upload = multer({ dest: './uploads/' })

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
            CustomerEmail: String,
            CustomerCellPhone: String,
            CustomerTel: String,
            CustomerSite: String,
            CustomerDateCreation:   Date,
            CustomerUsername: String,
            CustomerPassword: String,
            CustomerRole: String  //administrator, customer
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


app.post('/customerLogin',  function(req, res) {custlib.customerLogin(req, res, Customer)});
app.post('/customerLogout', function(req, res) {custlib.customerLogout(req, res, Customer)});
app.post('/customerStore',  function(req, res) {custlib.customerStore(req, res, Customer)});
app.post('/customerDelete', function(req, res) {custlib.customerDelete(req, res, Customer)});
app.post('/customerFind', function(req, res) {custlib.customerFind(req, res, Customer)});


app.post('/importFromDaneaInvoices', upload.array("XmlDaneaFiles" ,20), function(req, res) {invlib.uploadInvoicesFromDaneaXml(req, res, Invoice, Customer)});
app.post('/getInvoices', function(req, res) {invlib.getInvoices(req, res, Invoice)});
app.post('/printInvoice', function(req, res) {invlib.printInvoice(req, res, Invoice)});
app.post('/invoiceFind', function(req, res) {invlib.invoiceFind(req, res, Invoice)});
app.post('/invoiceDelete', function(req, res) {invlib.invoiceDelete(req, res, Invoice)});
