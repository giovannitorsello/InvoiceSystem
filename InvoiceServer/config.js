module.exports = {
    database: {
        host: "localhost",
        database: "wifinetcom_invoices",
        user: "wifinetcom",
        password: "wifinetcom",
        protocol: "mysql",
        port: "3306",
        query: { "pool": false },
        connectionstring: "mysql://wifinetcom:wifinetcom@localhost:3306/wifinetcom_invoices"
    },
    server: {
        hostname: "127.0.0.1",
        ip: "127.0.0.1",
        port: "1111",
        cachefolder: "/cache"
    },
    mailserver: {
        host: 'smtp.wifinetcom.net',
        port: 465,
        secure: true,        
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            type: "login",
            user: "",
            pass: ""
        },
        defaultFrom: '"Wifinetcom SRL" <noreply@wifinetcom.com>'
    },    
    company: {
        name: "WIFINETCOM SRL", 
        address: "Via Agnesi 16, CAP 73052, Casarano [LE], Puglia, Italy", 
        phone: "(0039) (0)833 599327", 
        email: "contabilita@wifinetcom.net",
        site: "http://www.wifinetcom.net",
        linkservice: "http://www.wifinetcom.net/areaclienti",
      }
}
