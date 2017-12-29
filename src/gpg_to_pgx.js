// USAGE: $ node gpg_to_pgx.js <gpg_file> <pgx_files_prefix>
// OUTPUT_DIR: output/
// OUTPUT_FILES: <prefix>.opv <prefix>.ope <prefix>.json

var pgp_file = process.argv[2];
var prefix = process.argv[3];

var fs = require('fs');
var readline = require('readline');

var rs = fs.createReadStream(pgp_file);
var rl = readline.createInterface(rs, {});

var cnt_nodes = 0;
var cnt_edges = 0;

var node_props = [];
var edge_props = [];
var node_props_type = [];
var edge_props_type = [];

var opv = prefix + '.opv';
var ope = prefix + '.ope';
var cnf = prefix + '.json';

var path_opv = './output/' + opv;
var path_ope = './output/' + ope;
var path_cnf = './output/' + cnf;

var sep = '\t';

fs.writeFile(path_opv, '', function (err) {});
fs.writeFile(path_ope, '', function (err) {});
fs.writeFile(path_cnf, '', function (err) {});

rl.on('line', function(line) {
  if (line.charAt(0) != '#') {
    var items = line.match(/\w+|"[^"]+"/g);
    check_items(items);
    if (is_prop(line.split(/\s+/)[1])) {
      // This line is a node
      cnt_nodes++;
      var id = items[0];
      // For each property, add 1 line
      for (var i=1; i<items.length-1; i=i+2) {
        var key = items[i]; 
        var val = items[i+1];
        var type = eval_type(val);
        var output = [];
        output[0] = id;
        output[1] = key;
        output = output.concat(format(val, type));
        if (node_props.indexOf(key) == -1) {
          var prop = { name: key, type: type };
          node_props.push(key); 
          node_props_type.push(prop); 
        }
        fs.appendFile(path_opv, output.join(sep) + '\n', function (err) {});
        //console.log(output.join(sep));
      }
    } else {
      // This line is a edge
      cnt_edges++;
      var label;
      // Find "type" property and store as "label"
      for (var i=2; i<items.length-1; i=i+2) {
        if (items[i] == 'type') {
          label = items[i+1];
        }
      }
      // For each property, add 1 line
      for (var i=2; i<items.length-1; i=i+2) {
        var key = items[i]; 
        var val = items[i+1];
        var type = eval_type(val);
        var output = [];
        output[0] = cnt_edges; // edge id
        output[1] = items[0]; // source node
        output[2] = items[1]; // target node
        if (key != 'type') {
          output[3] = label;
          output[4] = key;
          output = output.concat(format(val, type));
          if (edge_props.indexOf(key) == -1) {
            var prop = { name: key, type: type };
            edge_props.push(key); 
            edge_props_type.push(prop); 
          }
          fs.appendFile(path_ope, output.join(sep) + '\n', function (err) {});
          //console.log(output.join(sep));
        }
      }
    }
  }
});

rl.on('close', function() {
  console.log('"' + path_opv + '" has been created.');
  console.log('"' + path_ope + '" has been created.');
  create_load_config();
});

function create_load_config() {
  var config = {
    vertex_uri_list: [ opv ]
  , edge_uri_list: [ ope ]
  , format: "flat_file"
  , node_id_type: "string"
  , edge_label: true
  , vertex_props: node_props_type
  , edge_props: edge_props_type
  , separator: sep
  , loading: {
      load_edge_label:true
    }
  };
  fs.appendFile(path_cnf, JSON.stringify(config), function (err) {});
  console.log('"' + path_cnf + '" has been created.');
}

function check_items(items) {
  for(var i=0; i<items.length; i++){
    items[i] = items[i].replace(/"/g,'');
    if (items[i].match(/\t/)) {
      console.log('WARNING: This item has tab(\\t): ' + items[i]);
    }
  }
};

function is_prop(str) {
  arr = str.match(/\w+|"[^"]+"/g);
  if (arr.length > 1 && arr[0] != '') {
    return true;
  } else {
    return false;
  } 
};

function eval_type(str) {
  if (is_string(str)) {
    return 'string';
  } else {
    return 'double';
  }
};

function format(str, type) {
  var output = [];
  if (type == 'string') {
    output[0] = '1';
    output[1] = str;
    output[2] = '';
    output[3] = '';
  } else if (type == 'double') {
    output[0] = '4';
    output[1] = '';
    output[2] = str;
    output[3] = '';
  }
  return output;
};

function is_string(str) {
  if (typeof str == 'string') {
    return true;
  } else {
    return false;
  }
};

function is_integer(x) {
  return Math.round(x) === x;
};

//fs.readFile(pgp_file, 'utf8', function(err, text) {
//  console.log(text);
//});
