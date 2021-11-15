// baseSubURLfullNames and baseSubURLRates are defined in CurrencyFetch methods and are subURl path and query which will be appended to baseURL accordingly
let baseSubURLfullNames;
let baseSubURLRates;
// currencyData = container for the base currency, any selected currencies to convert to, rate data for available currencies,
// full currency name for all available currencies (as fullNames), e.g. United States dollar vs USD 
const currencyData = {
    convertFrom: 'USD',
    convertTo: ['EUR', 'GBP', 'CNY', 'BGN', 'AED'],
    rates: {},
    fullNames: {},
}

// source for all exchange rates
let baseURL = 'https://openexchangerates.org/api/'




// all method definitions have been organized inside of objects which provide a sensible context for their usage
// use CurrencyFetch object to organize methods for fetching and storing text descriptions 
// of currency codes, fetching and storing rates of currencies, and the APIData method
// which calls both of these and then calls App.render() function
const CurrencyFetch = {
    APP_ID: `8453c33b4a3743769490d2c4fabcf120`,
    // append to baseURL to access json object providing full names of each currency per currency code
    baseSubURLfullNames: 'currencies.json',
    // formulate subURL to get currency rates vs base currency, call baseSubURLRates as a method due to that currencyData.convertFrom (the user's selected base currency may change throughout app usage
    baseSubURLRates: (app_id) => `latest.json?app_id=${app_id}&base='${currencyData.convertFrom}'`,
    // get and store the full descriptive name of each currency, with key == the ISO 3166 international standard currency code
    fullNames(url) {
        let fullNamesURL = url + this.baseSubURLfullNames;
        return fetch(fullNamesURL).then(response => response.json())
            .then(data => {
                let currencyCode;
                let fullName;
                for ([currencyCode, fullName] of Object.entries(data)) {
                    currencyData.fullNames[currencyCode] = fullName;
                }
            });
    },
    // get and store the latest rate of each currency in relation to the base currency (convertFrom)
    rates(url) {
        let ratesURL = url + this.baseSubURLRates(this.APP_ID);
        return fetch(ratesURL).then((response) => response.json())
            .then(data => {
                for (let currency of Object.keys(data.rates)) {
                    currencyData.rates[currency] = data.rates[currency];
                }
            })
    },
    APIData(url) {
        this.fullNames(url).then(() => {
            this.rates(url).then(() => {
                // call render when fullNames() and rates() are completed
                App.render();
            });
        });
    }
}




export { baseURL, baseSubURLfullNames, baseSubURLRates, currencyData, CurrencyFetch };