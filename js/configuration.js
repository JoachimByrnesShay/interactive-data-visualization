// Configuration object provides organization of methods for presenting configuration options and controlling their behavior and associted behavior of display in configuration section
const Configuration = {
    // Configuration object provides organization of methods for presenting configuration options and controlling their behavior and associted behavior of display in configuration section
    // due to much work with design/appearance of option elements and integrating mouseclicks and enter key press, up/down arrow usage in select options list,
    //

    makeVariables() {
        // variables to set on Configuration object, further visually organized by associated function
        const baseConfigVars = {
            BASE_SELECT_BOX_CLASS: 'Configure-baseSelectBox',
            BASE_OPTION_CLASS: 'Configure-baseOption',
            BASE_FORM_CLASS: 'Configure-baseForm',
            BASE_FILTER_FIELD_CLASS: 'Configure-baseFilter',
            BASE_HEADER_SPAN_CONFIG_VAL: 'Configure-baseHeadingValue',
            BASE_HEADER_SPAN_CONFIG_VAL_ANIMATE: 'Configure-baseHeadingValueAnimate',
            BASE_SCROLL_LIST_TO_TOP_CLASS: 'Configure-baseListScrollTopIntoView'
        }
        const comparisonsConfigVars = {
            COMPARISONS_OPTION_SELECTED_CLASS: 'is-selectedComparison',
            COMPARISONS_OPTION_CLASS: 'Configure-comparisonOption',
            COMPARISONS_FORM_CLASS: 'Configure-comparisonsForm',
            COMPARISONS_SELECT_BOX_CLASS: 'Configure-comparisonsSelectBox',
            COMPARISONS_FILTER_FIELD_CLASS: 'Configure-comparisonsFilter',
            COMPARISONS_SCROLL_LIST_TO_TOP_CLASS: 'Configure-comparisonsListScrollTopIntoView'
        }
        const currentSettingsVars = {
            CURRENT_BASE_CONFIG_SHOW_CLASS: 'Configure-showBase',
            CURRENT_COMPARISONS_CONFIG_SHOW_CLASS: 'Configure-showComparisons',
            CURRENT_BASE_SHOW_VALUE: 'Configure-baseValue',
            CURRENT_COMPARISON_SHOW_VALUE: 'Configure-comparisonValue',
            CURRENT_CHARTS_CLEAR_CLASS: 'Configure-clearChartsButton',
            CURRENT_CHARTS_CLEAR_PRESSED_CLASS: 'Configure-clearChartsButton--pressed',
        }

        // these manually track index of select list on list scroll behavior
        const indexConfigVars = {
            COMPARISON: { index: -1, lastIndex: -1 },
            BASE: { index: -1, lastIndex: -1 }
        }
        let configVars = Object.assign(baseConfigVars, comparisonsConfigVars, currentSettingsVars, indexConfigVars);
        // use App.makeCurrentObjectVariables() to set up the above variables as variables belonging to current object context, i.e. Configuration
        App.makeCurrentObjectVariables(this, configVars);
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
        let button = App.querySelectorByClass(this.CURRENT_CHARTS_CLEAR_CLASS);
        button.onclick = () => {
            button.classList.add(Configuration.CURRENT_CHARTS_CLEAR_PRESSED_CLASS);
            BarChart.Utility.clearCharts();
            button.addEventListener('animationend', () => {
                button.classList.remove(Configuration.CURRENT_CHARTS_CLEAR_PRESSED_CLASS);
            });
        }
        // make separate contexts for base section and comparisons section, which will be passed as arguments on separate calls to makeSection to create the respective sections
        let baseContext = {
            form: this.BASE_FORM_CLASS,
            selectBoxClass: Configuration.BASE_SELECT_BOX_CLASS,
            filterField: Configuration.BASE_FILTER_FIELD_CLASS,
            scrollClass: Configuration.BASE_SCROLL_LIST_TO_TOP_CLASS


        };
        let comparisonsContext = {
            form: this.COMPARISONS_FORM_CLASS,
            selectBoxClass: Configuration.COMPARISONS_SELECT_BOX_CLASS,
            filterField: Configuration.COMPARISONS_FILTER_FIELD_CLASS,
            scrollClass: Configuration.COMPARISONS_SCROLL_LIST_TO_TOP_CLASS
        };
        let indexContext;
        Configuration.makeSection(baseContext, 'BASE', Configuration.changeBase, true);
        Configuration.makeSection(comparisonsContext, 'COMPARISON', Configuration.changeComparisons, false);
        // displays current selections
        Configuration.showSelectedOptions();
    },
    // based upon arguments, will make base configuration section or comparisons configuration section
    makeSection(sectionContext, indexContext, changeFunction, scroll) {
        // ensure that form for baseCurrency config does not submit, i.e. when enter pressed. 
        // form submits refresh page and this is undesirable and unnecessary for user experience
        this.stopFormSubmit(App.querySelectorByClass(sectionContext.form));

        // headerBaseValue is class for span in h2.Configure-baseHeading and displays, reflects dynamic changes in, and animates in some contexts the configured current base currency value
        if (indexContext == 'BASE') {
            Configuration.baseHeadingDynamicControl();
        }

        // make and display the filterable (by text input field) list of available currencies currencies for user to select
        // indexContext and sectionContext will differentiate appearance and functionality accordingly
        this.makeFilterableList(sectionContext, indexContext, scroll);


        // get the selectBox, filterField, and form for the context (section) required
        let selectBox = App.querySelectorByClass(sectionContext.selectBoxClass);
        console.log(selectBox);
        let filterField = App.querySelectorByClass(sectionContext.filterField);
        let form = App.querySelectorByClass(sectionContext.form);
        let scrollButton = App.querySelectorByClass(sectionContext.scrollClass);

        scrollButton.addEventListener('click', (e) => selectBox.scroll({ top: 0, behavior: 'smooth' }));

        // make enter key and down/up arrow listeners for the select box, pass whichever function necessary as changeFunction to call when hit enter key on select option
        Configuration.makeEnterOnSelectBoxListener(sectionContext, indexContext, changeFunction);
        Configuration.makeSelectArrowKeyListener(sectionContext, indexContext);

    },
    makeFilterableList(sectionContext, indexContext, scroll) {
        let filterField = App.querySelectorByClass(sectionContext.filterField);
        let filteredResult;
        filterField.value = '';

        // without user filter input, on initialization the list will include all currency rates, 
        // though both base select list and comparison select list will omit the currently selected base currency, and will dynamically update this based upon any changes in base currency selection
        filteredResult = Object.keys(currencyData.rates);
        let selectBox = App.querySelectorByClass(sectionContext.selectBoxClass)
        let selectListContext = { selectBoxClass: sectionContext.selectBoxClass, indexContext: indexContext, scroll: scroll };
        // make baselist outside of keyup listener so there is a list without keyup
        Configuration.makeSelectList(filteredResult, selectListContext);
        // on each keyup event inside the baseFilterField, we filter the list (filteredResult) to only include currency codes which begin with the string 
        // which is the value of baseFilterField
        Configuration.makeSelectFilter(filterField, Configuration.BASE_FORM_CLASS_NAME, filteredResult, selectListContext);

    },
    makeSelectFilter(filterField, formClass, filteredResult, selectListContext) {
        // on keyup in the filterfield (text input), continuously recreate the options list based upon the text value in the input field
        let form = App.querySelectorByClass(formClass);
        let newlyFilteredResult;
        filterField.addEventListener('keyup', function(e) {
            // there are  have listeners on the form itself for 38 and 40 where a possible outcome is 
            // navigating back up into filterfield using up arrows to scroll up through selectbox options
            // avoid unnecessary filtering and the additional call to makeBaseList in the event that it is up/down arrow keys detected
            if (e.keyCode != 38 && e.keyCode != 40) {
                // if the filterField value becomes an empty string, such as if user deletes characters by backspace, the filteredResult is reset to all currency codes
                if (filterField.value == '') {
                    newlyFilteredResult = Object.keys(currencyData.rates);
                } else {
                    // create list of currency codes based upon text input in form input field
                    newlyFilteredResult = Object.keys(currencyData.rates).filter(function(elem) {
                        return elem.toLowerCase().startsWith(filterField.value.toLowerCase());

                    });

                }
                // make baselist with filtered base options, based upon above filtered list.
                Configuration.makeSelectList(newlyFilteredResult, selectListContext);
            }
        });
    },
    // prepare list by removing selected base currency from any instance of list passed as argument
    removeBaseCurrencyFromList(list) {
        if (list.includes(currencyData.convertFrom)) {
            let baseIndex = list.indexOf(currencyData.convertFrom);
            list.splice(baseIndex, 1);
        }
    },
    makeSelectList(filteredResult, context) {
        // deconstruct class values from context
        const { selectBoxClass, indexContext, scroll } = context;
        Configuration.removeBaseCurrencyFromList(filteredResult);
        let selectBox = App.querySelectorByClass(selectBoxClass);
        // reset selectbox innerHTML to empty before rebuilding
        selectBox.innerHTML = ''
        // construct all options and append to selectBox
        Configuration.constructSelectOptions(filteredResult, selectBoxClass, indexContext);
        if (scroll) {
            //selectBox.scroll({ top: 0, behavior: 'smooth' });
        }
    },
    constructSelectOptions(filteredResult, selectBoxClass, indexContext) {
        let selectBox = App.querySelectorByClass(selectBoxClass);
        // each time we construct select lists, indices are reset to -1 (no options selected)
        Configuration[indexContext].index = -1;
        selectBox.selectedIndex = -1;
        // there are behavior controls relating to arrowDownkey to scroll down list regarding reaching last option in list, use lastIndex to control this
        Configuration[indexContext].lastIndex = filteredResult.length - 1;
        for (let currency of filteredResult) {

            let option = document.createElement('option');
            selectBox.appendChild(option);
            // every option in select will display currency code and the currency's full name
            option.innerHTML = `<span style='display:inline-block;width:3em;'>${currency}:</span>${currencyData.fullNames[currency]}`;
            // usage of dataset to facilitate transfer of data regarding selected option to other methods
            option.dataset['code'] = currency;
            Configuration.setOptionClassByContext(option, indexContext);
            let setChangeFunction = Configuration.getChangeFunctionByContext(indexContext);

            // make all listeners for individual option, pass setChangeFunction which is called on click or enter on option
            Configuration.makeOptionListeners({ option: option, selectBox: selectBox }, indexContext, setChangeFunction);
        }

    },
    // depending on the type of select list created, appropriate class is assigned to option
    setOptionClassByContext(option, indexContext) {
        let currency = option.dataset.code;
        if (indexContext == 'BASE') {
            option.classList.add(Configuration.BASE_OPTION_CLASS);

        } else {
            option.classList.add(Configuration.COMPARISONS_OPTION_CLASS);
            // if the currency code associated with the option is found in the convertTo list, option gets special styling to indicate it is one of the chosen comparisons
            if (currencyData.convertTo.includes(currency)) {
                option.classList.add(Configuration.COMPARISONS_OPTION_SELECTED_CLASS);
            }
        }
    },
    // return the proper function for handling change of value, according to 'BASE' or 'COMPARISON' context
    getChangeFunctionByContext(indexContext) {
        return indexContext == 'BASE' ? Configuration.changeBase : Configuration.changeComparisons;
    },

    // set all necessary option-related listeners on the option
    makeOptionListeners(elemContainer, indexContext, changeSelectionMethod) {
        // handle mousein and mouseout
        Configuration.makeMouseInOptionListener(elemContainer, indexContext);
        Configuration.makeMouseOutOptionListener(elemContainer, indexContext);
        // on 'click', call the change method and re-render
        elemContainer.option.addEventListener('click', function(e) {
            changeSelectionMethod(elemContainer.option);
            App.render();
        });
    },

    makeMouseInOptionListener(elemContainer, indexContext) {

        let option = elemContainer.option;
        let selectBox = elemContainer.selectBox;

        option.addEventListener('mouseenter', function(e) {
            // a finepoint (!document.hasFocus()), small enhancement for improved appearance on edge case.  on some OS such as linux, if user has multiple programs open in diferent window, 
            // and is using a tiler which splits the screen (as this author does), the select options will lose their styling on hover (if another program is in the foreground, and browser is background),
            // as a result of that the browser will not recognize focus.  !document.hasFocus() improves appearance in this strange edge case
            if (!document.hasFocus()) {
                // on mouseenter, the option is selected 
                option.selected = 'selected';
                option.setAttribute('checked', true);
            } else {
                selectBox.focus();
                option.setAttribute('active', true);
                option.selected = 'selected';
                option.setAttribute('checked', true);
            }

            // keep the index up to date with the selectBox selectedIndex
            Configuration[indexContext]['index'] = selectBox.selectedIndex;
        });



    },
    makeMouseOutOptionListener(elemContainer, indexContext) {
        let option = elemContainer.option;
        let selectBox = elemContainer.selectBox;

        option.addEventListener('mouseleave', function(e) {
            option.setAttribute('active', 'false');
            option.selected = false;
            option.setAttribute('selected', 'false');
            option.setAttribute('checked', false);
            Configuration[indexContext]['index'] = selectBox.selectedIndex;

        });

    },
    callRenderAfterMethod(method) {
        method();
        App.render();
    },

    makeEnterOnSelectBoxListener(elemContainer, indexContext, changer) {
        let selectBox = App.querySelectorByClass(elemContainer.selectBoxClass);

        selectBox.addEventListener('keydown', function(e) {
            // test for enter key and presence of an index value
            // we update base currency value on enter key press on option just as for mouseclick on option
            if (e.keyCode == 13 && selectBox.selectedIndex > -1) {
                Configuration[indexContext].index = selectBox.selectedIndex;
                let option = selectBox.options[Configuration[indexContext].index];
                Configuration.callRenderAfterMethod(changer.bind(this, option));
            }
        });
    },

    makeSelectArrowKeyListener(elemContainer, indexContext) {

        let form = App.querySelectorByClass(elemContainer.form);
        let selectBox = App.querySelectorByClass(elemContainer.selectBoxClass);
        let filterField = App.querySelectorByClass(elemContainer.filterField);
        form.addEventListener('keydown', function(e) {
            e.target.focus();
            // 38 is arrowup, 40 is arrowdown

            if (e.keyCode == 38 || e.keyCode == 40) {
                if (selectBox.selectedIndex > -1) {
                    Configuration[indexContext].index = selectBox.selectedIndex;

                }
                // use preventDefault to override default integration of up/down arrows with select box
                // which causes skipping or bumping of the scroll that does not
                // integrate well with the other customizations / features coded here // for example, without this override
                e.stopImmediatePropagation();
                e.preventDefault(); // ensure focus within select box // on arrowup, decrement index potentially until 0 th index
                if (e.keyCode == 38) {

                    if (Configuration[indexContext].index > 0) {
                        Configuration[indexContext].index -= 1;

                    } else if (Configuration[indexContext].index <= 0) { // if index is already0, then user is scrolling up out of the  // select box into the filter field// filterField.tabIndex = '-1';
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
                // console.log('in arrow listner, selectedIndex ', selectBox.selectedIndex);
                // console.log(Configuration[indexContext].index, Configuration[indexContext].lastIndex)
            }

        });




    },
    showSelectedOptions() {
        let showcaseBase = App.querySelectorByClass(Configuration.CURRENT_BASE_CONFIG_SHOW_CLASS);
        let baseDisplayExists = showcaseBase.querySelector('p');
        if (baseDisplayExists) showcaseBase.removeChild(baseDisplayExists);

        let baseValue = document.createElement('p');
        baseValue.textContent = currencyData.convertFrom;

        baseValue.dataset.tooltipTitle = currencyData.fullNames[currencyData.convertFrom];
        baseValue.classList.add(Configuration.CURRENT_BASE_SHOW_VALUE)
        showcaseBase.appendChild(baseValue);
        let showcaseComparisons = App.querySelectorByClass(Configuration.CURRENT_COMPARISONS_CONFIG_SHOW_CLASS);

        showcaseComparisons.innerHTML = '';
        // sort conversion currencies by alpha order.  previously are in order 
        currencyData.convertTo.sort();
        for (let currency of currencyData.convertTo) {
            let comparison = document.createElement('p');
            comparison.textContent = currency;
            comparison.classList.add(Configuration.CURRENT_COMPARISON_SHOW_VALUE)
            comparison.dataset.tooltipTitle = currencyData.fullNames[currency];
            showcaseComparisons.appendChild(comparison);
        }
    },

}

export { Configuration };