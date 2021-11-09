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

// Configuration object provides organization of methods for presenting configuration options and controlling their behavior and associted behavior of display in configuration section
const Configuration = {

    makeVariables() {
        let configurationVariables = {
            BASE_SELECT_BOX_CLASS: 'Configure-baseSelectBox',
            BASE_OPTION_CLASS: 'Configure-baseOption',
            BASE_FORM_CLASS: 'Configure-baseForm',
            BASE_FILTER_FIELD_CLASS: 'Configure-baseFilter',
            SELECTED_COMPARISON_CLASS: 'Configure-selectedComparison',
            SHOW_BASE_CLASS: 'Configure-showBaseContainer',
            SHOW_COMPARISONS_CLASS: 'Configure-showComparisonsContainer',
            COMPARISON_OPTION_CLASS: 'Configure-comparisonOption',
            COMPARISONS_FORM_CLASS: 'Configure-comparisonsForm',
            COMPARISONS_SELECT_BOX_CLASS: 'Configure-comparisonsSelectBox',
            COMPARISONS_FILTER_FIELD_CLASS: 'Configure-comparisonsFilter',
            CLEAR_CHARTS_BUTTON_CLASS: 'Configure-clearChartsButton',
            CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS: 'Configure-headerBaseValue',
            CONFIGURATION_HEADER_BASE_VALUE_ANIMATE: 'Configure-headerBaseValueAnimate',
            COMPARISON: { index: -1, lastIndex: -1 },
            BASE: { index: -1, lastIndex: -1 }

        }
        // use App.makeCurrentObjectVariables() to set up the above variables in context of current object Configuration
        App.makeCurrentObjectVariables(this, configurationVariables);
    },
    getIndexFromContext(indexContext) {
        if (indexContext == 'BASE') {
            return ['BASE.index', 'BASE.lastIndex']
        } else {
            return ['Configuration.COMPARISON.index', 'Configuration.COMPARISON.lastIndex'];
        }
    },
    // make sure forms in configuration section to not submit (no page refresh on enter key)
    stopFormSubmit(form) {
        // equivalent to inline (in html) javascript onSubmit='return false', this function is utilized to stop any from from submitting 
        // if enter key is hit inside of an input field; utilized here to 
        // stop forms in base and comparisons configurations sections from submitting, which affects smoothness of user experience
        form.onsubmit = () => { return false; }
    },

    makeConfigurationDisplay() {
        // dynamically create variables owned by Configuration object from key:value pairs in object inside makeVariables method definitation
        this.makeVariables();
        // set onclick function on clear charts/comparison-currencies button in configuration section
        App.querySelectorByClass(this.CLEAR_CHARTS_BUTTON_CLASS).onclick = () => BarChart.Utility.clearCharts();

        // base currency selection section and comparison currencies selection selection
        Configuration.makeBaseSection();

        Configuration.makeComparisonsSection();
    },

    makeBaseSection() {
        // ensure that form for baseCurrency config does not submit, i.e. when enter pressed. 
        // form submits refresh page and this is undesirable and unnecessary for user experience
        this.stopFormSubmit(App.querySelectorByClass(this.BASE_FORM_CLASS));

        // headerBaseValue is class for span in h2.Configure-baseHeading and displays, reflects dynamic changes in, and animates in some contexts the configured current base currency value
        App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).innerHTML = currencyData.convertFrom;
        // a custom tooltip is used for the element and the css :hover::after effect employs a dataset attribute rather than title.  this avoids the combo of default behavior occurring alongside of custom behavior with use of title
        App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).dataset.tooltipTitle = currencyData.fullNames[currencyData.convertFrom];

        // animation class flashes element briefly to draw user attention to fact that a base currency value is set
        App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).classList.add(this.CONFIGURATION_HEADER_BASE_VALUE_ANIMATE);

        App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).addEventListener('animationend', () => {
            App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).classList.remove(this.CONFIGURATION_HEADER_BASE_VALUE_ANIMATE);
        });
        // make and display the filterable (by text input field) list of available base currencies for user to select one base currency
        this.makeFilterableBaseList();

    },
    makeFilterableBaseList() {
        let filterField = App.querySelectorByClass(Configuration.BASE_FILTER_FIELD_CLASS);
        let filteredResult;
        //ensure filter is always focused on renders, sought after behavior for transition from scrolling back up options list with arrowup above option at index 0, for refresh, and for re-rendering by changing base via mouseclick or enter on a selected/scrolled-to optionarrowup throw list
        filterField.focus();
        filterField.value = '';
        // a list of currency rate codes (the keys in currencyData.rates).  
        // without user filter input, on initialization the list will include all currency rates, though makeBaseList will omit the currently selected base currency from the list
        filteredResult = Object.keys(currencyData.rates);
        let selectBox = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS);
        // due to much work with design/appearance of option elements and integrating mouseclicks and enter key press, up/down arrow usage in select options list,
        // where focus and blur are used in other methods to enhance the user interface, explicit usage of focus and blur below maintain the integraity of the intended UI and its responsiveness.
        // selectBox.addEventListener('mouseenter', function(e) {

        //     //e.preventDefault();
        //     selectBox.focus();
        // });

        // selectBox.addEventListener('mouseleave', function(e) {
        //     //e.preventDefault();
        //     selectBox.blur();
        // });
        Configuration.makeBaseList(filteredResult);
        // make baselist outside of keyup listener so there is a list without keyup
        Configuration.makeSelectFilter(filterField, Configuration.BASE_FORM_CLASS_NAME, filteredResult, Configuration.makeBaseList);

        // on each keyup event inside the baseFilterField, we filter the list (filteredResult) to only include currency codes which begin with the string which is the value of baseFilterField
        let baseFormConfig = App.querySelectorByClass(Configuration.BASE_FORM_CLASS);
        Configuration.makeEnterOnSelectBoxListener({ form: baseFormConfig, filterField: filterField, selectBox: selectBox })
        // put top of the options constituting the select box content in view
        Configuration.makeSelectArrowKeyListener({ form: baseFormConfig, filterField: filterField, selectBox: selectBox }, 'BASE');

    },
    makeSelectFilter(filterField, formClass, filteredResult, listChangeFunction) {
        filterField.addEventListener('keyup', function(e) {

            //selectBox.focus(); //
            // I have listeners on the form itself for 38 and 40 where a possible outcome is 
            // navigating back up into filterfield using up arrows to scroll up through selectbox options
            // avoid unnecessary filtering and the additional call to makeBaseList int he event that it is up/down arrow keys detected
            if (e.keyCode != 38 && e.keyCode != 40) {

                if (filterField.value == '') {

                    filteredResult = Object.keys(currencyData.rates);
                }

                let form = App.querySelectorByClass(formClass);
                newlyFilteredResult = Object.keys(currencyData.rates).filter(function(elem) {
                    return elem.toLowerCase().startsWith(filterField.value.toLowerCase());

                });

                // if the filterField value becomes an empty string, such as if user deletes characters by backspace, the filteredResult is reset to all currency codes


                // make baselist with filtered base options
                listChangeFunction(newlyFilteredResult);
                // }
            }
        });
    },
    makeBaseList(filteredResult) {
        let baseIndex;
        if (filteredResult.includes(currencyData.convertFrom)) {
            baseIndex = filteredResult.indexOf(currencyData.convertFrom);
            filteredResult.splice(baseIndex, 1);
        }


        let selectBox = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS);
        // select box will always be re-rendered to exclude the current selected base currency,
        // as it should not be selected again.   So set innerHtmL to '' each time
        selectBox.innerHTML = ''
        //        if (filteredResult.length == 0) {
        //     filteredResult = [];
        // }
        let filterField = App.querySelectorByClass(Configuration.BASE_FILTER_FIELD_CLASS);



        // a helper index to control and maintain the integrity of the intended UI behavior on up/down arrow usage to scroll select options
        //Configuration['BASE'].index = -1;

        Configuration.BASE.lastIndex = filteredResult.length - 1;
        Configuration.constructBaseSelectOptions(filteredResult, selectBox);


        //Configuration.makeFormAndSelectListeners(baseFormConfig, { index: Configuration.BASE.index, lastIndex: Configuration.BASE.lastIndex }, filterField, selectBox);

        // always make sure scroll window is presenting at the top of the options list (first item) fully visible at top of element.

    },
    constructBaseSelectOptions(filteredResult, selectBox) {
        console.log('baseselectoptions length', filteredResult.length)
        Configuration.BASE.lastIndex = filteredResult.length - 1;
        for (let currency of filteredResult) {

            let option = document.createElement('option');
            selectBox.appendChild(option);
            //option.tabIndex = -1;
            // every option in select will display currency code and the currency's full name
            option.innerHTML = `<span style='display:inline-block;width:3em;'>${currency}:</span>${currencyData.fullNames[currency]}`;
            // usage of dataset to facilitate transfer of data regarding selected option to other methods
            option.dataset['code'] = currency;

            option.classList.add(Configuration.BASE_OPTION_CLASS);
            //Configuration.BASE.index = -1;
            Configuration.makeOptionListeners('Configure-baseOption--hovered', { 'option': option, selectBox: selectBox });


        }
        selectBox.options[0].scrollIntoView();
    },
    makeOptionListeners(hoverClass, elemContainer) {

        Configuration.makeMouseInListener(hoverClass, elemContainer);
        Configuration.makeMouseOutListener(hoverClass, elemContainer);
        // Configuration.makeMouseInAndOutListeners(hoverClass, elemContainer, indexContainer);
        elemContainer['option'].addEventListener('click', function(e) {
            Configuration.changeBase(elemContainer['option'].dataset['code']);
        });

    },


    makeMouseInListener(hoverClass, elemContainer) {

        let option = elemContainer.option;
        let selectBox = elemContainer.selectBox;

        option.addEventListener('mousemove', function(e) {



            // e.preventDefault();
            // a finepoint (!document.hasFocus()), small enhancement for improved appearance on edge case.  on some OS such as linux, if user has multiple programs open in diferent window, 
            // and is using a tiler which splits the screen (as this author does), the select options will lose their styling on hover (if another program is in the foreground, and browser is background),
            // as a result of that the browser will not recognize focus.  !document.hasFocus() improves appearance in this strange edge case
            if (!document.hasFocus()) {
                // a hover class to match the styling for up/down arrow scrolling styling of options
                //option.classList.add('Configure-baseOption--hovered');
                option.selected = 'selected';
                option.setAttribute('checked', true);
            } else {
                selectBox.focus();
                option.setAttribute('active', true);
                //option.classList.remove('Configure-baseOption--hovered');
                option.selected = 'selected';
                option.setAttribute('checked', true);
            }

            // keep the index up to date with the selectBox selectedIndex
            Configuration.BASE.index = selectBox.selectedIndex;


        });



    },
    makeMouseOutListener(hoverClass, elemContainer, indexContainer) {
        let option = elemContainer.option;
        let selectBox = elemContainer.selectBox;
        // elemContainer.option.addEventListener('mouseleave', function(e) {
        //     e.preventDefault();
        //     option.setAttribute('active', 'false');
        //     option.selected = false;
        //     option.classList.remove(hoverClass);
        //     option.setAttribute('selected', 'false');
        //     option.setAttribute('checked', false);
        //     indexContainer.index = selectBox.selectedIndex;
        option.addEventListener('mouseleave', function(e) {
            option.setAttribute('active', 'false');
            option.selected = false;
            //option.classList.remove('Configure-baseOption--hovered');
            option.setAttribute('selected', 'false');
            option.setAttribute('checked', false);
            Configuration.BASE.index = selectBox.selectedIndex;

        });

    },


    makeEnterOnSelectBoxListener(elemContainer) {
        elemContainer.selectBox.addEventListener('keydown', function(e) {


            // if (e.keyCode != 38 && e.keyCode != 40) {


            // test for enter key and presence of an index value
            // we update base currency value on enter key press on option just as for mouseclick on option
            if (e.keyCode == 13 && elemContainer.selectBox.selectedIndex > -1) {
                //lert(indexContainer.index);
                //console.log('configuration base index is: ', Configuration.BASE.index);

                Configuration.BASE.index = elemContainer['selectBox'].selectedIndex;

                Configuration.changeBase(elemContainer.selectBox.options[Configuration.BASE.index])
            }
            // }
        });



    },

    makeSelectArrowKeyListener(elemContainer, indexContext) {

        console.log('index container: ')
        let elem = elemContainer.form;
        let selectBox = elemContainer.selectBox;
        let filterField = elemContainer.filterField;
        elem.addEventListener('keydown', function(e) {
            e.target.focus();
            console.log(Configuration[indexContext].index);

            console.log('index: ', Configuration[indexContext].lastIndex)
            // 38 is arrowup, 40 is arrowdown


            if (e.keyCode == 38 || e.keyCode == 40) {
                if (selectBox.selectedIndex > -1) {
                    Configuration[indexContext].index = selectBox.selectedIndex;

                }


                // selectBox.style.cursor = 'none';
                // selectBox.style.pointerEvents = 'none';

                // use preventDefault to override default integration of up/down arrows with select box
                // which causes skipping or bumping of the scroll that does not 
                // integrate well with the other customizations/features coded here
                // for example, without this override
                // e.stopImmediatePropagation();
                e.preventDefault();

                // ensure focus within select box
                //selectBox.focus();




                // on arrowup, decrement index potentially until 0th index
                if (e.keyCode == 38) {
                    // indexContainer.index = selectBox.selectedIndex;
                    // if (selectBox.selectedIndex > -1) {
                    //     indexContainer.index = selectBox.selectedIndex;

                    // }
                    if (Configuration[indexContext].index > 0) {
                        Configuration[indexContext].index -= 1;

                    } else if (Configuration[indexContext].index <= 0) {
                        // if index is already 0, then user is scrolling up out of the 
                        // select box into the filter field
                        // filterField.tabIndex = '-1';
                        selectBox.blur();
                        filterField.focus()
                        // for consistency with selectBox.selectedIndex == -1 when no option selected
                        // make a scroll up from 0 index to be -1 index.  it is possible that user will hit 
                        // arrow up multiple times at this point, so set index as an assignment and not a decrement here
                        Configuration[indexContext].index = -1;
                    }

                }
                // on arrowdown, increment the index and ensure select box focus as long as 
                // we ensure we are not incrementing beyond the last index

                if (e.keyCode == 40 && Configuration[indexContext].index < Configuration[indexContext].lastIndex) {
                    // if (selectBox.selectedIndex > -1) {
                    //     
                    //e.preventDefault();
                    // e.stopImmediatePropagation();
                    // }
                    // 
                    selectBox.focus();

                    Configuration[indexContext].index += 1;


                } else if (e.keyCode == 40) {
                    //e.preventDefault();

                    Configuration[indexContext].index = Configuration[indexContext].lastIndex
                    selectBox.focus();
                }
                // update selectedIndex on select box, since we have overridden much default selectbox behavior
                // and are manually tracking an index.  

                selectBox.selectedIndex = Configuration[indexContext].index;
                console.log('in arrow listner, selectedIndex ', selectBox.selectedIndex);

            }

        });



    },
    // console.log('elemContainer: ', elemContainer);
    // elemContainer['form'].addEventListener('keydown', function(e) {
    //     console.log('make arrow listener')
    //     console.log('arrow control  ', `\nselected i - ${e.target.classList}: ${elemContainer.selectBox.selectedIndex}`, `\nindex ${e.target.classList}: ${indexContainer.index}`);
    //     // 38 is arrowup, 40 is arrowdown
    //     if (e.keyCode == 38 || e.keyCode == 40) {
    //         console.log(elemContainer['elem']);
    //         console.log(e.keyCode);

    //         e.preventDefault();

    //         //e.preventDefault();
    //         //elemContainer.selectBox.selectedIndex = indexContainer.index;

    //         indexContainer.index = elemContainer.selectBox.selectedIndex;


    //         //elemContainer.selectBox.selectedIndex = indexContainer.index;
    //         // console.log('index now is: ', index);
    //         // use preventDefault to override default integration of up/down arrows with select box
    //         // which causes skipping or bumping of the scroll that does not 
    //         // integrate well with the other customizations/features coded here
    //         // for example, without this override

    //         // ensure focus within select box
    //         elemContainer['selectBox'].focus();

    //         // on arrowup, decrement index potentially until 0th index
    //         if (e.keyCode == 38) {
    //             if (indexContainer.index > 0) {
    //                 indexContainer.index -= 1;

    //             } else if (indexContainer.index == 0) {
    //                 // if index is already 0, then user is scrolling up out of the 
    //                 // select box into the filter field
    //                 elemContainer['filterField'].tabIndex = '-1';
    //                 elemContainer['selectBox'].blur();
    //                 elemContainer['filterField'].focus()
    //                 // for consistency with selectBox.selectedIndex == -1 when no option selected
    //                 // make a scroll up from 0 index to be -1 index.  it is possible that user will hit 
    //                 // arrow up multiple times at this point, so set index as an assignment and not a decrement here
    //                 indexContainer.index = -1;
    //             }
    //         }
    //         // on arrowdown, increment the index and ensure select box focus as long as 
    //         // we ensure we are not incrementing beyond the last index
    //         if (e.keyCode == 40 && indexContainer.index < indexContainer.lastIndex) {
    //             console.log('adding')
    //             indexContainer.index += 1;
    //             //elemContainer['selectBox'].focus();

    //         }
    //         // update selectedIndex on select box, since we have overridden much default selectbox behavior
    //         // and are manually tracking an index.  
    //         //if (indexContainer.index > -1) {
    //         //e.preventDefault();

    //         //}


    //     }

    //     elemContainer['selectBox'].selectedIndex = indexContainer.index;

    // });


    makeComparisonsSection() {

        // ensure that form for comparison currency selection config does not submit, i.e. when enter pressed. 
        // form submits refresh page and this is undesirable and unnecessary for user experience
        this.stopFormSubmit(App.querySelectorByClass(this.COMPARISONS_FORM_CLASS));
        //let filterField = App.querySelectorByClass(this.COMPARISONS_FILTER_FIELD_CLASS);
        let filterField = App.querySelectorByClass('Configure-comparisonsFilter');

        let filteredResult;
        filterField.value = '';
        filteredResult = Object.keys(currencyData.rates);
        let selectBox = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS);

        this.makeComparisonsList(filteredResult);

        Configuration.makeSelectFilter(filterField, Configuration.COMPARISONS_FORM_CLASS, filteredResult, Configuration.makeComparisonsList)
    },

    makeComparisonsList(filteredResult) {
        let filterField = App.querySelectorByClass(Configuration.COMPARISONS_FILTER_FIELD_CLASS);
        let selectBox = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS);

        if (filteredResult.includes(currencyData.convertFrom)) {
            filteredResult.splice(filteredResult.indexOf(currencyData.convertFrom), 1);
        }
        selectBox.innerHTML = '';


        selectBox.addEventListener('mouseenter', function(e) {
            selectBox.focus();
        });

        selectBox.addEventListener('mouseleave', function(e) {
            selectBox.blur();
        });

        Configuration.COMPARISON.index = -1
        Configuration.COMPARISON.lastIndex = filteredResult.length - 1;
        let comparisonConfig = App.querySelectorByClass(Configuration.COMPARISONS_FORM_CLASS);
        for (let currency of filteredResult) {

            let option = document.createElement('option');
            option.tabIndex = 0;
            option.innerHTML = `<span style='display:inline-block;width:3em;'>${currency}</span>: ${currencyData.fullNames[currency]}`;
            option.dataset.code = currency;
            option.classList.add(Configuration.COMPARISON_OPTION_CLASS);
            if (currencyData.convertTo.includes(currency)) {

                option.classList.add(Configuration.SELECTED_COMPARISON_CLASS);
            }
            Configuration.makeMouseInListener('Configure-comparisonOption--hovered', { option: option, selectBox: selectBox }, { index: Configuration.COMPARISON.index });
            Configuration.makeMouseOutListener('Configure-comparisonOption--hovered', { option: option, selectBox: selectBox }, { index: Configuration.COMPARISON.index });



            option.addEventListener('click', function(e) {
                Configuration.changeComparisonSelections(e.target);
            });
            selectBox.appendChild(option);
            // always make sure scroll window is presenting at the top of the options list (first item) fully visible at top of element.
        }
        selectBox.options[0].scrollIntoView();
        Configuration.makeEnterOnSelectBoxListener({ form: comparisonConfig, filterField: filterField, selectBox: selectBox }, { index: Configuration.COMPARISON.index, lastIndex: Configuration.COMPARISON.lastIndex });

        Configuration.showComparisons();
    },

    changeComparisonSelections(option) {

        let currency = option.dataset.code;

        if (option.classList.contains(Configuration.SELECTED_COMPARISON_CLASS)) {

            option.classList.remove(Configuration.SELECTED_COMPARISON_CLASS);
            let ix = currencyData.convertTo.indexOf(currency);
            currencyData.convertTo.splice(ix, 1);
            App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage')

        } else if (currencyData.convertTo.length == 5) {
            App.querySelectorByClass('Header-flashContainer').classList.add('Header-flashMessage')
            App.querySelectorByClass('Header-flashMessage').innerHTML = "<p>SELECT NO MORE THAN 5 COMPARISONS.<br>TO DESELECT A SELECTED CHOICE, i.e click it.</p>";
        } else if (currencyData.convertTo.length < 5) {

            App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage')

            option.classList.toggle(Configuration.SELECTED_COMPARISON_CLASS);
            currencyData.convertTo.push(currency);
        }



        App.querySelectorByClass('Header-flashContainer').addEventListener('animationend', () => {
            App.querySelectorByClass('Header-flashContainer').innerHTML = '';
            App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage');
        });
        App.render();
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
        // sort conversion currencies by alpha order.  previously are in order 
        currencyData.convertTo.sort();
        for (let currency of currencyData.convertTo) {
            let p = document.createElement('p');
            p.textContent = currency;
            p.classList.add('Configure-comparisonParagraph')
            p.dataset.tooltipTitle = currencyData.fullNames[currency];
            div.appendChild(p);
        }
    },
    changeBase(option) {
        let val = option.dataset.code;

        let select = App.querySelectorByClass(this.BASE_SELECT_BOX_CLASS);
        App.querySelectorByClass('Configure-headerBaseValue').innerHTML = val;
        currencyData.convertFrom = val;
        // when base currency is changed, if the base currency code is present in the list to convertFrom
        // remove it from convertFrom, so that the base currency is not occupying a comparison slot
        if (currencyData.convertTo.includes(currencyData.convertFrom)) {
            currencyData.convertTo.splice(currencyData.convertTo.indexOf(currencyData.convertFrom), 1);
        }
        CurrencyFetch.APIData(baseURL);

        let thing = App.querySelectorByClass('Configure-showConfiguration');
        thing.classList.add('Configure-configurationCurrencyAnimate');
        thing.addEventListener('animationend', () => {
            thing.classList.remove('Configure-configurationCurrencyAnimate');
        });
    },

}

Configuration.Listeners = {

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
        // convertFrom rate will be 1, all convertTo rates will be proportional to convertFrom, 
        // convertFrom and convertTo currencies are combined in array to find the highest proportional rate of this group
        let arr = [...currencyData.convertTo, currencyData.convertFrom]
        // find the max rate value.
        for (let key of arr) {

            if (currencyData.rates[key] > max) max = currencyData.rates[key]
        }
        // get the ration of 100% (height) to max, utilized to size charts
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
        // chart with highest rate value * ration will equal 100% (height)
        // all others will appear proportional to this
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
                barChart.style.height = '90%';
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