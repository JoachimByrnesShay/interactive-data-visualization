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
            // console.log(v);
        }
    };
    console.log(currencyData);

} else if (baseURL == 'https://api.exchangerate.host/') {
    baseSubURLDescriptions = 'symbols'
    baseSubURLRates = (APP_ID) => `latest/?base=${currencyData.convertFrom}`;
    getDescriptions = function(data) {

        for ([k, v] of Object.entries(data.symbols)) {
            currencyData.description[k] = v.description;
        }
    };
    console.log(currencyData);

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
    CHART_CONTAINER_CLASS_NAME: 'ChartContent-container',
    CHART_CLASS_NAME: 'ChartContent-barChart',
    CLEAR_ALL_GRAPHS_CLASS_NAME: 'clearGraphs',
    makeAllBarCharts() {

        let container = document.querySelector('.' + this.MAIN_CONTENT_CLASS_NAME);
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
            console.log('hi buddy');
            let span = document.createElement('div');
            span.classList.add('indicateBase');

            chartContainer.classList.add('containerBase');
            span.textContent = 'BASE CURRENCY';
            chartContainer.appendChild(span);
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

    getSizeRatio() {
        console.log('getHeightRatio');
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
        console.log(chartSize);
        if (document.body.clientWidth > 950) {
            barChart.style.height = chartSize;
        } else barChart.style.width = chartSize;
        barChart.setAttribute('data-size', chartSize);

    },
    getMainContent(main = '.ChartContent') {
        let content = document.querySelector(main);
        return content;
    },

    clearConvertToDataValues() {
        currencyData.convertTo = []
    },
    clearCharts() {
        let main = this.getMainContent();
        this.clearConvertToDataValues();
        //AppConfiguration.makeCurrencyOptions();
        AppConfiguration.makeComparisonSection();
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
        let charts = document.querySelectorAll('.' + BarChart.CHART_CLASS_NAME);
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
    makeModal(curr) {
        let modal = document.createElement('div');
        modal.classList.add('Modal');
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
        let modal = elem.querySelector('.Modal');

        modal.classList.add('is-displayed');

        /* cleanly remove is-displayed state class from modal when animation ends */
        modal.addEventListener("animationend", () => {
            modal.classList.remove('is-displayed');
        });

        /* smoothen user experience when animation is not finished and user moves cursor back to bar too quickly (mousing back on too quickly after mousing off after click)*/
        modal.addEventListener('animationcancel', () => {
            modal.classList.remove('is-displayed');
        });

    }
}

// AppConfiguration object provides organization of methods for presenting configuration options and controlling their behavior and associted behavior of display in configuration section

const AppConfiguration = {
    changeBase() {
        let select = document.querySelector('.Config-baseSelection .base-select');
        console.log('ths is it', select.value);
        currencyData.convertFrom = select.value;
        if (currencyData.convertTo.includes(select.value)) {
            currencyData.convertTo.splice(currencyData.convertTo.indexOf(select.value), 1);
        }


        CurrencyFetch.APIData(requestURL);
    },
    // makeCurrencyOptions() {
    //     let selector = document.querySelector('.Config-baseSelection .base-select');


    //     selector.value = currencyData.convertFrom;
    //     let filterSelector = document.querySelector('.Base-filter');
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
        let selector = document.querySelector('.Config-baseSelection .base-select');


        selector.value = currencyData.convertFrom;
        let left = document.querySelector('.arrow.left');
        let right = document.querySelector('.arrow.right');
        console.log(right);
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
                selector.scrollBy(30, 0);
            }, 100);
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
                selector.scrollBy(-30, 0)
            }, 100);
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
        })
        let filterSelector = document.querySelector('.Base-filter');
        //filterSelector.addEventListener('scrollby', () => alert('hi'));
        let filtered;
        filtered = Object.keys(currencyData.rates);
        this.makeCurrencyOptionsList(filtered);
        filterSelector.addEventListener('keyup', (e) => {
            selector.innerHTML = '';
            if (filterSelector.value) {

                filtered = Object.keys(currencyData.rates).filter(function(elem) {
                    return elem.toLowerCase().startsWith(filterSelector.value.toLowerCase());
                });
            };
            if (filterSelector.value == '') {
                filtered = Object.keys(currencyData.rates);
            }

            console.log(filtered[0]);

            //filtered[0].classList.add('focus-li');
            this.makeCurrencyOptionsList(filtered);
            if (filtered[0]) {
                let options = document.querySelectorAll('.base-select li');
                let selected;
                for (option of options) {
                    if (option.textContent == filtered[0]) {
                        console.log(option);

                        option.scrollIntoView({ block: "center", inline: 'center', behavior: 'auto' });
                        break;
                    }
                }
                //let selected = options.select((elem) => elem.toLowerCase().startsWith(filtered[0].toLowerCase()));
                //console.log(selected);
            }

            if (e.keyCode == 13) AppConfiguration.changeBase();

            //console.log(filtered);
        });
        //this.makeCurrencyOptionsList(filtered);

    },

    makeCurrencyOptionsList(filtered) {
        filtered = Object.keys(currencyData.rates);
        if (filtered.length == 0) filtered = ["...", ...Object.keys(currencyData.rates)];
        // console.log(filtered);

        let selector = document.querySelector('.base-select');
        for (curr of filtered) {

            // let option = document.createElement('option');;
            let option = document.createElement('li');
            option.classList.add('base-select-li');
            // option.value = curr;
            //console.log(option);
            option.textContent = curr;
            selector.appendChild(option);
        }


    },
    makeComparisonSection() {
        let selector2 = document.querySelector('.Comparison-filter');
        let filtered;
        if (selector2.value) {
            filtered = Object.keys(currencyData.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(selector2.value.toLowerCase());
            })
        } else filtered = Object.keys(currencyData.rates);
        let selector = document.querySelector('.comparison div');
        //let filtered = Object.keys(currencyData.rates);
        console.log('filtered', 'is this', filtered);
        this.makeComparisonList(filtered);

        // selector2.value = '';


        selector2.addEventListener('keyup', function(e) {


            let form = document.querySelector('.comparison');

            // e.preventDefault();
            filtered = Object.keys(currencyData.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(selector2.value.toLowerCase());
            })
            if (selector2.value == '') {
                filtered = Object.keys(currencyData.rates);
            }

            AppConfiguration.makeComparisonList(filtered);
            // }

        });
    },
    makeComparisonList(filtered) {
        //console.log(filtered);
        let selector = document.querySelector('.comparison div');
        let ul = document.createElement('ul');
        selector.innerHTML = '';

        ul.classList.add('selectComparisons');
        if (filtered.length === 0) {
            filtered = [];
        }

        for (let curr of filtered) {
            if (curr != currencyData.convertFrom) {
                let option = document.createElement('li');
                option.innerHTML = `<span style='display:inline-block;width:3em;'>${curr}:</span>${currencyData.description[curr]}`;
                // option.value = curr; option.value = curr;

                if (currencyData.convertTo.includes(curr)) {
                    option.classList.add('comparisonOptionSelected');
                }
                option.addEventListener('click', function(e) {
                    if (currencyData.convertTo.length < 5) {
                        option.classList.toggle('comparisonOptionSelected');
                    } else if (option.classList.contains('comparisonOptionSelected')) {
                        option.classList.remove('comparisonOptionSelected');
                        // error();
                    }
                    if (option.classList.contains('comparisonOptionSelected')) {
                        currencyData.convertTo.push(curr);

                        // alert(option.textContent);
                    } else if (currencyData.convertTo.indexOf(curr) != -1) {
                        let ix = currencyData.convertTo.indexOf(curr);
                        currencyData.convertTo.splice(ix, 1);
                    }
                    //e.target.style.background = 'lightblue';

                    App.render();
                    AppConfiguration.updateShowComparisons();


                });
                ul.appendChild(option)

            }
        }
        selector.appendChild(ul);
    },
    updateShowComparisons() {
        let div1 = document.querySelector('.section-config-show-base');
        div1.textContent = currencyData.convertFrom;
        let div = document.querySelector('.section-config-show-comparisons');
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
        AppConfiguration.makeCurrencyOptions();
        AppConfiguration.makeComparisonSection();

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



}





console.log('mainjs');

CurrencyFetch.APIData(baseURL);