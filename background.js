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

function insert_CSS(id, event){
  chrome.scripting.insertCSS({
    target: {
      tabId: id,
    },
    files: ['src/rules.css'],
  }).
  catch (error => {
    console.log(`${event}: failed to insert CSS: ${error}`);
  });
}

function remove_CSS(id, event){
  chrome.scripting.removeCSS({
    target: {
      tabId: id,
    },
    files: ['src/rules.css'],
  }).
  catch (error => {
    console.log(`${event}: failed to remove CSS: ${error}`);
  });
}

function handle_CSS(id, event, page_is_dark, extension_mode){
  if (extension_mode == 'dark'){
    /* We only need to handle the case, when page is light by default.
    */
    if (page_is_dark === false){
      insert_CSS(id, event);
    }
    else{
      // Page is dark by default. Do nothing.
    }
  }
  else if (extension_mode == 'light'){
    /* We only need to handle the case, when page is light by default.
    */
    if (page_is_dark === false){
      remove_CSS(id, event);
    }
    else{
      // Page is dark by default. Do nothing.
    }
  }
  // Shall never happen, but to be 100% sure.
  else{
    console.log('handle_CSS: unrecognized extension mode.');
  }
}

function handle_CSS_on_event(id, event, page_is_dark, mode = null){
  if (mode === null){
    chrome.storage.local.get(['mode']).then(results => {
      handle_CSS(id, event, page_is_dark, results['mode']);
    }, error => {
      console.log(`handle_CSS_on_event: failed to get extension's mode: ${error}`);
    });
  }
  else{
    handle_CSS(id, event, page_is_dark, mode);
  }
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
    // Shall never happen, but to be 100% sure.
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
  chrome.storage.local.get(['mode']).then(results => {
    if (results['mode'] == 'dark'){
      chrome.storage.local.set({ mode: 'light' }).then(() => {
        chrome.storage.session.get([tabId]).then(tab_settings => {
          if (tabId in tab_settings){
            if (tab_settings[tabId]['page_is_dark'] === false){
              remove_CSS(tab.id, 'onClicked');
            }
            else{
              // Page is dark by default. Do nothing.
            }
          }
          else{
            reload_page(tab.id, 'onClicked');
          }
        }, error => {
          console.log(`onClicked: failed to get tab's ID: ${error}`);
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
    else if (results['mode'] == 'light'){
      chrome.storage.local.set({ mode: 'dark' }).then(() => {
        chrome.storage.session.get([tabId]).then(tab_settings => {
          if (tabId in tab_settings){
            if (tab_settings[tabId]['page_is_dark'] === false){
              insert_CSS(tab.id, 'onClicked');
            }
            else{
              // Page is dark by default. Do nothing.
            }
          }
          else{
            reload_page(tab.id, 'onClicked');
          }
        }, error => {
        console.log(`onClicked: failed to get tab's ID: ${error}`);
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
    // Shall never happen, but to be 100% sure.
    else{
      console.log('onClicked: failed to get mode.');
    }
  }, error => {
    console.log(`onClicked: failed to get mode event: ${error}`);
  });
});


chrome.tabs.onActivated.addListener(tab => {
  const tabId = String(tab.tabId);
  chrome.storage.local.get(['mode']).then(local_settings => {
    chrome.storage.session.get([tabId]).then(tab_settings => {
      if (tabId in tab_settings){
        if (local_settings['mode'] == 'dark' && tab_settings[tabId]['page_is_dark'] === false){
          insert_CSS(tab.tabId, 'onActivated');
        }
        else if (local_settings['mode'] == 'light' && tab_settings[tabId]['page_is_dark'] === false){
          remove_CSS(tab.tabId, 'onActivated');
        }
        else{

        }
      }
      else{
        reload_page(tab.tabId, 'onActivated');
      }
    }, error => {
      console.log(`onActivated: failed to get tab's ID: ${error}`);
    });
  }, error => {
    console.log(`onActivated: failed to get mode: ${error}`);
  });
});


chrome.tabs.onRemoved.addListener(tabId => {
  chrome.storage.session.remove([String(tabId)]).catch(error => {
    console.log(`onRemoved: failed to remove tab: ${error}`);
  });
});


chrome.runtime.onMessage.addListener((data, sender) => {
  const tabId = sender.tab.id;
  const tabIdStr = String(tabId);
  const page_is_dark = data.page_is_dark;
  //chrome.storage.session.get([tabIdStr]).then(tab_settings => {
  //  console.log('onmessage ', tab_settings);
  chrome.storage.session.set({
    [tabIdStr]: {
      'page_is_dark': page_is_dark}
  }).
  then(() => {
    handle_CSS_on_event(tabId, 'onMessage', page_is_dark);
  }, error => {
    console.log(`onMessage: failed to store tab's ID: ${error}`);
  });
});
