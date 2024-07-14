/**
 * @author gde-alme
 * 
*/


(function () {
    // Script object
    var tabRenamer = {
        controller: {
            targetTabId: -1,
            messages: {
                "changeTitle": function (message, sender, sendResponse) {
                    try {
                        tabRenamer.localstorage.set(tabRenamer.controller.targetTabId, message.formData.newTabTitle);
                        browser.tabs.executeScript(tabRenamer.controller.targetTabId, {
                            code: `document.title = "${message.formData.newTabTitle}";`
                        });
                    } catch (error) {
                        console.error('Error executing script:', error);
                    }
                    sendResponse({ response: "Title change received" });
                },
                "changeCurrentTabTitle": function (message, sender, sendResponse) {
                    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        if (tabs.length > 0) {
                            tabRenamer.localstorage.set(tabs[0].id, message.newTabTitle);
                            browser.tabs.executeScript(tabs[0].id, {
                                code: `document.title = "${message.newTabTitle}";`
                            });
                        }
                    });
                },
                "fetchTitle": function (message, sender, sendResponse) {
                    tabRenamer.localstorage.get(sender.tab.id).then(title => {
                        title ? sendResponse({
                            success: true, message: "Saved title found", data: {
                                title: title
                            }
                        }) : sendResponse({
                            success: false, message: "No saved title found"
                        })
                    });
                }
            },
            init: function () {
                browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
                    if (this.messages[message.action]) {
                        this.messages[message.action](message, sender, sendResponse);
                    }
                    return true;
                });
            }
        },
        contextMenu: {
            id: "change-tab-title",
            title: "Change Tab Title",
            contexts: ["tab"],
            events: {
                onClicked: function (info, tab) {
                    if (info.menuItemId === tabRenamer.contextMenu.id) {
                        tabRenamer.controller.targetTabId = tab.id;
                        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            if (tabs.length > 0) {
                                browser.tabs.sendMessage(tabs[0].id, {
                                    action: "openModal",
                                    currentTabName: tab.title
                                });
                            }
                        });
                    }
                }
            },
            init: function () {
                browser.contextMenus.create({
                    id: this.id,
                    title: this.title,
                    contexts: this.contexts
                });
                browser.contextMenus.onClicked.addListener(this.events.onClicked);
            }
        },
        localstorage: {
            namespace: "tabRenamer_1kndaFdsknl123lndASDa-kndl21DASd1",
            get: function (key) {
                return new Promise((resolve, reject) => {
                    browser.storage.local.get(this.namespace).then(result => {
                        if (result[this.namespace] && result[this.namespace][key]) {
                            resolve(result[this.namespace][key]);
                        } else {
                            resolve(undefined);
                        }
                    }).catch(error => reject(error));
                });
            },
            set: function (key, value) {
                browser.storage.local.get(this.namespace).then(result => {
                    if (!result[this.namespace]) {
                        result[this.namespace] = {};
                    }
                    result[this.namespace][key] = value;
                    browser.storage.local.set({ [this.namespace]: result[this.namespace] });
                });
            },
            getAll: function () {
                return new Promise((resolve, reject) => {
                    browser.storage.local.get(this.namespace).then(result => {
                        if (result[this.namespace]) {
                            resolve(result[this.namespace]);
                        } else {
                            resolve({});
                        }
                    }).catch(error => reject(error));
                });
            },
            init: function () {
                browser.storage.local.get(this.namespace).then(result => {
                    if (!result[this.namespace]) {
                        browser.storage.local.set({ [this.namespace]: {} });
                    }
                });
            },
        },
        init: function () {
            this.contextMenu.init();
            this.controller.init();
            this.localstorage.init();
        }
    };
    tabRenamer.init();
})();