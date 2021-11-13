const ConfigurationComparisonSection = {

    // makeComparisonsSection() {

    //     // ensure that form for comparison currency selection config does not submit, i.e. when enter pressed. 
    //     // form submits refresh page and this is undesirable and unnecessary for user experience
    //     this.stopFormSubmit(App.querySelectorByClass(this.COMPARISONS_FORM_CLASS));

    //     this.makeFilterableComparisonsList();
    //     let selectBox = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS);
    //     let filterField = App.querySelectorByClass('Configure-comparisonsFilter');
    //     let form = App.querySelectorByClass(this.COMPARISONS_FORM_CLASS);

    //     Configuration.makeEnterOnSelectBoxListener({ form: form, filterField: filterField, selectBox: selectBox }, 'COMPARISON', Configuration.changeComparisons);
    //     Configuration.makeSelectArrowKeyListener({ form: form, filterField: filterField, selectBox: selectBox }, 'COMPARISON');
    // },
    // makeFilterableComparisonsList() {
    //     let filterField = App.querySelectorByClass(Configuration.COMPARISONS_FILTER_FIELD_CLASS);

    //     let filteredResult;
    //     filterField.focus();
    //     filterField.value = '';
    //     filteredResult = Object.keys(currencyData.rates);
    //     let selectBox = App.querySelectorByClass(Configuration.COMPARISONS_SELECT_BOX_CLASS);
    //     let selectListContext = { selectBox: selectBox, indexContext: 'COMPARISON', scroll: false }    //     Configuration.makeSelectList(filteredResult, selectListContext);
    //     // selectBox.addEventListener('mouseenter', function(e) {
    //     //     selectBox.focus();
    //     // });

    //     // selectBox.addEventListener('mouseleave', function(e) {
    //     //     selectBox.blur();
    //     // });

    //     Configuration.makeSelectFilter(filterField, Configuration.COMPARISONS_FORM_CLASS, filteredResult, Configuration.makeSelectList, selectListContext);
    // },


    changeComparisons(option) {

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
    }
}


export { ConfigurationComparisonSection };