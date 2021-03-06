import React from "react";
import actionHeaderFrom from "./actionHeaderFactory";
import moment from "moment";

const toDataAlignment = fieldProp => {
  if (fieldProp.type === "number") {
    return 'right';
  }else if(fieldProp.format === "date" || fieldProp.format === "date-time" ){
    return 'right';
  }
};
const toDataFormat = fieldProp => {

  if (fieldProp.enum && fieldProp.enumNames) {
    return cell => fieldProp.enumNames[fieldProp.enum.indexOf(cell)];
  } else if (fieldProp.type === "boolean") {
    return cell => (
      <div style={{ textAlign: "right" }}>
     <label>{ (cell) ? 'Yes' : 'No'}</label>
      </div>
    );
  }
  return undefined;
};

const toEditable = fieldProp => {
  if (fieldProp.enum) {
    if (fieldProp.enumNames) {
      let values = fieldProp.enum.map((value, i) => {
        let text = fieldProp.enumNames[i];
        return { value, text };
      });
      return {
        type: "select",
        options: { values },
      };
    } else {
      return {
        type: "select",
        options: { values: fieldProp.enum },
      };
    }
  } else if (fieldProp.type === "boolean") {
    return {
      type: "checkbox",
    };
  } else if (fieldProp.format === "date-time") {
    return {
      type: "datetime-local",
    };
  } else if (fieldProp.format === "date") {
    return {
      type: "date",
    };
  } else if (fieldProp.format === "time") {
    return {
      type: "time",
    };
  } else if (fieldProp.type === "number") {
    return {
      type: "number",
    };
  }
  return true;
};

const columnHeadersFromSchema = schema => {
  let { items: { properties } } = schema;
  let schemaCols = Object.keys(properties).map(dataField => {
    let { title } = properties[dataField];
    let editable = toEditable(properties[dataField]);
    let dataFormat = toDataFormat(properties[dataField]);
    let dataAlign = toDataAlignment(properties[dataField]);
    return { dataField, displayName: title, editable, dataFormat, dataAlign };
  });

  return schemaCols;
};

export function overrideColDataFormat(colConf, fieldSchema) {
  if (typeof colConf.dataFormat === "string" && fieldSchema.type === "object") {
    const { dataField, dataFormat: field } = colConf;
    colConf.dataFormat = function(cell, row) {
      return row[dataField] ? row[dataField][field] : undefined;
    };
    colConf.dataFormat.bind(this);
  } else if (
    typeof colConf.dataFormat === "string" &&
    fieldSchema.type === "string" &&
    (fieldSchema.format === "date-time" || fieldSchema.format === "date")
  ) {
    const { dataField, dataFormat } = colConf;
    colConf.dataFormat = function(cell, row) {
      if (!row[dataField]) {
        return undefined;
      }
      let fieldVal = row[dataField];
      if (typeof fieldVal === "string") {
        return moment(fieldVal).format(dataFormat);
      }
      return moment(fieldVal.toISOString()).format(dataFormat);
    };
    colConf.dataFormat.bind(this);
  }
}

const overrideColEditable = (colConf, fieldSchema, fields) => {
  if (colConf.field && fields[colConf.field]) {
    let FieldEditor = fields[colConf.field];
    let fieldUISchema = Object.assign(
      { "ui:autofocus": true },
      colConf.uiSchema
    );
    let fieldSchemaWithoutTitle = Object.assign(
      { ...fieldSchema },
      { title: "" }
    );
    colConf.customEditor = {
      getElement: (onUpdate, props) => (
        <FieldEditor
          formData={props.defaultValue}
          schema={fieldSchemaWithoutTitle}
          uiSchema={fieldUISchema}
          onChange={onUpdate}
        />
      ),
    };
  }
};

const overrideColumns = (
  columns,
  { items: { properties } },
  uiSchema,
  fields
) => {
  let { table: { tableCols = [] } = {} } = uiSchema;

  let columnsWithOverrides = columns.map(col => {
    let colConf = tableCols.find(
      overrideCol => overrideCol.dataField === col.dataField
    );
    if (!colConf) {
      return col;
    }
    let updCol = Object.assign({}, col, colConf);
    overrideColDataFormat(updCol, properties[col.dataField]);
    overrideColEditable(updCol, properties[col.dataField], fields);
    return updCol;
  });

  return columnsWithOverrides;
};

const orderColumns = (columns, uiSchema) => {
  let { table: { tableCols = [] } = {} } = uiSchema;
  let order = tableCols.map(({ dataField }) => dataField);

  if (!order || order.length === 0) {
    return columns;
  }

  let orderedColumns = columns
    .filter(({ dataField }) => order.includes(dataField))
    .sort((a, b) => order.indexOf(a.dataField) - order.indexOf(b.dataField));
  if (orderedColumns.length === 0) {
    return columns;
  }
  if (orderedColumns.length === columns.length) {
    return orderedColumns;
  }

  let nonOrderedColumns = columns.filter(nav => !orderedColumns.includes(nav));
  return orderedColumns.concat(nonOrderedColumns);
};

const setColumnCSSIfMissing = (col, css) => {
  let {
    className = css,
    columnClassName = css,
    editColumnClassName = css,
  } = col;
  Object.assign(col, { className, columnClassName, editColumnClassName });
};

const withColumnCss = columns => {
  let shownColumns = columns.filter(({ hidden }) => !hidden);
  let numCols = shownColumns.length;
  let colSize = Math.floor(12 / numCols);
  if (colSize === 0) {
    return columns;
  }

  let colCss = `col-md-${colSize}`;
  shownColumns.forEach((col, i) => {
    if (i !== 0) {
      setColumnCSSIfMissing(col, colCss);
    }
  });
  return columns;
};

const columnHeadersFactory = (
  schema,
  uiSchema,
  fields = {},
  formData,
  onChange
) => {
  let allColumns = columnHeadersFromSchema(schema);
  let orderedColumns = orderColumns(allColumns, uiSchema);
  let withOverrides = overrideColumns(orderedColumns, schema, uiSchema, fields);
  let columnsWithCSS = withColumnCss(withOverrides);
  let { rightColumns, leftColumns } = actionHeaderFrom(
    uiSchema,
    formData,
    onChange
  );

  leftColumns.forEach(col => columnsWithCSS.unshift(col));
  rightColumns.forEach(col => columnsWithCSS.push(col));

  return columnsWithCSS;
};

export default columnHeadersFactory;
