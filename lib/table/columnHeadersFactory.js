"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.overrideColDataFormat = overrideColDataFormat;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _actionHeaderFactory = require("./actionHeaderFactory");

var _actionHeaderFactory2 = _interopRequireDefault(_actionHeaderFactory);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toDataAlignment = function toDataAlignment(fieldProp) {
  if (fieldProp.type === "number") {
    return 'right';
  } else if (fieldProp.format === "date" || fieldProp.format === "date-time") {
    return 'right';
  }
};
var toDataFormat = function toDataFormat(fieldProp) {

  if (fieldProp.enum && fieldProp.enumNames) {
    return function (cell) {
      return fieldProp.enumNames[fieldProp.enum.indexOf(cell)];
    };
  } else if (fieldProp.type === "boolean") {
    return function (cell) {
      return _react2.default.createElement(
        "div",
        { style: { textAlign: "right" } },
        _react2.default.createElement(
          "label",
          null,
          cell ? 'Yes' : 'No'
        )
      );
    };
  }
  return undefined;
};

var toEditable = function toEditable(fieldProp) {
  if (fieldProp.enum) {
    if (fieldProp.enumNames) {
      var values = fieldProp.enum.map(function (value, i) {
        var text = fieldProp.enumNames[i];
        return { value: value, text: text };
      });
      return {
        type: "select",
        options: { values: values }
      };
    } else {
      return {
        type: "select",
        options: { values: fieldProp.enum }
      };
    }
  } else if (fieldProp.type === "boolean") {
    return {
      type: "checkbox"
    };
  } else if (fieldProp.format === "date-time") {
    return {
      type: "datetime-local"
    };
  } else if (fieldProp.format === "date") {
    return {
      type: "date"
    };
  } else if (fieldProp.format === "time") {
    return {
      type: "time"
    };
  } else if (fieldProp.type === "number") {
    return {
      type: "number"
    };
  }
  return true;
};

var columnHeadersFromSchema = function columnHeadersFromSchema(schema) {
  var properties = schema.items.properties;

  var schemaCols = Object.keys(properties).map(function (dataField) {
    var title = properties[dataField].title;

    var editable = toEditable(properties[dataField]);
    var dataFormat = toDataFormat(properties[dataField]);
    var dataAlign = toDataAlignment(properties[dataField]);
    return { dataField: dataField, displayName: title, editable: editable, dataFormat: dataFormat, dataAlign: dataAlign };
  });

  return schemaCols;
};

function overrideColDataFormat(colConf, fieldSchema) {
  if (typeof colConf.dataFormat === "string" && fieldSchema.type === "object") {
    var dataField = colConf.dataField,
        field = colConf.dataFormat;

    colConf.dataFormat = function (cell, row) {
      return row[dataField] ? row[dataField][field] : undefined;
    };
    colConf.dataFormat.bind(this);
  } else if (typeof colConf.dataFormat === "string" && fieldSchema.type === "string" && (fieldSchema.format === "date-time" || fieldSchema.format === "date")) {
    var _dataField = colConf.dataField,
        dataFormat = colConf.dataFormat;

    colConf.dataFormat = function (cell, row) {
      if (!row[_dataField]) {
        return undefined;
      }
      var fieldVal = row[_dataField];
      if (typeof fieldVal === "string") {
        return (0, _moment2.default)(fieldVal).format(dataFormat);
      }
      return (0, _moment2.default)(fieldVal.toISOString()).format(dataFormat);
    };
    colConf.dataFormat.bind(this);
  }
}

var overrideColEditable = function overrideColEditable(colConf, fieldSchema, fields) {
  if (colConf.field && fields[colConf.field]) {
    var FieldEditor = fields[colConf.field];
    var fieldUISchema = Object.assign({ "ui:autofocus": true }, colConf.uiSchema);
    var fieldSchemaWithoutTitle = Object.assign(_extends({}, fieldSchema), { title: "" });
    colConf.customEditor = {
      getElement: function getElement(onUpdate, props) {
        return _react2.default.createElement(FieldEditor, {
          formData: props.defaultValue,
          schema: fieldSchemaWithoutTitle,
          uiSchema: fieldUISchema,
          onChange: onUpdate
        });
      }
    };
  }
};

var overrideColumns = function overrideColumns(columns, _ref, uiSchema, fields) {
  var properties = _ref.items.properties;
  var _uiSchema$table = uiSchema.table;
  _uiSchema$table = _uiSchema$table === undefined ? {} : _uiSchema$table;
  var _uiSchema$table$table = _uiSchema$table.tableCols,
      tableCols = _uiSchema$table$table === undefined ? [] : _uiSchema$table$table;


  var columnsWithOverrides = columns.map(function (col) {
    var colConf = tableCols.find(function (overrideCol) {
      return overrideCol.dataField === col.dataField;
    });
    if (!colConf) {
      return col;
    }
    var updCol = Object.assign({}, col, colConf);
    overrideColDataFormat(updCol, properties[col.dataField]);
    overrideColEditable(updCol, properties[col.dataField], fields);
    return updCol;
  });

  return columnsWithOverrides;
};

var orderColumns = function orderColumns(columns, uiSchema) {
  var _uiSchema$table2 = uiSchema.table;
  _uiSchema$table2 = _uiSchema$table2 === undefined ? {} : _uiSchema$table2;
  var _uiSchema$table2$tabl = _uiSchema$table2.tableCols,
      tableCols = _uiSchema$table2$tabl === undefined ? [] : _uiSchema$table2$tabl;

  var order = tableCols.map(function (_ref2) {
    var dataField = _ref2.dataField;
    return dataField;
  });

  if (!order || order.length === 0) {
    return columns;
  }

  var orderedColumns = columns.filter(function (_ref3) {
    var dataField = _ref3.dataField;
    return order.includes(dataField);
  }).sort(function (a, b) {
    return order.indexOf(a.dataField) - order.indexOf(b.dataField);
  });
  if (orderedColumns.length === 0) {
    return columns;
  }
  if (orderedColumns.length === columns.length) {
    return orderedColumns;
  }

  var nonOrderedColumns = columns.filter(function (nav) {
    return !orderedColumns.includes(nav);
  });
  return orderedColumns.concat(nonOrderedColumns);
};

var setColumnCSSIfMissing = function setColumnCSSIfMissing(col, css) {
  var _col$className = col.className,
      className = _col$className === undefined ? css : _col$className,
      _col$columnClassName = col.columnClassName,
      columnClassName = _col$columnClassName === undefined ? css : _col$columnClassName,
      _col$editColumnClassN = col.editColumnClassName,
      editColumnClassName = _col$editColumnClassN === undefined ? css : _col$editColumnClassN;

  Object.assign(col, { className: className, columnClassName: columnClassName, editColumnClassName: editColumnClassName });
};

var withColumnCss = function withColumnCss(columns) {
  var shownColumns = columns.filter(function (_ref4) {
    var hidden = _ref4.hidden;
    return !hidden;
  });
  var numCols = shownColumns.length;
  var colSize = Math.floor(12 / numCols);
  if (colSize === 0) {
    return columns;
  }

  var colCss = "col-md-" + colSize;
  shownColumns.forEach(function (col, i) {
    if (i !== 0) {
      setColumnCSSIfMissing(col, colCss);
    }
  });
  return columns;
};

var columnHeadersFactory = function columnHeadersFactory(schema, uiSchema) {
  var fields = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var formData = arguments[3];
  var onChange = arguments[4];

  var allColumns = columnHeadersFromSchema(schema);
  var orderedColumns = orderColumns(allColumns, uiSchema);
  var withOverrides = overrideColumns(orderedColumns, schema, uiSchema, fields);
  var columnsWithCSS = withColumnCss(withOverrides);

  var _actionHeaderFrom = (0, _actionHeaderFactory2.default)(uiSchema, formData, onChange),
      rightColumns = _actionHeaderFrom.rightColumns,
      leftColumns = _actionHeaderFrom.leftColumns;

  leftColumns.forEach(function (col) {
    return columnsWithCSS.unshift(col);
  });
  rightColumns.forEach(function (col) {
    return columnsWithCSS.push(col);
  });

  return columnsWithCSS;
};

exports.default = columnHeadersFactory;