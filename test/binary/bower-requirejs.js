/* jshint expr:true, unused:false */
/* global describe:true, it:true, beforeEach:true, afterEach:true */

'use strict';
var path = require('path');
var execFile = require('child_process').execFile;
var should = require('should');
var mockery = require('mockery');
var pkg = require('../../package.json');

describe('bin', function () {
  describe('mocked', function () {
    beforeEach(function () {
      this.origArgv = process.argv;
      this.origExit = process.exit;

      mockery.enable({
        warnOnUnregistered: false,
        useCleanCache: true
      });

      // Mock lib/index.js to verify the binary passes along the
      // correct arguments
      mockery.registerMock('../lib', function (opts, cb) {
        this.mockOpts = opts;
      }.bind(this));
    });

    afterEach(function () {
      mockery.disable();
      process.argv = this.origArgv;
      process.exit = this.origExit;
    });

    it('should pass the correct opts', function () {
      process.argv = [
        'node',
        path.join(__dirname, '../../', pkg.bin['bower-requirejs']),
        '-c', 'foo',
        '-b', 'bar',
        '-e', 'baz',
        '-t',
        '-d'
      ];
      require('../../bin/bower-requirejs');
      this.mockOpts.config.should.eql(path.join(process.cwd(), 'foo'));
      this.mockOpts.baseUrl.should.eql(path.join(process.cwd(), 'bar'));
      this.mockOpts.exclude.should.eql(['baz']);
      this.mockOpts.transitive.should.eql(true);
      this.mockOpts.devDependencies.should.eql(true);
    });

    it('should alias base-url', function () {
      process.argv = [
        'node',
        path.join(__dirname, '../../', pkg.bin['bower-requirejs']),
        '-c', 'foo',
        '--baseUrl', 'bar',
        '-e', 'baz'
      ];
      require('../../bin/bower-requirejs');
      this.mockOpts.config.should.eql(path.join(process.cwd(), 'foo'));
      this.mockOpts.baseUrl.should.eql(path.join(process.cwd(), 'bar'));
      this.mockOpts.exclude.should.eql(['baz']);
    });

    it('should pass base-url', function () {
      process.argv = [
        'node',
        path.join(__dirname, '../../', pkg.bin['bower-requirejs']),
        '-c', 'foo',
        '--base-url', 'bar',
        '-e', 'baz'
      ];
      require('../../bin/bower-requirejs');
      this.mockOpts.config.should.eql(path.join(process.cwd(), 'foo'));
      this.mockOpts.baseUrl.should.eql(path.join(process.cwd(), 'bar'));
      this.mockOpts.exclude.should.eql(['baz']);
    });

    it('should pass dev-dependencies', function () {
      process.argv = [
        'node',
        path.join(__dirname, '../../', pkg.bin['bower-requirejs']),
        '-c', 'foo',
        '--devDependencies',
        '-e', 'baz'
      ];
      require('../../bin/bower-requirejs');
      this.mockOpts.config.should.eql(path.join(process.cwd(), 'foo'));
      this.mockOpts.devDependencies.should.eql(true);
      this.mockOpts.exclude.should.eql(['baz']);
    });

    it('should alias dev-dependencies', function () {
      mockery.resetCache();
      process.argv = [
        'node',
        path.join(__dirname, '../../', pkg.bin['bower-requirejs']),
        '-c', 'foo',
        '--no-dev-dependencies',
        '-e', 'baz'
      ];
      require('../../bin/bower-requirejs');
      this.mockOpts.config.should.eql(path.join(process.cwd(), 'foo'));
      this.mockOpts.devDependencies.should.eql(false);
      this.mockOpts.exclude.should.eql(['baz']);
    });

  });

  it('should return the version', function (done) {
    var cp = execFile('node', [path.join(__dirname, '../../', pkg.bin['bower-requirejs']), '--version', '--no-update-notifier']);
    var expected = pkg.version;

    cp.stdout.on('data', function (data) {
      data.replace(/\r\n|\n/g, '').should.eql(expected);
      done();
    });
  });
});
