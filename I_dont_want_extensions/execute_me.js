/*
This script does not handle:
- MutationObserver (eg resize event can restore default mode).
  You can use setTimeout in console to overcome resizing issue
  if you wish to read page's content without console.
- Asynchronous server-related stuff (eg neverending scrolling).
  Just call paint_it_black in the console.
- Local (in client) dynamic changes to DOM.
  Also call paint_it_black.
*/

'use strict';

function create_wrapper_for_extension(){
  /*
  To avoid clashing with global scope.
  */
  /*
  Control variables affect the produced dark theme.
  - PRESERVE_NON_GRAY_TEXT_COLORS is either true or false.
    If true, then the code will try to preserve colourful text.
  - DEVIATION_FROM_GRAY_SCALE_FOR_TEXT is used to separate colorful text
    from non-colorful by looking if distance between pairs of rgb values
    less than or equal to the set number.
    It is used along with PRESERVE_NON_GRAY_TEXT_COLORS.
  - PRESERVE_NON_GRAY_BACKGROUND_COLORS/DEVIATION_FROM_GRAY_SCALE_FOR_BACKGROUND
    work as the previous two, but for background colors of elements.
  - BACKGROUND_COLOR is used if PRESERVE_NON_GRAY_BACKGROUND_COLORS == true.
    Non-colorful backgrounds will be replaced with it.
  */
  const PRESERVE_NON_GRAY_TEXT_COLORS = true;
  const DEVIATION_FROM_GRAY_SCALE_FOR_TEXT = 40;
  const PRESERVE_NON_GRAY_BACKGROUND_COLORS = true;
  const DEVIATION_FROM_GRAY_SCALE_FOR_BACKGROUND = 15;
  const BACKGROUND_COLOR = [27, 27, 27];
  /*
  The SPECIAL_TAGS need to be changed, probably in some sophisticated way.
  A key must point to an array with rules. Each rule must have one of forms:
  [propertyName, value, priority] or [propertyName, value], where
  propertyName, value, priority are parameters for the setProperty method.
  */
  const SPECIAL_TAGS = {
    'HTML': [],
    'BODY': [],
    'DIV': [],
    'SPAN': [],
    'P': [
      ['opacity', '1', 'important'],
    ],
    'A': [
      ['opacity', '1', 'important'],
      ['background-color', 'transparent', 'important'], // Otherwise will hide some content.
    ],
    'IMG': [
      ['color', 'black', 'important'], // For alt text.
      ['background-color', 'white', 'important'], // For transparent images.
    ],
  };
  /*
   The COMMON_CSS contains properties, which will be assigned to
   any found element, except for those defined in EXCLUDED_TAGS.
  */
  const COMMON_CSS = [
    ['color', 'white', 'important'],
    ['background', 'rgb(27, 27, 27)', 'important'],
    ['background-color', 'rgb(27, 27, 27)', 'important'],
    ['border-color', 'white', 'important'],
    ['text-shadow', 'none', 'important'],
    ['box-shadow', 'none', 'important'],
    ['border-color', 'white', 'important'],
    ['border-bottom-color', 'white', 'important'],
    ['border-left-color', 'white', 'important'],
    ['border-right-color', 'white', 'important'],
    ['border-top-color', 'white', 'important'],
    ['caret-color', 'white', 'important'],
    ['column-rule-color', 'white', 'important'],
    ['outline-color', 'white', 'important'],
  ];
  /*
   The EXCLUDED_TAGS do not need any manipulations.
   They will be ignored by this script, when redefining CSS.
  */
  const EXCLUDED_TAGS = [
    'HEAD', 'LINK', 'STYLE', 'TITLE', 'META', 'BASE',
    'BR', 'WBR', 'SCRIPT', 'NOSCRIPT', 'PROGRESS',
    'EMBED', 'IFRAME', 'OBJECT', 'PORTAL', 'SOURCE',
  ];
  /*
  Sort of protection against PRESERVE_NON_GRAY_BACKGROUND_COLORS
  Some tags must be changed. These are defined below.
  */
  const TAGS_MUST_GET_NEW_BACKGROUND = [
    'HTML', 'BODY', 'IMG',
  ];

  function change_css_properties(tag){
    /*
    Modify CSS properties of the given tag.
    */
    let tag_style = getComputedStyle(tag);
    apply_properties(COMMON_CSS, tag, tag_style);
    const tag_name = tag.tagName;
    if (tag_name in SPECIAL_TAGS){
      apply_properties(SPECIAL_TAGS[tag_name], tag, tag_style);
    }
  }

  function apply_properties(rules, tag, tag_style){
    for (let rule of rules){
      if (rule[0] == 'color' && PRESERVE_NON_GRAY_TEXT_COLORS)
      {
        const rgba = support.extract_rgba(tag_style['color']);
        if (rgba && !support.rgb_values_equal(rgba, DEVIATION_FROM_GRAY_SCALE_FOR_TEXT)){
          continue;
        }
      }
      if ((rule[0] == 'background-color' || rule[0] == 'background') &&
          PRESERVE_NON_GRAY_BACKGROUND_COLORS &&
          !TAGS_MUST_GET_NEW_BACKGROUND.includes(tag.tagName))
      {
        const property = rule[0];
        const color = tag_style[property];
        const rgba = support.extract_rgba(color);
        if (rgba && support.rgb_values_equal(rgba, DEVIATION_FROM_GRAY_SCALE_FOR_BACKGROUND)){
          tag.style.setProperty(property, support.modify_rgba(BACKGROUND_COLOR, color), 'important');
        }
        continue;
      }
      tag.style.setProperty(...rule);
    }
  }

  function paint_it_black(){
    function paint(tag){
      /*
      Recursively go through DOM and apply change_css_properties. It is unlikely that
      a call stack will be exceeded, because normally websites' DOMs are not too deep.
      */
      if (EXCLUDED_TAGS.includes(tag.tagName)){
        return;
      }
      else{
        change_css_properties(tag);
      }
      for (let child_tag of tag.children){
        paint(child_tag);
      }
    }
    paint(document.documentElement); // Start with <html>
  }

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

    modify_rgba(rgb, str){
      /*
      Try to modify RGB values in the str.
      Input:
      1) rgb is an array, whose first 3 values correspond to red/green/blue integers/strings from [0, 255].
      2) str is the string to be modified.
      */
      const [r, g, b] = rgb;
      let rgb_match = str.match(this.RGB_RE);
      if (rgb_match){
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
      }
      let rgba_match = str.match(this.RGBA_RE);
      if (rgba_match){
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + Number(rgba_match.groups['A']) + ')';
      }
      return str; // If none matched, return the original str.
    }

    rgb_values_equal(rgb, distance = 0){
      /*
      Check if single rgb values are approximately equal.
      Input:
      1) rgb is an array, whose first 3 values correspond to red/green/blue integers/strings from [0, 255].
      2) distance is a number(preferably int), which is used to check the difference between rgb pairs.

      The func can help to detect text which has some grayish color, which can be encountered often in
      light themes. Such colors shall be converted into smth whitish to look good on dark background.
      */
      const [r, g, b] = rgb;
      /*
      Check if difference between rgb pairs is less than the given distance.
      */
      if (Math.abs(r-g) <= distance && Math.abs(r-b) <= distance && Math.abs(g-b) <= distance){
        return true;
      }
      else{
        return false;
      }
    }
  }
  let support = new Support();

  return paint_it_black;
}

const paint_it_black = create_wrapper_for_extension();
paint_it_black();
