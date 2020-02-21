// html div where the final html code will be insert
var divId = "resultEvents"; 
// Rest query parameters
var listTitle = "Calendar"; 
var fields = ["Id", "Title", "Location","EventDate","EndDate","Description", "Category" ]; // to can change
var sorting = "Order asc"; 
var filtering = []; // json array key value
var paging = "";
var expand = "";
// html template for each item returned By the rest sharepoint api call
var template = '<div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"><div class="info-card"><img style="width: 100%" src="'
    + '[item.Image/Url]'
    + '" /><div class="info-card-details animate"><div class="info-card-header"><h1>'
    + '[item.Title]'
    + ' '
    + '[item.Prenom]'
    + '</h1><h3>'
    + '[item.Service]'
    + '</h3></div><div class="info-card-detail"><p>'
    + '[item.Comments]'
    + '<div class="info-card-footer [item.Visible]"><a href="'
    + '[item.Annuaire]'
    + '" target="_blank"><i class="fas fa-address-book fa-3x"></i></a></div>'
    + '</p></div></div></div></div>'; // you can change

$(document).ready(function () {
    render();
});
// add the html code in the target div given in the ID
function render() {
    var divHtml = $('#' + divId);
    divHtml.empty();
    var restUrl = getUrlRest();
    getItems(restUrl).then(function (items) {
        var htmlItems = "";
        getAllItemsViewsAfterTransformation(items).map(function (item) { htmlItems += injectInformation(template, item); });
        divHtml.append(htmlItems);
    });
}
// transform the Model View from sharepoint with view logic to inject 
function getAllItemsViewsAfterTransformation(inputItems){
    var outputItems =[];
    inputItems.map(function(inputItem,index){
        var outputItem = inputItem;
        outputItems[index] = outputItem;
    });
    return outputItems;
}
// prepare the rest api url for api call from sharepoint 
function getUrlRest() {
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
    if(sorting != ""){
        restUrl += "&$orderby=";
        restUrl += sorting;
    }
    if(paging != ""){
        restUrl += "$";
        restUrl += paging;
    }
    var filters = filtering;
    filters = filters.concat(getFilterParametersFromURL());
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
    if(expand != ""){
        restUrl += "$expand=";
        restUrl += expand;
    } 
    console.log(restUrl);
    return restUrl;
}
// promise that return the result of rest call from sharepoint
function getItems(restUrl) {
    var promise = new ES6Promise(function (resolve, reject) {
        var call = $.ajax({
            url: restUrl,
            type: "GET",
            dataType: "json",
            headers: {
                Accept: "application/json;odata=verbose"
            }
        });
        call.done(function (data, textStatus, jqXHR) {
            resolve(data.d.results.map(function (item) { return getModelViewFromSHP(fields, item); }));
        });
        call.fail(function (jqXHR, textStatus, errorThrown) {
            reject("Error retrieving information from list: " + params.childList + jqXHR.responseText);
        });
    });
    return promise;
}
// Prepare the first step for the item to be injected in the template (informations from sharepoint ready for the model)
function getModelViewFromSHP(fields, item) {
    var modelObject = {};
    for (var i = 0; i < fields.length; i++) {
        if (fields[i].indexOf('/') > -1) {
            //for expand columns (the column should have '/')
            var expand = fields[i].split('/');
            modelObject[fields[i]] = item[expand[0]][expand[1]]
        }
        else
            modelObject[fields[i]] = item[fields[i]];
    }
    return modelObject;
}
//get parameters from url for dynamique filters
function getFilterParametersFromURL() {
    var dynamicFilters = [];
    var urlParams = window.location.search.substring(1);
    if (urlParams.length > 0) {
        urlParams.split('&').forEach(function (item, index) {
            if (item.startsWith(listTitle + "/"))
                dynamicFilters[index] = { key: item.split("=")[0].split("/")[1], value: item.split("=")[1] };
        });
    }
    return dynamicFilters;
}
// Inject Information of SharePoint Item to the html template Given in the parameter
function injectInformation(template, item) {
    var htmlItem = template;
    Object.keys(item).forEach(function (x) { htmlItem = htmlItem.replace('[item.' + x + ']', item[x]); });
    return htmlItem;
}
