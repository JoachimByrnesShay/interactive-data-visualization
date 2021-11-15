const ConfigurationComparisonSection = {


    changeComparisons(option) {

        let currency = option.dataset.code;

        if (option.classList.contains(Configuration.COMPARISONS_OPTION_SELECTED_CLASS)) {

            option.classList.remove(Configuration.COMPARISONS_OPTION_SELECTED_CLASS);
            let ix = currencyData.convertTo.indexOf(currency);
            currencyData.convertTo.splice(ix, 1);
            App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage')

        } else if (currencyData.convertTo.length == 5) {
            App.querySelectorByClass('Header-flashContainer').classList.add('Header-flashMessage')
            App.querySelectorByClass('Header-flashMessage').innerHTML = "<p>SELECT NO MORE THAN 5 COMPARISONS.<br>TO DESELECT A SELECTED CHOICE, i.e click it.</p>";
        } else if (currencyData.convertTo.length < 5) {

            App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage')

            option.classList.toggle(Configuration.COMPARISONS_OPTION_SELECTED_CLASS);
            currencyData.convertTo.push(currency);
        }



        App.querySelectorByClass('Header-flashContainer').addEventListener('animationend', () => {
            App.querySelectorByClass('Header-flashContainer').innerHTML = '';
            App.querySelectorByClass('Header-flashContainer').classList.remove('Header-flashMessage');
        });
        CurrencyFetch.APIData(baseURL);
    }
}


export { ConfigurationComparisonSection };