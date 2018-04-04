"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactBootstrapTable = require("react-bootstrap-table");

var _tableConfFactory = require("./tableConfFactory");

var _tableConfFactory2 = _interopRequireDefault(_tableConfFactory);

var _columnHeadersFactory = require("./columnHeadersFactory");

var _columnHeadersFactory2 = _interopRequireDefault(_columnHeadersFactory);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function convertFields(cellValue, _ref) {
  var type = _ref.type,
      format = _ref.format,
      def = _ref.default;

  if (cellValue === undefined) {
    return cellValue;
  }

  if (type === "boolean") {
    return cellValue === "true";
  } else if (type === "number") {
    return cellValue !== undefined && cellValue != "" ? parseFloat(cellValue) : "";
  } else if (type === "string" && format === "date-time") {
    if (cellValue === "") {
      return def;
    } else {
      var date = new Date(cellValue);
      return date.toISOString();
    }
  } else if (type === "string" && format === "date") {
    if (cellValue === "") {
      return def;
    } else {
      var _date = (0, _moment2.default)(cellValue).format("YYYY-MM-DD");
      return _date;
    }
  }
  return cellValue;
}

var TableField = function (_Component) {
  _inherits(TableField, _Component);

  function TableField(props) {
    _classCallCheck(this, TableField);

    var _this = _possibleConstructorReturn(this, (TableField.__proto__ || Object.getPrototypeOf(TableField)).call(this, props));

    _this.handleCellSave = _this.handleCellSave.bind(_this);
    _this.handleRowsDelete = _this.handleRowsDelete.bind(_this);
    return _this;
  }

  _createClass(TableField, [{
    key: "handleCellSave",
    value: function handleCellSave(updRow, cellName, cellValue) {
      var _tableConf = this.tableConf,
          keyField = _tableConf.keyField,
          data = _tableConf.data;


      var fieldSchema = this.props.schema.items.properties[cellName];
      updRow[cellName] = convertFields(cellValue, fieldSchema);
      // Small hack to support object returned from async autocomplete
      // Don't judge me too hard
      if (cellValue && cellValue[cellName]) {
        Object.assign(updRow, cellValue);
      }

      var targetKey = updRow[keyField];
      var updTable = data.map(function (row) {
        return row[keyField] === targetKey ? updRow : row;
      });

      /* Number field Validation => if Number is Undefined Or Empty, it should removed from the FormData */
      var type = fieldSchema.type,
          format = fieldSchema.format,
          def = fieldSchema.default;

      if (type === 'number') {
        Object.keys(updTable[targetKey]).map(function (column) {
          if (column == cellName && updTable[targetKey][column] === undefined || updTable[targetKey][column] == '') {
            delete updTable[targetKey][column];
          }
        });
      }
      /* end Number Filed validation  */
      this.props.onChange((0, _tableConfFactory.removePosition)(updTable));
    }
  }, {
    key: "handleRowsDelete",
    value: function handleRowsDelete(removedKeys) {
      var _tableConf2 = this.tableConf,
          keyField = _tableConf2.keyField,
          data = _tableConf2.data;


      var filteredRows = data.filter(function (row) {
        var rowKey = row[keyField];
        return !removedKeys.includes(rowKey);
      });

      this.props.onChange((0, _tableConfFactory.removePosition)(filteredRows));
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      var _nextProps$uiSchema$t = nextProps.uiSchema.table;
      _nextProps$uiSchema$t = _nextProps$uiSchema$t === undefined ? {} : _nextProps$uiSchema$t;
      var focusOnAdd = _nextProps$uiSchema$t.focusOnAdd;

      this.adding = focusOnAdd !== undefined && nextProps.formData && this.props.formData && nextProps.formData.length > this.props.formData.length;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      if (this.adding) {
        var focusOnAdd = this.props.uiSchema.table.focusOnAdd;

        var body = this.refs.table.refs.body ? this.refs.table.refs.body : this.refs.table.body;
        if (!body || !body.handleEditCell) {
          console.error("Can't find body in the table");
          return;
        }
        body.handleEditCell(this.props.formData.length, focusOnAdd);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          uiSchema = _props.uiSchema,
          schema = _props.schema,
          formData = _props.formData,
          fields = _props.registry.fields,
          _props$idSchema = _props.idSchema;
      _props$idSchema = _props$idSchema === undefined ? {} : _props$idSchema;
      var $id = _props$idSchema.$id,
          onChange = _props.onChange;


      this.tableConf = (0, _tableConfFactory2.default)(uiSchema, formData, this.handleCellSave, this.handleRowsDelete);

      this.tableConf.cellEdit.beforeSaveCell = this.beforeSaveCell;
      var columns = (0, _columnHeadersFactory2.default)(schema, uiSchema, fields, formData, onChange);

      return _react2.default.createElement(
        "div",
        { id: $id },
        _react2.default.createElement(
          _reactBootstrapTable.BootstrapTable,
          _extends({}, this.tableConf, { ref: "table" }),
          columns.map(function (column, i) {
            return _react2.default.createElement(
              _reactBootstrapTable.TableHeaderColumn,
              _extends({ key: i }, column),
              column.displayName
            );
          })
        )
      );
    }
  }]);

  return TableField;
}(_react.Component);

exports.default = TableField;