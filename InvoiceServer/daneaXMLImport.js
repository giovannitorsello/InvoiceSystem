var formidable = require('formidable');

module.exports = {

  file: "fatture.DefXml",
  company: {},
  documents: [],
  n_invoices_new: 0, 
  n_invoices_existing: 0, 
  n_errors: 0,
  buffer: "",
  Invoice: {},

 import_xml_from_danea: function(req, res, InvoiceDB) {
  Invoice=InvoiceDB;
  n_invoices_new=0; n_invoices_existing=0; n_errors=0;
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {

      var oldpath = files.file.path;
      var newpath = path.join(__dirname,"/uploads/",files.file.name)+(new Date().toTimeString())+".xml";

      fs.rename(oldpath, newpath, function (err) {
          if (err) throw err;
          xml_to_obj(newpath, function (company, documents){
              console.log(company);
              if(!company) return;
              if(documents) console.log("Found "+documents.length+" invoices");

              //Async esecution with UI update and result
              async.each(documents,
              function(item, callback){
                  InsertUpdateDB(item,function(){console.log("done");callback();});
              },
              function (err) {
                  if(err) console.log(err);
                  update_ui(res);
              });

          }); //parse xml end

      });
  });
},

  InsertUpdateDB: function(obj, cb)
  {
      Invoice.find({"code": obj.CustomerCode, "number": obj.Number, "numbering": obj.Numbering, "date": obj.Date}, function(err, invs) {
          if (err) throw err;
          if(invs.length===0) //no result in database -> insert new invoice in database
          {

              Invoice.create({"code": obj.CustomerCode,
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
                  "data": obj}, function(err) {
                  if (err) throw err;
                  n_invoices_new++;
                  console.log("Insert invoice->"+n_invoices_new);
                  cb();
              }); //create end
          }
          if(invs.length===1)
          {
              //console.log("Existing invoice. ("+n_invoices_existing+")");
              console.log(obj);
              n_invoices_existing++;
              cb();
          }
          if(invs.length>1) {console.log("Error on import invoice. ("+n_errors+")");n_errors++;cb();}          
      }); //find end
  },
  update_ui: function(res)
  {      
      result = {"invoice_imported": n_invoices_new , 
                "invoice_existing": n_invoices_existing,
                "errors": n_errors};
      res.send(result);
      res.end();
      console.log(result);
  }
}
