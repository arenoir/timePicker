/*global module:false, test:false, expect:false ok:false equal:false*/
/*global strictEqual:false, _$:false*/
module('timePicker init', {
  teardown: function () {
    "use strict";
    var tpdiv = _$('#id_timepicker').data('timepickerdiv');
    _$('#' + tpdiv).remove();
  }
});

test('instantiate', function () {
  "use strict";
  expect(4);
  ok(_$('#id_timepicker').timePicker(), 'new instance');
  equal(_$('div.time-picker li:first').text(), '00:00', 'defaults to ' +
    '24-hour clock');
  equal(_$('div.time-picker li').length, 48, 'default settings produce 48 ' +
    'items');
  strictEqual(_$('div.time-picker li:last').text(), '23:30', 'time range is ' +
    'from 00:00 - 23:30');
});

test('instantiate in 12-hour format', function () {
  "use strict";
  expect(2);
  ok(_$('#id_timepicker').timePicker({show24Hours: false}), '12-hour ' +
    'timepicker');
  // not all browsers have a string.endsWith method, but they all handle regex.
  ok(/AM$/.test(_$('div.time-picker li:first').text()), 'shows am/pm');
});

test('instantiate with specified separator', function () {
  "use strict";
  expect(2);
  ok(_$('#id_timepicker').timePicker({separator: '.'}), "'.' separator");
  strictEqual(_$('div.time-picker li:first').text(), '00.00', 'proper');
});

test('instantiate with new start and end times', function () {
  "use strict";
  expect(4);
  var s = new Date(0, 0, 0, 6, 0, 0);
  var e = new Date(0, 0, 0, 17, 30, 0);
  var startandend = {
    startTime: s,
    endTime: e
  };
  ok(_$('#id_timepicker').timePicker(startandend), 'timepicker from 6 am up ' +
    'to 6pm');
  equal(_$('div.time-picker li:first').text(), '06:00', 'first time option ' +
    'is 06:00');
  equal(_$('div.time-picker li').length, 24, 'default settings produce 48 ' +
    'items');
  strictEqual(_$('div.time-picker li:last').text(), '17:30', 'time range is ' +
    'from 06:00 - 17:30');
});

test('instantiate with a step of 20-minutes', function () {
  "use strict";
  expect(4);
  // extend the default end time just so it fits to a round number
  var e = new Date(0, 0, 0, 23, 40, 0);
  ok(_$('#id_timepicker').timePicker({step: 20, endTime: e}), 'lists every ' +
    '20 minutes');
  equal(_$('div.time-picker li:first').text(), '00:00', 'defaults to ' +
    '24-hour clock');
  equal(_$('div.time-picker li').length, 72, 'default settings produce 48 ' +
    'items');
  strictEqual(_$('div.time-picker li:last').text(), '23:40', 'time range is ' +
    'from 00:00 - 23:40');
});

test('utilize the keyboard shortcuts', function () {
  "use strict";
  expect(4);
  strictEqual(_$('#id_timepicker').val(), '', 'initially empty');
  var up = _$.Event("keydown");
  up.which = 38;
  var down = _$.Event("keydown");
  down.which = 40;
  var enter = _$.Event("keydown");
  enter.which = 13;
  var esc = _$.Event("keydown");
  esc.which = 27;
  // focus, hit down, then enter.  should change the value
  // focus changes it to the first value, down changes it to the second, enter
  // sets it.  thus, 00:30
  _$('#id_timepicker').timePicker().focus().trigger(down).trigger(enter);
  strictEqual(_$('#id_timepicker').val(), '00:30', 'populated with proper ' +
    'data');
  _$('#id_timepicker').focus().trigger(up).trigger(enter);
  strictEqual(_$('#id_timepicker').val(), '00:00', 'up arrow changes value');
  // move down three times and up once then hit escape.  value should still be
  // the same.
  _$('#id_timepicker').focus(function () {
    this.trigger(down).trigger(down).trigger(down).trigger(down).trigger(up)
    .trigger(esc);
  });
  strictEqual(_$('#id_timepicker').val(), '00:00', 'move around a bit, then ' +
      'hit escape. same value as before');
});

module('timePicker destroy');
test('init and destroy', function () {
  "use strict";
  expect(8);
  var tp = _$('#id_timepicker').timePicker();
  _$('#qunit-fixture span').append('<input type="text" id="id_timepicker2" ' +
    'value="" name="timepicker2" />');
  var tp2 = _$('#id_timepicker2').timePicker();
  ok(tp, 'init');
  ok(tp2, 'init another');
  ok(/tp\d+/.test(tp.data('timepickerdiv')), "id of this timepicker's div " +
    "stored in data");
  ok(_$('#' + tp.data('timepickerdiv')), 'timepicker div exists');
  ok(tp.timePicker('destroy'), 'destroy');
  strictEqual(tp.data('timepickerdiv'), '', 'timepicker div does not exist');
  ok(/tp\d+/.test(tp2.data('timepickerdiv')), 'timepicker2 still exists');
  ok(tp2.timePicker('destroy'), 'destroy the second timePicker');
});
