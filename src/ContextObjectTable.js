/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/

(function (cwApi, $) {
    'use strict';
    var cwContextObjectTable;

    cwContextObjectTable = function (options, viewSchema) {
      this.viewSchema = viewSchema;
      cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);        
      cwApi.registerLayoutForJSActions(this);
      this.lockState = false;
      this.RowNodeID = "business_function_20123_1664918668";
      this.ColumnNodeID = "business_perimeter_20130_987496863";
      this.CellNodeID = "application_20126_1496180330";
      this.propertiesStyleMap = [
        { 'scriptname' : 'LIFECYCLESTATUS',
          "gris" : {"background-color" : "lightgray", "color": "black"},
          "vert" : {"background-color": "lightgreen", "color": "black"},
          "noir" : {"background-color": "black", "color": "white"}
        }];
      this.layoutsByNodeId = {};
      this.cwContextTable = new cwApi.customLibs.cwContextObjectTable.cwContextTable(this.propertiesStyleMap); 
    };

    cwContextObjectTable.prototype.drawAssociations = function (output, associationTitleText, object) {
      output.push('<div id="cwContextObjectTable" class="bootstrap-iso" style= "display: flex"></div></div><div id="cwContextTable"></div>');
      var objectTypeScriptName0,objectTypeScriptName1,objectTypeScriptName2;

      // if((cwApi.isIndexPage && cwApi.isIndexPage()) || this.item.objectTypeScriptName === undefined || true) {
      //   this.cwContextTable.Title.objectTypeScriptName = this.viewSchema.NodesByID[this.mmNode.NodeID].ObjectTypeScriptName.toUpperCase();
      //   this.cwContextTable.Column.Label = this.getNodeLabel();
      //   this.cwContextTable.Row.Label = this.getNodeLabel();
      // } else {
      //   this.cwContextTable.NodesFilter0.objectTypeScriptName = this.item.objectTypeScriptName.toUpperCase();
      //   this.cwContextTable.NodesFilter1.objectTypeScriptName = this.viewSchema.NodesByID[this.mmNode.NodeID].ObjectTypeScriptName.toUpperCase();
      //   this.cwContextTable.NodesFilter2.objectTypeScriptName = this.getSecondLvlNode();
      // }     

      this.parseObjects(object.associations[this.nodeID]);
      //this.getObjectFromObjectypes(this.cwContextTable.NodesFilter0.objectTypeScriptName,this.cwContextTable.NodesFilter1.objectTypeScriptName,this.cwContextTable.NodesFilter2.objectTypeScriptName,this.item);
    };

    cwContextObjectTable.prototype.parseObjects = function (objects) {
      var idRow,idColumn,self = this; 
      objects.forEach(function(object) {
        idRow = self.cwContextTable.addLine(object.associations[self.RowNodeID],self.getItemDisplayString(object.associations[self.RowNodeID]));
        idColumn = self.cwContextTable.addColumn(object.associations[self.ColumnNodeID],self.getItemDisplayString(object.associations[self.ColumnNodeID]));
        self.cwContextTable.addCell(object.associations[self.CellNodeID], idRow, idColumn,self.getItemDisplayString(object.associations[self.CellNodeID]),object);
      });
      this.cwContextTable.clearRowAndColumn();    
    };


    cwContextObjectTable.prototype.getItemDisplayString = function(items){
        var l,item, getDisplayStringFromLayout = function(layout){
            return layout.displayProperty.getDisplayString(item);
        };
        if(items.length > 0) {
          item = items[0];
        } else {
          return "";
        }
        if (item.nodeID === this.nodeID){
            return this.displayProperty.getDisplayString(item);
        }
        if (!this.layoutsByNodeId.hasOwnProperty(item.nodeID)){
            if (this.viewSchema.NodesByID.hasOwnProperty(item.nodeID)){
                var layoutOptions = this.viewSchema.NodesByID[item.nodeID].LayoutOptions;
                this.layoutsByNodeId[item.nodeID] = new cwApi.cwLayouts[item.layoutName](layoutOptions, this.viewSchema);
            } else {
                return item.name;
            }
        }
        return getDisplayStringFromLayout(this.layoutsByNodeId[item.nodeID]);
    };



   cwContextObjectTable.prototype.getObjectFromObjectypes = function(objectTypeScriptName0, objectTypeScriptName1, objectTypeScriptName2,item) {
      var sendData = {};
      var propertiesToSelect = ["NAME", "ID"];
      var that = this;
      var callbackCount = 0;

      sendData.objectTypeScriptName = objectTypeScriptName0;
      sendData.propertiesToSelect = propertiesToSelect;

      cwApi.cwEditProperties.GetObjectsByScriptName(sendData, function(update) {
        var object0;
        for(var key in update) {
          if(update.hasOwnProperty(key)) {
            callbackCount = callbackCount + 1;
            for (var i = 0; i < update[key].length; i++) {
              object0 = update[key][i];
                if (object0.hasOwnProperty('properties') && object0.properties.hasOwnProperty("name") && object0.properties.hasOwnProperty("id")) {
                  that.cwContextTable.NodesFilter0.addfield(key, object0.properties["name"], object0.properties["id"]);
                  that.cwContextTable.NodesFilter0.label = key;
                } 
            }
          }
        }
        if (callbackCount === 3) {
          that.createTable();
        }
      });

      sendData.objectTypeScriptName = objectTypeScriptName1;
      cwApi.cwEditProperties.GetObjectsByScriptName(sendData, function(update) {
        var object1;
        for(var key in update) {
          if(update.hasOwnProperty(key)) {
            callbackCount = callbackCount + 1;
            for (var i = 0; i < update[key].length; i++) {
              object1 = update[key][i];
                if (object1.hasOwnProperty('properties') && object1.properties.hasOwnProperty("name") && object1.properties.hasOwnProperty("id")) {
                  that.cwContextTable.NodesFilter1.addfield(key, object1.properties["name"], object1.properties["id"]);
                  that.cwContextTable.NodesFilter1.label = key;
                } 
            }
          }
        }
        if (callbackCount === 3) {
          that.createTable();
        }
      });

      sendData.objectTypeScriptName = objectTypeScriptName2;
      cwApi.cwEditProperties.GetObjectsByScriptName(sendData, function(update) {
        var object2;
        for(var key in update) {
          if(update.hasOwnProperty(key)) {
            callbackCount = callbackCount + 1;
            for (var i = 0; i < update[key].length; i++) {
              object2 = update[key][i];
                if (object2.hasOwnProperty('properties') && object2.properties.hasOwnProperty("name") && object2.properties.hasOwnProperty("id")) {
                  that.cwContextTable.NodesFilter2.addfield(key, object2.properties["name"], object2.properties["id"]);
                  that.cwContextTable.NodesFilter2.label = key;
                } 
            }
          }
        }
        if (callbackCount === 3) {
          that.createTable();
        }
      });
    };






    cwContextObjectTable.prototype.sendTernaryRequest = function (url,callback) {
      var that = this;
      cwApi.cwDoGETQuery('Failed to contact EvolveOnDemand', url, function(data){
        if(data !== 'Failed to contact EvolveOnDemand') {
          if(data.status === 'Ok') {
            cwApi.notificationManager.addNotification(data.result);
            callback();
          } else {
            cwApi.notificationManager.addNotification(data.result,'error');
            that.unlock();
          }
        } else {
          cwApi.notificationManager.addNotification('Failed to contact EvolveOnDemand','error');
          that.unlock();
        }
      });

    };


    cwContextObjectTable.prototype.createTable = function () {
        var container = document.getElementById("cwContextTable");
        var $container = $('#cwContextTable'); 
        this.cwContextTable.createAngularTable($container,container,this.item);
        if(container){
          container.removeEventListener('Remove Item', this.removeTernary);   
          container.removeEventListener('Add Item', this.createTernary);  
          container.addEventListener('Remove Item', this.removeTernary);  
          container.addEventListener('Add Item', this.createTernary); 
        }
      };

    cwContextObjectTable.prototype.createTernary = function (event) {
      if(this.isLocked() === false && event.callback) {
        this.lock();
        if(event.data && event.data.hasOwnProperty('ot0') && event.data.ot0 && event.data.hasOwnProperty('ot1') && event.data.ot1 && event.data.hasOwnProperty('ot2') && event.data.ot2) {

          var url = this.options.CustomOptions['EVOD-url'] + "ternarycreation?model=" + cwAPI.cwConfigs.ModelFilename;
          url = url + "&ot0=" + this.cwContextTable.NodesFilter0.objectTypeScriptName + "&id0=" + event.data.ot0.id;
          url = url + "&ot1=" + this.cwContextTable.NodesFilter1.objectTypeScriptName + "&id1=" + event.data.ot1.id;
          url = url + "&ot2=" + this.cwContextTable.NodesFilter2.objectTypeScriptName + "&id2=" + event.data.ot2.id;
          url = url + "&command=create"; 

          var line = [{},{},{}];
          line[0].id = event.data.ot0.id;
          line[1].id = event.data.ot1.id;
          line[2].id = event.data.ot2.id;
          line[0].name = event.data.ot0.name;
          line[1].name = event.data.ot1.name;
          line[2].name = event.data.ot2.name;

          var that = this;
          this.sendTernaryRequest(url,function() {
            event.callback(line,that.options.CustomOptions['Quick-Add']);
            that.unlock();
          });
        }
        else {
          this.unlock();
          cwApi.notificationManager.addNotification("Please Select All fields",'error'); 
        }
      }
    };



    cwContextObjectTable.prototype.removeTernary = function (event) {
      if(this.isLocked() === false && event.data && event.callback) {
        this.lock();
        var url = this.options.CustomOptions['EVOD-url'] + "ternarycreation?model=" + cwAPI.cwConfigs.ModelFilename;
        url = url + "&ot0=" + this.cwContextTable.NodesFilter0.objectTypeScriptName + "&id0=" + event.data.id0;
        url = url + "&ot1=" + this.cwContextTable.NodesFilter1.objectTypeScriptName + "&id1="  + event.data.id1;
        url = url + "&ot2=" + this.cwContextTable.NodesFilter2.objectTypeScriptName + "&id2="  + event.data.id2; 
        url = url + "&command=delete"; 
        var that = this;
        this.sendTernaryRequest(url,function() {
          that.unlock();
          event.callback();
        });
      }
    };



 

    cwContextObjectTable.prototype.lock = function () {
      this.lockState = true;
      cwApi.setMouseToLoading();
      $('.cwloading').show();
    };

    cwContextObjectTable.prototype.unlock = function () {
      this.lockState = false;
      cwApi.setMouseToDefault();
      $('.cwloading').hide();      
    };

    cwContextObjectTable.prototype.isLocked = function () {
      return this.lockState;
    };

    cwContextObjectTable.prototype.applyJavaScript = function () {
        var that = this;
        cwApi.CwAsyncLoader.load('angular', function () {
          that.createTable();
        });
    };

 

    cwApi.cwLayouts.cwContextObjectTable = cwContextObjectTable;

}(cwAPI, jQuery));