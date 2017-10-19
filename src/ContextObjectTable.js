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
      this.mainPropertyScriptName = this.options.CustomOptions["mainPropertyScriptname"].toLowerCase();
      this.layoutsByNodeId = {};
      this.isLoaded = false;
      this.headerRequest = {};

    };

    cwContextObjectTable.prototype.drawAssociations = function (output, associationTitleText, object) {
      output.push('<div id="cwContextObjectTable" class="bootstrap-iso" style= "display: flex"></div></div><div id="cwContextTable"></div>');

      this.createPostRequestHeader(object);
      this.cwContextTable = new cwApi.customLibs.cwContextObjectTable.cwContextTable(this.propertiesStyleMap,this.viewSchema.NodesByID[this.RowNodeID].NodeName,this.viewSchema.NodesByID[this.ColumnNodeID].NodeName,this.viewSchema.NodesByID[this.CellNodeID].NodeName,this.nodeID,this.viewSchema.NodesByID[this.viewSchema.RootNodesId].ObjectTypeScriptName.toLowerCase(),this.mmNode.ObjectTypeScriptName.toLowerCase(),this.mainPropertyScriptName);   

      this.parseObjects(object.associations[this.nodeID]);
      this.cwContextTable.title = this.displayProperty.getDisplayString(object);
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










    cwContextObjectTable.prototype.sendEVODRequest = function (postRequest,callback) {
      var that = this;

      this.headerRequest.request = postRequest;
      $.ajax({
          "url": this.EVODUrl,
          "success": function (res) {
              callback(res.status);
              cwApi.notificationManager.addNotification(res.messsage);
          },
          "type": 'POST',
          "dataType": "json",
          "data": this.headerRequest
      }).fail(function () {
          callback(false);
          cwApi.notificationManager.addNotification('Failed to contact EvolveOnDemand','error');
      });

    };


    cwContextObjectTable.prototype.createTable = function () {
        var container = document.getElementById("cwContextTable");
        var $container = $('#cwContextTable'); 
        this.cwContextTable.createAngularTable($container,container,this.item);
        
        var buttonsEdit = document.getElementsByClassName("cw-edit-mode-button-edit");
        if(buttonsEdit.length > 0) {
          buttonsEdit[0].addEventListener("click", this.goToEditMode.bind(this), false);  
        }
        if(location.hash.includes("cwmode=edit")) {
          this.goToEditMode();
        }
        container.addEventListener('Post Request', this.postRequest.bind(this)); 

      };

    cwContextObjectTable.prototype.goToEditMode = function (event) {
      this.cwContextTable.editMode = true;
      this.cwContextTable.refresh();
      this.lock();
      this.getObjectFromObjectypes(this.viewSchema.NodesByID[this.RowNodeID].ObjectTypeScriptName,this.viewSchema.NodesByID[this.ColumnNodeID].ObjectTypeScriptName,this.viewSchema.NodesByID[this.CellNodeID].ObjectTypeScriptName,this.viewSchema.NodesByID[this.viewSchema.RootNodesId].ObjectTypeScriptName.toLowerCase());
    };


    cwContextObjectTable.prototype.createPostRequestHeader = function (object) {
      this.headerRequest.main = {};
      this.headerRequest.main.id = object.object_id;
      this.headerRequest.main.scriptname = object.objectTypeScriptName;
      
      this.headerRequest.context = {};
      this.headerRequest.context.scriptname = this.mmNode.ObjectTypeScriptName.toLowerCase();
      this.headerRequest.context.mainPropertyScriptname = this.mainPropertyScriptName;
      this.headerRequest.context.mainPropertyLabel = this.mmNode.Filters[this.mainPropertyScriptName.toUpperCase()][0].DisplayValue;
      this.headerRequest.context.secondPropertyScriptname = this.propertiesStyleMap.scriptname.toLowerCase();
      this.headerRequest.context.assoToMainObjectScriptname = this.viewSchema.NodesByID[this.viewSchema.RootNodesId].AssociationsTargetObjectTypes[this.nodeID].associationTypeScriptName;

      this.headerRequest.objects = [];

      var obj = {};
      obj.scriptname = this.mmNode.AssociationsTargetObjectTypes[this.RowNodeID].targetScriptName.toLowerCase();
      obj.assoToCtxObjectScriptname = this.mmNode.AssociationsTargetObjectTypes[this.RowNodeID].associationTypeScriptName.toLowerCase();
      this.headerRequest.objects.push(obj);
      var obj1 = {};
      obj1.scriptname = this.mmNode.AssociationsTargetObjectTypes[this.ColumnNodeID].targetScriptName.toLowerCase();
      obj1.assoToCtxObjectScriptname = this.mmNode.AssociationsTargetObjectTypes[this.ColumnNodeID].associationTypeScriptName.toLowerCase();
      this.headerRequest.objects.push(obj1);
      var obj2 = {};
      obj2.scriptname = this.mmNode.AssociationsTargetObjectTypes[this.CellNodeID].targetScriptName.toLowerCase();
      obj2.assoToCtxObjectScriptname = this.mmNode.AssociationsTargetObjectTypes[this.CellNodeID].associationTypeScriptName.toLowerCase();
      this.headerRequest.objects.push(obj2);

    };



    cwContextObjectTable.prototype.getObjectFromObjectypes = function(rowObjectTypeScriptName, columnObjectTypeScriptName, cellObjectTypeScriptName,mainObjectScriptName) {
      var sendData = {};
      var propertiesToSelect = ["NAME", "ID"];
      var self = this;
      var callbackCount = 0;

      sendData.objectTypeScriptName = mainObjectScriptName.toUpperCase();
      sendData.propertiesToSelect = propertiesToSelect;

      cwApi.cwEditProperties.GetObjectsByScriptName(sendData, function(update) {
        var mainObject;
        for(var key in update) {
          if(update.hasOwnProperty(key)) {
            callbackCount = callbackCount + 1;
            for (var i = 0; i < update[key].length; i++) {
              mainObject = update[key][i];
                if (mainObject.hasOwnProperty('properties') && mainObject.properties.hasOwnProperty("name") && mainObject.properties.hasOwnProperty("id")) {
                  mainObject.properties.label = mainObject.name;
                  self.cwContextTable.mainObjectFilter.objects.push(mainObject.properties); 
                  self.cwContextTable.mainObjectFilter.label = key;
                } 
            }
          }
        }
        if (callbackCount === 4) {
          self.cwContextTable.refresh();
          self.unlock();
        }
      });

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
                  self.cwContextTable.rowFilter.objects.push(object0.properties); 
                  self.cwContextTable.rowFilter.label = key;
                } 
            }
          }
        }
        if (callbackCount === 4) {
          self.cwContextTable.refresh();
          self.unlock();
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
                  self.cwContextTable.columnFilter.objects.push(object1.properties);
                  self.cwContextTable.columnFilter.label = key;
                } 
            }
          }
        }
        if (callbackCount === 4) {
          self.cwContextTable.refresh();
          self.unlock();
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
                  self.cwContextTable.cellFilter.objects.push(object2.properties);
                  self.cwContextTable.cellFilter.label = key;
                } 
            }
          }
        }
        if (callbackCount === 4) {
          self.cwContextTable.refresh();
          self.unlock();
        }
      });
    };  


    cwContextObjectTable.prototype.postRequest = function (event) {
      var self = this;
      if(this.isLocked() === false && event.callback) {
        this.lock();

        this.sendEVODRequest(event.data.postRequest,function(sucess) {
          if(sucess) event.callback(sucess);
          self.unlock();
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