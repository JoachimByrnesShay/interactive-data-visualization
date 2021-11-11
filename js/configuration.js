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
        let selectBox = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS);



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

        Configuration.makeBaseList(filteredResult);

        console.log(Configuration.BASE.index)
        // make baselist outside of keyup listener so there is a list without keyup
        Configuration.makeSelectFilter(filterField, Configuration.BASE_FORM_CLASS_NAME, filteredResult, Configuration.makeBaseList);

        // on each keyup event inside the baseFilterField, we filter the list (filteredResult) to only include currency codes which begin with the string which is the value of baseFilterField
        let baseFormConfig = App.querySelectorByClass(Configuration.BASE_FORM_CLASS);
        Configuration.makeEnterOnSelectBoxListener({ form: baseFormConfig, filterField: filterField, selectBox: selectBox }, 'BASE');
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
                let newlyFilteredResult = Object.keys(currencyData.rates).filter(function(elem) {
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
        //selectBox.options[0].scrollIntoView();
        selectBox.scroll({ top: 0, behavior: 'smooth' });

        Configuration.BASE.index = -1;
        selectBox.selectedIndex = -1;
        //let filterField = querySelectorByClass('BASE_FILTER_FIELD_CLASS');
        filterField.tabIndex = -1;

        //document.querySelectorAll('.Configure-baseSelectBox option')[0].scrollIntoView();
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
            Configuration.makeOptionListeners('Configure-baseOption--hovered', { 'option': option, selectBox: selectBox }, 'BASE');


        }


    },
    makeOptionListeners(hoverClass, elemContainer, indexContext) {

        Configuration.makeMouseInListener(hoverClass, elemContainer, indexContext);
        Configuration.makeMouseOutListener(hoverClass, elemContainer, indexContext);
        // Configuration.makeMouseInAndOutListeners(hoverClass, elemContainer, indexContainer);
        elemContainer['option'].addEventListener('click', function(e) {
            Configuration.changeBase(elemContainer['option']);
        });

    },


    makeMouseInListener(hoverClass, elemContainer, indexContext) {

        let option = elemContainer.option;
        let selectBox = elemContainer.selectBox;

        option.addEventListener('mouseenter', function(e) {



            //e.preventDefault();
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
            console.log('indexcontexnt is ', Configuration[indexContext]['index'])
            // keep the index up to date with the selectBox selectedIndex
            Configuration[indexContext]['index'] = selectBox.selectedIndex;


        });



    },
    makeMouseOutListener(hoverClass, elemContainer, indexContext) {
        let option = elemContainer.option;
        let selectBox = elemContainer.selectBox;

        option.addEventListener('mouseleave', function(e) {
            option.setAttribute('active', 'false');
            option.selected = false;
            //option.classList.remove('Configure-baseOption--hovered');
            option.setAttribute('selected', 'false');
            option.setAttribute('checked', false);
            Configuration[indexContext]['index'] = selectBox.selectedIndex;

        });

    },


    makeEnterOnSelectBoxListener(elemContainer, indexContext) {
        elemContainer.selectBox.addEventListener('keydown', function(e) {



            // test for enter key and presence of an index value
            // we update base currency value on enter key press on option just as for mouseclick on option
            if (e.keyCode == 13 && elemContainer.selectBox.selectedIndex > -1) {
                Configuration[indexContext].index = elemContainer['selectBox'].selectedIndex;
                if (indexContext == 'COMPARISON') {
                    Configuration.changeComparisonSelections(elemContainer.selectBox.options[Configuration[indexContext].index]);
                } else {
                    Configuration.changeBase(elemContainer.selectBox.options[Configuration[indexContext].index]);
                }
                //lert(indexContainer.index);
                //console.log('configuration base index is: ', Configuration.BASE.index);




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

                // use preventDefault to override default integration of up/down arrows with select box
                // which causes skipping or bumping of the scroll that does not 
                // integrate well with the other customizations/features coded here
                // for example, without this override
                e.stopImmediatePropagation();
                e.preventDefault();

                // ensure focus within select box





                // on arrowup, decrement index potentially until 0th index
                if (e.keyCode == 38) {

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
                console.log(Configuration[indexContext].index, Configuration[indexContext].lastIndex)
            }

        });




    },



    makeComparisonsSection() {

        // ensure that form for comparison currency selection config does not submit, i.e. when enter pressed. 
        // form submits refresh page and this is undesirable and unnecessary for user experience
        this.stopFormSubmit(App.querySelectorByClass(this.COMPARISONS_FORM_CLASS));
        //let filterField = App.querySelectorByClass(this.COMPARISONS_FILTER_FIELD_CLASS);
        let filterField = App.querySelectorByClass('Configure-comparisonsFilter');
        let form = App.querySelectorByClass(this.COMPARISONS_FORM_CLASS);
        let filteredResult;
        filterField.value = '';
        filteredResult = Object.keys(currencyData.rates);
        let selectBox = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS);

        this.makeComparisonsList(filteredResult);

        Configuration.makeSelectFilter(filterField, Configuration.COMPARISONS_FORM_CLASS, filteredResult, Configuration.makeComparisonsList);
        Configuration.makeSelectArrowKeyListener({ form: form, filterField: filterField, selectBox: selectBox }, 'COMPARISON');
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
            Configuration.makeMouseInListener('Configure-comparisonOption--hovered', { option: option, selectBox: selectBox }, 'COMPARISON');
            Configuration.makeMouseOutListener('Configure-comparisonOption--hovered', { option: option, selectBox: selectBox }, 'COMPARISON');



            option.addEventListener('click', function(e) {
                Configuration.changeComparisonSelections(e.target);
            });
            selectBox.appendChild(option);
            // always make sure scroll window is presenting at the top of the options list (first item) fully visible at top of element.
        }
        // selectBox.options[0].scrollIntoView();
        Configuration.makeEnterOnSelectBoxListener({ form: comparisonConfig, filterField: filterField, selectBox: selectBox }, 'COMPARISON');

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
        console.log(option);
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

Configuration.ComparisonSection = {

}


Configuration.BaseSection = {

}

export { Configuration };