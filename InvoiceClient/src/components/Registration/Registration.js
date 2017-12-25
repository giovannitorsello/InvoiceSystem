import config from '../../config.js';
import session from '../../session.js';


var randtoken = require('rand-token');

import Vue from 'vue';
import VeeValidate from 'vee-validate';
import italian from 'vee-validate/dist/locale/it';
import { Validator } from 'vee-validate';
import axios from 'axios';

Vue.use(VeeValidate);
Vue.config.debug = true;
Validator.localize('it', italian);

export default {
  name: 'Registration',
  data () {
    return {
      customer: {name: '', email: '', phone: '', password: ''},
      password: '',
      confirmpassword: '',
      registerButton: '',
      lastotp: '',
      confirmotp: '',
      step: 1
    }
  },
  methods: {
    //Step 1 registration sending OTP on mobile
    go_otp(event) {
      this.customer.password=this.password;
      this.lastotp=randtoken.generate(6, "0123456789");
      this.step++;
    },
    go_finish(event) {
      if(this.lastotp!==this.confirmotp) this.step=1;
    }
  },
}
