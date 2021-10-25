//const baseURL = `https://openexchangerates.org/api/`;

// openexchangerates.org/api 

let baseURL;
let baseSubURLDescriptions;
let baseSubURLRates;
let getDescriptions;
const currencyData = {
    convertFrom: 'USD',
    convertTo: ['EUR', 'GBP', 'CNY', 'BGN', 'AED'],
    rates: {},
    description: {},
}



// this if else branch logic is for development purposes and will be removed upon deployment. 
baseURL = `https://openexchangerates.org/api/`;
//baseURL = 'https://api.exchangerate.host/';
if (baseURL == 'https://openexchangerates.org/api/') {
    baseSubURLDescriptions = 'currencies.json';
    baseSubURLRates = (APP_ID) => `latest.json?app_id=${APP_ID}&base='${currencyData.convertFrom}'`;
    getDescriptions = function(data) {


        for ([k, v] of Object.entries(data)) {
            currencyData.description[k] = v;

        }
    };


} else if (baseURL == 'https://api.exchangerate.host/') {
    baseSubURLDescriptions = 'symbols'
    baseSubURLRates = (APP_ID) => `latest/?base=${currencyData.convertFrom}`;
    getDescriptions = function(data) {

        for ([k, v] of Object.entries(data.symbols)) {
            currencyData.description[k] = v.description;
        }
    };


}

// api.exchangerate.host


const CurrencyFetch = {
    APP_ID: `8453c33b4a3743769490d2c4fabcf120`,
    baseSubURLDescriptions: 'currencies.json',
    baseSubURLRates: (app_id) => `latest.json?app_id=${app_id}&base='${currencyData.convertFrom}'`,
    descriptions(url) {

        let symbolsURL = url + this.baseSubURLDescriptions;
        return fetch(symbolsURL).then(response => response.json())
            .then(data => {
                //console.log(Object.entries(data))
                for ([k, v] of Object.entries(data)) {
                    currencyData.description[k] = v;
                }
            });
    },
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
        this.descriptions(url).then(() => {
            this.rates(url).then(() => {

                App.render();
            });
        });

    }
}

// CurrencyFetch object provides organization of methods for fetching and storing text descriptions of currency codes, fetching and storing rates of currencies,
// and the APIData method which calls both of these and then calls App.render() function
// const CurrencyFetch = {
//     APP_ID: `8453c33b4a3743769490d2c4fabcf120`,
//     descriptions(url) {
//         let symbolsURL = url + baseSubURLDescriptions; // for openexchangerates.org
//         // for exhangerate.host let symbolsURL = url + 'symbols';
//         return fetch(symbolsURL).then(response => response.json())
//             .then(data => {

//                 //for api.exchangerate.host
//                 // for ([k, v] of Object.entries(data.symbols)) {
//                 //     currencyData.description[k] = v.description;
//                 // };

//                 getDescriptions(data);

//                 // nfor openexhangerates 
//                 // for ([code, description] of Object.entries(data)) {
//                 //     currencyData.description[code] = description
//                 // }
//             })
//     },
//     rates(url) {
//         let ratesURL = url + baseSubURLRates(this.APP_ID); // for openexchangerates.org

//         // for exchangerate.host  let ratesURL = url + `
//         // latest / ? base = $ { currencyData.convertFrom }
//         // `
//         return fetch(ratesURL).then((response) => response.json())
//             .then(data => {
//                 for (let currency in data.rates) {

//                     currencyData.rates[currency] = (data.rates[currency]);
//                 }

//             });
//     },
//     APIData(url) {
//         this.descriptions(url).then(() => {
//             this.rates(url).then(() => App.render());
//         });

//     }
// }
// BarChart object provides organization of methods for creating, clearing, and resizing (responsive) barcharts, and associated utility methods
const BarChart = {
    MAIN_CONTENT_CLASS_NAME: 'ChartContent',
    CHART_CONTAINER_CLASS_NAME: 'ChartContent-barChartContainer',
    CHART_CLASS_NAME: 'ChartContent-barChart',
    CLEAR_ALL_GRAPHS_CLASS_NAME: 'ChartContent--clearCharts',
    DIV_FOR_BASE_TEXT_CLASS_NAME: 'ChartContent-indicateBase',
    CHART_CONTAINER_IS_BASE_CLASS_NAME: 'is-forBaseChart',


    makeAllBarCharts() {

        let container = App.querySelectorByClass(this.MAIN_CONTENT_CLASS_NAME);

        if (currencyData.convertTo.length) {
            for (let currency of [currencyData.convertFrom, ...currencyData.convertTo]) {
                let chartContainer = document.createElement('div');
                chartContainer.classList.add(this.CHART_CONTAINER_CLASS_NAME);
                this.visuallyIndicateChartIsBase(currency, chartContainer);

                let barChart = this.makeBarChart(currency);

                chartContainer.appendChild(barChart);
                container.appendChild(chartContainer);
            }
        }
    },
    visuallyIndicateChartIsBase(currency, chartContainer) {
        if (currency == currencyData.convertFrom) {

            let div = document.createElement('div');
            div.classList.add(this.DIV_FOR_BASE_TEXT_CLASS_NAME);

            chartContainer.classList.add(this.CHART_CONTAINER_IS_BASE_CLASS_NAME);
            div.textContent = 'BASE CURRENCY';
            chartContainer.appendChild(div);
        }

    },
    makeBarChart(currencyCode) {

        let barChart = document.createElement('div');
        barChart.classList.add(this.CHART_CLASS_NAME);

        let title = document.createElement('p');
        title.textContent = currencyCode;
        let modal = Modal.makeModal(currencyCode);
        barChart.append(title, modal);
        this.Utility.setInitialSize(barChart, currencyCode);
        barChart.onclick = () => Modal.activateModal(barChart);
        return barChart;
    }

}

BarChart.Utility = {
    MAIN_CONTENT_CLASS_NAME: 'ChartContent',
    getSizeRatio() {

        let max = 0;
        let arr = [...currencyData.convertTo, currencyData.convertFrom]
        for (let key of arr) {

            if (currencyData.rates[key] > max) max = currencyData.rates[key]
        }
        return 100 / max;
    },
    setInitialSize(barChart, currencyCode) {
        let ratio = BarChart.Utility.getSizeRatio();
        let chartSize = `${currencyData.rates[currencyCode] * ratio}%`;

        if (document.body.clientWidth > 950) {
            barChart.style.height = chartSize;
        } else barChart.style.width = chartSize;
        barChart.setAttribute('data-size', chartSize);

    },
    getMainContent(main = this.MAIN_CONTENT_CLASS_NAME) {

        let content = App.querySelectorByClass(main);
        return content;
    },

    clearConvertToDataValues() {
        currencyData.convertTo = []
    },
    clearCharts() {
        let main = this.getMainContent();
        this.clearConvertToDataValues();
        //Configuration.makeCurrencyOptions();
        Configuration.makeComparisonsSection();
        //this.CLEAR_ALL_GRAPHS_CLASS_NAME

        main.classList.add(BarChart.CLEAR_ALL_GRAPHS_CLASS_NAME);
        main.addEventListener('animationend', function(e) {
            main.classList.remove(BarChart.CLEAR_ALL_GRAPHS_CLASS_NAME);
            App.clearContents(main);
            App.render();

        });

    },
    resizeAll() {

        let charts = App.querySelectorAllByClass(BarChart.CHART_CLASS_NAME);

        for (barChart of charts) {
            let size = barChart.dataset.size;

            //if (document.body.clientWidth <= 950) {
            if (window.innerWidth <= 950) {
                barChart.style.width = size;
                barChart.style.height = '70%';


            } else {
                barChart.style.height = size;
                barChart.style.width = '7em';
            }

        }
    }
}

// Modal object provides organization of methods for creating modal elements and displaying modals and controlling animation (set and removed by classes)
const Modal = {
    MODAL_CLASS_NAME: 'Modal',
    MODAL_IS_DISPLAYED_CLASS_NAME: 'is-displayed',
    makeModal(curr) {
        let modal = document.createElement('div');
        modal.classList.add(this.MODAL_CLASS_NAME);
        let descriptionPara = document.createElement('p');
        let comparePara = document.createElement('p');
        descriptionPara.textContent = currencyData.description[curr];
        comparePara.textContent = `1${currencyData.convertFrom}==${currencyData.rates[curr]}${curr}`;
        modal.append(descriptionPara, comparePara);
        return modal;
    },

    /** show modal, call via onClick in html **/
    activateModal(elem) {
        /* select the modal within the ChartContent-barChart element (elem, passed as 'this') which has been clicked */
        // let modal = elem.querySelector('.' + this.MODAL_CLASS_NAME);
        let modal = App.querySelectorByClass(this.MODAL_CLASS_NAME, context = elem)

        modal.classList.add(this.MODAL_IS_DISPLAYED_CLASS_NAME);

        /* cleanly remove is-displayed state class from modal when animation ends */
        modal.addEventListener("animationend", () => {
            modal.classList.remove(this.MODAL_IS_DISPLAYED_CLASS_NAME);
        });

        /* smoothen user experience when animation is not finished and user moves cursor back to bar too quickly (mousing back on too quickly after mousing off after click)*/
        modal.addEventListener('animationcancel', () => {
            modal.classList.remove(this.MODAL_IS_DISPLAYED_CLASS_NAME);
        });

    }
}

// AppConfiguration object provides organization of methods for presenting configuration options and controlling their behavior and associted behavior of display in configuration section

const Configuration = {
    BASE_SELECT_BOX_CLASS_NAME: 'Configure-baseSelectBox',
    BASE_OPTION_CLASS_NAME: 'Configure-baseOption',
    // BASE_SELECT_UP_ARROW_CLASS_NAME: 'Configure-baseScrollArrow.u-upArrow',
    // BASE_SELECT_DOWN_ARROW_CLASS_NAME: 'Configure-baseScrollArrow.u-downArrow',
    BASE_FORM_CLASS_NAME: 'Configure-baseForm',
    BASE_FILTER_FIELD_CLASS_NAME: 'Configure-baseFilter',
    SELECTED_COMPARISON_CLASS_NAME: 'Configure-selectedComparison',
    SHOW_BASE_CLASS_NAME: 'Configure-showBase',
    SHOW_COMPARISONS_CLASS_NAME: 'Configure-showComparisons',
    COMPARISON_OPTION_CLASS_NAME: 'Configure-comparisonOption',
    COMPARISONS_FORM_CLASS_NAME: 'Configure-comparisonsForm',
    COMPARISONS_SELECT_BOX_CLASS_NAME: 'Configure-comparisonsSelectBox',
    COMPARISONS_FILTER_FIELD_CLASS_NAME: 'Configure-comparisonsFilterField',


    changeBase(val) {
        let select = App.querySelectorByClass(this.BASE_SELECT_BOX_CLASS_NAME);
        App.querySelectorByClass('Configure-headerBaseValue').innerHTML = val;
        currencyData.convertFrom = val; //select.value;

        if (currencyData.convertTo.includes(val)) {

            currencyData.convertTo.splice(currencyData.convertTo.indexOf(val), 1);
        }
        CurrencyFetch.APIData(baseURL);
        let thing = App.querySelectorByClass('Configure-showConfiguration');
        thing.classList.add('Configure-configurationCurrencyAnim');
        thing.addEventListener('animationend', () => {
            thing.classList.remove('Configure-configurationCurrencyAnim');
        });
        App.render();

    },
    //     let select = App.querySelectorByClass(this.BASE_SELECT_UL_CLASS_NAME);
    //     currencyData.convertFrom = val; //select.value;

    //     if (currencyData.convertTo.includes(val)) {
    //         currencyData.convertTo.splice(currencyData.convertTo.indexOf(val), 1);
    //     }
    //     CurrencyFetch.APIData(baseURL);
    //     //App.render();
    // },
    // makeScrollWithArrowListener(arrow, bool) {

    //     let selector = App.querySelectorByClass(this.BASE_SELECT_UL_CLASS_NAME);
    //     let timeArrow;
    //     arrow.addEventListener('mousedown', function(e) {
    //         let distance = 25;
    //         if (!bool) {
    //             distance *= -1;
    //         };
    //         timeArrow = setInterval(function() {
    //             selector.scrollBy(0, distance);
    //         }, 70);

    //     });
    //     arrow.addEventListener('mouseup', function(e) {
    //         clearInterval(timeArrow);
    //     })

    // },
    // makeBaseFilterListener(filter_field) {
    //     filter_field.addEventListener('keyup', (e) => {

    //         if (filter_field.value == '') {
    //             filtered = Object.keys(currencyData.rates);
    //         }
    //         filtered = Object.keys(currencyData.rates).filter(function(elem) {
    //             return elem.toLowerCase().startsWith(filter_field.value.toLowerCase());
    //         });
    //         this.makeCurrencyOptionsList(filtered);
    //     });
    // },
    // // filter_field.addEventListener('keyup', function(e) {


    // //            let form = App.querySelectorByClass(Configuration.COMPARISONS_FORM_CLASS_NAME);
    // //            filtered_result = Object.keys(currencyData.rates).filter(function(elem) {
    // //                return elem.toLowerCase().startsWith(filter_field.value.toLowerCase());
    // //            });

    // //            if (filter_field.value == '') {
    // //                filtered_result = Object.keys(currencyData.rates);
    // //            }

    // //            Configuration.makeComparisonsList(filtered_result);


    // //        });
    // makeBaseCurrencyOptions() {

    //     let selector = App.querySelectorByClass(this.BASE_SELECT_UL_CLASS_NAME);
    //     selector.value = currencyData.convertFrom;
    //     let up_arrow = App.querySelectorByClass(this.BASE_SELECT_UP_ARROW_CLASS_NAME)
    //     let down_arrow = App.querySelectorByClass(this.BASE_SELECT_DOWN_ARROW_CLASS_NAME);
    //     this.makeScrollWithArrowListener(up_arrow, false);
    //     this.makeScrollWithArrowListener(down_arrow, true);

    //     let filterSelector = App.querySelectorByClass(this.BASE_FILTER_CLASS_NAME);

    //     let filtered;

    //     filtered = Object.keys(currencyData.rates).sort();
    //     console.log(filtered);
    //     //delete filtered[currencyData.convertFrom];
    //     this.makeBaseCurrencyOptionsList(filtered);
    //     this.makeBaseFilterListener(filterSelector);
    //     // filterSelector.addEventListener('keyup', (e) => {

    //     //     if (filterSelector.value == '') {
    //     //         filtered = Object.keys(currencyData.rates);
    //     //     }

    //     //     filtered = Object.keys(currencyData.rates).filter(function(elem) {

    //     //         return elem.toLowerCase().startsWith(filterSelector.value.toLowerCase());
    //     //     });

    //     //     this.makeCurrencyOptionsList(filtered);

    //     // });
    //     if (filtered[0]) {

    //         let options = App.querySelectorAllByClass(this.BASE_OPTION_CLASS_NAME);
    //         let selected;

    //         for (let option of options) {
    //             if (option.dataset.curr == filtered[0]) {


    //                 option.scrollIntoView({ block: "center", inline: 'center', behavior: 'auto' });

    //                 break;
    //             }
    //         }
    //     }
    //     this.makeBaseCurrencyOptionsList(filtered);
    // },

    // makeBaseCurrencyOptionsList(filtered_result) {
    //     let firstOption;
    //     let selector = App.querySelectorByClass(this.BASE_SELECT_UL_CLASS_NAME);
    //     for (let curr of filtered_result) {

    //         let option = document.createElement('li');
    //         if (!firstOption) {
    //             firstOption = option;
    //         }

    //         option.classList.add(Configuration.BASE_OPTION_CLASS_NAME);

    //         option.textContent = `${curr}:${currencyData.description[curr]}`;
    //         option.dataset.curr = curr;
    //         option.addEventListener('click', function(e) {
    //             Configuration.changeBase(curr);
    //         });

    //         selector.appendChild(option);

    //     }
    //     if (filtered_result.length) {
    //         firstOption.scrollIntoView({ block: "center", inline: 'center', behavior: 'auto' });
    //     };
    // },
    // makeBaseSection() {
    //     let filter_field = App.querySelectorByClass(Configuration.BASE_FILTER_FIELD_CLASS_NAME);
    //     let filtered_result;
    //     filter_field.value = '';
    //     filtered_result = Object.keys(currencyData.rates);
    //     let select_box = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS_NAME);

    //     this.makeComparisonsList(filtered_result);

    //     filter_field.addEventListener('keyup', function(e) {


    //         let form = App.querySelectorByClass(Configuration.COMPARISONS_FORM_CLASS_NAME);
    //         filtered_result = Object.keys(currencyData.rates).filter(function(elem) {
    //             return elem.toLowerCase().startsWith(filter_field.value.toLowerCase());
    //         });

    //         if (filter_field.value == '') {
    //             filtered_result = Object.keys(currencyData.rates);
    //         }

    //         Configuration.makeComparisonsList(filtered_result);


    //     });
    // },

    makeBaseSection() {
        let filter_field = App.querySelectorByClass(Configuration.BASE_FILTER_FIELD_CLASS_NAME);
        App.querySelectorByClass('Configure-headerBaseValue').innerHTML = currencyData.convertFrom;
        App.querySelectorByClass('Configure-headerBaseValue').ariaLabel = currencyData.description[currencyData.convertFrom];
        App.querySelectorByClass('Configure-headerBaseValue').style.display = "inline-block";
        App.querySelectorByClass('Configure-headerBaseValue').classList.add('Configure-headerBaseValueAnim');

        App.querySelectorByClass('Configure-headerBaseValue').addEventListener('animationend', () => {
            App.querySelectorByClass('Configure-headerBaseValue').classList.remove('Configure-headerBaseValueAnim');
        });

        let filtered_result;
        filter_field.value = '';
        filtered_result = Object.keys(currencyData.rates);
        let select_box = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS_NAME);

        Configuration.makeBaseList(filtered_result);

        filter_field.addEventListener('keyup', function(e) {
            let form = App.querySelectorByClass(Configuration.BASE_FORM_CLASS_NAME);
            filtered_result = Object.keys(currencyData.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(filter_field.value.toLowerCase());
            });

            if (filter_field.value == '') {
                filtered_result = Object.keys(currencyData.rates);
            }

            Configuration.makeBaseList(filtered_result);

        });


    },
    makeComparisonsSection() {

        let filter_field = App.querySelectorByClass(Configuration.COMPARISONS_FILTER_FIELD_CLASS_NAME);
        let filtered_result;
        filter_field.value = '';
        filtered_result = Object.keys(currencyData.rates);
        let select_box = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS_NAME);

        this.makeComparisonsList(filtered_result);

        filter_field.addEventListener('keyup', function(e) {

            let form = App.querySelectorByClass(Configuration.COMPARISONS_FORM_CLASS_NAME);
            filtered_result = Object.keys(currencyData.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(filter_field.value.toLowerCase());
            });

            if (filter_field.value == '') {
                filtered_result = Object.keys(currencyData.rates);

            }
            Configuration.makeComparisonsList(filtered_result);




        });

    },
    makeBaseList(filtered_result) {

        let select_box = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS_NAME);
        select_box.innerHTML = '';
        if (filtered_result.length == 0) {
            filtered_result = [];
        }

        for (let currency of filtered_result) {
            if (currency != currencyData.convertFrom) {
                let option = document.createElement('li');
                option.innerHTML = `<span style='display:inline-block;width:3em;'>${currency}:</span>${currencyData.description[currency]}`;
                option.dataset['code'] = currency;
                select_box.appendChild(option);
                option.classList.add(Configuration.BASE_OPTION_CLASS_NAME);

                option.addEventListener('click', function(e) {

                    Configuration.changeBase(option.dataset['code']);
                    //     option.classList.toggle(Configuration.SELECTED_BASE_CLASS_NAME);
                    //     if (option.classList.contains(Configuration.SELECTED_BASE_CLASS_NAME)) {
                    //         option.classList.remove(Configuration.SELECTED_BASE_CLASS_NAME);

                    //     } else if (option.classList.contains(Configuration.SELECTED_COMPARISON_CLASS_NAME)) {
                    //         currencyData.convertTo.push(currency);

                    //     } else if (currencyData.convertTo.indexOf(currency) != -1) {
                    //         let ix = currencyData.convertTo.indexOf(currency);
                    //         currencyData.convertTo.splice(ix, 1);
                    //     }

                    // });
                });


            }
        }
    },
    makeComparisonsList(filtered_result) {

        let select_box = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS_NAME);
        select_box.innerHTML = '';
        if (filtered_result.length == 0) {
            filtered_result = [];
        }

        for (let currency of filtered_result) {
            if (currency != currencyData.convertFrom) {
                let option = document.createElement('li');

                option.innerHTML = `<span style='display:inline-block;width:3em;'>${currency}</span>: ${currencyData.description[currency]}`;

                option.classList.add(Configuration.COMPARISON_OPTION_CLASS_NAME);
                if (currencyData.convertTo.includes(currency)) {

                    option.classList.add(Configuration.SELECTED_COMPARISON_CLASS_NAME);
                }
                option.addEventListener('click', function(e) {
                    if (currencyData.convertTo.length == 5) {
                        App.querySelectorByClass('Header-flashContainer').classList.add('Header-flashMessage')
                    }
                    if (currencyData.convertTo.length < 5) {


                        option.classList.toggle(Configuration.SELECTED_COMPARISON_CLASS_NAME);
                    } else if (option.classList.contains(Configuration.SELECTED_COMPARISON_CLASS_NAME)) {
                        option.classList.remove(Configuration.SELECTED_COMPARISON_CLASS_NAME);

                    }
                    if (option.classList.contains(Configuration.SELECTED_COMPARISON_CLASS_NAME)) {
                        currencyData.convertTo.push(currency);

                    } else if (currencyData.convertTo.indexOf(currency) != -1) {
                        let ix = currencyData.convertTo.indexOf(currency);
                        currencyData.convertTo.splice(ix, 1);
                        App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage')

                    } else {

                    }
                    console.log(currencyData.convertTo.length);



                    App.render();
                });
                select_box.appendChild(option)

            }
        }

        Configuration.showComparisons();
    },
    showComparisons() {
        let div1 = App.querySelectorByClass(Configuration.SHOW_BASE_CLASS_NAME);
        let alreadyP;
        if (alreadyP = div1.querySelector('p')) {
            div1.removeChild(alreadyP);
        }
        let showBaseP = document.createElement('p');
        showBaseP.textContent = currencyData.convertFrom;
        showBaseP.ariaLabel = currencyData.description[currencyData.convertFrom];
        showBaseP.classList.add('Configure-baseParagraph')
        div1.appendChild(showBaseP);
        let div = App.querySelectorByClass(Configuration.SHOW_COMPARISONS_CLASS_NAME);
        div = document.querySelector('.Configure-listComparisons');



        App.querySelectorByClass('Configure-listComparisons').innerHTML = '';

        for (let currency of currencyData.convertTo) {
            let p = document.createElement('p');
            p.textContent = currency;
            p.classList.add('Configure-comparisonParagraph')
            p.ariaLabel = currencyData.description[currency];
            div.appendChild(p);
        }
    }

}


// main app 
class App {
    // render app
    static render() {

        Configuration.makeBaseSection();
        Configuration.makeComparisonsSection();

        //each call to render clears html of the barcharts area (.ChartContent)
        App.clearContents(BarChart.Utility.getMainContent());
        console.log('I am rendering');

        BarChart.makeAllBarCharts();
        //on resized window, barcharts will be resized form vertical to horizontal- conditionally
        window.onresize = BarChart.Utility.resizeAll;


    }
    static clearContents(elem) {
        // clear contents of any element passed
        elem.innerHTML = '';
    }
    static querySelectorByClass(elemClassName, context = document) {

        return context.querySelector('.' + elemClassName);
    }
    static querySelectorAllByClass(elemClassName, context = document) {
        return context.querySelectorAll('.' + elemClassName);
    }

}







CurrencyFetch.APIData(baseURL);