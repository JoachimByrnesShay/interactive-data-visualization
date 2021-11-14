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
            return ['Configuration.COMPARISONS.index', 'Configuration.COMPARISONS.lastIndex'];
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
        //Configuration.makeBaseSection();

        //Configuration.makeComparisonsSection();
        //this.stopFormSubmit(App.querySelectorByClass(this.BASE_FORM_CLASS));

        // headerBaseValue is class for span in h2.Configure-baseHeading and displays, reflects dynamic changes in, and animates in some contexts the configured current base currency value

        // make and display the filterable (by text input field) list of available base currencies for user to select one base currency
        //this.makeFilterableBaseList();

        let baseContext = {
            form: this.BASE_FORM_CLASS,
            selectBoxClass: Configuration.BASE_SELECT_BOX_CLASS, //
            filterField: Configuration.BASE_FILTER_FIELD_CLASS

        };
        let comparisonsContext = {
            form: this.COMPARISONS_FORM_CLASS,
            selectBoxClass: Configuration.COMPARISONS_SELECT_BOX_CLASS,
            filterField: Configuration.COMPARISONS_FILTER_FIELD_CLASS
        };
        let indexContext;
        Configuration.makeSection(baseContext, 'BASE', Configuration.changeBase, true);
        Configuration.makeSection(comparisonsContext, 'COMPARISON', Configuration.changeComparisons, false);
        Configuration.showSelectedOptions();
    },
    makeSection(sectionContext, indexContext, changeFunction, scroll) {
        this.stopFormSubmit(App.querySelectorByClass(sectionContext.form));

        // headerBaseValue is class for span in h2.Configure-baseHeading and displays, reflects dynamic changes in, and animates in some contexts the configured current base currency value
        if (indexContext == 'BASE') {
            Configuration.baseHeadingDynamicControl();
        }
        //console.log('in make section, sectioncontext is: ', sectionContext)
        this.makeFilterableList(sectionContext, indexContext, scroll);
        // make and display the filterable (by text input field) list of available base currencies for user to select one base currency
        //this.makeFilterableBaseList();
        let selectBox = App.querySelectorByClass(sectionContext.selectBoxClass);
        let filterField = App.querySelectorByClass(sectionContext.filterField);

        //let selectBox = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS);
        let form = App.querySelectorByClass(sectionContext.form);
        //Configuration.makeEnterOnSelectBoxListener({ form: sectionContext.form, filterField: sectionContext.filterField, selectBox: sectionContext.selectBox }, indexContext, changeFunction);
        Configuration.makeEnterOnSelectBoxListener(sectionContext, indexContext, changeFunction);
        // put top of the options constituting the select box content in view
        //Configuration.makeSelectArrowKeyListener({ form: form, filterField: filterField, selectBox: selectBox }, 'BASE');
        Configuration.makeSelectArrowKeyListener(sectionContext, indexContext);
    },
    makeFilterableList(sectionContext, indexContext, scroll) {
        let filterField = App.querySelectorByClass(sectionContext.filterField);
        let filteredResult;
        //ensure filter is always focused on renders, sought after behavior for transition from scrolling back up options list with arrowup above option at index 0, for refresh, and for re-rendering by changing base via mouseclick or enter on a selected/scrolled-to optionarrowup throw list
        filterField.focus();
        filterField.value = '';
        filteredResult = Object.keys(currencyData.rates);
        let selectBox = App.querySelectorByClass(sectionContext.selectBoxClass)
        let selectListContext = { selectBoxClass: sectionContext.selectBoxClass, indexContext: indexContext, scroll: scroll };
        // console.log('in filterable list, selectbox class is ', selectListContext);
        Configuration.makeSelectList(filteredResult, selectListContext);
        Configuration.makeSelectFilter(filterField, Configuration.BASE_FORM_CLASS_NAME, filteredResult, Configuration.makeSelectList, selectListContext);
    },
    removeBaseCurrencyFromList(list) {
        if (list.includes(currencyData.convertFrom)) {
            let baseIndex = list.indexOf(currencyData.convertFrom);
            list.splice(baseIndex, 1);
        }

    },
    makeSelectList(filteredResult, context) {
        const { selectBoxClass, indexContext, scroll } = context;
        //console.log('in makeselectlist, context is ', context);
        Configuration.removeBaseCurrencyFromList(filteredResult);
        // console.log('in make select list, selectbox is: ', selectBoxClass, '  and indexContext is ', context.indexContext);
        let selectBox = App.querySelectorByClass(selectBoxClass);
        // console.log(selectBox);
        selectBox.innerHTML = ''
        Configuration.constructSelectOptions(filteredResult, selectBoxClass, indexContext);
        if (scroll) {
            selectBox.scroll({ top: 0, behavior: 'smooth' });
        }
    },
    constructSelectOptions(filteredResult, selectBoxClass, indexContext) {
        let selectBox = App.querySelectorByClass(selectBoxClass);
        Configuration[indexContext].index = -1;
        selectBox.selectedIndex = -1;
        //Configuration.BASE.lastIndex = filteredResult.length - 1;
        // console.log('baseselectoptions length', filteredResult.length)
        Configuration[indexContext].lastIndex = filteredResult.length - 1;
        for (let currency of filteredResult) {

            let option = document.createElement('option');
            selectBox.appendChild(option);
            //option.tabIndex = -1;
            // every option in select will display currency code and the currency's full name
            option.innerHTML = `<span style='display:inline-block;width:3em;'>${currency}:</span>${currencyData.fullNames[currency]}`;
            // usage of dataset to facilitate transfer of data regarding selected option to other methods
            option.dataset['code'] = currency;
            let setChangeFunction;

            if (indexContext == 'BASE') {
                option.classList.add(Configuration.BASE_OPTION_CLASS);
                setChangeFunction = Configuration.changeBase;
            } else {
                option.classList.add(Configuration.COMPARISON_OPTION_CLASS);
                if (currencyData.convertTo.includes(currency)) {

                    option.classList.add(Configuration.SELECTED_COMPARISON_CLASS);
                }
                setChangeFunction = Configuration.changeComparisons;
            }

            //Configuration.BASE.index = -1;
            Configuration.makeOptionListeners({ option: option, selectBox: selectBox }, indexContext, setChangeFunction);
        }


    },

    makeSelectFilter(filterField, formClass, filteredResult, listChangeFunction, listChangeFunctionContext) {
        // console.log('list change function is: ', listChangeFunction);
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
                listChangeFunction(newlyFilteredResult, listChangeFunctionContext);
                // }
            }
        });
    },


    makeOptionListeners(elemContainer, indexContext, changeSelection) {
        //console.log(changeSelection);

        Configuration.makeMouseInOptionListener(elemContainer, indexContext);
        Configuration.makeMouseOutOptionListener(elemContainer, indexContext);
        // Configuration.makeMouseInAndOutListeners(hoverClass, elemContainer, indexContainer);
        elemContainer.option.addEventListener('click', function(e) {
            // console.log('on this option')
            console.log('in makeoptionlistejners, here is changeSelection function: ', changeSelection)
            console.log('here is optoinr ', elemContainer.option);
            changeSelection(elemContainer.option);
        });

    },

    makeMouseInOptionListener(elemContainer, indexContext) {

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

            // keep the index up to date with the selectBox selectedIndex
            Configuration[indexContext]['index'] = selectBox.selectedIndex;
            // console.log('indexcontexnt is ', Configuration[indexContext]['index'])

        });



    },
    makeMouseOutOptionListener(elemContainer, indexContext) {
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


    makeEnterOnSelectBoxListener(elemContainer, indexContext, changer) {


        let selectBox = App.querySelectorByClass(elemContainer.selectBoxClass);
        //let selectBox = elemContainer.selectBox;
        selectBox.addEventListener('keydown', function(e) {


            // test for enter key and presence of an index value
            // we update base currency value on enter key press on option just as for mouseclick on option
            if (e.keyCode == 13 && selectBox.selectedIndex > -1) {

                console.log('changer is ', changer);
                Configuration[indexContext].index = selectBox.selectedIndex;
                let option = selectBox.options[Configuration[indexContext].index];
                console.log('index is ', Configuration[indexContext].index);
                console.log('option is ', option);
                changer(option);
                // if (indexContext == 'COMPARISON') {
                //     Configuration.changeComparisons(elemContainer.selectBox.options[Configuration[indexContext].index]);
                // } else {
                //     Configuration.changeBase(elemContainer.selectBox.options[Configuration[indexContext].index]);
                // }
                //lert(indexContainer.index);
                //console.log('configuration base index is: ', Configuration.BASE.index);



                //App.render();
            }
            // }
        });



    },

    makeSelectArrowKeyListener(elemContainer, indexContext) {

        // console.log('index container: ')
        let form = App.querySelectorByClass(elemContainer.form);
        let selectBox = App.querySelectorByClass(elemContainer.selectBoxClass);
        let filterField = App.querySelectorByClass(elemContainer.filterField);
        form.addEventListener('keydown', function(e) {
            e.target.focus();
            // console.log(Configuration[indexContext].index);

            // console.log('index: ', Configuration[indexContext].lastIndex)
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
                // console.log('in arrow listner, selectedIndex ', selectBox.selectedIndex);
                // console.log(Configuration[indexContext].index, Configuration[indexContext].lastIndex)
            }

        });




    },
    showSelectedOptions() {
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





}

Configuration.Listeners = {

}

Configuration.ComparisonSection = {

}




export { Configuration };