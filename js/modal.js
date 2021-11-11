// Modal object provides organization of methods for creating modal elements and displaying modals and controlling animation (set and removed by classes)
const Modal = {
    MODAL_CLASS: 'Modal',
    MODAL_IS_DISPLAYED_CLASS: 'is-displayed',
    makeModal(currencyCode) {
        let modal = document.createElement('div');
        // modal by default when created with makeModal have display set to none, for individual modals this will change with activateModal(modal);
        modal.classList.add(this.MODAL_CLASS);
        let descriptionTextParagraph = document.createElement('p');
        let comparisonTextParagraph = document.createElement('p');
        // description text is full name of the current comparison currency for this modal
        descriptionTextParagraph.textContent = currencyData.fullNames[currencyCode];
        // set comparisonTextParagraph content to show comparision of 1 unit of base currency vs the ratioed current comparison currency
        comparisonTextParagraph.textContent = `1${currencyData.convertFrom}==${currencyData.rates[currencyCode]}${currencyCode}`;
        modal.append(descriptionTextParagraph, comparisonTextParagraph);
        return modal;
    },

    /** show modal, call via onClick in html **/
    activateModal(elem) {
        /* select the modal within the ChartContent-barChart element (elem, passed as 'this') which has been clicked */
        let context;
        let modal = App.querySelectorByClass(this.MODAL_CLASS, context = elem)
        // by default, the MODAL_CLASS, unactivated via activateModal has display set to none 
        modal.classList.add(this.MODAL_IS_DISPLAYED_CLASS);

        /* cleanly remove is-displayed state class from modal when animation ends */
        modal.addEventListener("animationend", () => {
            modal.classList.remove(this.MODAL_IS_DISPLAYED_CLASS);
        });

        /* smoothen user experience when animation is not finished and user moves cursor back to bar too quickly (mousing back on too quickly after mousing off after click)*/
        modal.addEventListener('animationcancel', () => {
            modal.classList.remove(this.MODAL_IS_DISPLAYED_CLASS);
        });
    }
}

export { Modal };