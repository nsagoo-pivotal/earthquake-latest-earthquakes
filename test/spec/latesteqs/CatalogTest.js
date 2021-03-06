/* global beforeEach, chai, describe, it, sinon */
'use strict';


var Catalog = require('latesteqs/Catalog'),
    Model = require('mvc/Model'),
    Xhr = require('util/Xhr');


var expect = chai.expect;


describe('latesteqs/Catalog', function () {
  describe('constructor', function () {
    it('is a function', function () {
      expect(typeof Catalog).to.equal('function');
    });
  });

  describe('initialize', function () {
    it('binds load method to change:feed model event', function () {
      var catalog,
          model;

      model = Model();
      catalog = Catalog({
        model: model
      });

      sinon.stub(catalog, 'load', function () {});
      model.trigger('change:feed');
      expect(catalog.load.calledOnce).to.equal(true);

      catalog.load.restore();
      catalog.destroy();
      model.destroy();
    });
  });

  describe('destroy', function () {
    it('can be destroyed', function () {
      var createDestroy;

      createDestroy = function () {
        var catalog;
        catalog = Catalog();
        catalog.destroy();
      };

      expect(createDestroy).to.not.throw(Error);
    });
  });

  describe('load', function () {
    it('loads selected feed', function () {
      var args,
          catalog;

      catalog = Catalog({
        model: Model({
          'feed': {
            id: 'abc',
            url: 'test url'
          }
        })
      });

      sinon.stub(catalog, 'loadUrl', function () {});
      catalog.load();

      args = catalog.loadUrl.getCall(0).args;
      expect(args[0]).to.equal('test url');

      catalog.loadUrl.restore();
      catalog.destroy();
    });
  });

  describe('onSort', function () {
    var catalog,
        onSortSpy,
        sort,
        sortSpy;

    beforeEach(function () {
      sort = {
        'id': 'newest',
        'name' : 'Newest first',
        'sort' : function (a, b) {
          return b.properties.time - a.properties.time;
        }
      };

      catalog = Catalog({
        model: Model({
          sort: sort
        })
      });
    });

    it('calls Collection.sort() with the correct sort method', function () {
      sortSpy = sinon.spy(catalog, 'sort');
      catalog.onSort();
      expect(sortSpy.calledWith(sort.sort)).to.equal(true);
    });

    it('is called when the sort property on the model changes', function () {
      onSortSpy = sinon.spy(catalog, 'onSort');
      catalog.model.set({
        sort: {}
      });
      expect(onSortSpy.callCount).to.equal(1);
    });
  });

  describe('loadUrl', function () {
    it('calls Xhr.ajax correctly', function () {
      var args,
          catalog;

      catalog = Catalog();
      sinon.stub(Xhr, 'ajax', function () {});
      catalog.loadUrl('test url', 'test data');
      args = Xhr.ajax.getCall(0).args;
      Xhr.ajax.restore();

      expect(args[0].url).to.equal('test url');
      expect(args[0].data).to.equal('test data');
      expect(args[0].success).to.equal(catalog.onLoadSuccess);
      expect(args[0].error).to.equal(catalog.onLoadError);
    });
  });

  describe('onLoadError', function () {
    it('sets error and resets collection', function () {
      var catalog;

      catalog = Catalog();
      catalog.reset(['a', 'b', 'c']);
      catalog.onLoadError('test error');

      expect(catalog.error).to.equal('test error');
      expect(catalog.data()).to.deep.equal([]);
    });
  });

  describe('onLoadSuccess', function () {
    it('clears error and resets collection with features', function () {
      var catalog,
          data;

      data = {
        features: ['a', 'b', 'c']
      };

      catalog = Catalog();
      catalog.error = 'test error';
      catalog.reset(['d', 'e', 'f']);
      catalog.onLoadSuccess(data);

      expect(catalog.error).to.equal(false);
      expect(catalog.data()).to.deep.equal(data.features);
    });
  });

  describe('checkForEventInCollection', function () {
    it('clears the selected event when it no longer exists in the collection',
        function () {
      var catalog,
          data,
          eq;

      data = [
        {
          'id': 'us1234'
        },
        {
          'id': 'nc5678'
        }
      ];

      eq = {
        'id': 'us1234'
      };

      catalog = Catalog({
        model: Model({
          'event': eq
        })
      });

      catalog.reset(data);
      expect(catalog.model.get('event').id).to.equal(eq.id);

      catalog.reset([]);
      expect(catalog.model.get('event')).to.equal(null);
    });
  });

});
