import { App } from './app.js';
import { baseURL, baseSubURLfullNames, baseSubURLRates, currencyData, CurrencyFetch } from './currencyfetch.js';
import { BarChart } from './barchart.js';
import { Modal } from './modal.js';
import { Configuration } from './configuration.js';
import { ConfigurationBaseSection } from './configurationBase.js';
import { ConfigurationComparisonSection } from './configurationComparisons.js';



// //https://stackoverflow.com/questions/62456451/handling-dependencies-in-es6-module-intended-for-node-and-browser
window.App = App;

// merge contents of Configuration, ConfigBaseSection, ConfigComparisonSection into one object; 
// by separating the 3 files we have increased readability; not necessary to nest the latter 2 in the first object though that may be logical as no functional or readability benefits from that
window.Configuration = Object.assign(Configuration, ConfigurationBaseSection, ConfigurationComparisonSection);
window.Modal = Modal;
window.BarChart = BarChart;
window.currencyData = currencyData;
window.baseURL = baseURL;
window.CurrencyFetch = CurrencyFetch;
window.baseSubURLfullNames = baseSubURLfullNames;
window.baseSubURLRates = baseSubURLRates;


CurrencyFetch.APIData(baseURL);