if (!systemRequirements('chrome 26+ or ff 20+')) {
    function go() {
        window.location = '/system-requirements';
    }
    if (window.location.hostname === 'conversat.io') {
        mixpanel.track('systemRequirementsNotMet', {}, go);
    } else {
        go();
    }
};
