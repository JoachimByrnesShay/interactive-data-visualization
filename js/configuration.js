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
        Configuration.makeBaseSection();

        Configuration.makeComparisonsSection();
        Configuration.showSelectedOptions();
    },
    removeBaseCurrencyFromList(list) {
        if (list.includes(currencyData.convertFrom)) {
            let baseIndex = list.indexOf(currencyData.convertFrom);
            list.splice(baseIndex, 1);
        }

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


    makeOptionListeners(elemContainer, indexContext, changeSelection) {
        console.log(changeSelection);
        Configuration.makeMouseInOptionListener(elemContainer, indexContext);
        Configuration.makeMouseOutOptionListener(elemContainer, indexContext);
        // Configuration.makeMouseInAndOutListeners(hoverClass, elemContainer, indexContainer);
        elemContainer.option.addEventListener('click', function(e) {
            console.log('on this option')
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
            console.log('indexcontexnt is ', Configuration[indexContext]['index'])

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
        elemContainer.selectBox.addEventListener('keydown', function(e) {



            // test for enter key and presence of an index value
            // we update base currency value on enter key press on option just as for mouseclick on option
            if (e.keyCode == 13 && elemContainer.selectBox.selectedIndex > -1) {
                Configuration[indexContext].index = elemContainer['selectBox'].selectedIndex;
                let option = elemContainer.selectBox.options[Configuration[indexContext].index];
                changer(option);
                // if (indexContext == 'COMPARISON') {
                //     Configuration.changeComparisons(elemContainer.selectBox.options[Configuration[indexContext].index]);
                // } else {
                //     Configuration.changeBase(elemContainer.selectBox.options[Configuration[indexContext].index]);
                // }
                //lert(indexContainer.index);
                //console.log('configuration base index is: ', Configuration.BASE.index);




            }
            // }
        });



    },

    makeSelectArrowKeyListener(elemContainer, indexContext) {

        console.log('index container: ')
        let form = elemContainer.form;
        let selectBox = elemContainer.selectBox;
        let filterField = elemContainer.filterField;
        form.addEventListener('keydown', function(e) {
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