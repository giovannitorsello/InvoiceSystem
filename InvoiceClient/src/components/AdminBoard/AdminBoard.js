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
const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;


export default {
    name: "AdminBoard",
    data: function () {
        return {
            //upload fiels
            uploadedFiles: [],
            uploadError: null,
            currentStatus: STATUS_INITIAL,
            uploadFieldName: 'Xml Danea files',


            file_import_danea: "",
            txt_search_customer: "",
            txt_search_invoice: "",
            active_template: "importazione_danea",
            rows_invoices: [],
            columns_invoices: [
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
        search_customer(event) {

        },
        search_invoice(event) {

        },
        import_from_danea(event) {
            console.log("importing danea xml file");

            /* var component = this;
             axios.post(config.server_http + "/importFromDanea", obj_search)
                 .then(function (response) {
                     if (response.data.status === "success") {
                         component.rows_customers = JSON.parse(response.data.customers);
                         console.log(component.rows_customers);
                     }
                     if (response.data.status === "error") {
                         console.log("Error");
                         console.log(response.data.err);
                     }
                 });*/
        },
        load_customers_table(event) {
            var component = this;
            var obj_search = {}; //{ CustomerVatCode: "*" }
            axios.post(config.server_http + "/customerFind", obj_search)
                .then(function (response) {
                    if (response.data.status === "success") {
                        component.rows_customers = JSON.parse(response.data.customers);
                        console.log(component.rows_customers);
                    }
                    if (response.data.status === "error") {
                        console.log("Error");
                        console.log(response.data.err);
                    }
                });
        },
        load_invoice_table(event) {
            var component = this;
            var obj_search = {}; //{ CustomerVatCode: "*" }
            axios.post(config.server_http + "/invoiceFind", obj_search)
                .then(function (response) {
                    if (response.data.status === "success") {
                        component.rows_invoices = JSON.parse(response.data.invoices);
                        console.log(component.rows_invoices);
                    }
                    if (response.data.status === "error") {
                        console.log("Error");
                        console.log(response.data.err);
                    }
                });
        },
        reset: function () {
            // reset form to initial state
            this.currentStatus = STATUS_INITIAL;
            this.uploadedFiles = [];
            this.uploadError = null;
        },
        upload: function (formData) {            
            return axios.post(config.server_http + "/importFromDanea", formData)
                // get data
                .then(x => x.data)
                // add url field
                .then(x => x.map(img => Object.assign({},
                    img, { url: `${BASE_URL}/images/${img.id}` })));
        },
        save: function (formData) {
            // upload data to the server
            this.currentStatus = STATUS_SAVING;
            this.upload(formData);
        },
        filesChange: function (fieldName, fileList) {
            // handle file changes
            const formData = new FormData();

            if (!fileList.length) return;

            // append the files to FormData
            Array
                .from(Array(fileList.length).keys())
                .map(x => {
                    formData.append(fieldName, fileList[x], fileList[x].name);
                });

            // save it
            this.save(formData);
        }
    },
    computed: {
        customer: function () {
            return session.user;
        },
        isInitial: function () {
            return this.currentStatus === STATUS_INITIAL;
        },
        isSaving: function () {
            return this.currentStatus === STATUS_SAVING;
        },
        isSuccess: function () {
            return this.currentStatus === STATUS_SUCCESS;
        },
        isFailed: function () {
            return this.currentStatus === STATUS_FAILED;
        }
    },
    mounted: function () {
        var router = this.$router;
        //reload session if it is necessary
        if (session.reloadSession() === null) {
            session.deleteSession();
            router.replace("/login");
        }
        //populate list of customer
        this.load_customers_table(null);
        this.load_invoice_table(null);
    }
}