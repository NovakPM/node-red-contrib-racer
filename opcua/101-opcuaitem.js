/**

 Copyright 2015 Valmet Automation Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 **/

module.exports = function (RED) {
    "use strict";
    var opcuaBasics = require('./opcua-basics');
    const {parse, stringify} = require('flatted');

    function OpcUaItemNode(n) {
        // console.log("ItemNode", n)
        // console.log("ItemNode", this)
        RED.nodes.createNode(this, n);
        this.item = n.item; // OPC UA address: ns=2;i=4 OR ns=3;s=MyVariable
        this.datatype = n.datatype; // String;
        this.value = n.value; // 66.6
        this.name = n.name; // browseName shall be put here
        this.action = n.action;
        this.time = n.time;
        this.timeUnit = n.timeUnit;
        
        var node = this;

        function verbose_warn(logMessage) {
            if (RED.settings.verbose) {
                node.warn((node.name) ? node.name + ': ' + logMessage : 'OpcUaClientNode: ' + logMessage);
            }
        }

        function verbose_log(logMessage) {
            if (RED.settings.verbose) {
                node.log(logMessage);
            }
        }

        node.on("input", function (msg) {

            // console.log("node", node)
            var n = node.item.indexOf("ns=2;i=");
            if(n === 0) {
                msg.topic = node.item;
            } else {
                msg.topic = "ns=2;i="+node.item;
            }
            console.log(node.action,n,node.item,msg.topic);
            msg.datatype = node.datatype;
            msg.browseName = node.name;
            msg.action = node.action;
            msg.time = node.time;
            msg.timeUnit = node.timeUnit;
            // msg.payload = node.value;

            // Node contains static value, inject with empty string as payload
            // console.log(msg.payload, node.value)
            if (node.value && msg.payload.length === 0) {
                verbose_log('First set value by node value:' + node.value);
                if (node.datatype) {
                    msg.payload = opcuaBasics.build_new_value_by_datatype(node.datatype, node.value);
                }
                if (msg.datatype) {
                    msg.payload = opcuaBasics.build_new_value_by_datatype(msg.datatype, node.value);
                }
                verbose_warn("Setting value to " + stringify(msg));
            }
            // Input msg is dynamic and will overwrite node.value
            if (msg.payload && msg.payload.length > 0) {
                verbose_warn("Second set value by Input " + msg.payload);
                if (node.datatype) {
                   msg.payload = opcuaBasics.build_new_value_by_datatype(node.datatype, msg.payload);
                }
                if (msg.datatype) {
                    msg.payload = opcuaBasics.build_new_value_by_datatype(msg.datatype, msg.payload);
                }
                verbose_warn("Setting value to " + stringify(msg));
            }
            node.send(msg);
        });
    }

    RED.nodes.registerType("Novakon-Item", OpcUaItemNode);
};
