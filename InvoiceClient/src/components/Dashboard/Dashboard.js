import config from '../../config.js';
import session from '../../session.js';

import Vue from 'vue';
import VueGoodTable from 'vue-good-table';
import VeeValidate from 'vee-validate';
import italian from 'vee-validate/dist/locale/it';
import { Validator } from 'vee-validate';
import axios from 'axios';

Vue.use(VueGoodTable);
Vue.use(VeeValidate);
Vue.config.debug = true;
Validator.localize('it', italian);


export default {
  name: 'Dashboard',
  data: function () {
    return {
      columns: [
        {
          label: 'Numero Fattura',
          field: 'numero fattura',
        },
        {
          label: 'Data Fattura',
          field: 'data fattura',
          type: 'date',
          inputFormat: 'YYYYMMDD',
          outputFormat: 'DD/MM/YYYY'
        },
        {
          label: 'Codice Fiscale/Partita Iva',
          field: 'vatcode',
        }
      ],
      rows: [],
    }
  },
  methods: {
    logout(event) {
      var router = this.$router;
      console.log(session.user.CustomerUsername);
      axios.post(config.server_http+"/customerLogout", { username: session.user.CustomerUsername })
        .then(function (response) {
          if (response.data.status === "logout_success") {
            session.deleteSession();
            router.replace("/login");
          }
        });
    },
    print_invoice(data) {
      axios.post(config.server_http+"/printInvoice", { username: session.user, invoice: data })
        .then(function (response) {
          var pdf_url = response.data.filePdfUrl;
          window.open(pdf_url, "_self");
        });
    },
    load_invoices(event) {
      session.reloadSession();
      //search invoices in databases
      var component = this;
      var router = this.$router;
      console.log("Getting invoices for:")
      console.log(session.user.CustomerUsername);
      console.log(session.user.CustomerFiscalCode);

      axios.post(config.server_http+"/getInvoices", { CustomerFiscalCode: session.user.CustomerFiscalCode, CustomerVatCode: session.user.CustomerVatCode})
        .then(function (response) {
          if (response.data.status === "success") {
            component.rows = JSON.parse(response.data.invoices);
          }
        });
    }

  },
  computed: {
    customer: function () {
      return session.user;
    }
  },
  mounted: function () {
    var router = this.$router;    
    //reload session if it is necessary
    if (session.reloadSession() === null) {
      session.deleteSession();
      router.replace("/login");
    }

    this.load_invoices(null);
  }
}
