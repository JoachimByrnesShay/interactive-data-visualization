function include(files) {
    for (let file of files) {
        var script = document.createElement('script');
        script.src = 'js/' + file;
        script.type = 'text/javascript';
        script.defer = true;
        document.querySelector('.Page').appendChild(script);
    }
}

const scripts = ['app.js', 'barchart.js', 'main400.js', 'configuration.js', 'modal.js'];
include(scripts);