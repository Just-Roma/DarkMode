'use strict';

// Prevent multiple injection.
(() => {
  if (window.main_script_injected != true){
    window.main_script_injected = true;

    function main(){
      if ('page_is_dark' in window){
        chrome.runtime.sendMessage({ page_is_dark: window.page_is_dark });
      }
      else {
        const true_or_false = is_page_dark();
        window.page_is_dark = true_or_false;
        chrome.runtime.sendMessage({ page_is_dark: true_or_false });
      }
    }
    window.main = main;

    function is_page_dark(){
      /*
      Try to detect if web page is already in a dark mode. If that is the case, return true, otherwise false.

      First check the main outer/inner containers. They hold the major content.
      If it is not possible to detect whether it is dark or not, check the body. If also did not work, check the html.
      */
      for (const element of [MAIN_INNER_CONTAINER, MAIN_OUTER_CONTAINER, BODY, HTML]){
        // Check if vars are elements, because they can be non-existent.
        if (element instanceof HTMLElement){
          const element_is_dark = SUPPORT.has_dark_background(element, RGB_THRESHOLD, ALPHA_THRESHOLD);
          if (element_is_dark != null){
            if (element_is_dark){
              return true;
            }
            else {
              return false;
            }
          }
        }
      }
      /*
      No idea if the page is dark or not.
      Statistically it is more likely that the page is in light mode, so return false.
      */
      return false;
    }
    /*
    This MutationObserver was introduced as a part of testing.
    It is left out for now, but could become useful in the future.

    Some sites are updated dynamically, so the main container can be added later asynchronously.

    const body_config = { childList: true };

    const body_callback = (mutationList, observer) => {
      for (const mutation of mutationList){
        if (mutation.type === "childList"){
          let oldcontainer;
          for (const element of mutation.addedNodes) {
            // Sometimes added elements can be non-HTMLElement (eg #text), hence dont have getComputedStyle method.
            if (!(element instanceof HTMLElement)) {
              continue;
            }
            oldcontainer = MAIN_CONTAINER;
            update_container(element);
            if (oldcontainer != MAIN_CONTAINER){
              let true_or_false = is_page_dark();
              window.page_is_dark = true_or_false;
              chrome.runtime.sendMessage({ page_is_dark: true_or_false });
            }
          }
        }
      }
    };
    const body_observer = new MutationObserver(body_callback);
    body_observer.observe(BODY, body_config);
    */
  }
})();

main();
