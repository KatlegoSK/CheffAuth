'use strict';
const Utils = require('./utilities.js');
var cheerio = require('cheerio');
var Promise = require("bluebird");
var tough = require('tough-cookie');
var rp = require('request-promise');

/* ----------------------------------------------------------------------------------- */
function index(request, reply) {
	Utils.getMarkDownHTML(__dirname.replace('/lib','') + '/README.md', function(err, data){
		reply.view('swagger.html', {
			title: 'API',
			markdown: data
		});
	});
}

function reduced(request, reply) {
	Utils.getMarkDownHTML(__dirname.replace('/lib','') + '/README.md', function(err, data){
		reply.view('reduced.html', {
			title: 'Reduced',
			markdown: data
		});
	});
}
 
function hostinfo(request, reply) {

    var connection = request.connection;
    var data = {
       'request.headers.host': request.headers.host,
       'x-forwarded-host': request.headers['x-forwarded-host'],
       'disguised-host': request.headers['disguised-host']
    }
    data['connection.info'] = connection.info.host;
    if (connection.info.port) {
        data['connection.info'] += ':' + connection.info.port;
    }
    reply(JSON.stringify(data)).type('application/json; charset=utf-8');
}



function searchVATVendor(request, reply) {
    var searchThreshold = 20;
    var searchInput = request.payload.searchVATVendor;
  
    fetchStateAndCookieInformation().then((stateAndCookieInformation) => {
        var vatSearchPayload = {
            __EVENTVALIDATION: stateAndCookieInformation.eventValidation,
            __VIEWSTATE: stateAndCookieInformation.viewState,
            __VIEWSTATEENCRYPTED: stateAndCookieInformation.viewStateEncrypted,
            __VIEWSTATEGENERATOR: stateAndCookieInformation.viewStateGenerator,
            btnSearch: "Search"
        };
        let sarsCookie = new tough.Cookie({
            key: "COOKIE",
            value: stateAndCookieInformation.cookie
        });

        /*Assign user input to the search request [START]*/
        vatSearchPayload["txtVatNumber"] = request.payload.VATNumber;
        vatSearchPayload["txtDescription"] = request.payload.VATTradingName;
        /*Assign user input to the search request [END]*/

        /*Set the SARS cookie to the request mechanism (rp) [START]*/
        var cookiejar = rp.jar();
        cookiejar.setCookie(sarsCookie, 'https://secure.sarsefiling.co.za');
        /*Set the SARS cookie to the request mechanism (rp) [END]*/

        /*Prepare the rp request options [START]*/
        var args = {
            method: 'POST',
            form: vatSearchPayload,
            url: "https://secure.sarsefiling.co.za/VATVendorSearch/application/VendorSearch.aspx",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            jar: cookiejar
        };
        /*Prepare the rp request options [END]*/

        rp(args)
            .then(function (responseData) {
                if (responseData.indexOf("No records found") == -1) {
                    var $ = cheerio.load(responseData);
                    var designatedTable = $('table#dbResults');
                    if (designatedTable.length == 1) {
                        var designatedRows = designatedTable[0].children;
                        var dataRows = [];
                        for (var i = 0; i < designatedRows.length; i++) {
                            if (designatedRows[i].children != undefined) {
                                dataRows = designatedRows[i].children;
                            }
                        }
                        var actualRowsCount = dataRows.length - 3;
                        if (actualRowsCount < searchThreshold) {
                            searchThreshold = actualRowsCount;
                        }
                        var vatVendorCollection = [];
                        for (var i = 1; i <= searchThreshold; i++) {
                            vatVendorCollection.push({
                                VATTradingName: dataRows[i].children[1].children[0].data.replace("\n", ""),
                                VATRegistrationNumber: dataRows[i].children[2].children[0].data.replace("\n", ""),
                                Office: dataRows[i].children[3].children[0].data.replace("\n", "")
                            });
                        }
                        reply(vatVendorCollection);

                    }
                    else {
                        reply({
                            error: "There are 0 VAT Vendors that match your search criteria."
                        });
                    }
                }
                else {
                    reply({
                        error: "There are 0 VAT Vendors that match your search criteria."
                    });
                }
            })
            .catch(function (e) {
                reply({
                    error: String(e)
                });
            });
    }); 

};

function fetchStateAndCookieInformation() {
    var stateAndCookieInformation = {
        cookie: "",
        eventValidation: "",
        viewState: "",
        viewStateEncrypted: "",
        viewStateGenerator: ""
    };
    return new Promise((resolve, reject) => {
        var args = {
            method: 'GET',
            url: "https://secure.sarsefiling.co.za/VATVendorSearch/application/VendorSearch.aspx",
            resolveWithFullResponse: true
        };
        rp(args)
            .then(function (response) {
                var $ = cheerio.load(response.body);
                stateAndCookieInformation.eventValidation = $("#__EVENTVALIDATION").val();
                stateAndCookieInformation.viewState = $("#__VIEWSTATE").val();
                stateAndCookieInformation.viewStateEncrypted = $("#__VIEWSTATEENCRYPTED").val();
                stateAndCookieInformation.viewStateGenerator = $("#__VIEWSTATEGENERATOR").val();
                var responseCookies = response.headers["set-cookie"];
                if (responseCookies != undefined && responseCookies.constructor === Array && responseCookies.length > 0) {
                    for (var i = 0; i < responseCookies.length; i++) {
                        if (responseCookies[i].indexOf("COOKIE=") >= 0) {
                            var cookieContentsSplit = responseCookies[i].split(";")[0].split("=");
                            if (cookieContentsSplit.length == 2) {
                                stateAndCookieInformation.cookie = cookieContentsSplit[1];
                            }
                            break;
                        }
                    }
                }
                resolve(stateAndCookieInformation);
            });
    });
};

function searchEnterprise(request, reply) {
    var searchThreshold = 20;
    fetchStateAndCookieInformationCIPC('ByName').then((stateAndCookieInformation) => {

        var vatSearchPayload = {
            ctl00$cntMain$ScriptManager1: "ctl00$cntMain$Updatepanel1|ctl00$cntMain$btnSearch",
            __VIEWSTATE: stateAndCookieInformation.viewState,
            __EVENTVALIDATION: stateAndCookieInformation.eventValidation,
            __VIEWSTATEGENERATOR: stateAndCookieInformation.viewStateGenerator,
            ctl00$cntMain$txtName: request.payload.VATNumber,
            "ctl00$cntMain$btnSearch.x": "48",
            "ctl00$cntMain$btnSearch.y": "25"
        };

        /*Prepare the rp request options [START]*/
        var args = {
            method: 'POST',
            form: vatSearchPayload,
            url: "https://eservices.cipc.co.za/NameSearch.aspx",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        /*Prepare the rp request options [END]*/
        rp(args)
            .then(function (responseData) {
                if (responseData.indexOf("We did not find any enterprises") == -1) {
                    var $ = cheerio.load(responseData);
                    var designatedTable = $('table#ctl00_cntMain_gdvNames');
                    if (designatedTable.length == 1) {
                        var designatedRows = designatedTable[0].children;
                        var dataRows = [];
                        for (var i = 0; i < designatedRows.length; i++) {
                            if (designatedRows[i].children != undefined) {
                                dataRows = designatedRows[i].children;
                            }
                        }
                        var actualRowsCount = dataRows.length - 2;
                        if (actualRowsCount < searchThreshold) {
                            searchThreshold = actualRowsCount;
                        }
						var enterpriseDetails = {};
                        for (var i = 1; i <= searchThreshold; i++) {
							var currentStatus = dataRows[i].children[3].children[0].data;
							if(enterpriseDetails[currentStatus] == undefined){
											enterpriseDetails[currentStatus] = [];
							}
                            enterpriseDetails[currentStatus].push({
                                EnterpriseName: dataRows[i].children[1].children[0].data,
                                EnterpriseNumber: dataRows[i].children[2].children[0].data,
                            });
                        }
                        reply(enterpriseDetails);


                    }
                    else {
                        reply({
                            error: "There are 0 Enterprises that match your search criteria."
                        });
                    }
                }
                else {
                    reply({
                        error: "There are 0 Enterprises that match your search criteria."
                    });
                }
            })
            .catch(function (e) {
                reply({
                    error: String(e)
                });
            });
    });

};

 
function searchEnterpriseByNumber(request, reply) {
    var searchThreshold = 20;
    fetchStateAndCookieInformationCIPC("ByNumber").then((stateAndCookieInformation) => {

        var vatSearchPayload = {
            ctl00$cntMain$ScriptManager1: "ctl00$cntMain$Updatepanel1|ctl00$cntMain$btnValidate",
            __VIEWSTATE: stateAndCookieInformation.viewState,
            __EVENTVALIDATION: stateAndCookieInformation.eventValidation,
            __VIEWSTATEGENERATOR: stateAndCookieInformation.viewStateGenerator,
            ctl00$cntMain$txtEntNoYear: "1998",
            ctl00$cntMain$txtEntNoMid: "006558",
            ctl00$cntMain$txtEntNoType: "10",
            "ctl00$cntMain$btnValidate.x": "48",
            "ctl00$cntMain$btnValidate.y": "25"
        };

        /*Prepare the rp request options [START]*/
        var args = {
            method: 'POST',
            form: vatSearchPayload,
            url: "https://eservices.cipc.co.za/EntEnquiry.aspx",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        /*Prepare the rp request options [END]*/

        rp(args)
            .then(function (responseData) {
                if (responseData.indexOf("We did not find any enterprises") == -1) {
                    var $ = cheerio.load(responseData);
                    var designatedDiv = $('div#ctl00_cntMain_pnlEntDetails table');
                    if (designatedDiv.length == 2) {
                        var enterpriseInformation = {
                            PhysicalAddress: "",
                            PostalAddress: "",
                            RegisteredDirectors: []
                        };

                        var dataRows = designatedDiv[0].children[1].children;
                        for (var i = 2; i < dataRows.length; i += 2) {
                            var propertyName = dataRows[i].children[1].children[0].data.trim().replace(" ", "");
                            if (propertyName != "") {
                                var propertyValue = dataRows[i].children[3].children[1].children[0].data;
                                if (propertyValue == undefined) {
                                    propertyValue = dataRows[i].children[3].children[1].children[0].children[0].data;
                                }
                                enterpriseInformation[propertyName] = propertyValue;
                            }
                        }

                        /*Extract Physical Address [START]*/
                        var physicalAddressControl = $("#ctl00_cntMain_lblPhysAddress");
                        if (physicalAddressControl.length == 1 && physicalAddressControl[0].children != undefined) {
                            var physicalAddressFields = physicalAddressControl[0].children;
                            for (var i = 0; i < physicalAddressFields.length; i++) {
                                if (physicalAddressFields[i] != undefined && physicalAddressFields[i].data != undefined) {
                                    var fieldInfo = physicalAddressFields[i].data.trim() + ", ";
                                    enterpriseInformation.PhysicalAddress += fieldInfo;
                                }
                            }
                            enterpriseInformation.PhysicalAddress = enterpriseInformation.PhysicalAddress.substr(0, enterpriseInformation.PhysicalAddress.length - 2);
                        }
                        /*Extract Physical Address [END]*/

                        /*Extract Postal Address [START]*/
                        var postalAddressControl = $("#ctl00_cntMain_lblPostalAddress");
                        if (postalAddressControl.length == 1 && postalAddressControl[0].children != undefined) {
                            var postalAddressFields = postalAddressControl[0].children;
                            for (var i = 0; i < postalAddressFields.length; i++) {
                                if (postalAddressFields[i] != undefined && postalAddressFields[i].data != undefined) {
                                    var fieldInfo = postalAddressFields[i].data.trim() + ", ";
                                    enterpriseInformation.PostalAddress += fieldInfo;
                                }
                            }
                            enterpriseInformation.PostalAddress = enterpriseInformation.PostalAddress.substr(0, enterpriseInformation.PostalAddress.length - 2);
                        }
                        /*Extract Postal Address [END]*/

                        /*Extract Director's Information [START]*/
                        var directorDataTable = $('table#ctl00_cntMain_gdvDirectorDetails');
                        if (directorDataTable.length == 1) {
                            var directorDataRows = directorDataTable[0].children;
                            dataRows = [];
                            for (var i = 0; i < directorDataRows.length; i++) {
                                if (directorDataRows[i].children != undefined) {
                                    dataRows = directorDataRows[i].children;
                                }
                            }
                            var actualRowsCount = dataRows.length - 2;
                            if (actualRowsCount < searchThreshold) {
                                searchThreshold = actualRowsCount;
                            }
                            for (var i = 1; i <= searchThreshold; i++) {
                                enterpriseInformation.RegisteredDirectors.push({
                                    IDPassportNumber: dataRows[i].children[1].children[0].data.trim(),
                                    Name: dataRows[i].children[2].children[0].data.trim(),
                                    Surname: dataRows[i].children[3].children[0].data.trim(),
                                    Type: dataRows[i].children[4].children[0].data.trim(),
                                    Status: dataRows[i].children[5].children[0].data.trim()
                                });
                            }
                        }
                        /*Extract Director's Information [END]*/

                        reply(enterpriseInformation);

                    }
                    else {
                        reply({
                            error: "There are 0 Enterprises that match your serach criteria."
                        });
                    }
                }
                else {
                    reply({
                        error: "There are 0 Enterprises that match your serach criteria."
                    });
                }
            })
            .catch(function (e) {
                reply({
                    error: String(e)
                });
            });
    });
};

function fetchStateAndCookieInformationCIPC(searchType) {
    var stateAndCookieInformation = {
        eventValidation: "",
        viewState: "",
        viewStateGenerator: ""
    };
    return new Promise((resolve, reject) => {
        var cipcURL = "";
        switch (searchType) {
            case "ByName":
                cipcURL = "https://eservices.cipc.co.za/NameSearch.aspx";
                break;
            case "ByNumber":
                cipcURL = "https://eservices.cipc.co.za/EntEnquiry.aspx";
                break;
            case "ByPerson":
                cipcURL = "https://eservices.cipc.co.za/Disclosures_person.aspx";
                break;
        }

        var args = {
            method: 'GET',
            url: cipcURL,
            resolveWithFullResponse: true
        };
        rp(args)
            .then(function (response) {
                var $ = cheerio.load(response.body);
                stateAndCookieInformation.eventValidation = $("#__EVENTVALIDATION").val();
                stateAndCookieInformation.viewState = $("#__VIEWSTATE").val();
                stateAndCookieInformation.viewStateGenerator = $("#__VIEWSTATEGENERATOR").val();
                resolve(stateAndCookieInformation);
            });
    });
};




exports.searchEnterpriseByNumber = searchEnterpriseByNumber;
exports.searchEnterprise = searchEnterprise;

exports.searchVATVendor = searchVATVendor;
exports.index = index;
exports.reduced = reduced;
exports.hostinfo = hostinfo;





