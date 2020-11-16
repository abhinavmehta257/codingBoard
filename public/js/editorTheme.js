$(document).ready(function(){
     
    var lang = document.getElementById('lang');
    var loadedThemes = null;
    var loadedThemesData = {};
    var count = 0;

    function loadTheme(theme) {
      var path = './js/themes/' + loadedThemes[theme] + '.json';
      return fetch(path)
        .then(r => r.json())
        .then(data => {
          loadedThemesData[theme] = data;
          if (window.monaco) {
            monaco.editor.defineTheme(theme, data);
          }
          return data;
        });
    }

    // monaco.editor.setTheme('vs-dark');

    
    lang.addEventListener('change', function(ev) {
      var val = ev.target.value;
      if (val === 'vs' || val === 'vs-dark' || val === 'hc-black') {
        monaco.editor.setTheme(val);
        return;
      }

      if (loadedThemesData[val]) {
        monaco.editor.setTheme(val);
      } else {
        loadTheme(val).then((data) => {
          monaco.editor.setTheme(val);
        });
      }
    });

    function loadThemeList() {
      return fetch('./js/themes/themelist.json')
        .then(r => r.json())
        .then(data => {
          loadedThemes = data;
          var themes = Object.keys(data);
          themes.forEach(theme => {
            var opt = document.createElement('option');
            opt.value = theme;
            opt.text = data[theme]
            lang.add(opt);
          });
        });
    }

    loadThemeList();
})
   