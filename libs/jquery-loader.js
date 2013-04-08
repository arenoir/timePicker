(function() {
  // Get any jquery=___ param from the query string.
  var jqversion = location.search.match(/[?&]jquery=(.*?)(?=&|$)/);
  var path;
  if (jqversion) {
    // If a version was specified, use that version from code.jquery.com.
    path = 'http://code.jquery.com/jquery-' + jqversion[1] + '.js';
  } else {
    // No version was specified, load the google cache version.
    path = 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js';
  }
  // This is the only time I'll ever use document.write, I promise!
  document.write('<script src="' + path + '"></script>');
}());
