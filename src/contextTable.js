/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function(cwApi, $) {

  "use strict";
  // constructor
  var cwContextTable = function(propertiesStyleMap) {
    this.lines = {};
    this.columns = {}; 
    this.linesArray = [];
    this.columnsArray = [];
    this.cells = [];
    this.propertiesStyleMap = propertiesStyleMap;
  };

  cwContextTable.prototype.addLine = function(line,label) {
    if(line.length > 0) {
      line[0].label = label;
      line[0].link = cwAPI.getSingleViewHash(line[0].objectTypeScriptName, line[0].object_id);
      this.lines[line[0].object_id] = line[0];
      return line[0].object_id; 
    }
    return null;
  };

  cwContextTable.prototype.addColumn = function(column,label) {
    if(column.length > 0) {
      column[0].label = label;
      column[0].link = cwAPI.getSingleViewHash(column[0].objectTypeScriptName, column[0].object_id);
      this.columns[column[0].object_id] = column[0];
      return column[0].object_id; 
    }
    return null; 
  };

  cwContextTable.prototype.addCell = function(cell,rowID,columnID,label,ctxObj) {
    if(cell.length > 0) {
      cell[0].columnID = columnID;
      cell[0].rowID = rowID;
      cell[0].label = label;
      cell[0].ctxProperties = ctxObj.properties;
      cell[0].link = cwAPI.getSingleViewHash(cell[0].objectTypeScriptName, cell[0].object_id);
      this.cells.push(cell[0]);
    }
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

      $scope.getTitle = function() {
        return "HK Short term view";
      };
      $scope.getLabelRow = function() {
        return "Business Function";
      };
      $scope.getLabelCell = function() {
        return "Application";
      };
 


      $scope.searchTextCell = {};


      $scope.filterLines =  function (searchTextCell) {
        var getObjectForLineAndColumns = $scope.getObjectForLineAndColumns;
        return function (item) {
          var j,cells;
          if(searchTextCell === undefined || item.name.toLowerCase().includes(searchTextCell.toLowerCase())) return true;
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


      $scope.remove = function(data) {
        var newEvent = document.createEvent('Event');
        newEvent.data = data;
        newEvent.callback = function() {
          that.removeLine(data);
          $scope.$apply();
        };
        newEvent.initEvent('Remove Item', true, true);
        container.dispatchEvent(newEvent);
      };

      $scope.myObj = {
          "color" : "white",
          "background-color" : "coral",
          "font-size" : "60px",
          "padding" : "50px"
      };

      $scope.getStyle = function(obj) {
        var returnStyle = {};
        self.propertiesStyleMap.forEach(function(property) {
          if(obj.ctxProperties.hasOwnProperty(property.scriptname.toLowerCase())) {
            var value = obj.ctxProperties[property.scriptname.toLowerCase()];
            if(property.hasOwnProperty(value.toLowerCase())) {
              returnStyle = property[value.toLowerCase()];
            }
          }
        });

        return returnStyle;
      };

      // in case of single Page, hide 1st column and preselect object
      if (cwAPI.isIndexPage && !cwAPI.isIndexPage() && false) {
        $scope.data = {};
        $scope.display = 'display:none';
        $scope.data['ot0'] = {};
        $scope.data['ot0']['id'] = item.object_id.toString();
      }

      $scope.sortColumn = "name0";
      $scope.reverseSort = false;

      $scope.sortData = function(column) {
        $scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
        $scope.sortColumn = column;
      };

      $scope.getSortClass = function (column) {
        if($scope.sortColumn == column) {
          return $scope.reverseSort ? 'arrow-down' : 'arrow-up';
        }
        return '';
      };

      $scope.getObjectForLineAndColumns = function (rowID,columnID,filter) {
        var result = [];
        self.cells.forEach(function(cell) {
          if(cell.columnID == columnID && cell.rowID == rowID) {
            if(filter === undefined || cell.name.toLowerCase().includes(filter.toLowerCase())) {
              result.push(cell);
            }
          }
        });
        return result;
      };

      $scope.ExportCsv = function() {
        var table = container.firstChild;
        var csvString = '';
        for (var i = 0; i < table.rows.length; i++) {
          if(i !== 1) {
            var rowData = table.rows[i].cells;
            for (var j = 0; j < rowData.length - 1; j++) {
              csvString = csvString + rowData[j].innerText + ";";
            }
            csvString = csvString.substring(0, csvString.length - 1);
            csvString = csvString + "\n";
          }
        }
        csvString = csvString.substring(0, csvString.length - 1);
        var a = $('<a/>', {
          style: 'display:none',
          href: 'data:application/octet-stream;base64,' + btoa(csvString),
          download: 'export.csv'
        }).appendTo('body');
        a[0].click();
        a.remove();
      };

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