/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function(cwApi, $) {

  "use strict";
  // constructor
  var cwContextTable = function(propertiesStyleMap,rowTitle,columnTitle,cellTitle,nodeID) {
    this.lines = {};
    this.columns = {}; 
    this.linesArray = [];
    this.columnsArray = [];
    this.cells = [];
    this.rowTitle = rowTitle;
    this.columnTitle = columnTitle;
    this.cellTitle = cellTitle;
    this.propertiesStyleMap = propertiesStyleMap;
    this.cellFilter = {};
    this.cellFilter.objects = [];
    this.rowFilter = {};
    this.rowFilter.objects = [];
    this.columnFilter = {};
    this.columnFilter.objects = [];     
    this.display = false;
    this.nodeID = nodeID;
    this.saveEvent = false;
  };

  cwContextTable.prototype.addLine = function(line,label) {
    if(line.length > 0) {
      line[0].label = label;
      line[0].edited = "none";
      line[0].link = cwAPI.getSingleViewHash(line[0].objectTypeScriptName, line[0].object_id);
      this.lines[line[0].object_id] = line[0];
      return line[0].object_id; 
    }
    return null;
  };

  cwContextTable.prototype.addColumn = function(column,label) {
    if(column.length > 0) {
      column[0].label = label;
      column[0].edited = "none";
      column[0].link = cwAPI.getSingleViewHash(column[0].objectTypeScriptName, column[0].object_id);
      this.columns[column[0].object_id] = column[0];
      return column[0].object_id; 
    }
    return null; 
  };

  cwContextTable.prototype.addCell = function(cell,rowID,columnID,label,ctxObj,edited) {
    if(cell.length > 0) {
      cell[0].edited = 'none';
      cell[0].columnID = columnID;
      cell[0].rowID = rowID;
      cell[0].label = label;
      cell[0].ctxProperties = ctxObj.properties;
      cell[0].link = cwAPI.getSingleViewHash(cell[0].objectTypeScriptName, cell[0].object_id);
      this.cells.push(cell[0]);
    }
  };

  cwContextTable.prototype.addCellFromEdit = function(cell,rowID,columnID) {
    var newCell = {};
    newCell.edited = 'added';
    newCell.columnID = columnID;
    newCell.rowID = rowID;
    newCell.label = cell.label;
    newCell.ctxProperties = {};    
    newCell.ctxProperties[this.propertiesStyleMap.scriptname.toLowerCase()] = "";
    newCell.link = cell.link;
    newCell.object_id = cell.id;
    this.cells.push(newCell);
  };

 


  cwContextTable.prototype.isCellAlreadyExist = function (rowID,columnID,idToCompare) {
    var result = [];
    var status = false;
    var self = this;
    this.cells.forEach(function(cell) {
      if(cell.columnID == columnID && cell.rowID == rowID && cell.object_id === idToCompare) {
        status = true;
        if(cell.edited === "deleted") {
          cell.edited = 'none';
        } else {
          cwApi.notificationManager.addNotification(self.cellTitle + " " + cell.label + " already exist",'error');          
        }
      }
    });
    return status;
  };


 cwContextTable.prototype.clearRowAndColumn = function() {
    var id;
    for (id in this.lines) {
      if (this.lines.hasOwnProperty(id)) {
        this.linesArray.push(this.lines[id]);
      }
    }
    for (id in this.columns) {
      if (this.columns.hasOwnProperty(id)) {
        this.columnsArray.push(this.columns[id]);
      }
    }
  };


  cwContextTable.prototype.addLineAndRefresh = function(line) {
    for (var i = 0; i < this.lines.length; i++) {
      if(this.lines[i].id0 === line[0].id && this.lines[i].id1 === line[1].id && this.lines[i].id2 === line[2].id) {
        cwApi.notificationManager.addNotification('Ternary was already existed');
        return;
      }
    }
    line[0].label = line[0].name ;
    line[1].label = line[1].name ;
    line[2].label = line[2].name ;
    this.addline(line[0], line[1], line[2]);
    this.refresh();
  };

  cwContextTable.prototype.removeLine = function(lineToRemove) {
    for (var i = 0; i < this.lines.length; i++) {
      if(this.lines[i] === lineToRemove) {
        this.lines.splice(i, 1);
        return;
      }
    }
  };


  cwContextTable.prototype.createAngularTable = function($container, container, item) {
    var loader = cwApi.CwAngularLoader,
      templatePath;
    loader.setup();
    var that = this;
    var self = this;

    templatePath = cwAPI.getCommonContentPath() + '/html/angularLayouts/cwLayoutAngularTable.ng.html' + '?' + Math.random();

    loader.loadControllerWithTemplate('abc', $container, templatePath, function($scope, $filter, $sce) {
      that.scope = $scope;

      $scope.lines = that.linesArray;
      $scope.columns = that.columnsArray;
      $scope.propertiesStyleMap = self.propertiesStyleMap;
      $scope.getTitle = function() {
        return self.title;
      };
      $scope.getLabelRow = function() {
        return self.rowTitle;
      };
      $scope.getLabelCell = function() {
        return self.cellTitle;
      };

      $scope.tableClass = "tableContext" + self.nodeID;
      $scope.rowFilter = self.rowFilter;
      $scope.columnFilter = self.columnFilter;
      $scope.cellFilter = self.cellFilter;            
      $scope.searchTextCell = {};

      $scope.filterLines =  function (searchTextCell) {
        var getObjectForLineAndColumns = $scope.getObjectForLineAndColumns;
        return function (item) {
          var j,cells;
          if(self.editMode || searchTextCell === undefined || item.name.toLowerCase().includes(searchTextCell.toLowerCase())) return true;
          for(j = 0; j < self.columnsArray.length; j++) {
            if(searchTextCell != "") {
              cells = getObjectForLineAndColumns(item.object_id,self.columnsArray[j].object_id,searchTextCell);
              if(cells.length > 0) {
                return true;
              }
            } else {
              return true;
            }
          }
          return false;
        };
      };


      $scope.getSce = function(label) {
        if(label) {
          return $sce.trustAsHtml(label);
        }
      };

      $scope.display = function(style) {
        var r = {};
        if(self.editMode) {
          r.display = style;
        } else {        
          r.display = "none";
        }
        return r;
      };

      $scope.add = function(data) {
        var newEvent = document.createEvent('Event');
        newEvent.data = data;
        newEvent.callback = function(lineToAdd,quickADD) {
          if(quickADD) that.addLineAndRefresh(lineToAdd);
          else that.reload();
        };
        newEvent.initEvent('Add Item', true, true);
        container.dispatchEvent(newEvent);
      };


      $scope.editAddCell = function(row,column,cell) {
        if(!self.isCellAlreadyExist(row.object_id,column.object_id,cell.id)) {
          self.addCellFromEdit(cell,row.object_id,column.object_id);
        } 
        self.addEventOnSave();
      };

      $scope.editProperties = function(obj,scriptname,value) {
        if(value == obj.ctxProperties[scriptname.toLowerCase()].toLowerCase()) {
          return;
        } else if(value.toLowerCase() == obj.previousValue) {
          obj.edited = "none";
          obj.previousValue = undefined;
          obj.ctxProperties[scriptname.toLowerCase()] = value;
        } else {
          if(obj.previousValue === undefined) {
            obj.previousValue = obj.ctxProperties[scriptname.toLowerCase()].toLowerCase();
          }
          obj.ctxProperties[scriptname.toLowerCase()] = value;
          if(obj.edited !== 'added') obj.edited = 'edited';
        }
        self.addEventOnSave();
      };

      $scope.deleteCell = function(obj) {
        obj.edited = 'deleted';
        self.addEventOnSave();
      };


      $scope.editAddColumn = function(column) {
        column.object_id = column.id;
        for (var i = 0; i < self.columnsArray.length; i++) {
          if(self.columnsArray[i].object_id === column.id) {
            cwApi.notificationManager.addNotification(self.columnTitle + " already exist",'error');  
            return;
          }
        };
        column.edited = "added";
        self.columnsArray.push(column);
        self.column[column.object_id] = column;
      };

      $scope.editAddRow = function(row) {
        row.object_id = row.id;
        for (var i = 0; i < self.linesArray.length; i++) {
          if(self.linesArray[i].object_id === row.id) {            
            cwApi.notificationManager.addNotification(self.rowTitle + " already exist",'error');
            return;
          }
        };
        row.edited = "added";
        self.linesArray.push(row);
        self.lines[row.object_id] = row;
      };


      $scope.getStyle = function(obj) {
        var returnStyle;
        if(obj.ctxProperties && obj.ctxProperties.hasOwnProperty(self.propertiesStyleMap.scriptname.toLowerCase())) {
          var value = obj.ctxProperties[self.propertiesStyleMap.scriptname.toLowerCase()];
          if(self.propertiesStyleMap.properties.hasOwnProperty(value.toLowerCase())) {
            returnStyle = $.extend(true, {}, self.propertiesStyleMap.properties[value.toLowerCase()]);
          }
        }
        if(obj.edited == "none" || obj.edited == "deleted") {
          returnStyle["border"] = "";  
        } else {
          returnStyle["border"] = "solid red";    
        }

        if(self.editMode === true) {
          returnStyle["justify-content"] = "space-between";
        } else {
          returnStyle["justify-content"] = "center";
        }
        return returnStyle;
      };

      $scope.getWidth = function() {
        var returnStyle = {};
        if(self.editMode) {
          returnStyle.width = (self.columnsArray.length + 1) * 300 + "px";
        } else {
          returnStyle.width = self.columnsArray.length * 300 + "px";
        }
        return returnStyle;
      };

    

      $scope.getObjectForLineAndColumns = function (rowID,columnID,filter) {
        var result = [];
        self.cells.forEach(function(cell) {
          if(cell.columnID == columnID && cell.rowID == rowID  && cell.edited != "deleted") {
            if(filter === undefined || cell.name.toLowerCase().includes(filter.toLowerCase())) {
              result.push(cell);
            }
          }
        });
        return result;
      };
    });
  };


  cwContextTable.prototype.addEventOnSave = function() {
    if(!this.saveEvent) {
      var buttonSave = document.getElementById("cw-edit-mode-button-save");
      if(buttonSave) {
        this.saveEvent = true;
        buttonSave.addEventListener("click", this.buildReport.bind(this), false);  
      }      
    }
  };

  cwContextTable.prototype.buildReport = function() {
    var cell, i;
    this.report = {};
    this.report.added = [];
    this.report.edited = [];
    this.report.deleted = [];

    for (i = 0; i < this.cells.length; i++) {
      cell = this.cells[i];
      if(cell.edited === 'added') {
        cell.edited = 'none';
        this.report.added.push(cell);
      }
      if(cell.edited === 'edited') {
        cell.edited = 'none';
        this.report.edited.push(cell);
      }
      if(cell.edited === 'deleted') {
        cell.edited = 'none';
        this.report.deleted.push(cell);
      }
    };
    this.displayReport();
  };
  

  cwContextTable.prototype.displayReport = function() {

    var containers,container;
    containers = document.getElementsByClassName("saveChanges");
    if(containers.length > 0)  {
      container = containers[0];
      container.removeChild(container.firstElementChild);
      this.buildHTMLReport(container);
      debugger;



    }
    else setTimeout(this.displayReport.bind(this), 1000);


   // <div id="button-container"><button id="btn-submit" type="button" class="btn-primary">Submit</button><span id="processing-message">Preparing your change request...</span><span id="complete-message">Complete</span><span id="error-message"></span></div>
  };

  cwContextTable.prototype.buildHTMLReport = function(container) {
    var titleAdded = document.createElement('h3');
    var span;
    var self = this;
    titleAdded.innerText = "Added " + this.cellTitle;
    container.append(titleAdded);
    this.report.added.forEach(function(elem) {
      span = document.createElement('span');
      span.innerText = elem.label + " # " + self.lines[elem.rowID].name + " # "+ self.lines[elem.columnID].name;
      container.append(span);
    });


    var titleEdited = document.createElement('h3');
    titleEdited.innerText = "Edited " + this.cellTitle;
    container.append(titleEdited);
    this.report.edited.forEach(function(elem) {
      span = document.createElement('span');
      span.innerText = elem.label + " # " + self.lines[elem.rowID].name + " # "+ self.lines[elem.columnID].name + "\n";
      //span.innerText += "was " + elem.previousValue;
      container.append(span);
    });      


    var titleDeleted = document.createElement('h3');
    titleDeleted.innerText = "Deleted " + this.cellTitle;
    container.append(titleDeleted);
    this.report.deleted.forEach(function(elem) {
      span = document.createElement('span');
      span.innerText = elem.label + " # " + self.lines[elem.rowID].name + " # "+ self.lines[elem.columnID].name;
      container.append(span);
    });    
  };



  cwContextTable.prototype.refresh = function() {
    if (this.scope) {
      this.scope.$apply();
    }
  };


  cwContextTable.prototype.reload = function() {
    if (location) {
      location.reload();
    }
  };


  if (!cwApi.customLibs) {
    cwApi.customLibs = {};
  }
  if (!cwApi.customLibs.cwContextObjectTable) {
    cwApi.customLibs.cwContextObjectTable = {};
  };
  if (!cwApi.customLibs.cwContextObjectTable.cwContextTable) {
    cwApi.customLibs.cwContextObjectTable.cwContextTable = cwContextTable;
  };

}(cwAPI, jQuery));