const ConfigurationComparisonSection = {
    // classes for container for flash messages displayed in header and for the add animation class for the flashmessage
    HEADER_FLASH_CONTAINER: 'Header-flashContainer',
    HEADER_FLASH_MESSAGE: 'Header-flashMessage',
    // changeComparisons is called on the following events on options in comparision select list: click or enter key pressed 
    // adds or splices to comparison list accordingly, or displays flash message if user has 5 (max) comparisons in comparison list and tries to select a 6th
    changeComparisons(option) {
        let currency = option.dataset.code;
        // options that are selections included in the comparisons currency list will be removed from convertTo list when clicked or enter key pressed on them
        // toggling the COMPARISONS_OPTION_SELECTED_CLASS is not necessary because CurrencyFetch.APIData() will be called, which will re-render() and re-set necessary classes at that time
        if (option.classList.contains(Configuration.COMPARISONS_OPTION_SELECTED_CLASS)) {
            let ix = currencyData.convertTo.indexOf(currency);
            currencyData.convertTo.splice(ix, 1);
            App.querySelectorByClass(Configuration.HEADER_FLASH_CONTAINER).classList.remove(Configuration.HEADER_FLASH_MESSAGE)

        } else if (currencyData.convertTo.length == 5) {
            // if the convertTo list length is 5 and user has entered this method, do not add to the list but display warning message that 5 exist and any can be deselected
            App.querySelectorByClass(Configuration.HEADER_FLASH_CONTAINER).classList.add(Configuration.HEADER_FLASH_MESSAGE)
            App.querySelectorByClass(Configuration.HEADER_FLASH_MESSAGE).innerHTML = "<p>SELECT NO MORE THAN 5 COMPARISONS.<br>TO DESELECT A SELECTED CHOICE, i.e click it.</p>";
        } else if (currencyData.convertTo.length < 5) {
            // else, we know the class is not selected or would have entered the first if branch and we want to add it to the selected/convertTo group
            currencyData.convertTo.push(currency);
            App.querySelectorByClass(Configuration.HEADER_FLASH_CONTAINER).classList.remove(Configuration.HEADER_FLASH_MESSAGE)

        }
        // get rid of flash message contents on animation end
        App.querySelectorByClass(Configuration.HEADER_FLASH_CONTAINER).addEventListener('animationend', () => {
            App.querySelectorByClass(Configuration.HEADER_FLASH_CONTAINER).innerHTML = '';
            App.querySelectorByClass(Configuration.HEADER_FLASH_CONTAINER).classList.remove(Configuration.HEADER_FLASH_MESSAGE);
        });



        Configuration.flashNewSelectionChanges();
        CurrencyFetch.APIData(baseURL);
    }
}


export { ConfigurationComparisonSection };