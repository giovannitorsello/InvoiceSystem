
var randtoken = require('rand-token');

module.exports = {

    makeAuthenticationCode(){
        var rnd=randtoken.generate(5, "0123456789");
        var d=new Date(); //now date
        var ticks = d.getTime();
        return ticks.toString()+rnd.toString();
    },
    makePinCode(){
        return randtoken.generate(5, "0123456789");        
    }

}
