// specialized methods relating to base selection 
const ConfigurationBaseSection = {
    CURRENT_ALL_CONFIG_SHOW_CLASS: 'Configure-showCurrentConfiguration',
    CURRENT_ALL_CONFIG_SHOW_ANIMATE_CLASS: 'Configure-showCurrentConfigurationAnimate',
    // method for dynamically updating a display of convertFrom (base currency code) within the span inside h2.Configure-baseHeading  
    // as well as for controlling the class which turns on an animation which calls users's attention to this span on startup 
    baseHeadingDynamicControl() {
        let baseHeaderSpan = App.querySelectorByClass(Configuration.BASE_HEADER_SPAN_CONFIG_VAL);
        baseHeaderSpan.innerHTML = currencyData.convertFrom;
        // a custom tooltip is used for the element and the css :hover::after effect employs a dataset attribute rather than title.  this avoids the combo of default behavior occurring alongside of custom behavior with use of title
        baseHeaderSpan.dataset.tooltipTitle = currencyData.fullNames[currencyData.convertFrom];
    },

    // called on both base header span and the display of both convertTo and convertFrom selections in showcomparisonscontainer on any update to selections
    alertToSelections() {
        let configurationsDisplay = App.querySelectorByClass(Configuration.CURRENT_ALL_CONFIG_SHOW_CLASS);
        let baseHeaderSpan = App.querySelectorByClass(Configuration.BASE_HEADER_SPAN_CONFIG_VAL);
        //animation classes are added to briefly call users attention to the currently configured settings, i.e. current base currency and current comparison currencies
        baseHeaderSpan.classList.add(Configuration.BASE_HEADER_SPAN_CONFIG_VAL_ANIMATE);
        configurationsDisplay.classList.add(Configuration.CURRENT_ALL_CONFIG_SHOW_ANIMATE_CLASS);
        baseHeaderSpan.addEventListener('animationend', () => {
            baseHeaderSpan.classList.remove(Configuration.BASE_HEADER_SPAN_CONFIG_VAL_ANIMATE);
        });

        configurationsDisplay.addEventListener('animationend', () => {
            configurationsDisplay.classList.remove(Configuration.CURRENT_ALL_CONFIG_SHOW_ANIMATE_CLASS);
        });
    },

    changeBase(option) {
        // retrieve the currency code from the dataset code value of the currently selected option in the base currency select list
        let currency = option.dataset.code;
        // update the base currency code value in the base config h2
        App.querySelectorByClass(Configuration.BASE_HEADER_SPAN_CONFIG_VAL).innerHTML = currency;
        // change the convertFrom value to the currency code of the currently selected option
        currencyData.convertFrom = currency;
        // when base currency is changed, if the base currency code is present in the list to convertFrom
        // remove it from convertFrom, so that the base currency is not additionally occupying a comparison slot
        Configuration.removeBaseCurrencyFromList(currencyData.convertTo);
        // brief animation to call users attention to all currently selected options
        Configuration.alertToSelections();

        // do a new currency fetch when base is changed
        CurrencyFetch.APIData(baseURL);
    }
}

export { ConfigurationBaseSection };