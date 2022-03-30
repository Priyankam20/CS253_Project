import React, { useState, useEffect } from "react";
import { GetCurrentUser } from "../../services/auth.service";

import "./CalendarShow.css";

import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
} from "@syncfusion/ej2-react-schedule";

import { Query, DataManager, Predicate } from "@syncfusion/ej2-data";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import { GridComponent } from "@syncfusion/ej2-react-grids";
import { extend } from "@syncfusion/ej2-base";
import { SampleBase } from "./sample-base";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import * as dataSource from "./datasource.json";
/**
 * Sample for searching appointments
 */

const data = dataSource;

export class SearchEvents extends SampleBase {
  constructor() {
    super(...arguments);
    this.data = extend([], data.scheduleData, null, true);
  }
  globalSearch(args) {
    let searchString = args.target.value;
    if (searchString !== "") {
      new DataManager(this.scheduleObj.getEvents(null, null, true))
        .executeQuery(
          new Query().search(
            searchString,
            ["Subject", "Location", "Description"],
            null,
            true,
            true
          )
        )
        .then((e) => {
          if (e.result.length > 0) {
            this.showSearchEvents("show", e.result);
          } else {
            this.showSearchEvents("hide");
          }
        });
    } else {
      this.showSearchEvents("hide");
    }
  }
  searchOnclick() {
    let searchObj = [];
    let startDate;
    let endDate;
    let formElements = [].slice.call(
      document.querySelectorAll(".event-search .search-field")
    );
    formElements.forEach((node) => {
      let fieldOperator;
      let predicateCondition;
      let fieldValue;
      let fieldInstance;
      if (
        node.value &&
        node.value !== "" &&
        !node.classList.contains("e-datepicker")
      ) {
        fieldOperator = "contains";
        predicateCondition = "or";
        fieldValue = node.value;
        searchObj.push({
          field: node.getAttribute("data-name"),
          operator: fieldOperator,
          value: fieldValue,
          predicate: predicateCondition,
          matchcase: true,
        });
      }
      if (
        node.classList.contains("e-datepicker") &&
        node.ej2_instances[0].value
      ) {
        fieldInstance = node.ej2_instances[0];
        fieldValue = fieldInstance.value;
        if (node.classList.contains("e-start-time")) {
          fieldOperator = "greaterthanorequal";
          predicateCondition = "and";
          startDate = new Date(+fieldValue);
        } else {
          fieldOperator = "lessthanorequal";
          predicateCondition = "and";
          let date = new Date(+fieldInstance.value);
          fieldValue = new Date(date.setDate(date.getDate() + 1));
          endDate = fieldValue;
        }
        searchObj.push({
          field: node.getAttribute("data-name"),
          operator: fieldOperator,
          value: fieldValue,
          predicate: predicateCondition,
          matchcase: false,
        });
      }
    });
    if (searchObj.length > 0) {
      let filterCondition = searchObj[0];
      let predicate = new Predicate(
        filterCondition.field,
        filterCondition.operator,
        filterCondition.value,
        filterCondition.matchcase
      );
      for (let i = 1; i < searchObj.length; i++) {
        predicate = predicate.and(
          searchObj[i].field,
          searchObj[i].operator,
          searchObj[i].value,
          searchObj[i].matchcase
        );
      }
      let result = new DataManager(
        this.scheduleObj.getEvents(startDate, endDate, true)
      ).executeLocal(new Query().where(predicate));
      this.showSearchEvents("show", result);
    } else {
      this.showSearchEvents("hide");
    }
  }
  clearOnClick() {
    document.getElementById("schedule").style.display = "block";
    document.getElementById("form-search").reset();
    this.showSearchEvents("hide");
  }
  showSearchEvents(type, data) {
    if (type === "show") {
      if (document.getElementById("grid").classList.contains("e-grid")) {
        let gridObj = document.querySelector("#grid").ej2_instances[0];
        gridObj.dataSource = data;
        gridObj.dataBind();
      } else {
        let gridObj = new GridComponent({
          dataSource: data,
          height: 505,
          width: "auto",
          columns: [
            { field: "Subject", headerText: "Subject", width: 120 },
            { field: "Location", headerText: "Location", width: 120 },
            {
              field: "StartTime",
              headerText: "StartTime",
              width: 120,
              format: { type: "dateTime", format: "M/d/y hh:mm a" },
            },
            {
              field: "EndTime",
              headerText: "EndTime",
              width: 120,
              format: { type: "dateTime", format: "M/d/y hh:mm a" },
            },
          ],
        });
        gridObj.appendTo(document.querySelector("#grid"));
        this.scheduleObj.element.style.display = "none";
      }
    } else {
      let gridObj = document.querySelector("#grid").ej2_instances;
      if (gridObj && gridObj.length > 0 && !gridObj[0].isDestroyed) {
        gridObj[0].destroy();
      }
      this.scheduleObj.element.style.display = "block";
    }
  }
  render() {
    return (
      <>
        <head>
          <link
            href="https://cdn.syncfusion.com/ej2/material.css"
            rel="stylesheet"
          />
        </head>
        <div className="calendar-body-padded">
          <div className="schedule-control-section">
            <div className="col-lg-9 control-section">
              <div className="control-wrapper">
                <div className="col-md-12">
                  <ScheduleComponent
                    id="schedule"
                    cssClass="resource"
                    width="100%"
                    height="650px"
                    selectedDate={new Date(2022, 2, 10)}
                    readonly={true}
                    ref={(schedule) => (this.scheduleObj = schedule)}
                    eventSettings={{ dataSource: this.data }}
                  >
                    <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
                  </ScheduleComponent>
                  <div id="grid"></div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 property-section property-customization">
              <div className="property-panel-section">
                <p
                  className="property-panel-header header-customization"
                  style={{ width: "100%" }}
                >
                  Search by all event fields
                </p>
                <div className="property-panel-content">
                  <input
                    className="e-input"
                    type="text"
                    placeholder="Enter the Search text"
                    onKeyUp={this.globalSearch.bind(this)}
                  />
                </div>
                <form className="event-search" id="form-search">
                  <p
                    className="property-panel-header header-customization"
                    style={{ width: "100%" }}
                  >
                    Search by specific event fields
                  </p>
                  <table id="property-specific" style={{ width: "100%" }}>
                    <tbody>
                      <tr className="row">
                        <td className="property-panel-content" colSpan={2}>
                          <input
                            type="text"
                            className="e-input search-field"
                            id="searchEventName"
                            data-name="Subject"
                            placeholder="Subject"
                          />
                        </td>
                      </tr>
                      <tr className="row" style={{ height: "45px" }}>
                        <td className="property-panel-content" colSpan={2}>
                          <input
                            type="text"
                            className="e-input search-field"
                            id="searchEventLocation"
                            data-name="Location"
                            placeholder="Location"
                          />
                        </td>
                      </tr>
                      <tr className="row" style={{ height: "45px" }}>
                        <td className="property-panel-content" colSpan={2}>
                          <DatePickerComponent
                            className="search-field e-start-time"
                            value={null}
                            data-name="StartTime"
                            showClearButton={false}
                            placeholder="Start Time"
                          ></DatePickerComponent>
                        </td>
                      </tr>
                      <tr className="row" style={{ height: "45px" }}>
                        <td className="property-panel-content" colSpan={2}>
                          <DatePickerComponent
                            className="search-field e-end-time"
                            value={null}
                            data-name="EndTime"
                            showClearButton={false}
                            placeholder="End Time"
                          ></DatePickerComponent>
                        </td>
                      </tr>
                      <tr className="row" style={{ height: "45px" }}>
                        <td
                          className="e-field button-customization"
                          style={{ width: "50%", padding: "15px" }}
                        >
                          <ButtonComponent
                            title="Search"
                            type="button"
                            onClick={this.searchOnclick.bind(this)}
                          >
                            Search
                          </ButtonComponent>
                        </td>
                        <td
                          className="e-field button-customization"
                          style={{ width: "50%", padding: "15px" }}
                        >
                          <ButtonComponent
                            title="Clear"
                            type="button"
                            onClick={this.clearOnClick.bind(this)}
                          >
                            Clear
                          </ButtonComponent>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default SearchEvents;
