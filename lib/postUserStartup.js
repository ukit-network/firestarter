/*
Copyright (c) 2013 

Dave Williamson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var colors = require('colors');

module.exports = function(_self) {
    'use strict';

    return function(err) {
        var exPort = _self.config.app.get('port') || 3000;
        var spdyExPort = _self.config.app.get('spdyPort') || 3443;

        if (err) {
            _self.config.logger.info('Shutting down, as initialisation code failed: ' + err);
            _self.config.shutdown();
        } else {

            _self.config.server = _self.config.http.createServer(_self.config.app);

            _self.config.server.on('listening', function() {
				_self.config.logger.info('');
                _self.config.logger.info((_self.config.name + ' Status').underline.bold.yellow);
                _self.config.logger.info('');
                _self.config.logger.info('     NodeJS Version: '.green + (process.version + '').blue);
                _self.config.logger.info('     Process Name (pid): '.green + (process.title + ' ('+process.pid+')').blue);
                _self.config.logger.info('     Architecture: '.green + (process.arch + '').blue);
                _self.config.logger.info('     Platform: '.green + (process.platform + '').blue);
                _self.config.logger.info('     Memory Used: '.green + (parseInt((process.memoryUsage().rss/1048576)*100)/100 + ' MB').blue);
                _self.config.logger.info('     Memwatch Enabled: '.green + ((_self.config.memwatch && _self.config.memwatch.enabled ? 'Yes' : 'No')).bold.blue);
                _self.config.logger.info('     App Listening on port: '.green + (exPort + '').bold.blue);
                _self.config.logger.info('     Environment: '.green + (_self.config.app.get('env')+'').bold.blue);
                _self.config.logger.info('     Version: '.green + (_self.config.app.get('version')+'').blue);
                _self.config.logger.info('     Application Started'.blue);
                if (!_self.config.spdyEnabled) {
                    _self.config.logger.info('');
                    _self.config.sendMessage('online');
                    clearTimeout(_self.startTimer);
                    _self.config.memwatch.fn.gc();
                    _self.config.memwatch.initialHeap = new _self.config.memwatch.fn.HeapDiff();
                    if (typeof _self.onReady === 'function') _self.onReady();

                } else {
                    //inspect(_self.config.spdyOptions);
                    _self.config.spdy = require('spdy').createServer(_self.config.spdyOptions, _self.config.app);

                    _self.config.spdy.on('listening', function() {

                        _self.config.logger.info('     SPDY Listening on port: '.green + (spdyExPort+'').blue);
                        _self.config.logger.info('');
                        _self.config.sendMessage('online');
                        clearTimeout(_self.startTimer);
                        _self.config.memwatch.fn.gc();
                        //_self.config.memwatch.initialHeap = new _self.config.memwatch.fn.HeapDiff();
                        if (typeof _self.onReady === 'function') _self.onReady();

                    });
                    _self.config.spdy.listen(spdyExPort);
                }
                
            });
            _self.config.server.listen(exPort);
        }
    };
};