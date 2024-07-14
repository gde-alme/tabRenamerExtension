/**
 * @author gde-alme
 * 
*/

var defaultPopup = {
    newTitleInput: document.getElementById('default-popup-new-tab-title'),
    submitButton: document.getElementById('default-popup-submit-btn'),
    events: {
        keydown: function (event) {
            if (event.key === 'Enter') {
                defaultPopup.submitButton.click();
                window.close();
            }
        },
        onclick: function () {
            const newTitle = defaultPopup.newTitleInput.value;
            if (newTitle !== "") {
                chrome.runtime.sendMessage({
                    action: "changeCurrentTabTitle",
                    newTabTitle: newTitle.trim()
                });
            }
        },
        globalKeydown: function (event) {
            if (event.key === 'Escape') {
                window.close();
            }
        }
    },
    init: function () {
        this.newTitleInput.focus();
        this.submitButton.addEventListener('click', this.events.onclick);
        this.newTitleInput.addEventListener('keydown', this.events.keydown);
        document.addEventListener('keydown', this.events.globalKeydown);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    defaultPopup.init();
});