var utility=require("./utility.js");
module.exports = {

  customerLogin(req, res, custObjDb) {
    cust={CustomerUsername: req.body.username, CustomerPassword: req.body.password};
    custObjDb.find(cust, function (err, list){
      if(err) throw err;
      if(list.length==1)
      {
        cust=list[0];
        cust.CustomerAuthTokenCode=utility.makeAuthenticationCode();
        cust.save(cust, function(err){
          if(err) throw err;
          console.log("Update new customer, generating authentication code");
          console.log(cust);          
          res.send({status: "login_success", user: cust});
        });        
      }
      else {
        console.log("Wrong credential!!!");
        res.send({error: "not logged"});
      }

    });
  },

  customerLogout(req, res, custObjDb) {
    cust={CustomerUsername: req.body.username};
    console.log(cust);
    custObjDb.find(cust, function (err, list){
      if(err) throw err;
      if(list.length==1)
      {
        cust=list[0];
        console.log(cust);
        console.log("Logged out!!!");
        cust.CustomerAuthTokenCode=""; //Empty auth code for logout
        cust.save(cust, function(err){
          if(err) throw err;
          console.log("Update new customer, deleting authentication code");
          console.log(cust);
          res.send({status: "logout_success", user: cust});
        });   
      }
      else {
        res.send("{status: Logged out, session finished}");
      }

    });
  },

  customerStore(req, res, custObjDb) {

  },

  customerDelete(req, res, custObjDb) {

  },

  customerFind(req, res, custObjDb) {
    var obj=req.body;
    console.log("Search"); console.log(obj);
    custObjDb.find(obj, function (err, list) {
      if (err) res.send({ status: "error", err: err });
      else {
        console.log(JSON.stringify(list));
        res.send({ status: "success", customers: JSON.stringify(list) });
      }
    });
  },
}


function Find(obj, custObjDb, cb) {
  custObjDb.find(obj, function(err, customers) {
      cb(customers);
  });
}

function Remove(obj, custObjDb, cb) {
  custObjDb.find({ CustomerFiscalCode: obj.CustomerFiscalCode }).remove(function (err) {
    if(err){ console.log("Error in deleting customer"); console.log(obj);}
    // success
  });
}

function InsertUpdate(obj, custObjDb, cb)
{
    custObjDb.find(obj, function(err, customers) {
        if (err) throw err;
        if(customers.length===0) { //no result in database -> insert new customer in database
          console.log("Create new customer");
          console.log(obj);
           /* custObjDb.create(obj, function(err) {
                if (err) throw err;                
                console.log(obj);
                //cb();
            }); //create end */
        }
        if(customers.length===1) {
            custObjDb.save(obj, function(err){
              if(err) throw err;
              console.log("Update new customer");
              console.log(obj);
              //cb();
            });
        }
        if(customers.length>1) {console.log("Error duplicate customer");}
    }); //find end
}
