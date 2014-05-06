'use strict';

var assert = require('assert');
var MarionetteHelper = requireGaia('/tests/js-marionette/helper.js');
var PerformanceHelper =
  requireGaia('/tests/performance/performance_helper.js');
var SettingsIntegration = require('./integration.js');
var Actions = require('marionette-client').Actions;

marionette(mozTestInfo.appPath + ' >', function() {
  var app;
  var client = marionette.client({
    settings: {
      'ftu.manifestURL': null
    }
  });

  var chrome = client.scope({context: 'chrome' });
  var actions = new Actions(client);
  app = new SettingsIntegration(client, mozTestInfo.appPath);

  setup(function() {
    // It affects the first run otherwise
    this.timeout(500000);
    client.setScriptTimeout(50000);
    MarionetteHelper.unlockScreen(client);
  });

  test('Overfill Settings Scroll >', function() {
    var results = [];
    results["fakeResults"] = 2048;

    var performanceHelper = new PerformanceHelper({
      app: app
    });

    function sendOverfill() {
      window.wrappedJSObject.mozRequestOverfill(function result(aOverfill) {
        /*
        console.log("Overfill is: " + aOverfill);
        dump("Dump overfill is: " + aOverfill);
        */

        //var results = { "overfill" : aOverfill };
        //performanceHelper.reportCustom("overfill", results);
        //assert.ok(aOverfill <= 300, "Overfill numbers are greater than 300");
        //var results = {};
        //results["overfill"] = aOverfill;

        marionetteScriptFinished(aOverfill);
      });
    }

    function requestOverfill() {
      results.push(chrome.executeScript(sendOverfill));
    }

    performanceHelper.repeatWithDelay(function(app, next) {
      var waitForBody = true;
      app.launch(waitForBody);

      //performanceHelper.observe();

      app.element('wifiSelector', function(err, wifiSubpanel) {
        var width = wifiSubpanel.size()['width'];
        var height = wifiSubpanel.size()['height'];

        // Scrolling should happen here
        actions.flick(wifiSubpanel, width / 2, height / 2, width / 2, -400, 200);
        requestOverfill();
        app.close();
      });
    });

    PerformanceHelper.reportDuration(results, "FakeResults");

  });
});
