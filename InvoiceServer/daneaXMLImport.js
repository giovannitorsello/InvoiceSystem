var path = require('path');
var fs = require('fs');
var async = require("async");
var xml_to_obj = require('./xml_to_obj').import
var makeAuthenticationCode = require('./utility').makeAuthenticationCode

var n_invoices_new = 0;
var n_invoices_existing = 0;
var n_errors = 0;

var n_customers_new = 0;
var n_customers_existing = 0;


module.exports = {

    file: "fatture.DefXml",
    company: {},
    documents: [],
    buffer: "",
    Invoice: {},
    Customer: {},

    import_xml_from_danea_invoices: function (req, res, InvoiceDB, CustomerDB) {
        Invoice = InvoiceDB;
        Customer = CustomerDB;
        n_invoices_new = 0; n_invoices_existing = 0; n_errors = 0;
        if (!req.files) {
            res.send({ status: "upload_error", message: "no file present" });
        }
        var files = req.files;
        files.forEach(element => {
            let file = element;

            var oldpath = path.join(__dirname, file.path);
            var newpath = path.join(__dirname, file.path) + (new Date().toTimeString()) + ".xml";

            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                xml_to_obj(newpath, function (company, documents) {
                    console.log(company);
                    if (!company) return;
                    if (documents) console.log("Found " + documents.length + " invoices");

                    //Async esecution with UI update and result
                    var callback_async = function (err) {
                        if (!err)
                            console.log("Invoice and customer stored");
                        else
                            console.log(err);
                    };                    
                    async.each(documents,
                        function (item, callback_async) {
                            return InsertUpdateDBInvoices(item,InsertUpdateDBCustomers,callback_async);
                        },
                        function (err) {
                            if (err) {
                                console.log(err);
                                res.send({ "status": "error", "data": err });
                            }
                            else
                                update_ui(res);
                        });

                }); //parse xml end                
            }); //fs.rename end                    
        });
    }
}

function InsertUpdateDBInvoices(obj, callback_customer, callback_async) {
    Invoice.find({ "code": obj.CustomerCode, "number": obj.Number, "numbering": obj.Numbering, "date": obj.Date }, function (err, invs) {
        if (err) throw err;
        if (invs.length === 0) //no result in database -> insert new invoice in database
        {
            Invoice.create({
                "code": obj.CustomerCode,
                "name": obj.CustomerName,
                "codfis": obj.CustomerFiscalCode,
                "pariva": obj.CustomerVatCode,
                "address": obj.CustomerAddress,
                "postcode": obj.CustomerPostcode,
                "tel": obj.CustomerTel,
                "mobile": obj.CustomerCellPhone,
                "email": obj.CustomerEmail,
                "number": obj.Number,
                "numbering": obj.Numbering,
                "date": obj.Date,
                "data": obj
            }, function (err) {
                if (err) {console.log(err);}
                n_invoices_new++;
                return callback_customer(obj, err, callback_async);
                //console.log("Insert invoice->" + n_invoices_new);                
            }); //create end
        }
        if (invs.length === 1) {
            //console.log("Existing invoice. (" + n_invoices_existing + ")");
            n_invoices_existing++;
            return callback_customer(obj, err, callback_async);
        }
        if (invs.length > 1) { 
            console.log("Error on import invoice. More than one "+ obj.Number+"/"+obj.Numbering+" (" + n_errors + ")"); 
            n_errors++; 
            return callback_customer(obj, err, callback_async);
        }
    }); //find end
}


function InsertUpdateDBCustomers(obj, err, callback) {
    Customer.find({ "CustomerVatCode": obj.CustomerVatCode}, function (err, customers) {
        if (err) throw err;
        if (customers.length === 0) //no result in database -> insert new invoice in database
        {
            var date_now=new Date();
            if(obj.CustomerFiscalCode) username=obj.CustomerFiscalCode;
            else if(obj.CustomerVatCode) username=obj.CustomerVatCode;
            else username=date_now.getTime();
            password=makeAuthenticationCode();
            Customer.create({
                CustomerName:   obj.CustomerName,
                CustomerFiscalCode: obj.CustomerFiscalCode,
                CustomerVatCode: obj.CustomerVatCode,
                CustomerAddress:obj.CustomerAddress,
                CustomerPostcode: obj.CustomerPostcode,                
                CustomerEmail: obj.CustomerEmail,
                CustomerCellPhone: obj.CustomerCellPhone,
                CustomerTel: obj.CustomerTel,
                CustomerSite: obj.CustomerSite,
                CustomerDateCreation: date_now,
                CustomerUsername: username,
                CustomerPassword: password,                                
            }, function (err) {
                if (err) {console.log(err);}
                n_customers_new++;
                //console.log("Insert customer->" + obj.CustomerFiscalCode+"/"+obj.CustomerVatCode+" (" + n_customers_new);                
                return callback(err);                
            }); //create end
        }
        if (customers.length === 1) {
            //console.log("Existing customer. "+ obj.CustomerFiscalCode+"/"+obj.CustomerVatCode+" (" + n_invoices_existing + ")");
            n_customers_existing++;
            return callback(err);
        }
        if (customers.length > 1) { 
            console.log("Error on import customer. More tha one: "+ obj.CustomerFiscalCode+"/"+obj.CustomerVatCode+" (" + n_errors + ")"); 
            n_errors++; 
            return callback(err);
        }
    }); //find end
}


function update_ui(res) {
    result = {
        "invoice_imported": n_invoices_new,
        "invoice_existing": n_invoices_existing,
        "customer_imported": n_customers_new,
        "customer_existing": n_customers_existing,        
        "errors": n_errors
    };
    res.send(result);
}