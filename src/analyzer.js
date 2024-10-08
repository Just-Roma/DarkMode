'use strict';

// Prevent multiple injection.
(() => {
  if (window.analyzer_script_injected != true){
    window.analyzer_script_injected = true;

    window.RGB_THRESHOLD = [50, 50, 50];
    window.ALPHA_THRESHOLD = 0.5;

    window.MAIN_OUTER_CONTAINER = null;
    window.MAIN_OUTER_CONTAINER_SIZE = 0;
    find_main_outer_container(BODY);

    window.MAIN_INNER_CONTAINER = null;
    window.MAIN_INNER_CONTAINER_SIZE = 0;
    find_main_inner_container(MAIN_OUTER_CONTAINER);

    function find_main_outer_container(element){
      /*
      Tries to find the container tag, which holds the main content, within the given element.
      */
      // Check if element exists (eg body may not exist in img files).
      if (element instanceof HTMLElement){
        for (const _element of element.children) {
          // Safety measure
          if (_element instanceof HTMLElement) update_main_outer_container(_element);
        }
      }
    }

    function update_main_outer_container(element){
      /*
      Compares the globally stored container with the currently examined element, if bigger, then update global vars.

      Presumably the main container tag would be the largest one. So we'll calculate the area.
      Also check that a tag is visible, because it can be placed beyond the visible area of the screen.
      */
      const element_style = getComputedStyle(element);
      if (element_style['display'] != 'none'){
        const position = element.getBoundingClientRect();
        if (
          position['x'] < innerWidth && position['x'] + position['width'] >= 0 &&         // Top-left x-position must be on [0, innerWidth) intervall.
          position['y'] < HTML.scrollHeight && position['y'] + position['height'] >= 0 && // Top-left y-position must be on [0, HTML.scrollHeight) intervall.
          position['width'] * position['height'] > MAIN_OUTER_CONTAINER_SIZE
        ){
          MAIN_OUTER_CONTAINER_SIZE = position['width'] * position['height'];
          MAIN_OUTER_CONTAINER = element;
        }
      }
    }

    function find_main_inner_container(element){
      /*
      Tries to find the container tag within body, which holds the main content.
      */
      function recurse_dom(element){
        // Safety measure.
        if (element instanceof HTMLElement){
          for (const _element of element.children){
            // Any, even partially transparent, elements are excluded.
            if (SUPPORT.element_is_not_transparent(_element, 1)) update_main_inner_container(_element);
            recurse_dom(_element);
          }
          // It can happen that a part of a popup is a shadow DOM.
          const shadow = element.shadowRoot;
          if (shadow){
            for (const _element of shadow.children){
              // Any, even partially transparent, elements are excluded.
              if (SUPPORT.element_is_not_transparent(_element, 1)) update_main_inner_container(_element);
              recurse_dom(_element);
            }
          }
        }
        return;
      }
      recurse_dom(element);
    }

    function update_main_inner_container(element){
      const element_style = getComputedStyle(element);
      if (element_style['display'] != 'none'){
        const position = element.getBoundingClientRect();
        if (position['width'] * position['height'] >= MAIN_INNER_CONTAINER_SIZE){
          MAIN_INNER_CONTAINER_SIZE = position['width'] * position['height'];
          MAIN_INNER_CONTAINER = element;
        }
      }
    }
  }
})();
