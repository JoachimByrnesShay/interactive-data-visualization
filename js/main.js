console.log('loaded main.js')
const requestURL = 'https://api.exchangerate.host/';
let currencies = {
    convertFrom: 'USD',
    convertTo: ['EUR', 'GBP', 'CNY', 'BGN', 'AED'],
    rates: {},
    description: {},
    symbols: {}
}

//let baseSymbols = ['EUR', 'USD', 'GBP', 'CNY', 'BGN', 'AED']

//let thing = 'https://www.localeplanet.com/api/auto/currencymap.json?name=Y';
//let thing = 'https://github.com/bengourley/currency-symbol-map/blob/master/map.js'
let thing = 'https://gist.github.com/portapipe/a28cd7a9f8aa3409af9171480efcc090'

function fetchCurrencyDescriptions(url) {
    let symbolsURL = url + 'symbols';
    return fetch(symbolsURL).then(response => response.json())
        .then(data => {
            for ([k, v] of Object.entries(data.symbols)) {
                currencies.description[k] = v.description;
            };
        })
}

function changeBase() {
    let select = document.querySelector('.section-config-base select');
    currencies.convertFrom = select.value;
    fetchAPI(requestURL);
}

function fetchCurrencySymbols(url) {
    return;
}

function fetchCurrencyRates(url) {
    let ratesURL = url + `latest?base=${currencies.convertFrom}`;
    return fetch(ratesURL).then((response) => response.json())
        .then(data => {
            for (let curr in data.rates) {
                currencies.rates[curr] = data.rates[curr]
            }
        });
}

function fetchAPI(url) {
    fetchCurrencyDescriptions(url).
    then(() => fetchCurrencySymbols(url)).
    then(() => fetchCurrencyRates(url)).
    then(() => {
        for (let re in currencies.rates) {
            //console.log(re);
        }
        //console.log(Object.keys(currencies.rates).length)
        // console.log(currencies)
    }).
    then(() => render());
}

fetchAPI(requestURL);


function getSizeRatio() {
    console.log('getHeightRatio');
    let max = 0
    let arr = [...currencies.convertTo, currencies.convertFrom]
    for (let key of arr) {
        console.log(key, currencies.rates[key])
        if (currencies.rates[key] > max) max = currencies.rates[key]
    }
    return 100 / max;
}

function makeModal(curr) {
    let modal = document.createElement('div');
    modal.classList.add('Modal');
    let descriptionPara = document.createElement('p');
    let comparePara = document.createElement('p');
    descriptionPara.textContent = currencies.description[curr];
    comparePara.textContent = `1 ${currencies.convertFrom} == ${currencies.rates[curr]} ${curr}`;
    modal.append(descriptionPara, comparePara);
    return modal;
}



function makeBarChart(curr) {
    let ratio = getSizeRatio();
    let barChart = document.createElement('div');
    barChart.classList.add('ChartContent-barChart');
    let chartSize = `${currencies.rates[curr] * ratio}%`;

    if (document.body.clientWidth > 950) {
        barChart.style.height = chartSize;
    } else barChart.style.width = chartSize;
    barChart.setAttribute('data-size', chartSize);

    let title = document.createElement('p');
    title.textContent = curr;
    let modal = makeModal(curr);
    barChart.append(title, modal);
    barChart.onclick = () => activateModal(barChart);
    return barChart;
}

function resize() {
    let charts = document.querySelectorAll('.ChartContent-barChart');
    for (barChart of charts) {
        let size = barChart.dataset.size;
        console.log(size);
        if (document.body.clientWidth <= 950) {
            barChart.style.width = size;
            barChart.style.height = '70%';


        } else {
            barChart.style.height = size;
            barChart.style.width = '7em';
        }

    }
}

function makeCharts() {
    console.log('make charts');
    let container = document.querySelector('.ChartContent');
    if (currencies.convertTo.length) {
        for (let curr of [...currencies.convertTo, currencies.convertFrom]) {
            let chartContainer = document.createElement('div');
            chartContainer.classList.add('ChartContent-container');
            let barChart = makeBarChart(curr);
            chartContainer.appendChild(barChart);
            container.appendChild(chartContainer);
        }
    }
}

function makeCurrencyOptions() {
    let selector = document.querySelector('.config-curr');
    console.log(selector);
    for (curr in currencies.rates) {
        let option = document.createElement('option');
        console.log(option);
        //option.value = curr;
        option.textContent = curr;
        selector.appendChild(option);
    }
    selector.value = currencies.convertFrom;
}

function clearCharts() {
    currencies.convertTo = []
    render();
}

function makeComparisonSection(filtered = '') {

    let selector = document.querySelector('.comparison div');
    //let selector = document.querySelector('.Header');
    // selector.onchange(() => {
    //     alert('ya');
    // })
    selector.innerHTML = '';

    let selector2 = document.querySelector('.filter');
    let search = ''

    selector2.addEventListener('keyup', function(e) {
        let form = document.querySelector('.comparison');

        // let thing = document.querySelector('.section-config-selections h3');  // if (e.key.charCodeAt(0) > 63 && e.key.charCodeAt(0) < 'Z' || e.key.charCodeAt(0) > 96 && e.key.charCodeAt(0) < 123) {


        //console.log(Object.keys(currencies.rates))
        // console.log(e.key);
        // console.log(selector2.value);
        // console.log(search);
        let filtered = Object.keys(currencies.rates).filter(function(elem) {
            return elem.toLowerCase().startsWith(selector2.value.toLowerCase());
        })
        console.log(filtered);
        makeComparisonList(filtered);
        // }

    });

    //console.log(filtered);


}

//     select.appendChild(textinput);
//     for (curr in currencies.rates) {
//         if (curr != currencies.convertTo) {
//             let option = document.createElement('option');
//             makeEventListener(option);
//             option.textContent = curr;
//             option.value = curr;
//             selector.appendChild(option);
//         }
//     }
// }


function makeComparisonList(filtered = []) {
    console.log(filtered);
    let selector = document.querySelector('.comparison div');
    let ul = document.createElement('ul');
    selector.innerHTML = '';
    ul.classList.add('selectComparisons');
    if (filtered.length === 0) {
        filtered = Object.keys(currencies.rates);
    }
    console.log(filtered);
    for (let curr of filtered) {
        if (curr != currencies.convertFrom) {
            let option = document.createElement('li');
            option.textContent = curr;
            option.value = curr;

            option.addEventListener('click', function(e) {
                if (currencies.convertTo.length < 5) {
                    option.classList.toggle('comparisonSelectOption');
                } else if (option.classList.contains('comparisonSelectOption')) {
                    option.classList.remove('comparisonSelectOption');
                    // error();
                }

                if (option.classList.contains('funnyClass')) {
                    currencies.convertTo.push(curr);
                    // alert(option.textContent);
                } else if (currencies.convertTo.indexOf(curr) != -1) {
                    let ix = currencies.convertTo.indexOf(curr);
                    currencies.convertTo.splice(ix, 1);
                }
                //e.target.style.background = 'lightblue';
                updateShowComparisons();
                render();
            });
            ul.appendChild(option)
            if (currencies.convertTo.includes(curr)) {
                option.classList.add('comparisonSelectOption');
            }
        }
    }
    selector.appendChild(ul);
}

function updateShowComparisons() {
    let div = document.querySelector('.section-config-show-comparisons');
    div.innerHTML = '';

    for (curr of currencies.convertTo) {
        let p = document.createElement('p');
        p.textContent = curr;
        div.appendChild(p);
    }
}

function makeEventListener(thisOption) {

}

function clear() {
    let main = document.querySelector('.ChartContent')
    main.innerHTML = '';
}

function render() {
    makeCurrencyOptions();
    makeComparisonSection();

    clear();
    console.log('I am rendering');

    makeCharts();
    window.onresize = resize;
    // window.onresize = resize();

}

/** show modal, call via onClick in html **/
function activateModal(elem) {
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