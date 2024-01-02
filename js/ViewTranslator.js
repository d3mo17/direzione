Direzione.ViewTranslator = (function (Utils, Settings) {

    var LANGUAGES = Settings.availableLanguages()

    function ViewTranslator(lang, selectors) {
        this[' selectors'] = selectors
        this.setLanguage(lang)
    }

    ViewTranslator.prototype.setLanguage = function (lang) {
        if (! LANGUAGES.includes(lang)) {
            throw RangeError('Language "' + lang + '" not yet supported. Try one of: ' + LANGUAGES.join(', '))
        }
        Utils.loadTranslationJS('lang/' + lang + '.js', _translate.bind(this))
    }

    function _translate(transObj) {
        Object.keys(this[' selectors']).forEach(function (path) {
            var selector = this[' selectors'][path]
            var elements = document.querySelectorAll(selector);
            var pparts   = path.split('.')
            var translation = pparts.reduce(function (obj, key) { return obj[key] }, transObj)

            elements.forEach(function (elem) {
                elem.innerText = translation
            })
        }, this)
    }

    // Module-API
    return {
        /**
         * Creates an object to manage settings to the Direzione app
         *
         * @static
         * @method   create
         * @memberof "Direzione.ViewTranslator"
         * @param    {String} lang
         * @param    {Array} jsonPathToSelectors
         * @returns  {ViewTranslator}
         */
        create: function (lang, jsonPathToSelectors) {
            return new ViewTranslator(lang, jsonPathToSelectors)
        }
    }
})(Direzione.Utils, Direzione.AppSettings)
