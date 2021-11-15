// main app 
const App = {
    // clear contents of the DOM element passed
    clearContents: (elem) => elem.innerHTML = '',

    render: () => {
        // set up configuration display section of the app and display
        Configuration.makeConfigurationDisplay();
        // each call to render clears html of the barcharts area (by default on .ChartContent)
        App.clearContents(BarChart.Utility.getMainContent());
        // create all bar charts and display
        BarChart.makeAllBarChartDisplay();
        // on resized window, barcharts will be resized form vertical to horizontal- conditionally
        window.onresize = BarChart.Utility.resizeAll;
    },
    // make variables within the called currentObject context from the variable name/variable value pairs in the variables object
    // this is called in Configuration. and BarChart. to help the visual encapsulation of the many variables in each, specifically those used to point to html/css classes
    makeCurrentObjectVariables: (currentObject, variables) => {
        for (let varName of Object.keys(variables)) {
            // varName is scoped within currentObject and is called as this.varName inside of the methods of currentObject, e.g. Configuration.SHOW_BASE_CLASS or BarChart.CHART_CLASS
            currentObject[varName] = variables[varName];
        }
    },

    // standardizes get element by querySelector without needing to pass '.', useful as classnames are variablized and used both in querySelectors 
    // which requre '.' in the classstring and classlist add and remove which require no usage of '.' in classstring
    // pass a context in to allow to get element with a certain class inside of any DOM element, not only document (which is default)
    querySelectorByClass: (elemClassName, context = document) => {
        return context.querySelector('.' + elemClassName);
    },
    // same usage as above SelectorByClass, but for All
    // context argument if exists allows to select descendants of a specific DOM node other than document
    querySelectorAllByClass: (elemClassName, context = document) => {
        return context.querySelectorAll('.' + elemClassName);
    }
}

export { App };