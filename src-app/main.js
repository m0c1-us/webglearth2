/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2013 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('weapp.App');

goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.events.EventType');

goog.require('klokantech.Nominatim');
goog.require('weapi.exports.App');



/**
 * @constructor
 */
weapp.App = function() {
  /**
   * @type {!weapi.exports.App}
   * @private
   */
  this.app_ = new weapi.exports.App('webglearthdiv', {
    atmosphere: true,
    sky: false,
    position: [0, 0],
    altitude: 7000000,
    panning: true,
    tilting: true,
    zooming: true,
    proxyHost: 'http://srtm.webglearth.com/cgi-bin/corsproxy.fcgi?url='
  });

  /**
   * @type {!goog.dom.ViewportSizeMonitor}
   * @private
   */
  this.vsm_ = new goog.dom.ViewportSizeMonitor();
  goog.events.listen(this.vsm_, goog.events.EventType.RESIZE, function(e) {
    this.resize_(this.vsm_.getSize());
  }, false, this);
  this.resize_(this.vsm_.getSize());

  var geocoderElement = goog.dom.getElement('geocoder');
  geocoderElement.focus();
  var ac = new klokantech.Nominatim(geocoderElement);

  goog.events.listen(ac, goog.ui.ac.AutoComplete.EventType.UPDATE, function(e) {
    var ext = e.row['bounds'] || e.row['viewport'];
    this.app_.flyToFitBounds(ext[1], ext[3], ext[0], ext[2]);
  }, false, this);

  var geocoder_search = goog.bind(function(event) {
    goog.events.Event.preventDefault(event);
    ac.search(geocoderElement.value, 1, goog.bind(function(tok, results) {
      var ext = results[0]['bounds'] || results[0]['viewport'];
      this.app_.flyToFitBounds(ext[1], ext[3], ext[0], ext[2]);
    }, this));
  }, this);
  var form = goog.dom.getAncestorByTagNameAndClass(geocoderElement,
                                                   goog.dom.TagName.FORM);
  goog.events.listen(form, 'submit', geocoder_search);
  goog.events.listen(geocoderElement,
                     ['webkitspeechchange', 'speechchange'], geocoder_search);

  var initedMaps = {}; //cache
  var maptypeElement = /** @type {!HTMLSelectElement} */
                       (goog.dom.getElement('maptype'));
  goog.events.listen(maptypeElement, goog.events.EventType.CHANGE, function(e) {
    var key = maptypeElement.options[maptypeElement.selectedIndex].value;
    switch (key) {
      case 'bing_aerial':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.BING,
              ['Aerial', weapp.App.BING_KEY]);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'bing_roads':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.BING,
              ['Road', weapp.App.BING_KEY]);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'bing_aerialwl':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.BING,
              ['AerialWithLabels', weapp.App.BING_KEY]);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'mapquest':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.MAPQUEST);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      case 'osm':
        if (!goog.isDefAndNotNull(initedMaps[key])) {
          initedMaps[key] = this.app_.initMap(weapi.maps.MapType.OSM);
        }
        this.app_.setBaseMap(initedMaps[key]);
        break;
      default:
        break;
    }
  }, false, this);

  /*
     <option value="bing_aerialwl">Bing Maps – Aerial with labels</option>
     <option value="bing_roads">Bing Maps – Roads</option>
     <option value="bing_aerial">Bing Maps – Aerial</option>
     <option value="mapquest">MapQuest OSM</option>
     <option value="osm">OpenStreetMap</option>
     */
};


/**
 * @define {string} bing key.
 */
weapp.App.BING_KEY =
    'AsLurrtJotbxkJmnsefUYbatUuBkeBTzTL930TvcOekeG8SaQPY9Z5LDKtiuzAOu';


/**
 * @param {?goog.math.Size} size
 * @private
 */
weapp.App.prototype.resize_ = function(size) {
  if (!size) return;
  this.app_.handleResize();
};

goog.exportSymbol('WebGLEarth', weapp.App);