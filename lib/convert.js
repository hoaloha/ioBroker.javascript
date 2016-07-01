// this file is used by controller when build uploads
function stringify(data, settings) {
    var obj = data.data;
    var id =  data.id;
    if (data.data.type === 'channel') {
        id = id.replace(/\./g, '/').substring('script.js.'.length) + '/_dir.json';
        obj = JSON.stringify(obj, null, 2);
    } else if (data.data.type === 'script') {
        id = id.replace(/\./g, '/').substring('script.js.'.length) + '.json';
        if (obj.common && obj.common.source) {
            var source = obj.common.source;
            if (obj.common.enabled) delete obj.common.enabled;
            if (obj.common.engine === 'system.adapter.javascript.0') delete obj.common.engine;
            if (obj.common.engineType === 'Javascript/js') delete obj.common.engineType;
            delete obj.common.name;
            delete obj.common.source;
            if (JSON.stringify(obj.common) !== '{}') {
                obj = '/* -- do not edit following lines - START --\n' + JSON.stringify(obj.common, null, 2) + '\n' + '-- do not edit previous lines - END --*/\n' + source;
            } else {
                obj = source;
            }
        } else {
            obj = JSON.stringify(obj, null, 2);
        }
    } else if (data.data.type === 'script') {
        id = id.replace(/\./g, '/').substring('script.js.'.length) + '.json';
        obj = JSON.stringify(obj, null, 2);
    }

    return {id: id, data: obj};
}

function parse(data, settings) {
    var obj = data.data;
    var id  = data.id;
    var error;
    var name;
    if (id[id.length - 1] === '/') id = id.substring(0, id.length - 1);
    
    if (!id.match(/\.json$/)) return null;
    
    if (id.match(/_dir\.json$/)) {
        name = id.substring(0, id.length - '/_dir.json'.length).replace(/\//g, '.');

        try {
            obj = JSON.parse(obj);
        } catch (e) {
            error = 'Cannot parse object "' + name + '": ' + e;
            obj = {
                common: {
                    name: name.split('.').pop()
                },
                type: 'channel',
                _id: 'script.js.' + name
            };
        }
        id = 'script.js.' + name;
    } else {
        //script
        name = id.substring(0, id.length - '.json'.length).replace(/\//g, '.');
        var source;
        if (obj[0] === '/' && obj[1] === '*') {
            var lines = obj.split(/[\r\n|\r|\n]/);
            var strignObj = '';
            var line = 1;
            while (line < lines.length) {
                if (lines[line].match(/^--\sdo\snot/)) {
                    break;
                }
                strignObj += lines[line];
                line++;
            }
            lines.splice(0, line + 1);
            source = lines.join('\n');
            try {
                obj = {};
                obj.common = JSON.parse(strignObj);
                obj.common.source = source;
            } catch (e) {
                error = 'Cannot parse object "' + id + '": ' + e;
            }
        } else {
            source = obj;
            obj = null;
        }

        obj                     = obj || {};
        obj.common              = obj.common || {};
        obj._id                 = 'script.js.' + name;
        obj.type                = 'script';
        obj.common.name         = name.split('.').pop();
        obj.common.enabled      = (obj.common.enabled === undefined) ? true : obj.common.enabled;
        obj.common.engine       = obj.common.engine || 'system.adapter.javascript.0';
        obj.common.engineType   = obj.common.engineType || 'Javascript/js';
        obj.common.source       = obj.common.source || source;
        id = 'script.js.' + name;
    }

    return {id: id, data: obj, error: error};
}
module.exports.stringify = stringify;
module.exports.parse     = parse;