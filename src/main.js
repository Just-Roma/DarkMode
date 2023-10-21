'use strict';

// Prevent multiple injection.
(() => {
  if (window.main_script_injected != true){
    window.main_script_injected = true;

    function main(){
      if ('page_is_dark' in window){
        chrome.runtime.sendMessage({ page_is_dark: window.page_is_dark });
      }
      else{
        const true_or_false = is_page_dark();
        window.page_is_dark = true_or_false;
        chrome.runtime.sendMessage({ page_is_dark: true_or_false });
      }
    }
    window.main = main;

    function is_page_dark(){
      /*
      Try to detect if web page is already in a dark mode.
      If that is the case, return true, otherwise false.
      */
      /*
      First check the main container. It holds the major content.
      If it is not possible to detect whether it is dark or not,
      check the body. If also did not work, check the html.
      */
      for (const element of [MAIN_CONTAINER, BODY, HTML]){
        // check if not null, because MAIN_CONTAINER can be null.
        if (element != null){
          const element_is_dark = support.has_dark_background(element, RGB_THRESHOLD, ALPHA_THRESHOLD);
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
  }
})();

main();
