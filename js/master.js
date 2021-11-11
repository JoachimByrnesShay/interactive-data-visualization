import { App } from './app.js';
import { baseURL, baseSubURLfullNames, baseSubURLRates, currencyData, CurrencyFetch } from './currencyfetch.js';
import { BarChart } from './barchart.js';
import { Modal } from './modal.js';
import { Configuration } from './configuration.js';



// //https://stackoverflow.com/questions/62456451/handling-dependencies-in-es6-module-intended-for-node-and-browser
window.App = App;

window.Configuration = Configuration;
window.Modal = Modal;
window.BarChart = BarChart;
window.currencyData = currencyData;
window.baseURL = baseURL;
window.CurrencyFetch = CurrencyFetch;
window.baseSubURLfullNames = baseSubURLfullNames;
window.baseSubURLRates = baseSubURLRates;


CurrencyFetch.APIData(baseURL);