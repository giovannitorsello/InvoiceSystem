'use strict';

export default  {
    
    name: "session_object",
    user: {},
    status: "",
    time: {},

    storeSession: function()
    {
        console.log("Storing session.");
        //setCookie("session", {name: this.name, user: this.status, time: this.time}, 1);
        var sess={name: this.name, user: this.user, status: this.status, time: this.time};
        window.localStorage.setItem("session", JSON.stringify(sess));
    },
    
    reloadSession: function()
    {        
        var sess=window.localStorage.getItem("session"); // getCookie("session");
        if(sess===null | sess === "") {console.log("no session found"); return null;}
        else {
            console.log("Found a session");
            console.log(sess);            
        }
        var sess_obj=JSON.parse(sess);
        this.user=sess_obj.user;
        this.status=sess_obj.status;
        this.time=sess_obj.time;
        return this;
    },
    deleteSession: function()
    {
        this.status=""
        this.user={};
        this.time={};

        window.localStorage.removeItem("session");
    }
}

    
 
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
