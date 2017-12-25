
module.exports = {

  var file="fatture.DefXml";
  var company={};
  var documents=[];
  var n_invoices_new=0, n_invoices_existing=0, n_errors=0;
  var buffer ="";

function import_xml_from_danea(req, res){
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

  function InsertUpdateDB(obj, cb)
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
          makePdfInvoice(obj);
      }); //find end

  }

  function update_ui(res)
  {
      buffer = "<p>Import finished</p>";
      buffer += "<p>New invoices: " + n_invoices_new + "</p>";
      buffer += "<p>Existing invoices: " + n_invoices_existing + "</p>";
      buffer += "<p>Import errors: " + n_errors + "</p>";
      res.send(buffer);
      res.end();
      console.log(buffer);
      console.log(n_invoices_existing);

  }

  function makePdfInvoice(obj)
  {
      var invoice_items=[];
      obj.Rows.forEach(function (item){
          invoice_items.push({amount: item.Total,
                              name: item.Description,
                              quantity: item.Qty,
                              price: item.Price,
                              vatcode: item.VatCode
                          });
      });

      const document = pdfInvoice({
          company: {
              name: company.Name,
              address: company.Address,
              phone: company.Tel,
              vatcode: company.VatCode,
              email: company.Email
          },
          customer: {
              name: obj.CustomerName,
              email: obj.CustomerEmail,
              vatcode: obj.CustomerVatCode,
              codfis: obj.CustomerFiscalCode,
              tel: obj.CustomerTel,
              cellphone: obj.CustomerCellPhone
          },
          items: [invoice_items]
      });

      // That's it! Do whatever you want now.
      // Pipe it to a file for instance:

      const fs = require('fs');

      document.generate(); // triggers rendering

      filename_pdf=obj.CustomerCode+"_"+obj.Number+"_"+obj.Numbering+obj.CustomerFiscalCode+".pdf"
      document.pdfkitDoc.pipe(fs.createWriteStream(__dirname,"/uploads/"+filename_pdf));
  }

}

}
