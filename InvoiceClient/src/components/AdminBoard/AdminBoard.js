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
            uploadFieldName: 'XmlDaneaFiles',

            //update ui durint import
            import_report: {},
            file_import_danea: "",
            txt_search_customer: "",
            txt_search_invoice: "",
            active_template: "importazione_danea",
            rows_invoices: [],
            columns_invoices: [
                { label: 'Numero Fattura', field: 'number'},
                { label: 'Data Fattura', field: 'date', type: 'date', inputFormat: 'YYYY-MM-DD', outputFormat: 'DD/MM/YYYY'},
                { label: 'Codice Fiscale/Partita IVA', field: 'codfis'},
                //{ label: 'Partita Iva', field: 'pariva'},
                { label: 'Azione'}
            ],
            rows_customers: [],
            columns_customers: [
                { label: 'Name', field: 'CustomerName'},
                { label: 'Codice Fiscale/Partita IVA', field: 'CustomerFiscalCode'},                
                { label: 'Username', field: 'CustomerUsername' },
                { label: 'Password', field: 'CustomerPassword' },
                { label: 'Email', field: 'CustomerEmail'},
                { label: 'Mobile', field: 'CustomerCellPhone'},
                { label: 'Fisso', field: 'CustomerTel'},
                { label: 'Azione'}
            ]
        }
    },
    methods: {
        getFullNumberInvoice(row) {
            return row.number+" "+row.numbering;
        },
        getVatCode(row) {
            if(row.CustomerFiscalCode && row.CustomerVatCode) return row.CustomerFiscalCode+" <br> " +row.CustomerVatCode;
            else if(row.CustomerVatCode) return row.CustomerVatCode;
            else if(row.CustomerFiscalCode) return row.CustomerFiscalCode;            
            else return "estremi fiscali non inseriti";
        },
        formatDate: function(stringDate) {
            var dateFormatted="";
            var d=new Date(stringDate);
            var dateFormatted = d.getDate()  + "/" + (d.getMonth()+1) + "/" + d.getFullYear();
            return dateFormatted;
        },
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
        send_credential(data){
            axios.post(config.server_http + "/sendCredential", { user: session.user, customerData: data })
            .then(function (response) {
                
            });
        },
        print_invoice(data) {
            axios.post(config.server_http + "/printInvoice", { username: session.user, invoice: data })
                .then(function (response) {
                    var pdf_url = response.data.filePdfUrl;
                    window.open(pdf_url, "_self");
                });
        },
        search_customer(event) {

        },
        search_invoice(event) {

        },
        import_from_danea(event) {
            console.log("importing danea xml file");
        },
        load_customers_table(event) {
            var component = this;
            var obj_search = {}; //{ CustomerVatCode: "*" }
            axios.post(config.server_http + "/customerFind", obj_search)
                .then(function (response) {
                    if (response.data.status === "success") {
                        component.rows_customers = JSON.parse(response.data.customers);
                        //console.log(component.rows_customers);
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
                        //console.log(component.rows_invoices);
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
        filesChange: function (fieldName, fileList) {
            var this_obj = this;
            const formData = new FormData();
            if (!fileList.length) return;
            // append the files to FormData
            Array
                .from(Array(fileList.length).keys())
                .map(x => {
                    formData.append(fieldName, fileList[x], fileList[x].name);
                });
            this.currentStatus = STATUS_SAVING;
            axios.post(config.server_http + "/importFromDaneaInvoices", formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                .then(
                function (res) {
                    this_obj.currentStatus = STATUS_SUCCESS;
                    console.log(res);
                    this_obj.import_report = res.data;
                });
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