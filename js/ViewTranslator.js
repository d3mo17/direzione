Direzione.ViewTranslator = (function (Utils, Settings) {

    var LANGUAGES = Settings.availableLanguages()

    function ViewTranslator(lang, selectors) {
        var deferred = {resolve: null, reject: null}
        this[' selectors'] = selectors
        this.setLanguage(lang)

        this[' deferred'] = deferred
        this[' deferred'].promise = new Promise(function (resolve, reject) {
            deferred.resolve = resolve
            deferred.reject  = reject
        })
    }

    ViewTranslator.prototype.getTranslations = async function() {
        this[' translations'] = await this[' deferred'].promise
        return JSON.parse(JSON.stringify(this[' translations']))
    }

    ViewTranslator.prototype.setLanguage = function (lang) {
        if (! LANGUAGES.includes(lang)) {
            throw RangeError('Language "' + lang + '" not yet supported. Try one of: ' + LANGUAGES.join(', '))
        }
        Utils.loadTranslationJS('lang/' + lang + '.js', _translate.bind(this))
    }

    function _walkDown(value, concatKeys, translationObj) {
        if (typeof value === "string") {
            var pparts      = concatKeys.split('.')
            var translation = pparts.reduce(function (obj, key) { return obj[key] }, translationObj)

            document.querySelectorAll(value).forEach(function (elem) {
                elem.innerText = translation
            })

            return
        }

        if (typeof value === "object" && value !== null && !Array.isArray(value))
            Object.keys(value).forEach(function (key) {
                _walkDown(value[key], concatKeys + '.' + key, translationObj)
            })
    }

    function _translate(transObj) {
        Object.keys(this[' selectors']).forEach(function (key) {
            _walkDown(this[' selectors'][key], key, transObj)
        }, this)
        this[' deferred'].resolve(transObj)
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
