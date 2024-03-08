Direzione.AppSettings = (function () {

    var LANGUAGES = ['de-DE', 'en-GB']
    var SETTINGS  = ['language', 'communicationID', 'theme']

    /**
     * @class
     * @hideconstructor
     * @global
     * @private
     *
     * @borrows <anonymous>~_toStorage as toStorage
     * @borrows <anonymous>~_fromStorage as fromStorage
     */
    function AppSettings() {
        this.setCommunicationID('refTab1')
        this.setLanguage('de-DE')
        this.setThemeID('blue')
        this.fromStorage()
        this.fromURLParameters()
    }

    AppSettings.prototype = {
        toStorage:   _toStorage,
        fromStorage: _fromStorage,
        fromURLParameters: _fromURLParameters,
        getLanguage: function () { return this.language },
        getCommunicationID: function () { return this.communicationID },
        getThemeID: function () { return this.theme },
        setLanguage: function (lang) {
            if (! LANGUAGES.includes(lang)) {
                throw RangeError('Language "' + lang + '" not yet supported. Try one of: ' + LANGUAGES.join(', '))
            }
            this.language = lang
            return this
        },
        setCommunicationID: function (id) {
            this.communicationID = id
            return this
        },
        setThemeID: function (theme) {
            this.theme = theme
            return this
        }
    }

    /**
     * Puts the settings to the local storage
     *
     * @method  AppSettings#toStorage
     * @public
     */
    function _toStorage() {
        localStorage.setItem('Direzione.AppSettings', JSON.stringify(this))
    }

    /**
     * Fetches the settings from the local storage and applies them to this object
     *
     * @method  AppSettings#fromStorage
     * @public
     */
    function _fromStorage() {
        var obj, settings = localStorage.getItem('Direzione.AppSettings')
        if (settings) {
            obj = JSON.parse(settings)
            Object.keys(obj).forEach(function (key) {
                SETTINGS.includes(key) && (this[key] = obj[key])
            }, this)
        }
    }

    /**
     * Fetches the settings from url parameters given in query and applies them to this object
     *
     * @method  AppSettings#fromURLParameters
     * @public
     */
    function _fromURLParameters() {
        var urlParams = new URLSearchParams(window.location.search)
        Array.from(urlParams.entries()).forEach(function (entry) {
            SETTINGS.includes(entry[0]) && (this[entry[0]] = entry[1])
        }, this)
    }

    // Module-API
    return {
        /**
         * Creates an object to manage settings to the Direzione app
         *
         * @static
         * @method     create
         * @memberof   "Direzione.AppSettings"
         * @returns    {AppSettings}
         */
        create: function () {
            return new AppSettings()
        },
        availableLanguages: function () {
            return JSON.parse(JSON.stringify(LANGUAGES))
        }
    }
})(Direzione.Utils)
