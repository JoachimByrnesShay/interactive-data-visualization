
## Interactive Data Visualization

## Joachim Byrnes-Shay
 
## 11/16/21

## github repository ---

https://github.com/JoachimByrnesShay/interactive-data-visualization

## Deployed at github pages, per link below---  

https://joachimbyrnesshay.github.io/interactive-data-visualization/

## Screen shot of page working

[![screenshot-app.png](https://i.postimg.cc/Pq8s3dhN/screenshot-app.png)](https://postimg.cc/R39Dq5Wz)

## Project

An interactive comparison of world currency values using pure javascript, generating barcharts with data taken from 'https://openexchangerates.org/'
Charts display proportional values from perspective of how much one of a comparison unit one gets in return for 1 unit of base currency, i.e., if user exchanges 1 dollar for comparison currency, how many units of comparison currency does user get

## Credit 
all data taken from to 'https://openexchangerates.org/'
data consists of standardized currency codes and conversion rates.

## API Docs
are found here: https://docs.openexchangerates.org/


## Notes on project and app usage
Pure javacript is utilized for all code, including to create filters and filterable options to choose base currency as well as to select a group of currencies to compare with the chosen base currency.

In addition to being filterable upon input in form text input field (causing re-evaluation and re-render of lists), both select lists exhibit scrollable behavior with arrowup and arrowdown on the lists, and internally there is indexing behavior upon scroll as well as mouse-in and mouse-out.  

In either list, the current highlighted option (on mouseenter or scrolldown/up) can be selected with enter key or mouseclick as the new base currency (in the case of the base currency select list) or for inclusion in the list of selected comparison currencies (in the case of the comparison currencies list).  In the case of the comparison currencies list only, there is deselect behavior as well on enter or mouseclick which is further clarified below.

Note that up to 5 comparison currencies may be selected.   If user attempts to select a 6th comparison currency, a flash message will display in the header informing user that the app accomodates at most 5 and one or more may be deselected.

Any options in the comparison currencies select box which populate the current comparison currencies list (max 5) are specially styled with blue background.  This highlights their location in the box for the user, and any of the current comparison currencies may be deselected and removed from the selected comparisons list, again by either mouseclick or enter key pressed.

Both select lists will omit the currently selected base currency from their displayed options.  If a new base currency is selected from the base currency list, and that currency is already in the list of selected comparison currencies, it will be removed (spliced) from the selected comparison currencies which will now be one less in size.  A new comparison can be selected in its place.   

On all changes to selections, a brief animation will highlight in red the current configuration in the separate field displaying current base and selected comparisons as well as in the case of the base, in the span inside the h2 above the filter field for the base currency select list.   

All of this is dynamically controlled.

There are custom tooltips coded for these styled presentations of selected values, visible upon hover on the black and white squares containing the white currency codes.

Selected comparison currencies may all be deselected down to a zero size list, in which case the charts will re-render to show only the base currency chart.

Clicking the "Clear Charts + Comparisons" button will yield the same result, and additionally applies a fade-out animation to all comparison charts, as well as removes them from the currencyData.convertTo list.  The lists will be re-rendered, and styling of options will reflect the current state of the selections (what previously appeared with styling as a selected comparison no longer will).

The base currency and all chosen comparison currencies will all be displayed as barcharts in the chart area, with the base currency designated as such with special styling on a container.   Each barchart displays with a title equal to its standardized 3 letter currency code.   Each barchart has a modal which will appear onclick which displays the full name of the currency and a proportional comparison of 1 unit of the base currency vs units of the selected comparison (the current chart).  Modals are animated to disappear on mouseout (leave the chart element).

Javascript is also utilized to control the positioning and restyling of the barchart titles (the displayed currency code) if any barchart due to its values in proportion to other charts is too small in size to contain the size of the paragraph which holds the title (currency code).  In that case, the title will display outside of the chart, absolutely positioned 1em away from either its top edge or right edge, depending on the orientation of the charts (vertical on large, horizontal on small)

The configuration portion of the page is decently responsive on resize via grid auto-fill usage in css.  The chart area is responsive via combination of javascript and css media queries.  Javascript controls the sizing and resizing of the charts, and height vs width for re-orienting the charts from vertical on larger screens to horizontal on smaller screens.


## Limitations 

Below a certain percentage size proportional to the largest currency, there will be little visual difference peer charts at that small of size.



