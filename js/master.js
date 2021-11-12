import { App } from './app.js';
import { baseURL, baseSubURLfullNames, baseSubURLRates, currencyData, CurrencyFetch } from './currencyfetch.js';
import { BarChart } from './barchart.js';
import { Modal } from './modal.js';
import { Configuration } from './configuration.js';
import { ConfigurationBaseSection } from './configurationBase.js';
import { ConfigurationComparisonSection } from './configurationComparisons.js';




// by explicitly setting all the above imports onto window object as below, it is ensured they all are seen at the window object level for web browser usage, 
// elsewise there are undefined issues when functions within one object call functions in another objects
// inspiration to use this as solution to imports not being seen as defined is taken from stackoverflow source below
// https://stackoverflow.com/questions/62456451/handling-dependencies-in-es6-module-intended-for-node-and-browser

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


// call APIData on CurrencyFetch object, passing it the baseURL also defined in CurrencyFetch.  This is app entry: sets up currency data from json taken from url, on success calls App.render
CurrencyFetch.APIData(baseURL);