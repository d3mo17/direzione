Direzione.ThemeManager = (function () {

    var BASE_PATH = 'themes/'

    function _addStyleTag(path) {
        var style = document.createElement('link')
        style.setAttribute('rel', 'stylesheet')
        style.setAttribute('href', path)

        document.head.appendChild(style)
    }

    function _addCommonStyles(themeID) {
        _addStyleTag(BASE_PATH + themeID + '/theme.css')
        _addStyleTag(BASE_PATH + themeID + '/settings.css')
        _addStyleTag(BASE_PATH + themeID + '/history.css')
    }

    function _removeIncludedCSS() {
        document.querySelectorAll('link[rel="stylesheet"]')
            .forEach(function (el) { el.parentNode.removeChild(el) } )
    }

    // Module-API
    return {
        changeThemeCSSForControlBoard: function (themeID) {
            _removeIncludedCSS()
            _addCommonStyles(themeID)
            _addStyleTag(BASE_PATH + themeID + '/scoreboard_gui.css')
        },
        changeThemeCSSForRemoteBoard: function (themeID) {
            _removeIncludedCSS()
            _addCommonStyles(themeID)
            _addStyleTag(BASE_PATH + themeID + '/remote_scoreboard.css')
        }
    }
})()