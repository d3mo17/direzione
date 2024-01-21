Direzione.FightController = (function (Utils) {

    function FightController(fight, translator) {
        this.setFight(fight)
        this[' translator'] = translator
        _registerKeyBoardEvents.call(this)
    }

    FightController.prototype.setFight = function (fight) {
        this[' fight'] = fight
    }

    function _confirmReset() {
        if (confirm(this[' translator'].getTranslations().message['confirm-reset'])) {
            this[' fight'].reset()
        }
    }

    function _confirmFinish() {
        if (confirm(this[' translator'].getTranslations().message['confirm-finish'])) {
            this[' fight'].stop()
        }
    }

    _registerKeyBoardEvents = function () {
        document.addEventListener('keyup', function(event) {
        	this[' keylock'] = false
        }.bind(this))
      	document.addEventListener('keydown', function(event) {
            if (this[' keylock']) return

            var white = this[' fight'].getWhiteOpponent()
            var red   = this[' fight'].getRedOpponent()
            this[' keylock'] = true
            switch (event.code) {
                case 'Escape':      return _confirmReset.call(this)
                case 'Enter':
                case 'Space':       return this[' fight'].startPauseResume()
                case 'ArrowLeft':   return this[' fight'].osaeKomi(Direzione.Fight.SIDE_WHITE)
                case 'ArrowRight':  return this[' fight'].osaeKomi(Direzione.Fight.SIDE_RED)
                // case 'ArrowDown':   return this[' fight'].osaeKomi(Direzione.Fight.SIDE_CENTER)
                case 'ArrowUp':     return this[' fight'].toketa()
                // left warrior
                case 'KeyQ':        return white.addIppon()
                case 'KeyW':        return white.addWazari()
                case 'KeyE':        return white.addShido()
                case 'KeyA':        return white.removeIppon()
                case 'KeyS':        return white.removeWazari()
                case 'KeyD':        return white.removeShido()
                // right warrior
                case 'KeyI':        return red.addIppon()
                case 'KeyO':        return red.addWazari()
                case 'KeyP':        return red.addShido()
                case 'KeyK':        return red.removeIppon()
                case 'KeyL':        return red.removeWazari()
                case 'Semicolon':   return red.removeShido()
            }
        }.bind(this))

        document.getElementById('scoreboardLayout').addEventListener('click', function (evt) {
          var half = evt.target.offsetHeight / 2

          var white = this[' fight'].getWhiteOpponent()
          var red   = this[' fight'].getRedOpponent()
          switch (evt.target) {
            case document.querySelector('.shidoControlWrapper.white .up'):   return white.addShido()
            case document.querySelector('.shidoControlWrapper.white .down'): return white.removeShido()
            case document.querySelector('.shidoControlWrapper.red .up'):     return red.addShido()
            case document.querySelector('.shidoControlWrapper.red .down'):   return red.removeShido()

            case document.querySelector('.scoreControlWrapper.white .down'): return white.removeWazari()
            case document.querySelector('.scoreControlWrapper.red .down'):   return red.removeWazari()

            case document.getElementById('whiteScore'):
              return evt.offsetY < half ? white.addWazari() : white.removeWazari()
            case document.getElementById('redScore'):
              return evt.offsetY < half ? red.addWazari() : red.removeWazari()

            case document.querySelector('img.reset'):
              return _confirmReset.call(this)

            case document.querySelector('img.finish'):
              return _confirmFinish.call(this)

            case document.querySelector('img.toketa'):
              return this[' fight'].toketa()

            case document.querySelector('img.osaekomi-left'):
              return this[' fight'].osaeKomi(Direzione.Fight.SIDE_WHITE)

            case document.querySelector('img.osaekomi-right'):
              return this[' fight'].osaeKomi(Direzione.Fight.SIDE_RED)

            case document.querySelector('#countdown .start'):
              if (this[' fight'].isStopped()) return

              return ! this[' fight'].isRunning() && this[' fight'].startPauseResume()
            case document.querySelector('#countdown .stop'):
              if (this[' fight'].isStopped()) return

              return this[' fight'].isRunning() && this[' fight'].startPauseResume()
          }
        }.bind(this))
    }

    // Module-API
    return {
        /**
         * Creates an object to control current selected fight
         *
         * @static
         * @method     create
         * @memberof   "Direzione.FightController"
         * @returns    {FightController}
         */
        create: function (fight, translationConfig) {
            return new FightController(fight, translationConfig)
        }
    }
})(Direzione.Utils)


Direzione.SettingsController = (function () {

    function SettingsController(appSettings, fightSettings, viewConfig, translator) {
        this[' appSettings']   = appSettings
        this[' fightSettings'] = fightSettings
        this[' translator']    = translator
        _fillForm.call(this, viewConfig)
        _registerUIEvents.call(this)
    }

    function _valueToElem(val, elem) {
        if (elem.tagName === 'INPUT') {
            elem.value = val
        } else if (elem.tagName === 'SELECT') {
            elem.childNodes.forEach(function (option) {
                if (option.value === val) {
                    option.selected = 'selected'
                    return;
                }
            })
        }
    }

    function _registerUIEvents () {
        var appSettings   = this[' appSettings']
        var fightSettings = this[' fightSettings']
        var translator    = this[' translator']
        viewConfig.inputElemCommunicationID.addEventListener('change', function (evt) {
          appSettings.setCommunicationID(this.value)
          appSettings.toStorage()
        })
        viewConfig.inputElemTheme.addEventListener('change', function (evt) {
          appSettings.setThemeID(this.value)
          appSettings.toStorage()
          Direzione.ThemeManager.changeThemeCSSForControlBoard(appSettings.getThemeID())
        })
        viewConfig.inputElemLanguage.addEventListener('change', function (evt) {
          appSettings.setLanguage(this.value)
          appSettings.toStorage()
          translator.setLanguage(this.value)
        })
        viewConfig.inputElemDuration.addEventListener('change', function (evt) {
          fightSettings.setDuration(parseInt(this.value, 10))
          fightSettings.toStorage()
        })
        viewConfig.inputElemCountUpLimit.addEventListener('change', function (evt) {
          fightSettings.setCountUpLimit(parseInt(this.value, 10))
          fightSettings.toStorage()
        })
        viewConfig.inputElemLockOut.addEventListener('change', function (evt) {
          fightSettings.setLockOutTime(parseInt(this.value, 10))
          fightSettings.toStorage()
        })
    }

    function _fillForm(viewConfig) {
        _valueToElem(this[' appSettings'].getCommunicationID(), viewConfig.inputElemCommunicationID)
        _valueToElem(this[' appSettings'].getThemeID(), viewConfig.inputElemTheme)
        _valueToElem(this[' appSettings'].getLanguage(), viewConfig.inputElemLanguage)
        _valueToElem(this[' fightSettings'].getDuration(), viewConfig.inputElemDuration)
        _valueToElem(this[' fightSettings'].getCountUpLimit(), viewConfig.inputElemCountUpLimit)
        _valueToElem(this[' fightSettings'].getLockOutTime(), viewConfig.inputElemLockOut)
    }

    // Module-API
    return {
        /**
         * Creates an object to manage all settings to the Direzione app
         *
         * @static
         * @method     create
         * @memberof   "Direzione.SettingsController"
         * @returns    {SettingsController}
         */
        create: function (appSettings, fightSettings, viewConfig, translator) {
            return new SettingsController(appSettings, fightSettings, viewConfig, translator)
        }
    }
})()


Direzione.ControlPanelController = (function () {

    function ControlPanelController(fightEmitter) {
        this[' emitter'] = fightEmitter
        this[' listener'] = { fightChange: [], fightHistoryTrigger: [] }
        _registerUIEvents.call(this)
    }

    ControlPanelController.prototype.on = function (type, callback) {
        var eventTypes = Object.keys(this[' listener'])
        if (eventTypes.indexOf(type) === -1) {
            throw new RangeError(
                'Only following values are allowed for event type: ' + eventTypes.join(', ') + '!'
            )
        }

        this[' listener'][type].push(callback)

        return this
    }

    function _registerUIEvents () {
        var remoteIndicator = document.getElementById('remoteIndicator')
        remoteIndicator.addEventListener('click', function (event) {
            if (this[' emitter'].isConnected()) {
                this[' emitter'].disconnect()
                return
            }

            this[' emitter'].connect().then(function () {
                remoteIndicator.className = 'on'
            }.bind(this))
        }.bind(this))
        this[' emitter'].on('disconnect', function () {
            remoteIndicator.className = 'off'
        })

        document.getElementById('repertoire').addEventListener('click', function (evt) {
            if (typeof evt.target.parentNode.fight !== 'undefined') {
                if (evt.target.matches('img.history')) {
                    _dispatch.call(this, 'fightHistoryTrigger', evt.target.parentNode.fight)
                    return
                }

                _dispatch.call(this, 'fightChange', evt.target.parentNode.fight)
            }
        }.bind(this))

        document.querySelector('#menue .settings').addEventListener('click', function (evt) {
          document.getElementById('settings').style.display = 'block'
        }.bind(this))

        document.querySelector('#settings .close').addEventListener('click', function (evt) {
          document.getElementById('settings').style.display = 'none'
        }.bind(this))
    }

    /**
     * Notifies all listeners of passed event-type.
     *
     * @private
     * @param {String} type
     * @param {*} data
     */
    function _dispatch(type, data) {
        this[' listener'][type].forEach(function (listener) {
            listener.call(this, data)
        }, this)
    }

    // Module-API
    return {
        /**
         * Creates an object to control the control panel
         *
         * @static
         * @method     create
         * @memberof   "Direzione.ControlPanelController"
         * @returns    {ControlPanelController}
         */
        create: function (fightEmitter) {
            return new ControlPanelController(fightEmitter)
        }
    }
})()

Direzione.HistoryController = (function (Utils) {

    function HistoryController(appSettings) {
        this[' settings'] = appSettings
        _registerUIEvents.call(this)
    }

    HistoryController.prototype.setFight = function (fight) {
        this[' fight'] = fight
        return this
    }

    HistoryController.prototype.show = function() {
        var dialog = document.getElementById('history')
        var log    = dialog.querySelector('#log')
        var topt   = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h24"
        }

        log.querySelectorAll('tr:has(td)').forEach(function (row) {
            log.removeChild(row)
        })

        this[' fight'].getHistory().getLog().forEach(function (row) {
            var rowElem = document.createElement('tr')

            var cellElem = document.createElement('td')
            cellElem.innerText = Number.isInteger(row[0])
                ? (new Date(row[0])).toLocaleDateString(this[' settings'].getLanguage(), topt) : row[0]
            rowElem.appendChild(cellElem)

            cellElem = document.createElement('td')
            cellElem.innerText = row[1]
            rowElem.appendChild(cellElem)

            cellElem = document.createElement('td')
            cellElem.innerText = ! Number.isInteger(row[2]) ? row[2] :
                row[1] === 'toketa'
                    ? (Math.floor(row[2] / 1000)%60)+'.'+(Math.floor(row[2]%1000)+'').padStart(3,'0')
                    : Utils.getMinSecDisplay(row[2])
            rowElem.appendChild(cellElem)

            log.appendChild(rowElem)
        }, this)

        dialog.style.display = 'block'
    }

    function _registerUIEvents () {
        document.querySelector('#history .close').addEventListener('click', function (evt) {
            document.getElementById('history').style.display = 'none'
        }.bind(this))
    }

    // Module-API
    return {
        /**
         * Creates an object to control the view of the fight histories
         *
         * @static
         * @method     create
         * @memberof   "Direzione.HistoryController"
         * @returns    {HistoryController}
         */
        create: function (appSettings) {
            return new HistoryController(appSettings)
        }
    }
})(Direzione.Utils)
