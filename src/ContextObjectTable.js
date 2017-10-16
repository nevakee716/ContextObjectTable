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
      this.RowNodeID = this.options.CustomOptions["RowNodeID"];//"business_function_20123_1664918668";
      this.ColumnNodeID = this.options.CustomOptions["ColumnNodeID"];//"business_perimeter_20130_987496863";
      this.CellNodeID  = this.options.CustomOptions["CellNodeID"];// "application_20126_1496180330";
      this.EVODUrl = this.options.CustomOptions["EVOD-url"];
      this.propertiesStyleMap = JSON.parse(this.options.CustomOptions["propertiesStyleMap"]); //
      this.layoutsByNodeId = {};
      this.isLoaded = false;
      this.cwContextTable = new cwApi.customLibs.cwContextObjectTable.cwContextTable(this.propertiesStyleMap,this.viewSchema.NodesByID[this.RowNodeID].NodeName,this.viewSchema.NodesByID[this.ColumnNodeID].NodeName,this.viewSchema.NodesByID[this.CellNodeID].NodeName,this.nodeID); 
    };

    cwContextObjectTable.prototype.drawAssociations = function (output, associationTitleText, object) {
      output.push('<div id="cwContextObjectTable" class="bootstrap-iso" style= "display: flex"></div></div><div id="cwContextTable"></div>');
      var objectTypeScriptName0,objectTypeScriptName1,objectTypeScriptName2;
  

      this.parseObjects(object.associations[this.nodeID]);
      this.cwContextTable.title = this.displayProperty.getDisplayString(object);
      this.getObjectFromObjectypes(this.viewSchema.NodesByID[this.RowNodeID].ObjectTypeScriptName,this.viewSchema.NodesByID[this.ColumnNodeID].ObjectTypeScriptName,this.viewSchema.NodesByID[this.CellNodeID].ObjectTypeScriptName);
    };

    cwContextObjectTable.prototype.parseObjects = function (objects) {
      var idRow,idColumn,self = this; 
      objects.forEach(function(object) {
        idRow = self.cwContextTable.addLine(object.associations[self.RowNodeID],self.getItemDisplayString(object.associations[self.RowNodeID]));
        idColumn = self.cwContextTable.addColumn(object.associations[self.ColumnNodeID],self.getItemDisplayString(object.associations[self.ColumnNodeID]));
        self.cwContextTable.addCell(object.associations[self.CellNodeID], idRow, idColumn,self.getItemDisplayString(object.associations[self.CellNodeID]),object,false);
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



   cwContextObjectTable.prototype.getObjectFromObjectypes = function(rowObjectTypeScriptName, columnObjectTypeScriptName, cellObjectTypeScriptName) {
      var sendData = {};
      var propertiesToSelect = ["NAME", "ID"];
      var that = this;
      var callbackCount = 0;

      sendData.objectTypeScriptName = rowObjectTypeScriptName;
      sendData.propertiesToSelect = propertiesToSelect;

      cwApi.cwEditProperties.GetObjectsByScriptName(sendData, function(update) {
        var object0;
        for(var key in update) {
          if(update.hasOwnProperty(key)) {
            callbackCount = callbackCount + 1;
            for (var i = 0; i < update[key].length; i++) {
              object0 = update[key][i];
                if (object0.hasOwnProperty('properties') && object0.properties.hasOwnProperty("name") && object0.properties.hasOwnProperty("id")) {
                  object0.properties.label = object0.name;
                  object0.properties.link = cwAPI.getSingleViewHash(rowObjectTypeScriptName, object0.properties.id);
                  that.cwContextTable.rowFilter.objects.push(object0.properties); 
                  that.cwContextTable.rowFilter.label = key;
                } 
            }
          }
        }
        if (callbackCount === 3 && that.isLoaded) {
          that.createTable();
        }
      });

      sendData.objectTypeScriptName = columnObjectTypeScriptName;
      cwApi.cwEditProperties.GetObjectsByScriptName(sendData, function(update) {
        var object1;
        for(var key in update) {
          if(update.hasOwnProperty(key)) {
            callbackCount = callbackCount + 1;
            for (var i = 0; i < update[key].length; i++) {
              object1 = update[key][i];
                if (object1.hasOwnProperty('properties') && object1.properties.hasOwnProperty("name") && object1.properties.hasOwnProperty("id")) {
                  object1.properties.label = object1.name;
                  object1.properties.link = cwAPI.getSingleViewHash(columnObjectTypeScriptName, object1.properties.id);
                  that.cwContextTable.columnFilter.objects.push(object1.properties);
                  that.cwContextTable.columnFilter.label = key;
                } 
            }
          }
        }
        if (callbackCount === 3 && that.isLoaded) {
          that.createTable();
        }
      });

      sendData.objectTypeScriptName = cellObjectTypeScriptName;
      cwApi.cwEditProperties.GetObjectsByScriptName(sendData, function(update) {
        var object2;
        for(var key in update) {
          if(update.hasOwnProperty(key)) {
            callbackCount = callbackCount + 1;
            for (var i = 0; i < update[key].length; i++) {
              object2 = update[key][i];
                if (object2.hasOwnProperty('properties') && object2.properties.hasOwnProperty("name") && object2.properties.hasOwnProperty("id")) {
                  object2.properties.label = object2.name;
                  object2.properties.link = cwAPI.getSingleViewHash(cellObjectTypeScriptName, object2.properties.id);
                  that.cwContextTable.cellFilter.objects.push(object2.properties);
                  that.cwContextTable.cellFilter.label = key;
                } 
            }
          }
        }
        if (callbackCount === 3 && that.isLoaded) {
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
        
        var buttonsEdit = document.getElementsByClassName("cw-edit-mode-button-edit");
        if(buttonsEdit.length > 0) {
          buttonsEdit[0].addEventListener("click", this.goToEditMode.bind(this), false);  
        }

      };

    cwContextObjectTable.prototype.goToEditMode = function (event) {
      this.cwContextTable.editMode = true;
      this.cwContextTable.refresh();
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
        if(that.isLoaded) {
          that.createTable();
        } else {
          that.isLoaded = true;
        }
        
      });
    };

 

    cwApi.cwLayouts.cwContextObjectTable = cwContextObjectTable;

}(cwAPI, jQuery));