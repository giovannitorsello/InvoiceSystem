var path = require('path');
var fs = require('fs');
var async = require("async");
var xml_to_obj = require('./xml_to_obj').import

var n_invoices_new = 0;
var n_invoices_existing = 0;
var n_errors = 0;

module.exports = {

    file: "fatture.DefXml",
    company: {},
    documents: [],
    buffer: "",
    Invoice: {},

    import_xml_from_danea: function (req, res, InvoiceDB, CustomerDB) {
        Invoice = InvoiceDB;
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
                    callback = function (err) {
                        if (!err)
                            console.log("Invoice stored");
                        else
                            console.log(err);
                    };
                    async.each(documents,
                        function (item, callback) {
                            return InsertUpdateDB(item, callback);
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

function InsertUpdateDB(obj, callback) {
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
                return callback(err);
                //console.log("Insert invoice->" + n_invoices_new);                
            }); //create end
        }
        if (invs.length === 1) {
            //console.log("Existing invoice. (" + n_invoices_existing + ")");
            n_invoices_existing++;
            return callback(err);
        }
        if (invs.length > 1) { 
            console.log("Error on import invoice. (" + n_errors + ")"); 
            n_errors++; 
            return callback(err);
        }
    }); //find end
}

function update_ui(res) {
    result = {
        "invoice_imported": n_invoices_new,
        "invoice_existing": n_invoices_existing,
        "errors": n_errors
    };
    res.send(result);
}