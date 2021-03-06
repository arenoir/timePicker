/*! Timepicker - v0.4.0 - 2013-05-15
* http://labs.perifer.se/timedatepicker/
* Copyright (c) 2013 Dennis Burke; Licensed MIT, GPL */
(function ($) {
  "use strict";
  var methods = {
    init: function (options) {
      // Build main options before element iteration
      var settings = $.extend({}, $.fn.timePicker.defaults, options);

      return this.each(function () {
          $.timePicker(this, settings);
        });
    },
    destroy: function () {
      return this.each(function () {
        if (this.timePicker) {
          var tpdiv = $(this).data('timepickerdiv');
          $(this).data('timepickerdiv', '');
          $('#' + tpdiv).remove();
          delete this.timePicker;
        }
      });
    }
  };

  $.timePicker = function (elm, settings) {
    try {
      var e = $(elm)[0];
      return e.timePicker || (e.timePicker = new $._timePicker(e, settings));
    } catch (err) {
      throw 'timepicker must be called on an element';
    }
  };

  $.timePicker.version = '0.4.0';

  $._timePicker = function (elm, settings) {

    var tpOver = false;
    var keyDown = false;
    var startTime = timeToDate(settings.startTime, settings);
    var endTime = timeToDate(settings.endTime, settings);
    // add default time
    var defaultSelected = settings.defaultSelected ? timeToDate(settings.defaultSelected, settings) : startTime;
    var selectedClass = "selected";
    var selectedSelector = "li." + selectedClass;
    var divid = 'tp' + new Date().getTime();

    $(elm).attr('autocomplete', 'off'); // Disable browser autocomplete
    $(elm).data('timepickerdiv', divid);

    var times = [];
    var time = new Date(startTime); // Create a new date object.
    while (time <= endTime) {
      times[times.length] = formatTime(time, settings);
      time = new Date(time.setMinutes(time.getMinutes() + settings.step));
    }

    var $tpDiv = $('<div id="' + divid + '" class="time-picker' +
        (settings.show24Hours ? '' : ' time-picker-12hours') + '"></div>');
    var $tpList = $('<ul></ul>');

    // Build the list.
    for (var i = 0; i < times.length; i += 1) {
      $tpList.append("<li>" + times[i] + "</li>");
    }
    $tpDiv.append($tpList);
    // Append the timPicker to the body and position it.
    $tpDiv.appendTo('body').hide();

    // Store the mouse state, used by the blur event. Use mouseover instead of
    // mousedown since Opera fires blur before mousedown.
    $tpDiv.mouseover(function () {
      tpOver = true;
    }).mouseout(function () {
      tpOver = false;
    });

    $("li", $tpList).mouseover(function () {
      if (!keyDown) {
        $(selectedSelector, $tpDiv).removeClass(selectedClass);
        $(this).addClass(selectedClass);
      }
    }).mousedown(function () {
      tpOver = true;
    }).click(function () {
      setTimeVal(elm, this, $tpDiv, settings);
      tpOver = false;
    });

    var showPicker = function () {
      if ($tpDiv.is(":visible")) {
        return false;
      }
      $("li", $tpDiv).removeClass(selectedClass);

      // Position
      var elmOffset = $(elm).offset();
      $tpDiv.css({'top': elmOffset.top + elm.offsetHeight, 'left': elmOffset.left});

      // Show picker. This has to be done before scrollTop is set since that
      // can't be done on hidden elements.
      $tpDiv.show();

      // Try to find a time in the list that matches the entered time.
      var time = elm.value ? timeStringToDate(elm.value, settings) : defaultSelected;
      var startMin = startTime.getHours() * 60 + startTime.getMinutes();
      var min = (time.getHours() * 60 + time.getMinutes()) - startMin;
      var steps = Math.round(min / settings.step);
      var roundTime = normaliseTime(new Date(0, 0, 0, 0, (steps * settings.step + startMin), 0));
      roundTime = (startTime < roundTime && roundTime <= endTime) ? roundTime : startTime;
      var $matchedTime = $("li:contains(" + formatTime(roundTime, settings) + ")", $tpDiv);

      if ($matchedTime.length) {
        $matchedTime.addClass(selectedClass);
        // Scroll to matched time.
        $tpDiv[0].scrollTop = $matchedTime[0].offsetTop;
      }
      return true;
    };
    // Attach to click as well as focus so timePicker can be shown again when
    // clicking on the input when it already has focus.
    $(elm).focus(showPicker).click(showPicker);
    // Hide timepicker on blur
    $(elm).blur(function () {
      if (!tpOver) {
        $tpDiv.hide();
      }
      $(this).val(sanitizeTimeString($(this).val(), settings));
    });
    // Keypress doesn't repeat on Safari for non-text keys.
    // Keydown doesn't repeat on Firefox and Opera on Mac.
    // Using kepress for Opera and Firefox and keydown for the rest seems to
    // work with up/down/enter/esc.
    // $.browser is deprecated and this functionality is not necessarily vital
    // to the entire plugin.  If the browser won't handle this keyboard
    // navigation properly, all is not lost.  keydown is technically the right
    // event.
    //var event = ($.browser.opera || $.browser.mozilla) ? 'keypress' : 'keydown';
    $(elm).keydown(function (e) {
      var $selected;
      keyDown = true;
      var top = $tpDiv[0].scrollTop;
      switch (e.which) {
      case 38: // Up arrow.
        // Just show picker if it's hidden.
        if (showPicker()) {
          break;
        }
        $selected = $(selectedSelector, $tpList);
        var prev = $selected.prev().addClass(selectedClass)[0];
        if (prev) {
          $selected.removeClass(selectedClass);
          // Scroll item into view.
          if (prev.offsetTop < top) {
            $tpDiv[0].scrollTop = top - prev.offsetHeight;
          }
        }
        else {
          // Loop to next item.
          $selected.removeClass(selectedClass);
          prev = $("li:last", $tpList).addClass(selectedClass)[0];
          $tpDiv[0].scrollTop = prev.offsetTop - prev.offsetHeight;
        }
        break;
      case 40: // Down arrow, similar in behaviour to up arrow.
        if (showPicker()) {
          break;
        }
        $selected = $(selectedSelector, $tpList);
        var next = $selected.next().addClass(selectedClass)[0];
        if (next) {
          $selected.removeClass(selectedClass);
          if (next.offsetTop + next.offsetHeight > top + $tpDiv[0].offsetHeight) {
            $tpDiv[0].scrollTop = top + next.offsetHeight;
          }
        }
        else {
          $selected.removeClass(selectedClass);
          next = $("li:first", $tpList).addClass(selectedClass)[0];
          $tpDiv[0].scrollTop = 0;
        }
        break;
      case 13: // Enter
        if ($tpDiv.is(":visible")) {
          var sel = $(selectedSelector, $tpList)[0];
          setTimeVal(elm, sel, $tpDiv, settings);
          // preventDefault so that enter won't try to submit the form
          e.preventDefault();
        }
        break;
      case 27: // Esc
        $tpDiv.hide();
        break;
      }
    });
    $(elm).keyup(function () {
      keyDown = false;
    });
    // Helper function to get an inputs current time as Date object.
    // Returns a Date object.
    this.getTime = function () {
      return timeStringToDate(elm.value, settings);
    };
    // Helper function to set a time input.
    // Takes a Date object or string.
    this.setTime = function (time) {
      elm.value = formatTime(timeToDate(time, settings), settings);
      // Trigger element's change events.
      $(elm).change();
    };

  }; // End fn;

  $.fn.timePicker = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.tooltip');
    }
  };

  // Plugin defaults.
  $.fn.timePicker.defaults = {
    step: 30,
    startTime: new Date(0, 0, 0, 0, 0, 0),
    endTime: new Date(0, 0, 0, 23, 30, 0),
    defaultSelected: null,
    separator: ':',
    show24Hours: true
  };


  // Private functions.
  function setTimeVal(elm, sel, $tpDiv) {
    // Update input field
    elm.value = $(sel).text();
    // Trigger element's change events.
    $(elm).change();
    // Keep focus for all but IE (which doesn't like it)
    //if (!$.browser.msie) {
    elm.focus();
    //}
    // Hide picker
    $tpDiv.hide();
  }

  function formatTime(time, settings) {
    var h = time.getHours();
    var hours = settings.show24Hours ? h : (((h + 11) % 12) + 1);
    var minutes = time.getMinutes();
    return formatNumber(hours) + settings.separator + formatNumber(minutes) + (settings.show24Hours ? '' : ((h < 12) ? ' am' : ' pm'));
  }

  function formatNumber(value) {
    return (value < 10 ? '0' : '') + value;
  }

  function timeToDate(input, settings) {
    return (typeof input === 'object') ? normaliseTime(input) : timeStringToDate(input, settings);
  }

  function timeStringToDate(input, settings) {
    if (input) {
      input = sanitizeTimeString(input, settings);
      var array = input.split(settings.separator);
      var hours = parseFloat(array[0]);
      var minutes = parseFloat(array[1]);

      // Convert AM/PM hour to 24-hour format.
      if (!settings.show24Hours) {
        if (hours === 12 && input.indexOf('am') !== -1) {
          hours = 0;
        }
        else if (hours !== 12 && input.indexOf('pm') !== -1) {
          hours += 12;
        }
      }
      var time = new Date(0, 0, 0, hours, minutes, 0);
      return normaliseTime(time);
    }
    return null;
  }

  /* Normalise time object to a common date. */
  function normaliseTime(time) {
    time.setFullYear(2001);
    time.setMonth(0);
    time.setDate(0);
    return time;
  }
  
  function sanitizeTimeString(sTime, settings) {
    var t, s, v, hours, minutes, ampm;
    
    //skip if using 24hours
    if (settings.show24Hours) {
      return sTime;
    }
    
    if (sTime) {
      s = sTime.toLowerCase().replace(/\s*/g, '');
      
      //time strings in format of 1pm
      if (t = /^(\d{1,2})(a|p)m*$/.exec(s)) {
        if ((parseInt(t[1], 10) < 12)) {
          return "" + t[1] + ":00" + t[2] + "m";
        }
      
      //time strings in format of 10:30pm
      } else if (v = /^(\d{1,2}):(\d{1,2})(a|p)m*$/.exec(s)) {
        hours   = parseInt(v[1], 10);
        minutes = parseInt(v[2], 10);
        ampm    = v[3] + "m";
        if ( hours < 12 || minutes < 59) {
          return "" + hours + ":" + ( minutes >= 10 ? minutes : minutes + '0' ) + ampm;
        }
      
      //time string in format of 13:00
      } else if (v = /^(\d{1,2}):(\d{1,2})$/.exec(s)) {
        hours   = parseInt(v[1], 10);
        minutes = parseInt(v[2], 10);
        ampm    = 'am';
        if (hours <= 24 && minutes <= 59) {
          if (hours >= 12) {
            hours = hours-12;
            ampm = "pm";
          }
          if (hours === 0) {
            hours = 12;
          }
          return hours + ':' + minutes + ampm;
        }
      }
    }
  }
  
})(jQuery);
