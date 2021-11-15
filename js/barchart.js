// BarChart object provides organization of methods for creating, clearing, and resizing (responsive) barcharts, and associated utility methods
const BarChart = {
    makeVariables() {

        let barChartVariables = {
            // variablize the usage of classes necessary in calling barchart methods
            MAIN_CONTENT_CLASS: 'ChartContent',
            CHART_CONTAINER_CLASS: 'ChartContent-barChartContainer',
            CHART_CLASS: 'ChartContent-barChart',
            CHART_TITLE_CLASS: 'ChartContent-barChartTitle',
            CLEAR_ALL_GRAPHS_CLASS: 'ChartContent--clearCharts',
            // control background text on base chart indicating chart is base
            INDICATE_BASE_TEXT_ON_BASE_CLASS_CHART: 'ChartContent-indicateBase',
            CHART_CONTAINER_IS_BASE_CLASS: 'is-baseChart',
        }

        App.makeCurrentObjectVariables(this, barChartVariables);
    },

    makeAllBarChartDisplay() {
        this.makeVariables();

        let container = App.querySelectorByClass(this.MAIN_CONTENT_CLASS);
        // combine base currency with selection of comparison currencies and create displayable charts for all
        for (let currency of [currencyData.convertFrom, ...currencyData.convertTo]) {
            let chartContainer = document.createElement('div');
            chartContainer.classList.add(this.CHART_CONTAINER_CLASS);
            this.visuallyIndicateChartIsBase(currency, chartContainer);
            let barChart = this.makeBarChart(currency);
            chartContainer.appendChild(barChart);
            container.appendChild(chartContainer);
        }

    },
    // if the chart container is for the base currency chart, add additional css for making this indication on a custom low opacency background
    visuallyIndicateChartIsBase(currency, chartContainer) {

        if (currency == currencyData.convertFrom) {
            let div = document.createElement('div');
            div.classList.add(this.INDICATE_BASE_TEXT_ON_BASE_CLASS_CHART);
            chartContainer.classList.add(this.CHART_CONTAINER_IS_BASE_CLASS);
            div.textContent = 'BASE CURRENCY';
            chartContainer.appendChild(div);

        }
    },
    makeBarChart(currencyCode) {

        let barChart = document.createElement('div');
        barChart.classList.add(this.CHART_CLASS);
        // all bar charts have an associated title consisting of currency code which displays either inside the chart boundaries or offset the end of the chart depending on chart size
        let title = document.createElement('p');
        title.textContent = currencyCode;
        title.classList.add(BarChart.CHART_TITLE_CLASS);
        let modal = Modal.makeModal(currencyCode);

        barChart.append(title, modal);
        // each chart will be given an initial size ratioed vs its peers on a 100% scale with largest currency given 100%, size will be height for wide screens, axis will change to width on small screens
        this.Utility.setInitialSize(barChart, currencyCode);
        //let size = parseInt(barChart.dataset.size);
        // each charts modal is only displayed on chart click
        barChart.onclick = (e) => {
            // e.preventDefault();
            Modal.activateModal(barChart);
        }
        return barChart;
    }

}

BarChart.Utility = {
    MAIN_CONTENT_CLASS: 'ChartContent',

    // use all charts to find max and get the ratio of 100% (height) to max; this will be utilized to size all charts in proportion to eachother
    getSizeRatio() {
        let max = 0;
        // convertFrom rate will be 1 and all comparison rates are compared to/will be proportional to convertFrom, 
        // convertFrom and convertTo currencies are combined in array to find the highest proportional rate of this group
        let arr = [...currencyData.convertTo, currencyData.convertFrom]
        // find the max rate value.
        for (let key of arr) { if (currencyData.rates[key] > max) max = currencyData.rates[key] }
        return 100 / max;
    },
    offsetTitle(barChart, size) {
        let context;
        // pass context in order to select the chart_title for the current barchart
        let title = App.querySelectorByClass(BarChart.CHART_TITLE_CLASS, context = barChart);
        // add utility offset class which will change positioning to absolute in order to be able to place the title outside the chart 
        // and standardizes text color to black for all offset cases to properly contrast with the light blue main content background instead of 
        // vs the chart backgrounds which when not offset alternate white text on purple and black text on light green
        title.classList.add('u-offset');
        // use calc to prepare offset value to be equal to 1em greater than size (in %) of object, ready to use this on style object with javascript
        let titleOffset = `calc(${size} + 1em)`;

        // on large screens, if this title needs to be offset, the title bottom value will be offset from the bottom of chart.  i.e., it will be 1em above the top of the chart
        if (window.innerWidth > 950) {
            title.style.bottom = titleOffset
            // if left value exists, as in case where screen has been resized from small (horizontal charts) to large (vertical charts), unset the left value
            title.style.left = 'unset';

            // on small screens, where we change to horizontal charts, the title will be offset from the left edge of the chart, i.e. it will be 1em to the right of rightmost edge of chart
        } else {
            title.style.left = titleOffset;
            // unset bottom value if it has already been set, because otherwise it will continue toaffect our positioning
            title.style.bottom = 'unset';
        }
    },
    setInitialSize(barChart, currencyCode) {
        let ratio = BarChart.Utility.getSizeRatio();
        // chart with highest rate value * ratio will equal 100% (height)
        // using the chartSize calculation below, this barChart will appear proportional to largest, 1 to 1 if it itself is the largest chart
        let chartSize = `${currencyData.rates[currencyCode] * ratio}%`;
        // if the initial screen size is large, create vertical charts (height), otherwise create horizontal charts (width);
        if (window.innerWidth > 950) {
            barChart.style.height = chartSize;

        } else {
            barChart.style.width = chartSize;
        }
        // all barChart elements have 'data-size' data attribute which records size in percentage
        barChart.setAttribute('data-size', chartSize);
        // offset the chart title if the chart size is less than 8%
        if (parseInt(chartSize) < 8) {
            this.offsetTitle(barChart, chartSize);
        }

    },
    // by default, main is the entire barchart display area (the main element has .ChartContent class)
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
        // immediately remake configuration section so that the show comparisons options immediately reflects that there are no comparisons.
        Configuration.makeConfigurationDisplay();
        // trigger gradual visual disappearance of all barcharts other than the base currency chart via a class with an animation function set
        main.classList.add(BarChart.CLEAR_ALL_GRAPHS_CLASS);
        main.addEventListener('animationend', function(e) {
            main.classList.remove(BarChart.CLEAR_ALL_GRAPHS_CLASS);
            // the elements still exist but are at 0 opacityt at animation end, remove all elements via clearing innerhtml of main and re-render;
            App.clearContents(main);
            App.render();
        });
    },
    // listener for resize of window object is set in App.render() to call the resizeAll method
    resizeAll() {

        let charts = App.querySelectorAllByClass(BarChart.CHART_CLASS);
        // for large screen, set width and height for vertical charts, on small screen re-adjust for horizontal charts
        for (let barChart of charts) {
            let size = barChart.dataset.size;
            if (window.innerWidth <= 950) {
                barChart.style.width = size;
                barChart.style.height = '90%';
            } else {
                barChart.style.height = size;
                barChart.style.width = '7em';
            }
            // offset title from barchart edge if barchart size < 8%;
            if (parseInt(size) < 8) {
                BarChart.Utility.offsetTitle(barChart, size);
            }
        }
    }
}

export { BarChart };