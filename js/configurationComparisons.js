const ConfigurationComparisonSection = {

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
}


export { ConfigurationComparisonSection };