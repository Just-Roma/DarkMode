'use strict';

// Prevent multiple injection.
(() => {
  if (window.support_script_injected != true){
    window.support_script_injected = true;

    window.HTML = document.documentElement;
    window.BODY = document.body;

    window.SUPPORT = {}; // Object with common specific functionality.

    class Support{
      /*
      Wrapper for common methods.
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
        else {
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

      element_is_not_transparent(element, alpha_threshold){
        /*
        Check if the given element is transparent based on the provided alpha_threshold.
        */
        const rgba = this.extract_rgba(getComputedStyle(element)['background-color']);
        if (rgba[3] && rgba[3] < alpha_threshold) return false;
        else return true;
      }
    }
    SUPPORT = new Support();
  }
})();
