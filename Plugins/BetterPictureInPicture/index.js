module.exports = (Plugin, Library) => {
  const { Logger, DOMTools, ReactTools } = Library

  return class BetterPictureInPicture extends Plugin {

    onStart() {
      Logger.log('Started')
      this.setSize()
      // Logger.log(_.defaults({ 'a': 1 }, { 'a': 3, 'b': 2 }))
      if (this.settings['hideswitch']) {
        BdApi.injectCSS('betterpictureinpicturecss-hide', `div[class^="pictureInPictureWindow-"] {display:none!important}`)
      }

      BdApi.injectCSS('betterpictureinpicturecss-animation', `div[class^="pictureInPictureVideo-"] {transition: width .5s cubic-bezier(0.68,-0.55,0.27,1.55), height .5s cubic-bezier(0.68,-0.55,0.27,1.55)}`)

      DOMTools.observer.subscribe(changes => {
        if (changes.addedNodes.length > 0) {
          Logger.log('PiP started.')
          this.onPipStarted(changes.addedNodes[0])
        }
        if (changes.removedNodes.length > 0) {
          Logger.log('PiP stopped.')
        }
      },
      changes => { return changes.target?.classList[0]?.startsWith('pictureInPicture-') }
      )

      function wheelSize(e) {
        if (this.settings['customswitch']) {
          let scaleX = parseFloat(this.settings['customwidth'])
          scaleX += e.deltaY * -0.1
          let scaleY = parseFloat(this.settings['customheight'])
          scaleY += e.deltaY * -0.1
          
          this.settings['customwidth'] = scaleX
          this.settings['customheight'] = scaleY
        } else {
          let scale = parseFloat(this.settings['popupsize'])
          scale += e.deltaY * -0.1
          if (scale < 100) scale = 100
          if (scale > 300) scale = 300
          this.settings['popupsize'] = scale
        }
        this.setSize()
        this.saveSettings(this.settings)
      }

      this.wheelSize = _.throttle(wheelSize.bind(this), 0)
      
      const window = DOMTools.query('div[class^="pictureInPictureWindow-"]')
      if (window)
        this.onPipStarted(window)
    }

    onStop() {
      Logger.log('Stopped')
      BdApi.clearCSS('betterpictureinpicturecss')
      BdApi.clearCSS('betterpictureinpicturecss-animation')
      BdApi.clearCSS('betterpictureinpicturecss-hide')
      DOMTools.observer.unsubscribeAll()

      const window = DOMTools.query('div[class^="pictureInPictureWindow-"]')
      window?.removeEventListener('wheel', this.wheelSize)
    }

    onPipStarted(target) {
      target.addEventListener('wheel', this.wheelSize)
    }

    setSize() {
      Logger.log('Size changed')
      BdApi.clearCSS('betterpictureinpicturecss')
      if (this.settings['customswitch']) {
        BdApi.injectCSS('betterpictureinpicturecss', `div[class^="pictureInPictureVideo-"] {width: ${this.settings['customwidth']}px!important;height:${this.settings['customheight']}px!important}`)
      } else {
        const width = 320 * (this.settings['popupsize'] / 100)
        const height = 180 * (this.settings['popupsize'] / 100)

        BdApi.injectCSS('betterpictureinpicturecss', `div[class^="pictureInPictureVideo-"] {width: ${width}px!important;height:${height}px!important}`)
        // BdApi.injectCSS('betterpictureinpicturecss', `div[class^="pictureInPictureWindow-"] {transform: scale(${this.settings['popupsize'] / 100})!important}`)
      }
    }

    getSettingsPanel() {
      const panel = this.buildSettingsPanel()
      panel.onChange = (e, v) => {
        if (e === 'customwidth' || e === 'customheight') {
          if (isNaN(v)) {
            this.settings[e] = this.defaultSettings[e]
          }
        }

        if (this.settings['hideswitch']) {
          BdApi.clearCSS('betterpictureinpicturecss-hide')
          BdApi.injectCSS('betterpictureinpicturecss-hide', `div[class^="pictureInPictureWindow-"] {display:none!important}`)
        } else {
          BdApi.clearCSS('betterpictureinpicturecss-hide')
        }

        this.saveSettings(this.settings)
        this.setSize()
      }
      return panel.getElement()
    }
  }
}