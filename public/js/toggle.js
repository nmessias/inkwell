/**
 * Dark mode toggle for non-reader pages
 * ES5 syntax for Kindle browser compatibility
 */
(function() {
  // Set a cookie with 1 year expiry
  function setCookie(name, value) {
    var d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    var expires = 'expires=' + d.toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + ';' + expires + ';path=/';
  }

  // Save settings to cookie (and localStorage as backup)
  function saveSettings(isDark) {
    // For non-reader pages, font defaults to 18
    var settings = JSON.stringify({ dark: isDark, font: 18 });
    setCookie('reader_settings', settings);
    try {
      localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    } catch(e) {}
  }

  function hasDarkMode() {
    return document.body.className.indexOf('dark-mode') !== -1;
  }

  // Dark mode is already applied by server via cookie - no need to read localStorage on load

  var toggle = document.querySelector('.dark-toggle');
  if (toggle) {
    toggle.onclick = function() {
      var nowDark;
      if (hasDarkMode()) {
        document.body.className = document.body.className.replace(' dark-mode', '');
        nowDark = false;
      } else {
        document.body.className = document.body.className + ' dark-mode';
        nowDark = true;
      }
      saveSettings(nowDark);
    };
  }
})();
