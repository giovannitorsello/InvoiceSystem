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
    name: "AdminBoard",
    data: function () {
        return {
            file_import_danea: "",
            txt_search_customer: "",
            txt_search_invoice: "",
            active_template: "importazione_danea",
            rows_invoice: [],
            columns_invoice: [
                { label: 'Numero Fattura', field: 'numero fattura' },
                { label: 'Data Fattura', field: 'data fattura', type: 'date', inputFormat: 'YYYYMMDD', outputFormat: 'DD/MM/YYYY' },
                { label: 'Codice Fiscale/Partita Iva', field: 'vatcode', }
            ],
            rows_customers: [],
            columns_customers: [
                { label: 'Name', field: 'name' },
                { label: 'Codice Fiscale/Partita Iva', field: 'vatcode' }
            ]
        }
    },
    methods: {
        logout(event) {
            var router = this.$router;
            console.log(session.user.CustomerUsername);
            axios.post(config.server_http + "/customerLogout", { username: session.user.CustomerUsername })
                .then(function (response) {
                    if (response.data.status === "logout_success") {
                        session.deleteSession();
                        router.replace("/login");
                    }
                });
        },
        importazione_danea(event) {
            console.log("Switch to importazione Danea");
            this.active_template = "importazione_danea";
        },
        anagrafica_clienti(event) {
            console.log("Switch Anagrafica clienti");
            this.active_template = "anagrafica_clienti";
        },
        consulta_fatture(event) {
            console.log("Switch to consulta fatture");
            this.active_template = "consulta_fatture";
        },
        search_customer(event) {

        },
        search_invoice(event) {

        },
        import_from_danea(event) {
             
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
    }
}