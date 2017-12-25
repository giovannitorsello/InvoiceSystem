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