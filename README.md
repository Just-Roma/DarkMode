# DarkMode
Dead simple 'Dark mode' / 'Night mode' web extension.
# Install
__Web extension__:
1. Download ZIP.
2. Unzip the file in some folder.
3. Open Chrome/Opera/Edge/Firefox.
4. If you use Firefox, then rename the "manifest_for_firefox.json" into "manifest.json".  
   The already existing "manifest.json" must be removed or renamed.
5. Depending on the browser enter one of the following in the address bar:
   - Chrome/Opera/Edge:
      - chrome://extensions
      - opera://extensions
      - edge://extensions
   - Firefox:
      - about:debugging#/runtime/this-firefox
6. Depending on the browser do the following:
   1. Chrome/Opera/Edge:  
      Click on the "Load unpacked" or on equivalent in your browser's language.  
      Choose the unzipped folder and click open or press enter.  
   2. Firefox:  
      Click on "Load Temporary Add-on" or on equivalent in your browser's language.  
      Choose the unzipped folder and the "manifest.json", click open or press enter.  
7. :tada:
8. Well, not really :tada: if you use Firefox.  
   Open about:config in the address bar and set css.has-selector to true.  
   If you dont want to activate the extansion manually for each website, then  
   you would also have to modify permissions. If you use Firefox ~ 116.0.0, then:  
   Type about:addons, press enter, choose "Extensions" in the left menu,  
   then click on "..." button, choose "manage" option, then "permissions" tab.  
   Allow the "Run on sites with restrictions". Now it should work.  
   This sequence may vary depending on the browser version.
   
- - - -
__Stand-alone script__:
1. Open the "I_dont_want_extensions" folder, then execute_me.js.
2. Copy-paste the script in browser's console and press enter.
# Licence
MIT :copyright:
