import config from '../../config.js';
import session from '../../session.js';

import Vue from 'vue';
import VeeValidate from 'vee-validate';
import italian from 'vee-validate/dist/locale/it';
import { Validator } from 'vee-validate';
import axios from 'axios';

Validator.localize('it', italian);

export default {
  name: 'Login',
  data () {
    return {
      customer: {username: '', password: ''},
      isLogged: false,
      currentView: ""
    }
  },
  methods: {
    //Step 1 registration sending OTP on mobile
    login(event) {
      var router=this.$router;            
      axios.post(config.server_http+"/customerLogin", this.customer)
      .then(function(response){
        console.log(response);
        if(response.data.status==="login_success")
        {
          console.log(session);
          session.user=response.data.user;
          session.status=response.data.status;
          session.time=new Date();
          
          session.storeSession();
          console.log(session.user);
          
          console.log("Check if session is stored....");
          session.reloadSession();
          console.log(session.user);
          
          if(session.user.CustomerRole==="administrator")
            router.replace("/adminboard");
          else
            router.replace("/dashboard");
            //router.replace("/adminboard");            
          console.log(response);
          console.log(session);          
        }
      });
    },
    logout(event) {
      var component=this;
      axios.post(config.server_http+"/customerLogout", this.customer)
      .then(function(response){        
        if(response.data.status==="logout"){
          
          session.deleteSession();
          
          component.isLogged=false;
          console.log(session);
          router.replace("/login");
        }    
      });
    },
  }
}
