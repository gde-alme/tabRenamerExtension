/**
 * @author gde-alme
 * 
*/

var tabScript = {
    modal: {
        html: `
            <div id="myModal" class="modal">
                <div class="modal-content">
                    <h3 class="editTab-modal-h1" >Change Tab Title</h3>
                    <span class="close" style="display: none">&times;</span>
                    <input type="text" id="new-tab-title" placeholder="Enter new tab title">
                    <button id="submit-new-tab-title">Submit</button>
                </div>
            </div>
            <style>
                .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4); }
                .modal-content { background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 30%; }
                .editTab-modal-h1 { text-align: center; color: #912912; }
                #new-tab-title { width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; color: #912912; }
                #submit-new-tab-title { background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; cursor: pointer; width: 100%; }
                .close { color: #aaa; font-size: 28px; font-weight: bold; }
                .close:hover, .close:focus { color: black; text-decoration: none; cursor: pointer; }
            </style>
            `,
        events: {
            keydown: function (event) {
                switch (event.key) {
                    case 'Escape':
                        document.getElementById('myModal').style.display = 'none';
                        break;
                    case 'Enter':
                        document.getElementById('submit-new-tab-title').click();
                        break;
                }
            },
            onclick: function () {
                const newTabTitle = document.getElementById('new-tab-title').value;
                var formData = {
                    currentTabTitle: document.title,
                    newTabTitle: newTabTitle
                }
                tabScript.controller.sendFormInputToBackground(formData);
                document.getElementById('myModal').style.display = 'none';
            },
            close: function () {
                document.getElementById('myModal').style.display = 'none';
            },
        },
        injectModal: function () {
            document.body.insertAdjacentHTML('beforebegin', this.html);
        },
        displayModal: function () {
            var modal = document.getElementById('myModal');
            modal.style.display = 'block';
            var tabTitleInput = document.getElementById('new-tab-title');
            tabTitleInput.value = document.title;
            tabTitleInput.focus();
        },
        init: function () {
            this.injectModal();
            document.getElementById('new-tab-title').addEventListener('keydown', this.events.keydown);
            document.getElementById('submit-new-tab-title').addEventListener('click', this.events.onclick);
            document.getElementsByClassName('close')[0].addEventListener('click', this.events.close);
            document.addEventListener('keydown', this.events.keydown);
        }
    },
    events: {
        listenForMessages: function () {
            browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.action === "openModal") {
                    tabScript.modal.displayModal();
                }
            });
        }
    },
    controller: {
        fetchCurrentTabTitle: function () {
            browser.runtime.sendMessage({
                action: "fetchTitle",
            }).then(res => {
                console.log(res);
                if (res.success) {
                    document.title = res.data.title;
                }
            }).catch(error => console.error('Error sending message:', error));
        },
        sendFormInputToBackground: function (formData) {
            if (formData) {
                console.log('sending form data');
                browser.runtime.sendMessage({
                    action: "changeTitle",
                    formData: formData
                }).then(res => {
                    console.log(res);
                }).catch(error => console.error('Error sending message:', error));
            }
        }
    },
    init: function () {
        this.controller.fetchCurrentTabTitle();
        this.modal.init();
        this.events.listenForMessages();
    }
};

tabScript.init();