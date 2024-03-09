Direzione.State = {
    keyControlScoreboard: true
}

Direzione.FightController = (function (Utils) {

    // todo: use fightemitter instead of fight ...
    // check connection to remote scoreboard before starting fight
    function FightController(fightEmitter, translator) {
        this[' fightEmitter'] = fightEmitter
        this[' translator']   = translator
        _registerKeyBoardEvents.call(this)
    }

    function _confirmReset() {
        if (confirm(this[' translator'].getTranslations().message['confirm-reset'])) {
            this[' fightEmitter'].getFight().reset()
        }
    }

    function _confirmFinish() {
        if (confirm(this[' translator'].getTranslations().message['confirm-finish'])) {
            this[' fightEmitter'].getFight().stop()
        }
    }

    function _triggerFight(action) {
        var fight = this[' fightEmitter'].getFight()

        function touchFight() {
            if (typeof action === 'undefined') {
                return fight.startPauseResume()
            } else {
                if (fight.isStopped()) return
                switch (action) {
                    case 'start': return ! fight.isRunning() && fight.startPauseResume()
                    case 'stop': return fight.isRunning() && fight.startPauseResume()
                }
            }
        }

        if (this[' fightEmitter'].isConnected()) {
            touchFight()
        } else {
            this[' fightEmitter'].connect().then(touchFight)
        }
    }

    _registerKeyBoardEvents = function () {
        document.addEventListener('keyup', function(event) {
        	this[' keylock'] = false
        }.bind(this))
      	document.addEventListener('keydown', function(event) {
            if (this[' keylock'] || !Direzione.State.keyControlScoreboard) return

            var fight = this[' fightEmitter'].getFight()

            var white = fight.getWhiteOpponent()
            var red   = fight.getRedOpponent()
            this[' keylock'] = true
            switch (event.code) {
                case 'Escape':      return _confirmReset.call(this)
                case 'Enter':
                case 'Space':       return _triggerFight.call(this)
                case 'ArrowLeft':   return fight.osaeKomi(Direzione.Fight.SIDE_WHITE)
                case 'ArrowRight':  return fight.osaeKomi(Direzione.Fight.SIDE_RED)
                // case 'ArrowDown':   return fight.osaeKomi(Direzione.Fight.SIDE_CENTER)
                case 'ArrowUp':     return fight.toketa()
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

          var fight = this[' fightEmitter'].getFight()

          var white = fight.getWhiteOpponent()
          var red   = fight.getRedOpponent()
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
              return fight.toketa()

            case document.querySelector('img.osaekomi-left'):
              return fight.osaeKomi(Direzione.Fight.SIDE_WHITE)

            case document.querySelector('img.osaekomi-right'):
              return fight.osaeKomi(Direzione.Fight.SIDE_RED)

            case document.querySelector('#countdown .start'):
              return _triggerFight.call(this, 'start')

            case document.querySelector('#countdown .stop'):
              return _triggerFight.call(this, 'stop')
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
        create: function (fightEmitter, translationConfig) {
            return new FightController(fightEmitter, translationConfig)
        }
    }
})(Direzione.Utils)


Direzione.SettingsController = (function () {

    function SettingsController(appSettings, fightSettings, viewConfig, translator) {
        this[' appSettings']   = appSettings
        this[' fightSettings'] = fightSettings
        this[' translator']    = translator
        _initSoundSelect.call(this, viewConfig)
        _fillForm.call(this, viewConfig)
        _registerUIEvents.call(this, viewConfig)
    }

    function _initSoundSelect(viewConfig) {
        Direzione.sound_files.forEach(function (filename) {
            var opt = document.createElement('option')
            opt.value = 'sounds/' + filename
            opt.innerText = filename
            viewConfig.selectElemFightEndSound.appendChild(opt)
        })
    }

    function _valueToElem(val, elem) {
        if (elem.tagName === 'INPUT') {
            if (elem.type === 'checkbox') {
                elem.checked = val
            } else {
                elem.value = val
            }
        } else if (elem.tagName === 'SELECT') {
            elem.childNodes.forEach(function (option) {
                if (option.value === val) {
                    option.selected = 'selected'
                    return;
                }
            })
        }
    }

    function _registerUIEvents (viewConfig) {
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
        viewConfig.inputElemCountUpLimitIppon.addEventListener('change', function (evt) {
          fightSettings.setCountUpLimitIppon(parseInt(this.value, 10))
          fightSettings.toStorage()
        })
        viewConfig.inputElemLockOut.addEventListener('change', function (evt) {
          fightSettings.setLockOutTime(parseInt(this.value, 10))
          fightSettings.toStorage()
        })
        viewConfig.inputElemInvertGripSide.addEventListener('change', function (evt) {
          fightSettings.setGripSideInverted(this.checked)
          fightSettings.toStorage()
        })
        viewConfig.inputElemInvertGripDisplay.addEventListener('change', function (evt) {
          fightSettings.setGripDisplayInverted(this.checked)
          fightSettings.toStorage()
        })
        viewConfig.selectElemFightEndSound.addEventListener('change', function (evt) {
          fightSettings.setTimeUpSoundFile(this.value)
          fightSettings.toStorage()
        })
        viewConfig.buttonElemFightEndSoundTest.addEventListener('click', function (evt) {
            var audio = new Audio(viewConfig.selectElemFightEndSound.value)
            audio.currentTime = 0
            audio.oncanplay = function () { audio.play() }
            evt.preventDefault()
            evt.stopPropagation()
        })
    }

    function _fillForm(viewConfig) {
        _valueToElem(this[' appSettings'].getCommunicationID(), viewConfig.inputElemCommunicationID)
        _valueToElem(this[' appSettings'].getThemeID(), viewConfig.inputElemTheme)
        _valueToElem(this[' appSettings'].getLanguage(), viewConfig.inputElemLanguage)
        _valueToElem(this[' fightSettings'].getDuration(), viewConfig.inputElemDuration)
        _valueToElem(this[' fightSettings'].getCountUpLimit(), viewConfig.inputElemCountUpLimit)
        _valueToElem(this[' fightSettings'].getCountUpLimitIppon(), viewConfig.inputElemCountUpLimitIppon)
        _valueToElem(this[' fightSettings'].getLockOutTime(), viewConfig.inputElemLockOut)
        _valueToElem(this[' fightSettings'].isGripSideInverted(), viewConfig.inputElemInvertGripSide)
        _valueToElem(this[' fightSettings'].isGripDisplayInverted(), viewConfig.inputElemInvertGripDisplay)
        _valueToElem(this[' fightSettings'].getTimeUpSoundFile(), viewConfig.selectElemFightEndSound)
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

    function ControlPanelController(fightEmitter, translator) {
        this[' emitter']    = fightEmitter
        this[' translator'] = translator
        this[' listener']   = { fightChange: [], fightHistoryTrigger: [] }
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

    function _avoidControl() {
        var fightIsRunning = this[' emitter'].getFight().isRunning()
        if (fightIsRunning) {
            alert(this[' translator'].getTranslations().message['alert-no-control-during-fight'])
        }
        return fightIsRunning;
    }

    function _registerUIEvents () {
        var remoteIndicator = document.getElementById('remoteIndicator')

        this[' emitter'].on('establish', function () { remoteIndicator.className = 'on' })
        this[' emitter'].on('disconnect', function () { remoteIndicator.className = 'off' })

        remoteIndicator.addEventListener('click', function (event) {
            return _avoidControl.call(this) ||
                    this[' emitter'].isConnected() && this[' emitter'].disconnect() ||
                    this[' emitter'].connect()
        }.bind(this))

        document.getElementById('repertoire').addEventListener('click', function (evt) {
            if (_avoidControl.call(this)) return
            if (typeof evt.target.parentNode.fight !== 'undefined') {
                if (evt.target.matches('img.history')) {
                    _dispatch.call(this, 'fightHistoryTrigger', evt.target.parentNode.fight)
                    return
                }

                _dispatch.call(this, 'fightChange', evt.target.parentNode.fight)
            }
        }.bind(this))

        document.querySelector('#menue .settings').addEventListener('click', function (evt) {
            if (_avoidControl.call(this)) return
            document.getElementById('settings').style.display = 'block'
            Direzione.State.keyControlScoreboard = false
            if (this[' emitter'].isConnected()) {
                this[' emitter'].disconnect()
                return
            }
        }.bind(this))

        document.querySelector('#settings .close').addEventListener('click', function (evt) {
          document.getElementById('settings').style.display = 'none'
          Direzione.State.keyControlScoreboard = true
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
        create: function (fightEmitter, translator) {
            return new ControlPanelController(fightEmitter, translator)
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


Direzione.OpponentsController = (function (OpponentGroup, Person) {

    /**
     * @param {Object} viewConfig
     */
    function OpponentsController(viewConfig, translator) {
        this[' groups']     = []
        this[' translator'] = translator
        this[' groupPanel'] = viewConfig.groupJigElem.parentNode
        this[' personJig']  = viewConfig.personJigElem.cloneNode(true)
        this[' personJig'].removeAttribute('id')
        viewConfig.personJigElem.remove();
        this[' groupJig']   = viewConfig.groupJigElem.cloneNode(true)
        this[' groupJig'].removeAttribute('id')
        viewConfig.groupJigElem.remove();

        _registerUIEvents.call(this, viewConfig)
    }

    /**
     * @param {String} name
     */
    function _groupExists(name) {
        return this[' groups'].some(function (group) {
            return group.getName() === name
        })
    }

    /**
     *
     * @param {Element} groupElem
     */
    function _removeGroup(groupElem) {
        this[' groups'] = this[' groups'].filter(function(obj) {
            return obj !== this;
        }.bind(groupElem.group))
        groupElem.remove()
    }

    /**
     * @param {String} name
     */
    function _createGroup(name) {
        if (_groupExists.call(this, name)) {
            alert(this[' translator'].getTranslations().message['alert-group-exists']);
            return
        }

        var groupElem = this[' groupJig'].cloneNode(true)
        var group     = OpponentGroup.create(name)

        groupElem.group = group
        groupElem.getElementsByTagName('caption')[0].innerText = name
        groupElem.querySelector('thead .group.remove').addEventListener(
            'click', function (groupElem, evt) {
                if (confirm(
                        this[' translator'].getTranslations().message['confirm-remove']
                            .replace('%s', groupElem.group.getName())
                )) {
                    _removeGroup.call(this, groupElem)
                }
            }.bind(this, groupElem)
        )
        groupElem.querySelector('th.hfn').innerText
            = this[' translator'].getTranslations().groups.firstName
        groupElem.querySelector('th.hln').innerText
            = this[' translator'].getTranslations().groups.lastName
        groupElem.querySelector('th.hcn').innerText
            = this[' translator'].getTranslations().groups.club

        group.on('add', function (group, person) {
            var tr = this[' personJig'].cloneNode(true)
            tr.person = person
            tr.querySelector('.fname').innerText = person.getFirstName()
            tr.querySelector('.lname').innerText = person.getLastName()
            tr.querySelector('.clubname').innerText = person.getClubName()
            tr.querySelector('.ctrls .remove').addEventListener('click', function (group, person) {
                if (confirm(
                    this[' translator'].getTranslations().message['confirm-remove']
                        .replace('%s', person.getFirstName() + ' ' + person.getLastName())
                )) {
                    group.removePerson(person)
                }
            }.bind(this, group, person))
            groupElem.querySelector('tbody').appendChild(tr)
        }.bind(this, group))

        group.on('remove', function (groupElem, person) {
            groupElem.querySelectorAll('tbody tr').forEach(function (tr) {
                tr.person === person && tr.remove()
            })
        }.bind(this, groupElem))

        groupElem.querySelector('.add').addEventListener('click', function (evt) {
            var persDialogElem = document.getElementById('persons')
            persDialogElem.group = group
            persDialogElem.style.display = 'block'
        })

        this[' groupPanel'].appendChild(groupElem)
        this[' groups'].push(group)
    }

    function _createAndAddPersonToGroup(group, fname, lname, cname) {
        var pers = Person.create(fname, lname, cname)
        group.addPerson(pers)
    }

    /**
     * @private
     * @param {Object} viewConfig
     */
    function _registerUIEvents (viewConfig) {
        viewConfig.buttonElemAddGroupName.addEventListener('click', function (evt) {
            evt.preventDefault()
            evt.stopPropagation()
            _createGroup.call(this, viewConfig.inputElemGroupName.value)
        }.bind(this))

        viewConfig.buttonElemAddPerson.addEventListener('click', function (evt) {
            evt.preventDefault()
            evt.stopPropagation()
            _createAndAddPersonToGroup.call(
                this,
                document.getElementById('persons').group,
                viewConfig.inputElemPersonFirstName.value,
                viewConfig.inputElemPersonLastName.value,
                viewConfig.inputElemPersonClubName.value
            )
        }.bind(this))

        document.querySelector('#menue .opponents').addEventListener('click', function (evt) {
            document.getElementById('groups').style.display = 'block'

            document.querySelectorAll('#groups th.hfn').forEach(function (elem) {
                elem.innerText = this[' translator'].getTranslations().groups.firstName
            }, this)
            document.querySelectorAll('#groups th.hln').forEach(function (elem) {
                elem.innerText = this[' translator'].getTranslations().groups.lastName
            }, this)
            document.querySelectorAll('#groups th.hcn').forEach(function (elem) {
                elem.innerText = this[' translator'].getTranslations().groups.club
            }, this)
        }.bind(this))

        document.querySelector('#groups .close').addEventListener('click', function (evt) {
            document.getElementById('groups').style.display = 'none'
        })

        document.querySelector('#persons .close').addEventListener('click', function (evt) {
            document.getElementById('persons').style.display = 'none'
        })
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
         *
         * @param      {Object}   viewConfig
         *
         * @memberof   "Direzione.OpponentsController"
         * @returns    {OpponentsController}
         */
        create: function (viewConfig, translator) {
            return new OpponentsController(viewConfig, translator)
        }
    }
})(Direzione.OpponentGroup, Direzione.Person)
