const ConfigurationBaseSection = {

    baseHeadingDynamicControl() {

        let baseHeaderSpan = App.querySelectorByClass(Configuration.BASE_HEADER_SPAN_CONFIG_VAL);
        baseHeaderSpan.innerHTML = currencyData.convertFrom;
        // a custom tooltip is used for the element and the css :hover::after effect employs a dataset attribute rather than title.  this avoids the combo of default behavior occurring alongside of custom behavior with use of title
        baseHeaderSpan.dataset.tooltipTitle = currencyData.fullNames[currencyData.convertFrom];

        // animation class flashes element briefly to draw user attention to fact that a base currency value is set
        baseHeaderSpan.classList.add(this.BASE_HEADER_SPAN_CONFIG_VAL_ANIMATE);

        baseHeaderSpan.addEventListener('animationend', () => {
            baseHeaderSpan.classList.remove(this.BASE_HEADER_SPAN_CONFIG_VAL_ANIMATE);
        });
    },



    flashNewBaseChanges() {
        let thing = App.querySelectorByClass('Configure-showConfiguration');
        thing.classList.add('Configure-configurationCurrencyAnimate');
        thing.addEventListener('animationend', () => {
            thing.classList.remove('Configure-configurationCurrencyAnimate');
        });
    },
    changeBase(option) {

        let currency = option.dataset.code;


        App.querySelectorByClass(Configuration.BASE_HEADER_SPAN_CONFIG_VAL).innerHTML = currency;
        currencyData.convertFrom = currency;
        // when base currency is changed, if the base currency code is present in the list to convertFrom
        // remove it from convertFrom, so that the base currency is not additionally occupying a comparison slot
        Configuration.removeBaseCurrencyFromList(currencyData.convertTo);


        Configuration.flashNewBaseChanges();

        CurrencyFetch.APIData(baseURL);


    }
}


export { ConfigurationBaseSection };