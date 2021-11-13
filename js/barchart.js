// BarChart object provides organization of methods for creating, clearing, and resizing (responsive) barcharts, and associated utility methods
const BarChart = {
    makeVariables() {

        let barChartVariables = {
            // variablize the usage of classes necessary in calling barchart methods
            MAIN_CONTENT_CLASS: 'ChartContent',
            CHART_CONTAINER_CLASS: 'ChartContent-barChartContainer',
            CHART_CLASS: 'ChartContent-barChart',
            CLEAR_ALL_GRAPHS_CLASS: 'ChartContent--clearCharts',
            INDICATE_BASE_TEXT_ON_BASE_CLASS_CHART: 'ChartContent-indicateBase',
            CHART_CONTAINER_IS_BASE_CLASS: 'is-forBaseChart',
        }

        App.makeCurrentObjectVariables(this, barChartVariables);
    },

    makeAllBarChartDisplay() {
        this.makeVariables();

        let container = App.querySelectorByClass(this.MAIN_CONTENT_CLASS);

        //if (currencyData.convertTo.length) {
        for (let currency of [currencyData.convertFrom, ...currencyData.convertTo]) {
            let chartContainer = document.createElement('div');
            chartContainer.classList.add(this.CHART_CONTAINER_CLASS);
            this.visuallyIndicateChartIsBase(currency, chartContainer);
            let barChart = this.makeBarChart(currency);
            chartContainer.appendChild(barChart);
            container.appendChild(chartContainer);
        }
        // if (currencyData.convertTo.length == 0) {
        //     container.style.display = 'block'
        // }
        //}
        if (currencyData.convertTo.length == 0) {
            container.classList.add('justOneGuy');
            // container.style.justifyContent = 'flex-start'
            // container.style.paddingLeft = '3.5em'
        } else {
            // container.style.justifyContent = 'unset';
            // container.style.paddingLeft = 'unset';
            container.classList.remove('justOneGuy');
        }

    },
    visuallyIndicateChartIsBase(currency, chartContainer) {
        let left;
        if (currency == currencyData.convertFrom) {

            let div = document.createElement('div');
            div.classList.add(this.INDICATE_BASE_TEXT_ON_BASE_CLASS_CHART);

            chartContainer.classList.add(this.CHART_CONTAINER_IS_BASE_CLASS);
            div.textContent = 'BASE CURRENCY';
            chartContainer.appendChild(div);
            left = chartContainer.offsetLeft;
            console.log('left ', left);

        }
        // if (currencyData.convertTo.length == 0) {
        // container.style.justifyContent = 'flex-start';
        // }

    },
    makeBarChart(currencyCode) {

        let barChart = document.createElement('div');
        barChart.classList.add(this.CHART_CLASS);

        let title = document.createElement('p');
        title.textContent = currencyCode;
        title.classList.add('ChartContent-barChartTitle');
        title.classList.add('u-bold');
        let modal = Modal.makeModal(currencyCode);

        barChart.append(title, modal);
        barChart.append(modal);
        this.Utility.setInitialSize(barChart, currencyCode);
        let size = parseInt(barChart.dataset.size);
        barChart.onclick = (e) => {
            e.preventDefault();
            Modal.activateModal(barChart);
        }
        return barChart;
    }

}

BarChart.Utility = {
    MAIN_CONTENT_CLASS: 'ChartContent',
    getSizeRatio() {
        let max = 0;
        // convertFrom rate will be 1, all convertTo rates will be proportional to convertFrom, 
        // convertFrom and convertTo currencies are combined in array to find the highest proportional rate of this group
        let arr = [...currencyData.convertTo, currencyData.convertFrom]
        // find the max rate value.
        for (let key of arr) {

            if (currencyData.rates[key] > max) max = currencyData.rates[key]
        }
        // get the ration of 100% (height) to max, utilized to size charts
        return 100 / max;
    },
    offsetTitle(barChart, size) {
        let context;
        let title = App.querySelectorByClass('ChartContent-barChartTitle', context = barChart);
        title.classList.add('u-offset');

        let titleOffset = `calc(${size} + 1em)`;

        title.style.position = 'absolute';
        title.classList.add('U-blackText');
        if (window.innerWidth > 950) {
            title.style.bottom = titleOffset

            title.style.left = 'unset';

        } else {
            title.style.left = titleOffset;
            title.style.bottom = 'unset';
        }
    },
    setInitialSize(barChart, currencyCode) {
        let ratio = BarChart.Utility.getSizeRatio();
        // chart with highest rate value * ration will equal 100% (height)
        // all others will appear proportional to this
        let chartSize = `${currencyData.rates[currencyCode] * ratio}%`;
        if (window.innerWidth > 950) {
            barChart.style.height = chartSize;

        } else barChart.style.width = chartSize;

        barChart.setAttribute('data-size', chartSize);
        if (parseInt(chartSize) < 8) {
            this.offsetTitle(barChart, chartSize);
        }

    },
    getMainContent(main = this.MAIN_CONTENT_CLASS) {

        let content = App.querySelectorByClass(main);
        return content;
    },

    clearConvertToDataValues() {
        currencyData.convertTo = []
    },
    clearCharts() {
        let main = this.getMainContent();
        this.clearConvertToDataValues();
        //Configuration.makeComparisonsSection();
        Configuration.makeConfigurationDisplay();
        main.classList.add(BarChart.CLEAR_ALL_GRAPHS_CLASS);
        main.addEventListener('animationend', function(e) {
            main.classList.remove(BarChart.CLEAR_ALL_GRAPHS_CLASS);
            App.clearContents(main);
            App.render();
        });
    },
    resizeAll() {

        let charts = App.querySelectorAllByClass(BarChart.CHART_CLASS);

        for (let barChart of charts) {
            let size = barChart.dataset.size;
            if (window.innerWidth <= 950) {
                barChart.style.width = size;
                barChart.style.height = '90%';
            } else {
                barChart.style.height = size;
                barChart.style.width = '7em';
            }
            if (parseInt(size) < 8) {
                BarChart.Utility.offsetTitle(barChart, size);
            }
        }
    }
}

export { BarChart };