const ConfigurationBaseSection = {

    baseHeadingDynamicControl() {
        App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).innerHTML = currencyData.convertFrom;
        // a custom tooltip is used for the element and the css :hover::after effect employs a dataset attribute rather than title.  this avoids the combo of default behavior occurring alongside of custom behavior with use of title
        App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).dataset.tooltipTitle = currencyData.fullNames[currencyData.convertFrom];

        // animation class flashes element briefly to draw user attention to fact that a base currency value is set
        App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).classList.add(this.CONFIGURATION_HEADER_BASE_VALUE_ANIMATE);

        App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).addEventListener('animationend', () => {
            App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).classList.remove(this.CONFIGURATION_HEADER_BASE_VALUE_ANIMATE);
        });
    },
    // makeBaseSection() {
    //     // ensure that form for baseCurrency config does not submit, i.e. when enter pressed. 
    //     // form submits refresh page and this is undesirable and unnecessary for user experience
    //     this.stopFormSubmit(App.querySelectorByClass(this.BASE_FORM_CLASS));

    //     // headerBaseValue is class for span in h2.Configure-baseHeading and displays, reflects dynamic changes in, and animates in some contexts the configured current base currency value
    //     App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).innerHTML = currencyData.convertFrom;
    //     // a custom tooltip is used for the element and the css :hover::after effect employs a dataset attribute rather than title.  this avoids the combo of default behavior occurring alongside of custom behavior with use of title
    //     App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).dataset.tooltipTitle = currencyData.fullNames[currencyData.convertFrom];

    //     // animation class flashes element briefly to draw user attention to fact that a base currency value is set
    //     App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).classList.add(this.CONFIGURATION_HEADER_BASE_VALUE_ANIMATE);

    //     App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).addEventListener('animationend', () => {
    //         App.querySelectorByClass(this.CONFIGURATION_HEADER_BASE_VALUE_SPAN_CLASS).classList.remove(this.CONFIGURATION_HEADER_BASE_VALUE_ANIMATE);
    //     });
    //     // make and display the filterable (by text input field) list of available base currencies for user to select one base currency
    //     this.makeFilterableBaseList();
    //     let selectBox = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS);
    //     let filterField = App.querySelectorByClass(Configuration.BASE_FILTER_FIELD_CLASS);

    //     //let selectBox = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS);
    //     let form = App.querySelectorByClass(Configuration.BASE_FORM_CLASS);
    //     Configuration.makeEnterOnSelectBoxListener({ form: form, filterField: filterField, selectBox: selectBox }, 'BASE', Configuration.changeBase);
    //     // put top of the options constituting the select box content in view
    //     Configuration.makeSelectArrowKeyListener({ form: form, filterField: filterField, selectBox: selectBox }, 'BASE');
    // },

    // makeFilterableBaseList() {
    //     let filterField = App.querySelectorByClass(Configuration.BASE_FILTER_FIELD_CLASS);
    //     let filteredResult;
    //     //ensure filter is always focused on renders, sought after behavior for transition from scrolling back up options list with arrowup above option at index 0, for refresh, and for re-rendering by changing base via mouseclick or enter on a selected/scrolled-to optionarrowup throw list
    //     filterField.focus();
    //     filterField.value = '';
    //     // a list of currency rate codes (the keys in currencyData.rates).  
    //     // without user filter input, on initialization the list will include all currency rates, though makeBaseList will omit the currently selected base currency from the list
    //     filteredResult = Object.keys(currencyData.rates);
    //     let selectBox = App.querySelectorByClass(Configuration.BASE_SELECT_BOX_CLASS);
    //     // due to much work with design/appearance of option elements and integrating mouseclicks and enter key press, up/down arrow usage in select options list,
    //     // where focus and blur are used in other methods to enhance the user interface, explicit usage of focus and blur below maintain the integraity of the intended UI and its responsiveness.
    //     let selectListContext = { selectBox: selectBox, indexContext: 'BASE', scroll: true };
    //     Configuration.makeSelectList(filteredResult, selectListContext);


    //     // make baselist outside of keyup listener so there is a list without keyup
    //     Configuration.makeSelectFilter(filterField, Configuration.BASE_FORM_CLASS_NAME, filteredResult, Configuration.makeSelectList, selectListContext);

    //     // on each keyup event inside the baseFilterField, we filter the list (filteredResult) to only include currency codes which begin with the string which is the value of baseFilterField


    // },


    flashNewBaseChanges() {
        let thing = App.querySelectorByClass('Configure-showConfiguration');
        thing.classList.add('Configure-configurationCurrencyAnimate');
        thing.addEventListener('animationend', () => {
            thing.classList.remove('Configure-configurationCurrencyAnimate');
        });
    },
    changeBase(option) {

        let currency = option.dataset.code;


        App.querySelectorByClass('Configure-headerBaseValue').innerHTML = currency;
        currencyData.convertFrom = currency;
        // when base currency is changed, if the base currency code is present in the list to convertFrom
        // remove it from convertFrom, so that the base currency is not occupying a comparison slot
        Configuration.removeBaseCurrencyFromList(currencyData.convertTo);


        Configuration.flashNewBaseChanges();
        App.render();

    }
}


export { ConfigurationBaseSection };