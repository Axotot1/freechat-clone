const {
    app,
    BrowserWindow,
    session,
    shell,
    ipcMain
} = require('electron');
const path = require('path');
const CssInjector = require('../js/css-injector');

// disable UOS patch on default
const UOS_patch = true
// https://github.com/BlueSky-07/wechat-token/issues/1
const UOS_secret = 'Gp8ICJkIEpkICggwMDAwMDAwMRAGGoAIP2dyZlmKevRGDZKoJMMXqdPRe1Iv+vL/2Kj8M/Fx/NMXVTdgTfDVuS5QjUjfXzzkMkxWm0Z1kfL7obGFtXzmgUIKp4RUJn6ehaLuPe4Ne4Gjom4/mifCGjNNtrgO20s4We3jo3FAqhcblYdW4vOTPytXB9HTHScBev1aPT66nS8JfneWgE07oCqB6WrgotoXYFKAJX9iIJbMQFUI8JrnJi3kGqpMjunQSb/npt+TEkgFo7hof7tKhHZHLGm2qyL6d8CweDwprnYWhzey9act6YJydLRlAjXaN35dm/6j8OvEct+H65lwT0hyPN28/Q2GkNcaxvB2NhaM80k3Jck7UHtCq2GLnTEMAV80sKSqTl/EWHNQ1G7APuCRXUvD8JOrmSpRARlUmWEWHeXeeZ0a8Qx+BPkyLxvn1RNtWvnI5hknPSMQ5CUaaBHKSaOwtxuB4fpZXJV2wCah0ACLU+7LFZ5bz1LdEkktzGRyC8GkL8MZwk25dgIiHOVSWgfLBRc4mkG4FMBsmJoCsKxG528Yt8fO0kLGb0pbkWZ2xhjfdveGd3UKwkLypOZ5POpZxbNqlYAQay15Zt0/i4oZnOSWZpCY2H8TtspWpHkVfjR2OpViOgSQGU0gHCQZLQf6hw9w8icKg64zhG82NqUm5/DLIBTq4+Q1MAdSoUmdzNfh+gu8te/ouxTwHF7+83cvXvuWyvONLNdTtOmswIcTwANlFIGCxrv+GKA7FbVapvamJ2c3XCg56xWuUnhaxX9SFFVPeVFLkxHH7pmLvyuWjmTDsVhbPUrHTBN+39tdE1MrpmoQlM+zDcV7G4my39n/8omfCr7UNeqE+nAgTyI31O6QlD/onR4QY5le4lYRWllmprj8O9jNnMWDnufG/2SYzaitCOUa/YL/sI0L0a+HFqNWD8FPApNGBw2bQu0JDyi0Ks4IDf0s9xIVSg4MC70Kpxmb01VnJbihU1IligbnO6roqY0ErBFW8bMCJoOWcaAu35kHVp1y8SMIsp815tkNwvdipWO9qAQch6CbQMFle0REj2FI7cpG0fjlr8jO6FFh8e5P4EpBTq9uHnPy1SrlCL0zdf0DPKddUErATZlEjz+64oDbwqfPYb7ECE2me+Pq+gNH2whFDGkdfsdMHJPP2uHFHZEceIfe7QHkkbMW2h4zTojWJFVPqHCPcUYgsnfY9GuGVoR5MG9cvRt8wa1r0MVXbR/Iz/pKL/qKz4IHNPKvjhegI57VHbAomXk9pAaIPx2M/ZfJC3ZSrskfHwp7P/jybzZbjn9XLDPNp1Vi/ANhT65z67lCtzXG/WW9eXG2RZFwlUdijzDL3uCbBOFWLy28FHJcLHEa37sKVX/nYnpcNiDepZiCBigFMAA='

const webUrls = ["https://wx.qq.com/*", "https://web.wechat.com/*", "https://wx2.qq.com/*", "https://wx8.qq.com/*"]
const wechatHeaders = {
    extspam:
        "Go8FCIkFEokFCggwMDAwMDAwMRAGGvAESySibk50w5Wb3uTl2c2h64jVVrV7gNs06GFlWplHQbY/5FfiO++1yH4ykCyNPWKXmco+wfQzK5R98D3so7rJ5LmGFvBLjGceleySrc3SOf2Pc1gVehzJgODeS0lDL3/I/0S2SSE98YgKleq6Uqx6ndTy9yaL9qFxJL7eiA/R3SEfTaW1SBoSITIu+EEkXff+Pv8NHOk7N57rcGk1w0ZzRrQDkXTOXFN2iHYIzAAZPIOY45Lsh+A4slpgnDiaOvRtlQYCt97nmPLuTipOJ8Qc5pM7ZsOsAPPrCQL7nK0I7aPrFDF0q4ziUUKettzW8MrAaiVfmbD1/VkmLNVqqZVvBCtRblXb5FHmtS8FxnqCzYP4WFvz3T0TcrOqwLX1M/DQvcHaGGw0B0y4bZMs7lVScGBFxMj3vbFi2SRKbKhaitxHfYHAOAa0X7/MSS0RNAjdwoyGHeOepXOKY+h3iHeqCvgOH6LOifdHf/1aaZNwSkGotYnYScW8Yx63LnSwba7+hESrtPa/huRmB9KWvMCKbDThL/nne14hnL277EDCSocPu3rOSYjuB9gKSOdVmWsj9Dxb/iZIe+S6AiG29Esm+/eUacSba0k8wn5HhHg9d4tIcixrxveflc8vi2/wNQGVFNsGO6tB5WF0xf/plngOvQ1/ivGV/C1Qpdhzznh0ExAVJ6dwzNg7qIEBaw+BzTJTUuRcPk92Sn6QDn2Pu3mpONaEumacjW4w6ipPnPw+g2TfywJjeEcpSZaP4Q3YV5HG8D6UjWA4GSkBKculWpdCMadx0usMomsSS/74QgpYqcPkmamB4nVv1JxczYITIqItIKjD35IGKAUwAA==",
    "client-version": "2.0.0",
}

class MainController {
    constructor() {
        !UOS_patch || session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
            details.requestHeaders['extspam'] = UOS_secret
            callback({ requestHeaders: details.requestHeaders })
        })

        !UOS_patch || session.defaultSession.webRequest.onBeforeRequest({
            urls: [
                'https://wx.qq.com/?&lang*',
                'https://wx2.qq.com/?&lang*'
            ]
        },
            (details, callback) => {
                callback((details.url.indexOf('&target=t') > -1) ? {} : { redirectURL: 'https://wx.qq.com/?&lang=zh_CN&target=t' })
            }
        )

        this.init()
    }

    init() {
        this.window = new BrowserWindow({
            show: false,
            width: 380,
            height: 500,
            frame: true,
            autoHideMenuBar: true,
            resizable: true,
            icon: path.join(__dirname, '../../build/icons/512x512.png'),
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true,
                contextIsolation:false
            }
        })

        this.window.loadURL('https://wx.qq.com/?&lang=zh_CN')

        this.window.webContents.on('dom-ready', () => {
            this.window.webContents.insertCSS(CssInjector.login)
            this.window.webContents.insertCSS(CssInjector.main)
            this.addFontAwesomeCDN()
            this.changeTitle()
            this.addToggleContactElement()
            this.addUnreadMessageListener()
            this.show()
        })

        // triggering when user try to close the play window.
        this.window.on('close', (e) => {
            if (this.window.isVisible()) {
                e.preventDefault()
                this.window.hide()
            }
        })

        this.window.webContents.on('new-window', this.openInBrowser)

        session.defaultSession.webRequest.onCompleted({urls: [
            'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit*',
            'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxinit*',
            'https://wx.qq.com/?&lang*',
            'https://wx2.qq.com/?&lang*'
        ]},
            (details) => this.handleRequest(details)
        )

        session.defaultSession.webRequest.onBeforeRequest({urls: webUrls}, (details, callback) => {
            let url = new URL(details.url);
            if (url.pathname === "/" && url.search.indexOf("target=t") === -1) {
                if (url.search === "" || url.search === "?") {
                    url.search = "?"
                } else {
                    url.search += "&"
                }
                url.search += "target=t"
            }
            callback({ redirectUrl: url.href })
        })

        session.defaultSession.webRequest.onBeforeSendHeaders({urls: webUrls}, (details, callback) => {
            let url = new URL(details.url);
            if (url.pathname === "/cgi-bin/mmwebwx-bin/webwxnewloginpage") {
                for (var k in wechatHeaders) {
                    details.requestHeaders.push({
                        name: k,
                        value: wechatHeaders[k],
                    });
                }
            }
            callback({ requestHeaders: details.requestHeaders })
        })

        ipcMain.on('resizeWindow', (event, value) => {
            if (value === 'desktop') {
                this.window.setSize(1000, this.window.getSize()[1], true)
            } else {
                this.window.setSize(450, this.window.getSize()[1], true)
            }
        })
    }

    show() {
        this.window.show()
        this.window.focus()
    }

    toggle() {
        if (this.window.isVisible()) {
            this.window.hide()
        } else {
            this.show()
        }
    }

    openInBrowser(e, url) {
        e.preventDefault()
        // if the url start with a wechat redirect url, get the real url, decode and open in external browser
        let redirectUrl = url
        if (url.startsWith('https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxcheckurl?requrl=')) {
            const redirectRegexp = /https:\/\/wx\.qq\.com\/cgi-bin\/mmwebwx-bin\/webwxcheckurl\?requrl=(.*)&skey.*/g
            redirectUrl = decodeURIComponent(redirectRegexp.exec(url)[1])
        }
        shell.openExternal(redirectUrl)
    }

    handleRequest(details) {
        // console.log(details.url)
        details.url.startsWith('https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit') && this.login()
        details.url.startsWith('https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxinit') && this.login()
        details.url.startsWith('https://wx.qq.com/?&lang') && this.logout()
        details.url.startsWith('https://wx2.qq.com/?&lang') && this.logout()
    }

    login() {
        this.window.hide()
        this.window.setSize(1000, 800, true)
        this.window.setResizable(true)
        this.window.show()
    }

    logout() {
        this.window.setSize(380, 500, true)
    }

    addFontAwesomeCDN() {
        this.window.webContents.executeJavaScript(`
            let faLink = document.createElement('link');
            faLink.setAttribute('rel', 'stylesheet');
            faLink.type = 'text/css';
            faLink.href = 'https://use.fontawesome.com/releases/v5.0.13/css/all.css';
            faLink.integrity = 'sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp';
            faLink.crossOrigin = 'anonymous';
            document.head.appendChild(faLink);
        `)
    }

    changeTitle() {
        this.window.webContents.executeJavaScript(`
            var titleName = 'Freechat (version: ${app.getVersion()})';
            document.title = titleName;
            new MutationObserver(mutations => {
                if (document.title !== titleName) {
                    document.title = titleName;
                }
            }).observe(document.querySelector('title'), {childList: true});
        `)
    }

    addUnreadMessageListener() {
        this.window.webContents.executeJavaScript(`
            new MutationObserver(mutations => {
                let unread = document.querySelector('.icon.web_wechat_reddot');
                let unreadImportant = document.querySelector('.icon.web_wechat_reddot_middle');
                let unreadType = unreadImportant ? 'important' : unread ? 'minor' : 'none';
                require('electron').ipcRenderer.send('updateUnread', unreadType);
            }).observe(document.querySelector('.chat_list'), {subtree: true, childList: true});
        `)
    }

    addToggleContactElement() {
        this.window.webContents.executeJavaScript(`
            let toggleButton = document.createElement('i');
            toggleButton.className = 'toggle-mobile-button fas fa-mobile-alt';
            toggleButton.onclick = () => {
                if (toggleButton.classList.contains('mini')) {
                    toggleButton.className = 'toggle-mobile-button fas fa-mobile-alt';
                    require('electron').ipcRenderer.send('resizeWindow', 'desktop');
                } else {
                    toggleButton.className = 'toggle-mobile-button fas fa-desktop mini';
                    require('electron').ipcRenderer.send('resizeWindow', 'mobile');
                }

                document.querySelector('div.main').classList.toggle('mini');
            };
            let titleBar = document.querySelector('.header');
            titleBar.appendChild(toggleButton);
        `)
    }
}

module.exports = MainController
