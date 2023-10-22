/*
All errors are logged with console.log to avoid popping up of the "errors" button.
*/

'use strict'

const DARK_PATH = {
  48: '/icons/dark_48.png',
  64: '/icons/dark_64.png',
  128: '/icons/dark_128.png',
  256: '/icons/dark_256.png',
  512: '/icons/dark_512.png'
}

const LIGHT_PATH = {
  48: '/icons/light_48.png',
  64: '/icons/light_64.png',
  128: '/icons/light_128.png',
  256: '/icons/light_256.png',
  512: '/icons/light_512.png'
}

function reload_page(id, event){
  chrome.tabs.reload(
    id,
    {bypassCache: true}
  ).
  catch(error => {
    console.log(`${event}: failed to reload the page: ${error}`);
  });
}

function reload_http_and_https(id, event){
  chrome.tabs.query({currentWindow: true, active: true}).then(query_result => {
    if ('url' in query_result[0] && query_result[0].url.match(/^https?/)){
      reload_page(id, event);
    }
  }, error => {
    console.log(`${event}: failed to query the active tab: ${error}`);
  });
}

function insert_CSS(id, event){
  chrome.scripting.insertCSS({
    target: {
      tabId: id,
    },
    files: ['/src/rules.css'],
  }).
  then(() => {
    chrome.storage.session.set({
      [String(id)]: {
        'page_is_dark': false,
        'css_inserted': true
      }
    }).
    catch(error => {console.log(`${event}: failed to store tab's settings: ${error}`);});
  }, error => {
    console.log(`${event}: failed to insert CSS: ${error}`);
  });
}

function remove_CSS(id, event){
  chrome.scripting.removeCSS({
    target: {
      tabId: id,
    },
    files: ['/src/rules.css'],
  }).
  then(() => {
    chrome.storage.session.set({
      [String(id)]: {
        'page_is_dark': false,
        'css_inserted': false
      }
    }).
    catch(error => {console.log(`${event}: failed to store tab's settings: ${error}`);});
  }, error => {
    console.log(`${event}: failed to remove CSS: ${error}`);
  });
}


/*----------------------------   Events   -----------------------------*/

chrome.runtime.onInstalled.addListener(() => {
  /* Always store the mode when installed. Default is dark.
  */
  chrome.storage.local.set({ mode: 'dark' }).catch(error => {
    console.log(`onInstalled: failed to initialize extension: ${error}`);
  });
});


chrome.runtime.onStartup.addListener(() => {
  /* Set icons and title, depending on mode.
  */
  chrome.storage.local.get(['mode']).then(mode => {
    if (mode['mode'] == 'dark'){
      chrome.action.setIcon({ path: DARK_PATH }).catch(error => {
        console.log(`onStartup: failed to set dark icon: ${error}`);
      });
      chrome.action.setTitle({ title: 'In dark mode' }).catch(error => {
        console.log(`onStartup: failed to set title for dark mode: ${error}`);
      });
    }
    else if (mode['mode'] == 'light'){
      chrome.action.setIcon({ path: LIGHT_PATH }).catch(error => {
        console.log(`onStartup: failed to set light icon: ${error}`);
      });
      chrome.action.setTitle({ title: 'In light mode' }).catch(error => {
        console.log(`onStartup: failed to set title for light mode: ${error}`);
      });
    }
    // Shall never happen, but print just in case.
    else{
      console.log('onStartup: unrecognized mode.');
    }
  }, error => {
    console.log(`onStartup: failed to initialize mode: ${error}`);
  });
});


chrome.action.onClicked.addListener(tab => {
  /* Clicking on the extension button shall reset the mode.
  */
  const tabId = String(tab.id);
  chrome.storage.local.get(['mode']).then(mode => {
    if (mode['mode'] == 'dark'){
      chrome.storage.local.set({ mode: 'light' }).then(() => {
        chrome.storage.session.get([tabId]).then(tab_settings => {
          /* If tab is stored, then set the light mode.
          */
          if (tabId in tab_settings){
            tab_settings = tab_settings[tabId];
            if (tab_settings['page_is_dark'] === false && tab_settings['css_inserted'] == true){
              remove_CSS(tab.id, 'onClicked');
            }
            else{
              // Page is dark by default. Do nothing.
            }
          }
          else{
            reload_http_and_https(tab.id, 'onClicked');
          }
        }, error => {
          console.log(`onClicked: failed to get tab's settings: ${error}`);
        });
        chrome.action.setIcon({ path: LIGHT_PATH }).catch(error => {
          console.log(`onClicked: failed to set light icon: ${error}`);
        });
        chrome.action.setTitle({ title: 'In light mode' }).catch(error => {
          console.log(`onClicked: failed to set title for light mode: ${error}`);
        });
      }, error => {
        console.log(`onClicked: failed to set light mode: ${error}`);
      });
    }
    else if (mode['mode'] == 'light'){
      chrome.storage.local.set({ mode: 'dark' }).then(() => {
        chrome.storage.session.get([tabId]).then(tab_settings => {
          /* If tab is stored, then set the dark mode.
          */
          if (tabId in tab_settings){
            tab_settings = tab_settings[tabId];
            if (tab_settings['page_is_dark'] === false && tab_settings['css_inserted'] == false){
              insert_CSS(tab.id, 'onClicked');
            }
            else{
              // Page is dark by default. Do nothing.
            }
          }
          else{
            reload_http_and_https(tab.id, 'onClicked');
          }
        }, error => {
        console.log(`onClicked: failed to get tab's settings: ${error}`);
        });
        chrome.action.setIcon({ path: DARK_PATH }).catch(error => {
          console.log(`onClicked: failed to set dark icon: ${error}`);
        });
        chrome.action.setTitle({ title: 'In dark mode' }).catch(error => {
          console.log(`onClicked: failed to set title for dark mode: ${error}`);
        });
      }, error => {
        console.log(`onClicked: failed to set dark mode: ${error}`);
      });
    }
    // Shall never happen, but print just in case.
    else{
      console.log('onClicked: wrong mode.');
    }
  }, error => {
    console.log(`onClicked: failed to get mode: ${error}`);
  });
});


chrome.tabs.onActivated.addListener(tab => {
  /* The first click on a tab shall put it in appropriate mode.
  */
  const tabId = String(tab.tabId);
  chrome.storage.local.get(['mode']).then(mode => {
    chrome.storage.session.get([tabId]).then(result => {
      /* If tab is stored, then apply the right mode.
      */
      if (tabId in result){
        const tab_settings = result[tabId];
        if (tab_settings['page_is_dark'] === false){
          if (mode['mode'] == 'dark'){
            if (tab_settings['css_inserted'] == false){
              insert_CSS(tab.tabId, 'onActivated');
            }
            else{
              // Mode is dark and CSS is already inserted. Do nothing.
            }
          }
          else if (mode['mode'] == 'light'){
            if (tab_settings['css_inserted'] == true){
              remove_CSS(tab.tabId, 'onActivated');
            }
            else{
              // Mode is light and CSS is already removed. Do nothing.
            }
          }
          // Shall never happen, but print just in case.
          else{
            console.log('onActivated: wrong mode.');
          }
        }
        else{
          // Page is dark by default. Do nothing.
        }
      }
      /* It can happen that a tab was not stored. Eg already existing tabs after installation.
      */
      else{
        /* It can happen that content scripts are not injected in a page.
        Eg www.google.com in Opera. Maybe it is necessary to adjust browser's
        configurations to make it work. But it probably requires manual work:
        In the ExtensionsSettings for instance. So, if a tab, after being
        activated, does not have an entry in the session storage, it gets one.
        This means that the tab won't be reloaded each time it is clicked on.
        */
        chrome.storage.session.set({
          [tabId]: {}
        }).
        then(() => {
          reload_http_and_https(tab.tabId, 'onActivated');
        }, error => {
          console.log(`onActivated: failed to store tab: ${error}`);
        });
      }
    }, error => {
      console.log(`onActivated: failed to get tab's settings: ${error}`);
    });
  }, error => {
    console.log(`onActivated: failed to get mode: ${error}`);
  });
});


chrome.tabs.onRemoved.addListener(tabId => {
  /* Remove tab's entry from the session storage after closing it.
  */
  chrome.storage.session.remove([String(tabId)]).catch(error => {
    console.log(`onRemoved: failed to remove tab: ${error}`);
  });
});


chrome.runtime.onMessage.addListener((data, sender) => {
  /* React on a message coming from content script.
  */
  const tabId = sender.tab.id;
  const tabIdStr = String(tabId);
  /*
  Change only if page is light.
  */
  if (data.page_is_dark === false){
    chrome.storage.local.get(['mode']).then(mode => {
      if (mode['mode'] == 'dark'){
        insert_CSS(tabId, 'onMessage');
      }
      else if (mode['mode'] == 'light'){
        chrome.storage.session.set({
          [tabIdStr]: {
            'page_is_dark': false,
            'css_inserted': false
          }
        }).catch(error => {console.log(`onMessage: failed to store tab's settings: ${error}`);});
      }
      // Shall never happen, but print just in case.
      else{
        console.log('onMessage: unrecognized mode.');
      }
    }, error => {
      console.log(`onMessage: failed to get mode: ${error}`);
    });
  }
  // Otherwise no css will ever be needed.
  else{
    chrome.storage.session.set({
        [tabIdStr]: {'page_is_dark': true}
    }).
    catch(error => {console.log(`onMessage: failed to store tab's settings: ${error}`);});
  }
});
