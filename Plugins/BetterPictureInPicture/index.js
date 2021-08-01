module.exports = (Plugin, Library) => {
  const { Logger } = Library

  return class BetterPictureInPicture extends Plugin {

    onStart() {
      Logger.log("Started")
      this.setSize()
    }

    onStop() {
      Logger.log("Stopped")
      BdApi.clearCSS('betterpictureinpicturecss')
    }

    setSize() {
      BdApi.clearCSS('betterpictureinpicturecss')
      if (this.settings['customswitch']) {
        Logger.log(this.settings['customwidth'])
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