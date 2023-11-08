'use strict';

// Prevent multiple injection.
(() => {
  if (window.support_script_injected != true){
    window.support_script_injected = true;
    window.HTML = document.documentElement;
    window.BODY = document.body;
    window.MAIN_CONTAINER = find_main_container();

    window.RGB_THRESHOLD = [60, 60, 60];
    window.ALPHA_THRESHOLD = 0.5;
    window.support = {}; // Object with common specific functionality.

    class Support{
      /*
      Wrapper for common methods used by the main.js
      */
      constructor(){
        // i flag to make case-insensitive. It won't hurt.
        this.RGB_RE  =  /rgb\((?<R>\d+),\s*(?<G>\d+),\s*(?<B>\d+)\)/i;
        this.RGBA_RE = /rgba\((?<R>\d+),\s*(?<G>\d+),\s*(?<B>\d+),\s*(?<A>\d|\d\.\d+)\)/i;
      }

      extract_rgba(str){
        /*
        Try to extract RGBA values from the str.
        */
        let rgb_match = str.match(this.RGB_RE);
        if (rgb_match){
          return [
            Number(rgb_match.groups['R']),
            Number(rgb_match.groups['G']),
            Number(rgb_match.groups['B']),
            null
          ];
        }
        let rgba_match = str.match(this.RGBA_RE);
        if (rgba_match){
          return [
            Number(rgba_match.groups['R']),
            Number(rgba_match.groups['G']),
            Number(rgba_match.groups['B']),
            Number(rgba_match.groups['A'])
          ];
        }
        return null; // If none matched, return null.
      }

      rgb_below_threshold(rgb, threshold){
        /*
        Input:
        1) rgb is an array, whose first 3 values correspond to red/green/blue integers from [0, 255].
        2) threshold is an array, whose first 3 values correspond to threshold-numbers for the rgb.
        */
        const [r, g, b] = rgb;
        const [R, G, B] = threshold;
        if (r <= R && g <= G && b <= B){
          return true;
        }
        else{
          return false;
        }
      }

      has_dark_background(element, rgb_threshold, alpha_threshold){
        /*
        Check if DOM element looks dark to a human eye.
        Input:
        1) element must be a DOM element.
        2) rgb_threshold must be an array, with first 3 values being rgb-thresholds.
        3) alpha_threshold must be a threshold-number(int/float) from [0, 1] for opacity.
        Output:
        - null if background could not be recognized or is transparent.
        - true if background is darkish.
        - false if background is whitish.
        */
        const rgba = this.extract_rgba(getComputedStyle(element)['background-color']);

        // RGBA could not be extracted, hence the color is unknown.
        if (rgba == null){
          return null;
        }
        // Otherwise rgba is either RGB or RGBA.
        const alpha = rgba[3];
        const rgb_is_dark = this.rgb_below_threshold(rgba, rgb_threshold);

        // No alpha and dark rgb.
        if (alpha == null && rgb_is_dark){
          return true;
        }
        // No alpha and light rgb.
        else if (alpha == null && !rgb_is_dark){
          return false;
        }
        // alpha is small enough to consider background transparent.
        else if (alpha <= alpha_threshold){
          return null;
        }
        // alpha is large enough, so return the estimation of darkness.
        else {
          return rgb_is_dark;
        }
      }
    }
    support = new Support();

    function find_main_container(){
      /*
      Tries to find the container tag within body, which holds the main content.
      */
      let main = null;
      /*
      Presumably such tag would be the largest one can be placed in the depth of DOM.
      So we'll go recursevely and calculate the area. Also check that a tag is truly
      within body, because it is possible to move a tag beyond the visible area on the screen.
      */
      let size_of_main = 0;
      const position_of_body = BODY.getBoundingClientRect();

      function check_element(tag){
        for (const element of tag.children){
          const element_style = getComputedStyle(element);
          if (element_style['display'] != 'none' && element.getBoundingClientRect){
            const position = element.getBoundingClientRect();
            if (position['x']      >= position_of_body['x']      &&
                position['y']      >= position_of_body['y']      &&
                position['width']  <= position_of_body['width']  &&
                position['height'] <= position_of_body['height'] &&
                position['width'] * position['height'] >= size_of_main
               ){
                main = element;
                size_of_main = position['width'] * position['height'];
            }
          }
          check_element(element);
        }

      }
      check_element(BODY);

      return main;
    }
  }
})();
