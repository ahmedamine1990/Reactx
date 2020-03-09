import React, { Component } from "react";
import axios from "axios";


var listTitle = "Events";
var fields = ["Id", "Title", "Location", "EventDate", "EndDate", "Description", "Category"]; // to can change
var sorting = "Order asc";
var filtering = ""; // json array key value
var paging = "";
var expand = "";
var toping= "1000";

export default class NextEvents extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }
    componentDidMount() {
        axios.get(this.getUrlRest())
        .then(res => this.getAllItemsViewsAfterTransformation(res.data.value))
        .then(_items => this.setState({ items: _items }))
    }
    render() {
        return (
            this.state.items.map(item =>
                <div class="col-lg-3 col-md-4 col-sx-6 pb-2 pt-2 border border-white event">
                <div class="row d-flex flex-wrap align-items-center p-1">
                    <div class="col-3"><i class="far fa-calendar-alt fa-3x"></i></div>
                    <div class="col-9">
                        <div class="container event-info">
                            <div class="row event-title">
                                <span>
                                    <a href={item.DisplayUrl}>
                                        {item.Title}
                                    </a>
                                </span>
                            </div>
                            <div class="row event-Date"><span class="event-text">{item.StartDay}</span></div>
                            <div class="row event-location event-text">
                                <div class="position-Icon"><i class="fas fa-map-marker-alt fa-2x"></i></div><span>{item.Location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )
        );
    }
    getUrlRest() {
           var restUrl = _spPageContextInfo.webServerRelativeUrl;
        restUrl += "/_api/Web/Lists/GetByTitle('";
        restUrl += listTitle;
        restUrl += "')/Items";
        if (fields.length > 0) {
            restUrl += "?$select=";
            for (var i = 0; i < fields.length; i++) {
                restUrl += fields[i];
                if (i != fields.length - 1) restUrl += ",";
            }
        }
        if (sorting != "")
            restUrl += "&$orderby=" + sorting;
        if (paging != "")
            restUrl += "$" + paging;
        if (filtering != "")
            restUrl += "&$filter=" + filtering;
        if (expand != "")
            restUrl += "$expand=" + expand;
        if (toping != "")
            restUrl += "&$top=" + toping;

        console.log(restUrl);
return restUrl;
    }
    getAllItemsViewsAfterTransformation(inputItems) {
        var outputItems = [];
        inputItems.map(function (inputItem, index) {
            var outputItem = inputItem;
            outputItem["StartDay"] = new Date(inputItem["EventDate"]).toLocaleDateString();      
            outputItem["DisplayUrl"] = _spPageContextInfo.webServerRelativeUrl + "/Lists/" + listTitle + "/DispForm.aspx?ID=" + outputItem["Id"];
            outputItems[index] = outputItem;
        });
        console.log(outputItems);
        return outputItems;
    }   
}