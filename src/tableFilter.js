"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// html div where the final html code will be insert
var divId = "DocumentsTable"; // Rest query parameters
var divFilterId ="FiltersTable";

var listTitle = "Documents";
var fields = ["Id", "Category", "Group", "SubGroup", "Refrence", "FileRef", "Language", "Status"];
var sorting = "Group,SubGroup";
var filtering = "Status eq 'PUBLISHED' or Status eq 'PENDING' ";
var paging = "";
var expand = "";
var toping = "1000";
var GroupByLevelOne = "Group";
var GroupByLevelTwo = "SubGroup";
var GroupByLevelThree = "Refrence";
var _Categories = {
  UserGuide: 'UserGuide',
  SpreadSheet: 'SpreadSheet',
  Policies: 'Policies',
  Other: 'Other'
};
var _Languages = {
  FR: 'FR',
  EN: 'EN'
};
var _Status = {
    PUBLISHED: 'PUBLISHED',
    PENDING: 'PENDING'
  };
var _Fields = {
  Id: "Id",
  Category: "Category",
  Group: "Group",
  SubGroup: "SubGroup",
  Refrence: "Refrence",
  FileRef: "FileRef",
  Language: "Language",
  Status: "Status" ,
  Logo : "Logo"
};
var _NoSubGroup = "NoSubGroup";
var templateInitial = "<div class='row row-header font-weight-bold text-center'> " + "<div class='col-4'>&#160;</div> " + "<div class='col-2'>Compliance User Guide chapter (pdf)</div> " + "<div class='col-2'>Practical spreadsheet for implementation &amp; controls (xls)</div> " + "<div class='col-2'>Policies</div> " + "<div class='col-2'>Additional documents (guidelines,clients facing, etc.)</div> " + "</div>";
var templateGroup = "<div class='row row-category text-uppercase'>[item.Group]</div>";
var templateSubGroup = "<div class='row row-subcategory text-uppercase'>[item.SubGroup]</div>";
var templateReference = "<div class='row row-alt text-uppercase'><div class='col-4 my-auto'>[item.Refrence]</div>[item.htmlContent]</div>";
var templateReferenceCase = "<div class='col-2 text-center my-auto'>[item.htmlContent]</div>";
var templateFile = "<a href='[item.FileRef]' target='_blank'><img src='/sites/mifid/SiteAssets/Modules/TableEchonet/IMG/[item.Logo]_32x32.png' width='32' height='32' /></a>";
var templateFileGrey = "<img src='/sites/mifid/SiteAssets/Modules/TableEchonet/IMG/[item.Logo]_32x32_grey.png' width='32' height='32' />";

var templateNA = "<span>N.A</span>";


$(document).ready(function () {
  render();
}); 

// add the html code in the target div given in the ID
function render() {
  var divResultHtml = $('#' + divId);
  var divFilterHtml = $('#' + divFilterId);
  divResultHtml.empty();
  var htmlItems = templateInitial;
  var restUrl = getUrlRest();
  getItems(restUrl).then(function (items) {
    var viewItems = getAllItemsViewsAfterTransformation(items);
    var itemsGroupByGroup = groupBy(viewItems, GroupByLevelOne);
    var groups = Object.keys(itemsGroupByGroup);
    groups.map(function (group) {
      htmlItems += injectInformation(templateGroup, _defineProperty({}, GroupByLevelOne, group));
      var itemsGroupBySubGroup = groupBy(itemsGroupByGroup[group], GroupByLevelTwo);
      var subGroups = Object.keys(itemsGroupBySubGroup);

      if (subGroups[0] == _NoSubGroup && subGroups.length == 1) {
        //without subCategories
        var itemsGroupByReference = groupBy(itemsGroupByGroup[group], GroupByLevelThree);
        var References = Object.keys(itemsGroupByReference);
        htmlItems += renderReferenceRows(itemsGroupByReference, References);
      } else {
        //with subCategories
        subGroups.map(function (subGroup) {
          htmlItems += injectInformation(templateSubGroup, _defineProperty({}, GroupByLevelTwo, subGroup));
          var itemsGroupByReference = groupBy(itemsGroupBySubGroup[subGroup], GroupByLevelThree);
          var References = Object.keys(itemsGroupByReference);
          htmlItems += renderReferenceRows(itemsGroupByReference, References);
        });
      }
    });
    divResultHtml.append(htmlItems);
    divFilterHtml.append(renderFilterComponent(getProprietiesValues(viewItems,filterFields), filterFields));
  });
}

function renderReferenceRows(itemsGroupByReference, References) {
  var htmlRows = "";
  References.sort().map(function (Reference) {
    var _injectInformation3;
    var htmlItem = "";
    var UserGuide = itemsGroupByReference[Reference].filter(function (item) {
      return item.Category == _Categories.UserGuide;
    });
    var Pratical = itemsGroupByReference[Reference].filter(function (item) {
      return item.Category == _Categories.SpreadSheet;
    });
    var Policies = itemsGroupByReference[Reference].filter(function (item) {
      return item.Category == _Categories.Policies;
    }).sort(sortByProperty(_Fields.Language));
    var Additionnals = itemsGroupByReference[Reference].filter(function (item) {
      return item.Category == _Categories.Other;
    }).sort(sortByProperty(_Fields.Language));

    if (UserGuide.length > 0) {
        var htmlUserGuide = "";
        for(var i = 0; i < UserGuide.length; i++){
            if(UserGuide[i][_Fields.Status] == _Status.PUBLISHED)
            htmlUserGuide += injectInformation(templateFile, UserGuide[i]);
            else{
            htmlUserGuide += injectInformation(templateFileGrey, UserGuide[i]);
            }
        }
        htmlItem += injectInformation(templateReferenceCase, {"htmlContent": htmlUserGuide});
    } else htmlItem += injectInformation(templateReferenceCase, {
      "htmlContent": templateNA
    });

    if (Pratical.length > 0) {
        var htmlPratical ="";
        for(var i = 0; i < Pratical.length; i++){
            if(Pratical[i][_Fields.Status] == _Status.PUBLISHED){
                htmlPratical +=  injectInformation(templateFile, Pratical[i]);
              }else{
                htmlPratical += injectInformation(templateFileGrey, Pratical[i]); 
              }
        }
        htmlItem += injectInformation(templateReferenceCase, {
            "htmlContent": htmlPratical
          });
    } else htmlItem += injectInformation(templateReferenceCase, {
      "htmlContent": templateNA
    });

    if (Policies.length > 0) {
      var htmlPolicies = "";
      for (var i = 0; i < Policies.length; i++) {
            if(Policies[i][_Fields.Status] == _Status.PUBLISHED){
                htmlPolicies += injectInformation(templateFile, Policies[i]);
            }
            if(Policies[i][_Fields.Status] == _Status.PENDING){
                htmlPolicies += injectInformation(templateFileGrey, Policies[i]);
            }
      }
      htmlItem += injectInformation(templateReferenceCase, {"htmlContent": htmlPolicies});
    } else htmlItem += injectInformation(templateReferenceCase, {
      "htmlContent": templateNA
    });

    if (Additionnals.length > 0) {
      var htmlAdditionnals = "";

      for (var i = 0; i < Additionnals.length; i++) {
        if(Additionnals[i][_Fields.Status] == _Status.PUBLISHED){
          htmlAdditionnals += injectInformation(templateFile, Additionnals[i]);
        }
        if(Additionnals[i][_Fields.Status] == _Status.PENDING){
          htmlAdditionnals += injectInformation(templateFileGrey, Additionnals[i]);
        }
      }

      htmlItem += injectInformation(templateReferenceCase, {
        "htmlContent": htmlAdditionnals
      });
    } else htmlItem += injectInformation(templateReferenceCase, {
      "htmlContent": templateNA
    });

    htmlRows += injectInformation(templateReference, (_injectInformation3 = {}, _defineProperty(_injectInformation3, GroupByLevelThree, Reference), _defineProperty(_injectInformation3, "htmlContent", htmlItem), _injectInformation3));
  });
  return htmlRows;
} 

// transform the Model View from sharepoint with view logic to inject 
function getAllItemsViewsAfterTransformation(inputItems) {
  var outputItems = [];
  inputItems.map(function (inputItem, index) {
    var outputItem = inputItem; //outputItem["FileRef"] = _spPageContextInfo.webServerRelativeUrl+ "/_layouts/15/WopiFrame.aspx?sourcedoc=" + encodeURI(outputItem["FileRef"]);
    outputItem[_Fields.FileRef] = encodeURI(outputItem[_Fields.FileRef]);
    outputItem[_Fields.Logo] = getFileLogo(outputItem[_Fields.FileRef]);
    if((outputItem[_Fields.Category] == _Categories.Policies || outputItem[_Fields.Category] == _Categories.Other) && outputItem[_Fields.Language] == _Languages.EN ) outputItem[_Fields.Logo] = _Languages.EN  ;
    if((outputItem[_Fields.Category] == _Categories.Policies || outputItem[_Fields.Category] == _Categories.Other) && outputItem[_Fields.Language] == _Languages.FR ) outputItem[_Fields.Logo] = _Languages.FR ;
    if (outputItem[_Fields.SubGroup] == null) outputItem[_Fields.SubGroup] = _NoSubGroup;
    outputItems[index] = outputItem;
  }); 
  outputItems = outputItems.filter(function (item) {
    return item[_Fields.Category] in _Categories;
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

  if (sorting != "") {
    restUrl += "&$orderby=";
    restUrl += sorting;
  }

  if (paging != "") {
    restUrl += "$";
    restUrl += paging;
  }

  if (filtering != "") {
    restUrl += "&$filter=";
    restUrl += filtering;
  }

  if (expand != "") {
    restUrl += "$expand=";
    restUrl += expand;
  }

  if(toping != ""){
    restUrl += "&$top=";
    restUrl += toping;
  }
  console.log(restUrl);
  return restUrl;
} 

// promise that return the result of rest call from sharepoint
function getItems(restUrl) {
  var promise = new Promise(function (resolve, reject) {
    var call = $.ajax({
      url: restUrl,
      type: "GET",
      dataType: "json",
      headers: {
        Accept: "application/json;odata=verbose"
      }
    });
    call.done(function (data, textStatus, jqXHR) {
      resolve(data.d.results.map(function (item) {
        return getModelViewFromSHP(fields, item);
      }));
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
      modelObject[fields[i]] = item[expand[0]][expand[1]];
    } else modelObject[fields[i]] = item[fields[i]];
  }

  return modelObject;
} 

//get parameters from url for dynamique filters
function getFilterParametersFromURL() {
  var dynamicFilters = [];
  var urlParams = window.location.search.substring(1);

  if (urlParams.length > 0) {
    urlParams.split('&').forEach(function (item, index) {
      if (item.startsWith(listTitle + "/")) dynamicFilters[index] = {
        key: item.split("=")[0].split("/")[1],
        value: item.split("=")[1]
      };
    });
  }

  return dynamicFilters;
} 

// Inject Information of SharePoint Item to the html template Given in the parameter
function injectInformation(template, item) {
  var htmlItem = template;
  Object.keys(item).forEach(function (x) {
    htmlItem = htmlItem.replace('[item.' + x + ']', item[x]);
  });
  return htmlItem;
} 

// return json object keys = value of groupBy column and value = array of items that contains only the groupBy column  
function groupBy(xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

function sortByProperty(property){  
    return function(a,b){  
       if(a[property] > b[property])  
          return 1;  
       else if(a[property] < b[property])  
          return -1;  
   
       return 0;  
    }  
 }

function getFileLogo(filePath) {
    var extension = filePath.split('.').pop();
    var logo;
    switch (extension) {
        case "pdf":
            logo = "pdf";
            break;
        case "xls":    
        case "xlsx":
        case "xlsm":
            logo = "xls";
            break;
        case "doc":
        case "dot":
        case "dotx":
        case "docx":
            logo = "doc";
            break;
        case "ppt":
        case "pptx":
        case "pptm":
            logo = "ppt";
            break;
        case "msg":
            logo = "msg";
            break;
        default:
            logo = "txt";
    }
    return logo;
}

function getProprietiesValues(items,fields){
    var values = {}
    fields.map(function(field){
      values[field] = [];
    });     
    items.map(function(item){
      fields.map(function(field){
        if(values[field].indexOf(item[field]) < 0){
          values[field].push(item[field]);
        }
      });
    });
    return values;
}

function renderFilterComponent(values, fields){
  var htmlFilters ="";
    fields.map(function(field){
      var htmlFilter = injectInformation(templateFilterRow , {"HtmlContent" : field});
      values[field].map(function(filterCriterea){
        htmlFilter += injectInformation(templateFilter,{"FilterId": field+"-"+filterCriterea , "FilterFor" :  field+"-"+filterCriterea,"FilterText" : filterCriterea})
      })
      htmlFilters += htmlFilter ;
    });
    return htmlFilters;
}

var templateFilterRow = "<div class='row'>[item.HtmlContent]</div>"
var templateFilter ="<div class='custom-control custom-checkbox'>"
                    +"<input type='checkbox' class='custom-control-input' id='ft-[item.FilterId]' />"
                    +"<label class='custom-control-label' for='ft-[item.FilterFor]'>[item.FilterText]</label>"
                    +"</div>";
var filterFields = ["Category", "Group", "SubGroup", "Refrence", "Language", "Status"];
