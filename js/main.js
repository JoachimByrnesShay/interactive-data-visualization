// openexchangerates.org/api 

let baseURL;
// ...fullNames and ...Rates 
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

baseURL = 'https://openexchangerates.org/api/'


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


// AppConfiguration object provides organization of methods for presenting configuration options and controlling their behavior and associted behavior of display in configuration section

const Configuration = {

    makeVariables() {
        let configurationVariables = {
            BASE_SELECT_BOX_CLASS: 'Configure-baseSelectBox',
            BASE_OPTION_CLASS: 'Configure-baseOption',
            BASE_FORM_CLASS: 'Configure-baseForm',
            BASE_FILTER_FIELD_CLASS: 'Configure-baseFilter',
            SELECTED_COMPARISON_CLASS: 'Configure-selectedComparison',
            SHOW_BASE_CLASS: 'Configure-showBase',
            SHOW_COMPARISONS_CLASS: 'Configure-showComparisonsContainer',
            COMPARISON_OPTION_CLASS: 'Configure-comparisonOption',
            COMPARISONS_FORM_CLASS: 'Configure-comparisonsForm',
            COMPARISONS_SELECT_BOX_CLASS: 'Configure-comparisonsSelectBox',
            COMPARISONS_FILTER_FIELD_CLASS: 'Configure-comparisonsFilter',
            CLEAR_CHARTS_BUTTON_CLASS: 'Configure-clearCharts',
        }
        // use App.makeCurrentObjectVariables() to set up the above variables in context of current object Configuration
        App.makeCurrentObjectVariables(this, configurationVariables);
    },

    stopFormSubmit(form) {
        // equivalent to inline (in html) javascript onSubmit='return false', this function is utilized to stop any from from submitting 
        // if enter key is hit inside of an input field; utilized here to 
        // stop forms in base and comparisons configurations sections from submitting, which affects smoothness of user experience
        form.onsubmit = () => { console.log('submit'); return false; }
    },

    makeConfigurationDisplay() {
        this.makeVariables();
        // set onclick function on clear comparisons button in configuration section
        App.querySelectorByClass(this.CLEAR_CHARTS_BUTTON_CLASS).onclick = () => BarChart.Utility.clearCharts();

        Configuration.makeBaseSection();
        Configuration.makeComparisonsSection();
    },

    makeBaseSection() {
        // ensure that form for baseCurrency config does not submit, i.e. when enter pressed. 
        // form submits refresh page and this is undesirable and unnecessary for user experience
        this.stopFormSubmit(App.querySelectorByClass('Configure-baseForm'));

        // headerBaseValue is class for span in h2.Configure-baseHeading and displays, reflects dynamic changes in, and animates in some contexts the configured current base currency value
        App.querySelectorByClass('Configure-headerBaseValue').innerHTML = currencyData.convertFrom;
        // a custom tooltip is used for the element and the css :hover::after effect employs a dataset attribute rather than title.  this avoids the combo of default behavior occurring alongside of custom behavior with use of title
        App.querySelectorByClass('Configure-headerBaseValue').dataset.tooltipTitle = currencyData.fullNames[currencyData.convertFrom];

        // animation class flashes element briefly to draw user attention to fact that a base currency value is set
        App.querySelectorByClass('Configure-headerBaseValue').classList.add('Configure-headerBaseValueAnimate');

        App.querySelectorByClass('Configure-headerBaseValue').addEventListener('animationend', () => {
            App.querySelectorByClass('Configure-headerBaseValue').classList.remove('Configure-headerBaseValueAnimate');
        });
        // make and display the filterable (by text input field) list of available base currencies for user to select one base currency
        this.makeFilterableBaseList();
    },
    makeFilterableBaseList() {
        let baseFilterField = App.querySelectorByClass(Configuration.BASE_FILTER_FIELD_CLASS);
        let filteredResult;
        baseFilterField.value = '';
        // without user filter input, on initialization the list will include all currency rates, though makeBaseList will omit the currently selected base currency from the list
        filteredResult = Object.keys(currencyData.rates);
        let selectBox = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS);


        // make default baseList
        Configuration.makeBaseList(filteredResult);

        baseFilterField.addEventListener('keyup', function(e) { //selectBox.focus();
            let form = App.querySelectorByClass(Configuration.BASE_FORM_CLASS_NAME);
            filteredResult = Object.keys(currencyData.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(baseFilterField.value.toLowerCase());
            });

            if (baseFilterField.value == '') {
                filteredResult = Object.keys(currencyData.rates);
            }
            // remake baselist with filtered base options
            Configuration.makeBaseList(filteredResult);


        });






    },
    makeBaseList(filtered_result) {
        let selectBox = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS);
        selectBox.innerHTML = '';
        if (filtered_result.length == 0) {
            filtered_result = [];
        }

        let baseFilterField = App.querySelectorByClass(Configuration.BASE_FILTER_FIELD_CLASS);
        //select_box.focus();
        selectBox.addEventListener('mouseenter', function(e) {
            selectBox.focus();
        });

        selectBox.addEventListener('mouseleave', function(e) {
            selectBox.blur();
        });

        for (let currency of filtered_result) {
            if (currency != currencyData.convertFrom) {
                let option = document.createElement('option');
                option.tabIndex = 0;
                option.innerHTML = `<span style='display:inline-block;width:3em;'>${currency}:</span>${currencyData.fullNames[currency]}`;
                option.dataset['code'] = currency;
                selectBox.appendChild(option);
                option.classList.add(Configuration.BASE_OPTION_CLASS);
                option.addEventListener('mouseenter', function(e) {

                    if (!document.hasFocus()) {
                        option.classList.add('Configure-baseOption--hovered');
                    } else {
                        option.setAttribute('active', true);
                        option.classList.remove('Configure-baseOption--hovered');
                        option.selected = 'selected';
                    }
                });
                option.addEventListener('mouseleave', function(e) {
                    option.setAttribute('active', 'false');
                    option.selected = false;
                    option.classList.remove('Configure-baseOption--hovered');
                    option.setAttribute('selected', 'false');
                    option.setAttribute('checked', false);

                });

                option.addEventListener('click', function(e) {

                    Configuration.changeBase(option.dataset['code']);
                });
            }
        }
        let index = -1
        let lastIndex = filtered_result.length - 1;

        document.addEventListener('keydown', function(e) {

            if (e.which == 38 || e.which == 40) {



                if (e.which == 38) {
                    console.log('38')
                    if (index > 0) {
                        index -= 1;
                        selectBox.focus();
                    } else if (index == 0) {
                        console.log(baseFilterField);
                        baseFilterField.tabIndex = '-1';
                        selectBox.blur();
                        baseFilterField.focus()
                    }
                }
                e.preventDefault();
                if (e.which == 40 && index < lastIndex) {
                    index += 1;
                    selectBox.focus();

                }

                if (index <= lastIndex) {

                    selectBox.selectedIndex = index;
                }

            }
            // if (e.which == 38 || e.which == 40) {
            //     e.preventDefault();
            //     //alert(e.keyDown)
            //     selectBox.focus();
            //     //let changeevent = new Event('change');
            //     selectBox.selectedIndex = 0;

            //     selectBox.dispatchEvent(changeevent);


            //alert(e.onkeydown)

        });
    },


    makeComparisonsSection() {

        this.stopFormSubmit(App.querySelectorByClass('Configure-comparisonsForm'));

        let filter_field = App.querySelectorByClass(Configuration.COMPARISONS_FILTER_FIELD_CLASS);
        let filtered_result;
        filter_field.value = '';
        filtered_result = Object.keys(currencyData.rates);
        let select_box = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS);

        this.makeComparisonsList(filtered_result);
        filter_field.addEventListener('click', function(e) {

            // select_box.focus();
        });
        filter_field.addEventListener('keyup', function(e) {
            this.focus();
            let form = App.querySelectorByClass(Configuration.COMPARISONS_FORM_CLASS);
            filtered_result = Object.keys(currencyData.rates).filter(function(elem) {
                return elem.toLowerCase().startsWith(filter_field.value.toLowerCase());
            });

            if (filter_field.value == '') {
                filtered_result = Object.keys(currencyData.rates);

            }
            Configuration.makeComparisonsList(filtered_result);
        });
    },

    makeComparisonsList(filtered_result) {

        let select_box = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS);
        select_box.innerHTML = '';
        if (filtered_result.length == 0) {
            filtered_result = [];
        }

        select_box.addEventListener('mouseenter', function(e) {
            select_box.focus();
        });

        select_box.addEventListener('mouseleave', function(e) {
            select_box.blur();
        });
        for (let currency of filtered_result) {
            if (currency != currencyData.convertFrom) {
                let option = document.createElement('option');
                option.tabIndex = 0;
                option.innerHTML = `<span style='display:inline-block;width:3em;'>${currency}</span>: ${currencyData.fullNames[currency]}`;

                option.classList.add(Configuration.COMPARISON_OPTION_CLASS);
                if (currencyData.convertTo.includes(currency)) {

                    option.classList.add(Configuration.SELECTED_COMPARISON_CLASS);
                }
                option.addEventListener('mouseenter', function(e) {

                    if (!document.hasFocus()) {
                        option.classList.add('Configure-comparisonOption--hovered');
                    } else {
                        option.focus();
                        //option.setAttribute('active', true);
                        option.classList.remove('Configure-comparisonOption--hovered');
                        option.selected = 'selected';
                        option.setAttribute('checked', true);
                    }
                    if (option.classList.contains('Configure-selectedComparison')) {
                        option.classList.add('u-highlightComparison');
                        option.selected = 'selected';
                    }
                });
                option.addEventListener('mouseleave', function(e) {
                    option.classList.remove('u-highlightComparison');
                    //option.blur();
                    //option.setAttribute('active', 'false');
                    //option.selected = false;
                    option.classList.remove('Configure-comparisonOption--hovered');
                    option.setAttribute('selected', 'false');
                    option.setAttribute('checked', false);


                });

                option.addEventListener('click', function(e) {
                    if (currencyData.convertTo.length == 5) {
                        App.querySelectorByClass('Header-flashContainer').classList.add('Header-flashMessage')
                        App.querySelectorByClass('Header-flashMessage').innerHTML = "<p>ONLY SELECT UP TO 5 COMPARISONS.<br>DESELECT A SELECTED CHOICE, i.e click it.</p>";
                    }
                    if (currencyData.convertTo.length < 5) {
                        App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage')

                        option.classList.toggle(Configuration.SELECTED_COMPARISON_CLASS);
                    } else if (option.classList.contains(Configuration.SELECTED_COMPARISON_CLASS)) {
                        option.classList.remove(Configuration.SELECTED_COMPARISON_CLASS);

                    }
                    if (option.classList.contains(Configuration.SELECTED_COMPARISON_CLASS)) {
                        currencyData.convertTo.push(currency);

                    } else if (currencyData.convertTo.indexOf(currency) != -1) {
                        let ix = currencyData.convertTo.indexOf(currency);
                        currencyData.convertTo.splice(ix, 1);
                        App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage')

                    } else {

                    }

                    App.querySelectorByClass('Header-flashContainer').addEventListener('animationend', () => {
                        App.querySelectorByClass('Header-flashContainer').innerHTML = '';
                        App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage');
                    });
                    App.render();
                });
                select_box.appendChild(option)
            }
        }
        Configuration.showComparisons();
    },
    showComparisons() {
        let div1 = App.querySelectorByClass(Configuration.SHOW_BASE_CLASS);
        let alreadyP;
        if (alreadyP = div1.querySelector('p')) {
            div1.removeChild(alreadyP);
        }
        let showBaseP = document.createElement('p');
        showBaseP.textContent = currencyData.convertFrom;

        showBaseP.dataset.tooltipTitle = currencyData.fullNames[currencyData.convertFrom];
        showBaseP.classList.add('Configure-baseParagraph')
        div1.appendChild(showBaseP);
        let div = App.querySelectorByClass(Configuration.SHOW_COMPARISONS_CLASS);
        div = document.querySelector('.Configure-showComparisons');

        App.querySelectorByClass('Configure-showComparisons').innerHTML = '';

        for (let currency of currencyData.convertTo) {
            let p = document.createElement('p');
            p.textContent = currency;
            p.classList.add('Configure-comparisonParagraph')
            p.dataset.tooltipTitle = currencyData.fullNames[currency];
            div.appendChild(p);
        }
    },
    changeBase(val) {
        let select = App.querySelectorByClass(this.BASE_SELECT_BOX_CLASS);
        App.querySelectorByClass('Configure-headerBaseValue').innerHTML = val;
        currencyData.convertFrom = val;

        if (currencyData.convertTo.includes(val)) {

            currencyData.convertTo.splice(currencyData.convertTo.indexOf(val), 1);
        }
        CurrencyFetch.APIData(baseURL);
        let thing = App.querySelectorByClass('Configure-showConfiguration');
        thing.classList.add('Configure-configurationCurrencyAnimate');
        thing.addEventListener('animationend', () => {
            thing.classList.remove('Configure-configurationCurrencyAnimate');
        });
        App.render();

    },

}



// BarChart object provides organization of methods for creating, clearing, and resizing (responsive) barcharts, and associated utility methods
const BarChart = {
    makeVariables() {

        let barChartVariables = {
            // variablize the usage of classes necessary in calling barchart methods
            MAIN_CONTENT_CLASS: 'ChartContent',
            CHART_CONTAINER_CLASS: 'ChartContent-barChartContainer',
            CHART_CLASS: 'ChartContent-barChart',
            CLEAR_ALL_GRAPHS_CLASS: 'ChartContent--clearCharts',
            INDICATE_BASE_TEXT_ON_BASE_CLASS_CHART: 'ChartContent-indicateBase',
            CHART_CONTAINER_IS_BASE_CLASS: 'is-forBaseChart',
        }

        App.makeCurrentObjectVariables(this, barChartVariables);
    },

    makeAllBarChartDisplay() {
        this.makeVariables();
        console.log('main-content', this.MAIN_CONTENT_CLASS);
        let container = App.querySelectorByClass(this.MAIN_CONTENT_CLASS);

        if (currencyData.convertTo.length) {
            for (let currency of [currencyData.convertFrom, ...currencyData.convertTo]) {
                let chartContainer = document.createElement('div');
                chartContainer.classList.add(this.CHART_CONTAINER_CLASS);
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
            div.classList.add(this.INDICATE_BASE_TEXT_ON_BASE_CLASS_CHART);

            chartContainer.classList.add(this.CHART_CONTAINER_IS_BASE_CLASS);
            div.textContent = 'BASE CURRENCY';
            chartContainer.appendChild(div);

        }

    },
    makeBarChart(currencyCode) {

        let barChart = document.createElement('div');
        barChart.classList.add(this.CHART_CLASS);

        let title = document.createElement('p');
        title.textContent = currencyCode;
        title.classList.add('ChartContent-barChartTitle');
        title.classList.add('u-bold');
        let modal = Modal.makeModal(currencyCode);

        barChart.append(title, modal);
        barChart.append(modal);
        this.Utility.setInitialSize(barChart, currencyCode);
        let size = parseInt(barChart.dataset.size);
        barChart.onclick = (e) => {
            e.preventDefault();
            Modal.activateModal(barChart);
        }
        return barChart;
    }

}

BarChart.Utility = {
    MAIN_CONTENT_CLASS: 'ChartContent',
    getSizeRatio() {
        let max = 0;
        // convertFrom rate will be 1
        let arr = [...currencyData.convertTo, currencyData.convertFrom]
        console.log(arr);
        for (let key of arr) {
            console.log(key, ': ', currencyData.rates[key]);
            if (currencyData.rates[key] > max) max = currencyData.rates[key]
        }
        console.log('ratio', 100 / max);
        return 100 / max;
    },
    offsetTitle(barChart, size) {
        let title = App.querySelectorByClass('ChartContent-barChartTitle', context = barChart);
        title.classList.add('u-offset');

        let titleOffset = `calc(${size} + 1em)`;

        title.style.position = 'absolute';
        title.classList.add('U-blackText');
        if (window.innerWidth > 950) {
            title.style.bottom = titleOffset

            title.style.left = 'unset';

        } else {
            title.style.left = titleOffset;
            title.style.bottom = 'unset';
        }
    },
    setInitialSize(barChart, currencyCode) {
        let ratio = BarChart.Utility.getSizeRatio();
        let chartSize = `${currencyData.rates[currencyCode] * ratio}%`;
        if (window.innerWidth > 950) {
            barChart.style.height = chartSize;


        } else barChart.style.width = chartSize;

        barChart.setAttribute('data-size', chartSize);
        if (parseInt(chartSize) < 8) {
            this.offsetTitle(barChart, chartSize);
        }

    },
    getMainContent(main = this.MAIN_CONTENT_CLASS) {

        let content = App.querySelectorByClass(main);
        return content;
    },

    clearConvertToDataValues() {
        currencyData.convertTo = []
    },
    clearCharts() {
        let main = this.getMainContent();
        this.clearConvertToDataValues();
        Configuration.makeComparisonsSection();
        main.classList.add(BarChart.CLEAR_ALL_GRAPHS_CLASS);
        main.addEventListener('animationend', function(e) {
            main.classList.remove(BarChart.CLEAR_ALL_GRAPHS_CLASS);
            App.clearContents(main);
            App.render();
        });
    },
    resizeAll() {

        let charts = App.querySelectorAllByClass(BarChart.CHART_CLASS);

        for (barChart of charts) {
            let size = barChart.dataset.size;
            if (window.innerWidth <= 950) {
                barChart.style.width = size;
                barChart.style.height = '70%';
            } else {
                barChart.style.height = size;
                barChart.style.width = '7em';
            }
            if (parseInt(size) < 8) {
                BarChart.Utility.offsetTitle(barChart, size);
            }
        }
    }
}

// Modal object provides organization of methods for creating modal elements and displaying modals and controlling animation (set and removed by classes)
const Modal = {
    MODAL_CLASS: 'Modal',
    MODAL_IS_DISPLAYED_CLASS: 'is-displayed',
    makeModal(currencyCode) {
        let modal = document.createElement('div');
        // modal by default when created with makeModal have display set to none, for individual modals this will change with activateModal(modal);
        modal.classList.add(this.MODAL_CLASS);
        let descriptionTextParagraph = document.createElement('p');
        let comparisonTextParagraph = document.createElement('p');
        // description text is full name of the current comparison currency for this modal
        descriptionTextParagraph.textContent = currencyData.fullNames[currencyCode];
        // set comparisonTextParagraph content to show comparision of 1 unit of base currency vs the ratioed current comparison currency
        comparisonTextParagraph.textContent = `1${currencyData.convertFrom}==${currencyData.rates[currencyCode]}${currencyCode}`;
        modal.append(descriptionTextParagraph, comparisonTextParagraph);
        return modal;
    },

    /** show modal, call via onClick in html **/
    activateModal(elem) {
        /* select the modal within the ChartContent-barChart element (elem, passed as 'this') which has been clicked */
        let modal = App.querySelectorByClass(this.MODAL_CLASS, context = elem)
        // by default, the MODAL_CLASS, unactivated via activateModal has display set to none 
        modal.classList.add(this.MODAL_IS_DISPLAYED_CLASS);

        /* cleanly remove is-displayed state class from modal when animation ends */
        modal.addEventListener("animationend", () => {
            modal.classList.remove(this.MODAL_IS_DISPLAYED_CLASS);
        });

        /* smoothen user experience when animation is not finished and user moves cursor back to bar too quickly (mousing back on too quickly after mousing off after click)*/
        modal.addEventListener('animationcancel', () => {
            modal.classList.remove(this.MODAL_IS_DISPLAYED_CLASS);
        });
    }
}


// main app 
const App = {
    // render the application 
    // TAKE A SECOND LOOK AT THIS!!!!  makeBase and makeComparisons in render?????
    // clear contents of the DOM element passed
    clearContents: (elem) => elem.innerHTML = '',
    render: () => {
        // set up configuration display section of the app and display
        Configuration.makeConfigurationDisplay();
        //each call to render clears html of the barcharts area (.ChartContent)
        App.clearContents(BarChart.Utility.getMainContent());
        // create all bar charts and display
        BarChart.makeAllBarChartDisplay();
        //on resized window, barcharts will be resized form vertical to horizontal- conditionally
        window.onresize = BarChart.Utility.resizeAll;



    },
    // make variables within the called currentObject context from the variable name/variable value pairs in the variables object
    // this is called in Configuration. and BarChart. to help the visual encapsulation of the many variables in each, specifically those used to point to html/css classes
    makeCurrentObjectVariables: (currentObject, variables) => {
        for (varName of Object.keys(variables)) {
            // varName is scoped within currentObject and is called as this.varName inside of the methods of currentObject, e.g. Configuration.SHOW_BASE_CLASS or BarChart.CHART_CLASS
            currentObject[varName] = variables[varName];
        }
    },

    // standardizes get element by querySelector without needing to pass '.', useful as classnames are variablized and used both in querySelectors 
    // which requre '.' in the classstring and classlist add and remove which require no usage of '.' in classstring
    // pass a context in to allow to get element with a certain class inside of any DOM element, not only document (which is default)
    querySelectorByClass: (elemClassName, context = document) => {
        return context.querySelector('.' + elemClassName);
    },
    // same usage as above SelectorByClass, but for All
    querySelectorAllByClass: (elemClassName, context = document) => {
        return context.querySelectorAll('.' + elemClassName);
    }
}

CurrencyFetch.APIData(baseURL);
window.focus();