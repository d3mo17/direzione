Direzione.FightController = (function (Utils) {

    function FightController(fightView, fight, remoteID) {
        this[' fight']   = fight
        this[' emitter'] = Direzione.FightEmitter.create(remoteID, fight)

        fight.getCountdown()
            && fight.getCountdown().on('stop', fightView.resetView.bind(fightView))
        this.registerKeyBoardEvents()
        this.registerUIEvents()
    }

    FightController.prototype.registerUIEvents = function () {
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
    }

    FightController.prototype.registerKeyBoardEvents = function () {
        document.addEventListener('keyup', function(event) {
        	this[' keylock'] = false
        }.bind(this))
      	document.addEventListener('keydown', function(event) {
            if (this[' keylock']) return

            var white = this[' fight'].getWhiteOpponent()
            var red   = this[' fight'].getRedOpponent()
            this[' keylock'] = true
            switch (event.code) {
                case 'Escape':      return this[' fight'].reset()
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

            case document.getElementById('countdown'): return this[' fight'].startPauseResume()
          }
        }.bind(this))

        // TODO: Extract to another controller
        document.querySelector('#repertoire').addEventListener('click', function (evt) {
          if (typeof evt.target.parentNode.fight !== 'undefined') {
            this[' fight'] = evt.target.parentNode.fight
            board.replaceFight(this[' fight'])
            this[' emitter'].replaceFight(this[' fight'])
          }
        }.bind(this))
    }

    // Module-API
    return {
        /**
         * Creates an object to manage settings to the Direzione app
         *
         * @static
         * @method     create
         * @memberof   "Direzione.FightController"
         * @returns    {FightController}
         */
        create: function (fightView, fight, remoteID) {
            return new FightController(fightView, fight, remoteID)
        }
    }
})(Direzione.Utils)
