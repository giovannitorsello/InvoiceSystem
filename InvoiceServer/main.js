var config = require("./config.js");

var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var orm = require('orm');
var cors = require('cors')
var custlib = require('./CustomerRestService');
var invlib = require('./InvoiceRestService');

var app = express();
var Invoice = {};
var Customer = {};

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('Warning', error.message);
  });

//enable cross origin
app.use(cors());
//covert body to JSON
app.use(bodyParser.json());
//parsing request object data during post
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies.
app.use(bodyParser.json({ limit: '20mb' }));
//static contents folders
app.use('/static', express.static(__dirname + config.server.cachefolder));

var upload = multer({ dest: './uploads/' })

app.use(orm.express(config.database.connectionstring, {
    define: function (db, models, next) {

        Invoice = db.define("invoice", {
            code: String,
            name: String,
            codfis: String,
            pariva: String,
            address: String,
            postcode: String,
            tel: String,
            mobile: String,
            email: String,
            number: String,
            numbering: String,
            date: Date,
            data: Object
        },{
            hooks: {
                beforeCreate: function () {   
                    var obj_invoice={"code": obj.CustomerCode, "number": obj.Number, "numbering": obj.Numbering, "date": obj.Date };                     
                    Invoice.exists(obj_invoice, function (err, exists) {
                        if (exists)
                            return Promise.reject({ message: "Existing Invoice: "+obj_invoice.Number+"/"+obj.Numbering+"/"+obj.CustomerCode });
                        else
                            return Promise.resolve();
                    });
                }
            }

        });


        Customer = db.define("customer", {
            CustomerName: String,
            CustomerFiscalCode: { type: "text", unique: "codfis" },
            CustomerVatCode: { type: "text", unique: "codiva" },
            CustomerAddress: String,
            CustomerPostcode: String,
            CustomerEmail: String,
            CustomerCellPhone: String,
            CustomerTel: String,
            CustomerSite: String,
            CustomerDateCreation: Date,
            CustomerUsername: { type: "text", unique: "username" },
            CustomerPassword: String,
            CustomerAuthTokenCode: String,
            CustomerRole: String  //administrator, null for customer
        }, {
                hooks: {
                    beforeCreate: function () {                        
                        var obj_customer={ "CustomerVatCode": this.CustomerVatCode, "CustomerFiscalCode": this.CustomerFiscalCode };
                        Customer.exists(obj_customer, function (err, exists) {
                            if (exists)
                                return Promise.reject({ message: "Existing Customer: " +obj_customer.CustomerFiscalCode+"/"+obj_customer.CustomerVatCode});
                            else
                                return Promise.resolve();
                        });
                    }
                }
            });


        models.Invoice = Invoice;
        models.Customer = Customer;

        db.sync(function (err) {
            if (err) throw err;
            //create default administrators
            var cust_obj_admin_1 = { CustomerUsername: "giovanni.torsello", CustomerPassword: "essequel2018", CustomerFiscalCode: "TRSGNN73H26i549A", CustomerRole: "administrator"};
            Customer.create(cust_obj_admin_1, function (err) {
                if (!err)
                    console.log("admin created");
                else
                    console.log("admin existing");
            });

            var cust_obj_admin_2 = { CustomerUsername: "vincenzo.pomarico", CustomerPassword: "cobretti2018", CustomerFiscalCode: "PMRVNC73H26i549A",CustomerRole: "administrator"};            
            Customer.create(cust_obj_admin_2, function (err) {
                if (!err)
                    console.log("admin created");
                else
                    console.log("admin existing");
            });
            //Finish create default admin
            next();
        });


    }
}));

process.chdir(__dirname);
app.listen(config.server.port);


app.get("/", function (req, res) {
    //process.env.PWD
    file_html = path.join(__dirname, "/forms/upload_def_xml.html");
    res.sendFile(file_html);
});


app.post('/customerLogin', function (req, res) { custlib.customerLogin(req, res, Customer) });
app.post('/customerLogout', function (req, res) { custlib.customerLogout(req, res, Customer) });
app.post('/customerStore', function (req, res) { custlib.customerStore(req, res, Customer) });
app.post('/customerDelete', function (req, res) { custlib.customerDelete(req, res, Customer) });
app.post('/customerFind', function (req, res) { custlib.customerFind(req, res, Customer) });
app.post('/sendCredential', function (req, res) { custlib.sendCredential(req, res, Customer) });


app.post('/importFromDaneaInvoices', upload.array("XmlDaneaFiles", 20), function (req, res) { invlib.uploadInvoicesFromDaneaXml(req, res, Invoice, Customer) });
app.post('/getInvoices', function (req, res) { invlib.getInvoices(req, res, Invoice) });
app.post('/printInvoice', function (req, res) { invlib.printInvoice(req, res, Invoice) });
app.post('/invoiceFind', function (req, res) { invlib.invoiceFind(req, res, Invoice) });
app.post('/invoiceDelete', function (req, res) { invlib.invoiceDelete(req, res, Invoice) });
