//console.log('loaded main.js')
//const requestURL = 'https://api.exchangerate.host/';
//const requestURL = `https://v6.exchangerate-api.com/v6/170228b5e41c1bad86073eb5/latest/`;
const requestURL = `https://openexchangerates.org/api/`;
const currencies = {
    convertFrom: 'USD',
    convertTo: ['EUR', 'GBP', 'CNY', 'BGN', 'AED'],
    rates: {},
    description: {},
    symbols: {}
}

//let baseSymbols = ['EUR', 'USD', 'GBP', 'CNY', 'BGN', 'AED']

//let thing = 'https://www.localeplanet.com/api/auto/currencymap.json?name=Y';
//let thing = 'https://github.com/bengourley/currency-symbol-map/blob/master/map.js'
//let thing = 'https://gist.github.com/portapipe/a28cd7a9f8aa3409af9171480efcc090'

// CurrencyFetch object provides organization of methods for fetching and storing text descriptions of currency codes, fetching and storing rates of currencies,
// and the APIData method which calls both of these and then calls App.render() function
const CurrencyFetch = {
    descriptions(url) {
        let symbolsURL = url + 'currencies.json';
        //let symbolsURL = url + 'symbols';
        return fetch(symbolsURL).then(response => response.json())
            .then(data => {

                for ([k, v] of Object.entries(data)) {
                    currencies.description[k] = v;
                };
            })
    },

    rates(url) {
        //let ratesURL = url + `latest?base=${currencies.convertFrom}`;
        let app_id = `0f6288f8f4b4421ba1a18cf74a5b9dcf`;
        let ratesURL = `https://openexchangerates.org/api/latest.json?app_id=${app_id}&base=${currencies.convertFrom}`;

        //ratesURL = url + `?app_id=${app_id}&base=${currencies.convertFrom}`;
        return fetch(ratesURL).then((response) => response.json())
            .then(data => {
                for (let curr in data.rates) {
                    currencies.rates[curr] = data.rates[curr]
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

    getMainContent() {
        let content = document.querySelector('.ChartContent');
        return content;
    },

    clearConvertToValues() {
        currencies.convertTo = []
    },
    clearCharts() {

        let main = BarChart.getMainContent();
        BarChart.clearConvertToValues();
        //AppConfiguration.makeCurrencyOptions();
        AppConfiguration.makeComparisonSection();
        main.classList.add('clearGraphs');
        main.addEventListener('animationend', function(e) {
            main.classList.remove('clearGraphs');
            App.clearContents(main);
            App.render();
        });
        //render();
    },
    resizeAll() {
        let charts = document.querySelectorAll('.ChartContent-barChart');
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
    },
    makeCharts() {
        console.log('make charts');
        let container = document.querySelector('.ChartContent');
        if (currencies.convertTo.length) {
            for (let curr of [currencies.convertFrom, ...currencies.convertTo]) {
                let chartContainer = document.createElement('div');
                chartContainer.classList.add('ChartContent-container');
                let barChart = this.makeBarChart(curr);
                chartContainer.appendChild(barChart);
                container.appendChild(chartContainer);
            }
        }
    },
    getSizeRatio() {
        console.log('getHeightRatio');
        let max = 0;
        let arr = [...currencies.convertTo, currencies.convertFrom]
        for (let key of arr) {

            if (currencies.rates[key] > max) max = currencies.rates[key]
        }
        return 100 / max;
    },
    makeBarChart(curr) {
        let ratio = this.getSizeRatio();
        let barChart = document.createElement('div');
        barChart.classList.add('ChartContent-barChart');
        let chartSize = `${currencies.rates[curr] * ratio}%`;

        if (document.body.clientWidth > 950) {
            barChart.style.height = chartSize;
        } else barChart.style.width = chartSize;
        barChart.setAttribute('data-size', chartSize);

        let title = document.createElement('p');
        title.textContent = curr;
        let modal = Modal.makeModal(curr);
        barChart.append(title, modal);
        barChart.onclick = () => Modal.activateModal(barChart);
        return barChart;
    },



}

// Modal object provides organization of methods for creating modal elements and displaying modals and controlling animation (set and removed by classes)
const Modal = {
    makeModal(curr) {
        let modal = document.createElement('div');
        modal.classList.add('Modal');
        let descriptionPara = document.createElement('p');
        let comparePara = document.createElement('p');
        descriptionPara.textContent = currencies.description[curr];
        comparePara.textContent = `1 ${currencies.convertFrom} == ${currencies.rates[curr]} ${curr}`;
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
        currencies.convertFrom = select.value;
        if (currencies.convertTo.includes(select.value)) {
            currencies.convertTo.splice(currencies.convertTo.indexOf(select.value), 1);
        }


        CurrencyFetch.APIData(requestURL);
    },
    // makeCurrencyOptions() {
    //     let selector = document.querySelector('.Config-baseSelection .base-select');


    //     selector.value = currencies.convertFrom;
    //     let filterSelector = document.querySelector('.Base-filter');
    //     let filtered;
    //     if (filterSelector.value) {
    //         filtered = (currencies.rates).filter(function(elem) {
    //             return elem.toLowerCase().startsWith(filterSelector.value.toLowerCase());
    //         })
    //     } else filtered = currencies.rates;
    //     for (curr in filtered) {

    //         let option = document.createElement('li');
    //         option.value = curr;
    //         option.textContent = curr;
    //         selector.appendChild(option);
    //     }
    // },
    makeCurrencyOptions() {
        let selector = document.querySelector('.Config-baseSelection .base-select');


        selector.value = currencies.convertFrom;
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
        filtered = Object.keys(currencies.rates);
        this.makeCurrencyOptionsList(filtered);
        filterSelector.addEventListener('keyup', (e) => {
            selector.innerHTML = '';
            if (filterSelector.value) {

                filtered = Object.keys(currencies.rates).filter(function(elem) {
                    return elem.toLowerCase().startsWith(filterSelector.value.toLowerCase());
                });
            };
            if (filterSelector.value == '') {
                filtered = Object.keys(currencies.rates);
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
        filtered = Object.keys(currencies.rates);
        if (filtered.length == 0) filtered = ["...", ...Object.keys(currencies.rates)];
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
            filtered = Object.keys(currencies.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(selector2.value.toLowerCase());
            })
        } else filtered = Object.keys(currencies.rates);
        let selector = document.querySelector('.comparison div');
        //let filtered = Object.keys(currencies.rates);
        this.makeComparisonList(filtered);

        // selector2.value = '';


        selector2.addEventListener('keyup', function(e) {


            let form = document.querySelector('.comparison');

            // e.preventDefault();
            filtered = Object.keys(currencies.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(selector2.value.toLowerCase());
            })
            if (selector2.value == '') {
                filtered = Object.keys(currencies.rates);
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
            if (curr != currencies.convertFrom) {
                let option = document.createElement('li');
                option.innerHTML = `<span style='display:inline-block;width:3em;'>${curr}:</span>${currencies.description[curr]}`;
                // option.value = curr; option.value = curr;

                if (currencies.convertTo.includes(curr)) {
                    option.classList.add('comparisonOptionSelected');
                }
                option.addEventListener('click', function(e) {
                    if (currencies.convertTo.length < 5) {
                        option.classList.toggle('comparisonOptionSelected');
                    } else if (option.classList.contains('comparisonOptionSelected')) {
                        option.classList.remove('comparisonOptionSelected');
                        // error();
                    }
                    if (option.classList.contains('comparisonOptionSelected')) {
                        currencies.convertTo.push(curr);

                        // alert(option.textContent);
                    } else if (currencies.convertTo.indexOf(curr) != -1) {
                        let ix = currencies.convertTo.indexOf(curr);
                        currencies.convertTo.splice(ix, 1);
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
        div1.textContent = currencies.convertFrom;
        let div = document.querySelector('.section-config-show-comparisons');
        div.innerHTML = '';

        for (curr of currencies.convertTo) {
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
        App.clearContents(BarChart.getMainContent());
        console.log('I am rendering');

        BarChart.makeCharts();
        //on resized window, barcharts will be resized form vertical to horizontal- conditionally
        window.onresize = BarChart.resizeAll;


    }
    static clearContents(elem) {
        // clear contents of any element passed
        elem.innerHTML = '';
    }



}





console.log('mainjs');

CurrencyFetch.APIData(requestURL);