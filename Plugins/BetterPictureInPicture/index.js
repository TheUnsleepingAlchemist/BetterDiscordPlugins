module.exports = (Plugin, Library) => {
  const { Logger, DOMTools } = Library

  return class BetterPictureInPicture extends Plugin {

    onStart() {
      Logger.log('Started')
      this.setSize()

      BdApi.injectCSS('betterpictureinpicturecss-animation', `div[class^="pictureInPictureVideo-"] {transition: width .5s ease-in-out, height .5s ease-in-out}`)

      const self = this

      DOMTools.observer.subscribe(changes => {
        if (changes.addedNodes.length > 0) {
          Logger.log('PiP started.')
          changes.target.onwheel = e => {
            if (self.settings['customswitch']) {
              let scaleX = parseFloat(self.settings['customwidth'])
              scaleX += e.deltaY * -0.1
              let scaleY = parseFloat(self.settings['customheight'])
              scaleY += e.deltaY * -0.1
              
              self.settings['customwidth'] = scaleX
              self.settings['customheight'] = scaleY
            } else {
              let scale = parseFloat(self.settings['popupsize'])
              scale += e.deltaY * -0.1
              if (scale < 100) scale = 100
              if (scale > 300) scale = 300
              self.settings['popupsize'] = scale
            }
            self.setSize()
            self.saveSettings(self.settings)
          }
        }
        if (changes.removedNodes.length > 0) {
          Logger.log('PiP stopped.')
        }
      },
      changes => { return changes.target?.classList[0]?.startsWith('pictureInPicture-') }
      )
    }

    onStop() {
      Logger.log('Stopped')
      BdApi.clearCSS('betterpictureinpicturecss')
      BdApi.clearCSS('betterpictureinpicturecss-animation')
      DOMTools.observer.unsubscribeAll()
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
        this.saveSettings(this.settings)
        this.setSize()
      }
      return panel.getElement()
    }
  }
}