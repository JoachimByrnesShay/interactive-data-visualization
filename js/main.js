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





// CurrencyFetch object provides organization of methods for fetching and storing text descriptions of currency codes, fetching and storing rates of currencies,
// and the APIData method which calls both of these and then calls App.render() function
const CurrencyFetch = {
    APP_ID: `0f6288f8f4b4421ba1a18cf74a5b9dcf `,
    descriptions(url) {
        let symbolsURL = url + baseSubURLDescriptions; // for openexchangerates.org
        // for exhangerate.host let symbolsURL = url + 'symbols';
        return fetch(symbolsURL).then(response => response.json())
            .then(data => {

                //for api.exchangerate.host
                // for ([k, v] of Object.entries(data.symbols)) {
                //     currencyData.description[k] = v.description;
                // };

                getDescriptions(data);

                // nfor openexhangerates 
                // for ([code, description] of Object.entries(data)) {
                //     currencyData.description[code] = description
                // }
            })
    },
    rates(url) {
        let ratesURL = url + baseSubURLRates(this.APP_ID); // for openexchangerates.org

        // for exchangerate.host  let ratesURL = url + `
        // latest / ? base = $ { currencyData.convertFrom }
        // `
        return fetch(ratesURL).then((response) => response.json())
            .then(data => {
                for (let currency in data.rates) {
                    currencyData.rates[currency] = data.rates[currency]
                }
            });
    },
    APIData(url) {
        this.descriptions(url).then(() => {
            this.rates(url).then(() => App.render())
        });

    }
}

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
        console.log(container);
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
        //render();
    },
    resizeAll() {

        let charts = App.querySelectorAllByClass(BarChart.CHART_CLASS_NAME);

        for (barChart of charts) {
            let size = barChart.dataset.size;

            if (document.body.clientWidth <= 950) {
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
    BASE_SELECT_UL_CLASS_NAME: 'Configure-baseSelect',
    BASE_OPTION_CLASS_NAME: 'Configure-baseOption',
    BASE_SELECT_LEFT_ARROW_CLASS_NAME: 'Configure-baseScrollArrow.u-leftArrow',
    BASE_SELECT_RIGHT_ARROW_CLASS_NAME: 'Configure-baseScrollArrow.u-rightArrow',
    BASE_FILTER_CLASS_NAME: 'Configure-baseFilter',
    SELECTED_COMPARISON_CLASS_NAME: 'Configure-selectedComparison',
    SHOW_BASE_CLASS_NAME: 'Configure-showBase',
    SHOW_COMPARISONS_CLASS_NAME: 'Configure-showComparisons',
    COMPARISON_OPTION_CLASS_NAME: 'Configure-comparisonOption',
    COMPARISONS_FORM_CLASS_NAME: 'Configure-comparisonsForm',
    COMPARISONS_SELECTOR_CLASS_NAME: 'Configure-comparisonsSelect',
    COMPARISONS_FILTER_CLASS_NAME: 'Configure-comparisonsFilter',


    changeBase(val) {

        let select = App.querySelectorByClass(this.BASE_SELECT_UL_CLASS_NAME);
        currencyData.convertFrom = val; //select.value;

        if (currencyData.convertTo.includes(val)) {
            currencyData.convertTo.splice(currencyData.convertTo.indexOf(val), 1);
        }
        CurrencyFetch.APIData(baseURL);
    },
    // makeCurrencyOptions() {
    //     let selector = document.querySelector('.Config-baseSelection .base-select');


    //     selector.value = currencyData.convertFrom;
    //     let filterSelector = document.querySelector('.Config-baseFilter');
    //     let filtered;
    //     if (filterSelector.value) {
    //         filtered = (currencyData.rates).filter(function(elem) {
    //             return elem.toLowerCase().startsWith(filterSelector.value.toLowerCase());
    //         })
    //     } else filtered = currencyData.rates;
    //     for (curr in filtered) {

    //         let option = document.createElement('li');
    //         option.value = curr;
    //         option.textContent = curr;
    //         selector.appendChild(option);
    //     }
    // },
    makeCurrencyOptions() {
        console.log('make currency');
        let selector = App.querySelectorByClass(this.BASE_SELECT_UL_CLASS_NAME);


        selector.value = currencyData.convertFrom;
        let left = App.querySelectorByClass(this.BASE_SELECT_LEFT_ARROW_CLASS_NAME)
        let right = App.querySelectorByClass(this.BASE_SELECT_RIGHT_ARROW_CLASS_NAME);

        let rightMouseDown = false;
        let timerRightArrow;
        let timerLeftArrow;
        right.addEventListener('mousedown', function(e) {
            // if (e.type == 'mousedown') {
            //     selector.scrollBy(40, 0);
            // }
            // function scrollDelay() {
            //     s
            // }
            timerRightArrow = setInterval(function() {
                //selector.scrollBy(30, 0);
                selector.scrollBy(0, 25);
            }, 70);
            //scrollDelay = setTimeout()
            // rightMouseDown = true;
            // e.target.addEventListener('mouseup', function(g) {
            //     rightMouseDown = false;
            // })
            // while (rightMouseDown) {
        });

        left.addEventListener('mousedown', function(e) {
            // if (e.type == 'mousedown') {
            //     selector.scrollBy(40, 0);
            // }
            timerLeftArrow = setInterval(function() {
                //selector.scrollBy(-30, 0)
                selector.scrollBy(0, -25);
            }, 70);
            // rightMouseDown = true;
            // e.target.addEventListener('mouseup', function(g) {
            //     rightMouseDown = false;
            // })
            // while (rightMouseDown) {
        });
        right.addEventListener('mouseup', function() {
            clearInterval(timerRightArrow);
        });
        left.addEventListener('mouseup', function() {
            clearInterval(timerLeftArrow);
        });
        let filterSelector = App.querySelectorByClass(this.BASE_FILTER_CLASS_NAME);

        //filterSelector.addEventListener('scrollby', () => alert('hi'));
        let filtered;
        filtered = Object.keys(currencyData.rates);
        this.makeCurrencyOptionsList(filtered);
        filterSelector.addEventListener('keyup', (e) => {
            console.log(filterSelector.value);
            //selector.innerHTML = '';
            if (filterSelector.value == '') {
                filtered = Object.keys(currencyData.rates);
            }

            if (filterSelector.value) {

                filtered = Object.keys(currencyData.rates).filter(function(elem) {
                    return elem.toLowerCase().startsWith(filterSelector.value.toLowerCase());
                });
            };

            console.log(filtered);

            //if (e.keyCode == 13) Configuration.changeBase();

            this.makeCurrencyOptionsList(filtered);



        });
        if (filtered[0]) {

            let options = App.querySelectorAllByClass(this.BASE_OPTION_CLASS_NAME);
            let selected;

            for (let option of options) {
                if (option.dataset.curr == filtered[0]) {


                    option.scrollIntoView({ block: "center", inline: 'center', behavior: 'auto' });

                    break;
                }
            }

            //selected = options.select((elem) => elem.toLowerCase().startsWith(filtered[0].toLowerCase()));

        }


        this.makeCurrencyOptionsList(filtered);

    },


    makeCurrencyOptionsList(filtered) {
        //filtered = Object.keys(currencyData.rates);
        //if (filtered.length == 0) filtered = ["...", ...Object.keys(currencyData.rates)];

        let firstOption;
        let selector = App.querySelectorByClass(this.BASE_SELECT_UL_CLASS_NAME);
        for (let curr of filtered) {

            // let option = document.createElement('option');;
            let option = document.createElement('li');
            if (!firstOption) {
                firstOption = option;
            }

            option.classList.add(Configuration.BASE_OPTION_CLASS_NAME)
            // option.value = curr;

            option.textContent = `${curr}:${currencyData.description[curr]}`;
            option.dataset.curr = curr;
            //option.title = currencyData.description[curr];
            option.addEventListener('click', function(e) {
                Configuration.changeBase(curr);



            });

            selector.appendChild(option);


        }
        if (filtered.length) {
            firstOption.scrollIntoView({ block: "center", inline: 'center', behavior: 'auto' });
        };

    },
    makeComparisonsSection() {
        let selector2 = App.querySelectorByClass(Configuration.COMPARISONS_FILTER_CLASS_NAME);
        let filtered;
        if (selector2.value) {
            filtered = Object.keys(currencyData.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(selector2.value.toLowerCase());
            })
        } else filtered = Object.keys(currencyData.rates);
        let selector = App.querySelectorByClass(Configuration.COMPARISONS_SELECTOR_CLASS_NAME);
        //let filtered = Object.keys(currencyData.rates);

        this.makeComparisonsList(filtered);

        // selector2.value = '';


        selector2.addEventListener('keyup', function(e) {


            let form = App.querySelectorByClass(Configuration.COMPARISONS_FORM_CLASS_NAME);

            // e.preventDefault();
            filtered = Object.keys(currencyData.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(selector2.value.toLowerCase());
            })
            if (selector2.value == '') {
                filtered = Object.keys(currencyData.rates);
            }

            Configuration.makeComparisonsList(filtered);
            // }

        });
    },
    makeComparisonsList(filtered) {

        let selector = App.querySelectorByClass(Configuration.COMPARISONS_FORM_CLASS_NAME);
        // let ul = document.createElement('ul');
        //selector.innerHTML = '';
        let ul = App.querySelectorByClass(Configuration.COMPARISONS_SELECTOR_CLASS_NAME);
        //Configure - comparisonsSelect

        if (filtered.length === 0) {
            filtered = [];
        }

        for (let curr of filtered) {
            if (curr != currencyData.convertFrom) {
                let option = document.createElement('li');
                option.innerHTML = `<span style='display:inline-block;width:3em;'>${curr}:</span>${currencyData.description[curr]}`;
                // option.value = curr; option.value = curr;

                option.classList.add(Configuration.COMPARISON_OPTION_CLASS_NAME);
                if (currencyData.convertTo.includes(curr)) {

                    option.classList.add(Configuration.SELECTED_COMPARISON_CLASS_NAME);
                }
                option.addEventListener('click', function(e) {
                    if (currencyData.convertTo.length < 5) {
                        option.classList.toggle(Configuration.SELECTED_COMPARISON_CLASS_NAME);
                    } else if (option.classList.contains(Configuration.SELECTED_COMPARISON_CLASS_NAME)) {
                        option.classList.remove(Configuration.SELECTED_COMPARISON_CLASS_NAME);
                        // error();
                    }
                    if (option.classList.contains(Configuration.SELECTED_COMPARISON_CLASS_NAME)) {
                        currencyData.convertTo.push(curr);

                        // alert(option.textContent);
                    } else if (currencyData.convertTo.indexOf(curr) != -1) {
                        let ix = currencyData.convertTo.indexOf(curr);
                        currencyData.convertTo.splice(ix, 1);
                    }
                    //e.target.style.background = 'lightblue';

                    App.render();



                });
                ul.appendChild(option)

            }
        }
        Configuration.showComparisons();
        //selector.appendChild(ul);
    },
    showComparisons() {
        let div1 = App.querySelectorByClass(Configuration.SHOW_BASE_CLASS_NAME);
        div1.textContent = currencyData.convertFrom;
        let div = App.querySelectorByClass(Configuration.SHOW_COMPARISONS_CLASS_NAME);
        div.innerHTML = '';

        for (curr of currencyData.convertTo) {
            let p = document.createElement('p');
            p.textContent = curr;
            div.appendChild(p);
        }
    }

}


// main app 
class App {
    // render app
    static render() {
        Configuration.makeCurrencyOptions();
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





console.log('mainjs');

CurrencyFetch.APIData(baseURL);