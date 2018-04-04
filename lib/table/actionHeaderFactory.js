"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = actionHeadersFrom;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function actionFactory(action) {
  if (action === "delete") {
    return function (cell, row, enumObject, rowIndex, formData, onChange) {
      var newFormData = formData.slice(0);
      newFormData.splice(rowIndex, 1);
      onChange(newFormData);
    };
  } else if (action === "moveup") {
    return function (cell, row, enumObject, rowIndex, formData, onChange) {
      var newFormData = formData.slice(0);
      var temp = newFormData[rowIndex];
      if (rowIndex >= 1) {
        newFormData[rowIndex] = newFormData[rowIndex - 1];
        newFormData[rowIndex - 1] = temp;
        onChange(newFormData);
      }
    };
  } else if (action === "movedown") {
    return function (cell, row, enumObject, rowIndex, formData, onChange) {
      var newFormData = formData.slice(0);
      var temp = newFormData[rowIndex];
      if (rowIndex <= formData.length - 2) {
        newFormData[rowIndex] = newFormData[rowIndex + 1];
        newFormData[rowIndex + 1] = temp;
        onChange(newFormData);
      }
    };
  } else if (typeof action === "function") {
    return action;
  } else {
    return undefined;
  }
}

function actionColumnFrom(_ref) {
  var action = _ref.action,
      icon = _ref.icon,
      text = _ref.text;

  var handleClick = actionFactory(action);
  if (!handleClick) {
    return {};
  }
  return {
    dataField: icon,
    dataFormat: function dataFormat(cell, row, enumObject, rowIndex, formData, onChange) {
      return _react2.default.createElement(
        "span",
        {
          onClick: function onClick() {
            return handleClick(cell, row, enumObject, rowIndex, formData, onChange);
          } },
        _react2.default.createElement("i", { className: icon }),
        text
      );
    },
    editable: false
  };
}

var actionToCol = function actionToCol(formData, onChange) {
  return function (actionConf) {
    var genericConf = actionColumnFrom(actionConf);
    var realDataFormat = actionConf.dataFormat ? actionConf.dataFormat : genericConf.dataFormat;
    return Object.assign({}, actionConf, genericConf, {
      dataFormat: function dataFormat(cell, row, enumObject, rowIndex) {
        return realDataFormat(cell, row, enumObject, rowIndex, formData, onChange);
      }
    });
  };
};

function actionHeadersFrom(uiSchema, formData, onChange) {
  var _uiSchema$table = uiSchema.table;
  _uiSchema$table = _uiSchema$table === undefined ? {} : _uiSchema$table;
  var _uiSchema$table$right = _uiSchema$table.rightActions,
      rightActions = _uiSchema$table$right === undefined ? [] : _uiSchema$table$right,
      _uiSchema$table$leftA = _uiSchema$table.leftActions,
      leftActions = _uiSchema$table$leftA === undefined ? [] : _uiSchema$table$leftA;

  var rightColumns = rightActions.map(actionToCol(formData, onChange));
  var leftColumns = leftActions.map(actionToCol(formData, onChange));
  return { rightColumns: rightColumns, leftColumns: leftColumns };
}