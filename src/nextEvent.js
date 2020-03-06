import React, { Component } from "react";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import './styles.scss';

var listTitle = "Events";
var fields = ["Id", "Title", "Location", "EventDate", "EndDate", "Description", "Category"]; // to can change
var sorting = "Order asc";
var filtering = []; // json array key value
var paging = "";
var expand = "";

export default class NextEvents extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }
    componentWillMount() {
        this.getListItems(this.getUrlRest());
    }
    render() {
        return (
            this.state.items.map(item =>
                        <Col sm={6} md={4} lg={3} className="ml-1 p-2 event"> 
                            <Row className="d-flex flex-wrap align-items-center p-1">
                                <Col xs={3}> 
                                    <div className="event-logo" >
                                        <i class="fa fa-calendar fa-2x"></i>
                                    </div>
                                </Col>
                                <Col xs={9}>                
                                    <Container className="event-info">
                                        <Row className="event-title"><span><a href={item.DisplayUrl}>{item.Title}</a></span></Row>
                                        <Row className="event-Date"><span className="event-text">Date: {item.StartDay}</span></Row>
                                        <Row className="event-location"><i class="fa fa-map-marker fa-2x" aria-hidden="true"></i><span className="event-text"> {item.Location}</span> </Row>
                                    </Container>
                                </Col>                       
                            </Row>
                        </Col> 
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
        if (sorting != "") {
            restUrl += "&$orderby=";
            restUrl += sorting;
        }
        if (paging != "") {
            restUrl += "$";
            restUrl += paging;
        }
        var filters = filtering;
        //filters = filters.concat(getFilterParametersFromURL());
        if (filters.length > 0) {
            restUrl += "&$filter=";
            if (filters.length == 1) {
                restUrl += filters[0].key + " eq '" + filters[0].value + "'";
            }
            else {
                for (var i = 0; i < filters.length; i++) {
                    restUrl += "(" + filters[i].key + " eq '" + filters[i].value + "')";
                    if (i != filters.length - 1) restUrl += " and ";
                }
            }
        }
        if (expand != "") {
            restUrl += "$expand=";
            restUrl += expand;
        }
        console.log(restUrl);
        return restUrl;
    }
    getListItems(restUrl) {
        var myHeaders = new Headers({
            'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
            'Accept': 'application/json; odata=verbose'
        })

        var myInit = {
            method: 'GET',
            headers: myHeaders,
            credentials: 'include'
        }
        fetch(restUrl, myInit)
            .then(response => response.json())
            .then(data => this.getAllItemsViewsAfterTransformation(data.d.results))
            .then(_items => this.setState({ items: _items }))
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
