module.exports = {
database: {
    host:     "localhost",
    database: "wifinetcom_invoices",
    user: "wifinetcom",
    password: "wifinetcom",
    protocol: "mysql",
    port:     "3306",
    query:    {"pool": false},
    connectionstring : "mysql://wifinetcom:wifinetcom@localhost:3306/wifinetcom_invoices"
},
server : {
    hostname : "127.0.0.1",
    ip : "127.0.0.1",
    port : "1111",
    cachefolder : "./cache" 
}
}