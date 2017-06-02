const ItemListService = require("services/ItemListService");
const ResourceService = require("services/ResourceService");
var _categoryTree = {};
var _categoryBreadcrumbs = [];

/**
 * render items in relation to location
 * @param currentCategory
 */
export function renderItems(currentCategory)
{
    ResourceService.getResource("isLoadingBreadcrumbs").set(true);

    if ($.isEmptyObject(_categoryTree))
    {
        _categoryTree = ResourceService.getResource("navigationTree").val();
    }

    if (!App.isCategoryView)
    {
        window.open(_getScopeUrl(currentCategory), "_self");
    }
    else
    {
        _handleCurrentCategory(currentCategory);
    }
}

/**
 * bundle functions
 * @param currentCategory
 */
function _handleCurrentCategory(currentCategory)
{
    _updateItemList(currentCategory);
    _updateHistory(currentCategory);
    _updateBreadcrumbs();
}

function _updateBreadcrumbs()
{
    ResourceService.getResource("breadcrumbs").set(_categoryBreadcrumbs.reverse());
}

/**
 * update the current item list without reloading
 * @param currentCategory
 */
function _updateItemList(currentCategory)
{
    ItemListService.setCategoryId(currentCategory.id);

    ItemListService.setPage(1);
    ItemListService.setFacets("");
    ItemListService.getItemList();
}

/**
 * update page informations
 * @param currentCategory
 */
function _updateHistory(currentCategory)
{
    var title = document.getElementsByTagName("title")[0].innerHTML;

    window.history.replaceState({}, title, _getScopeUrl(currentCategory) + window.location.search);

    document.getElementsByTagName("h1")[0].innerHTML = currentCategory.details[0].name;
}

/**
 * get the current scope url
 * @param currentCategory
 * @param scopeUrl - default
 * @param categories - default
 */
export function getScopeUrl(currentCategory, scopeUrl, categories)
{
    scopeUrl = scopeUrl || "";
    categories = categories || _categoryTree;

    if (scopeUrl.length == 0)
    {
        _categoryBreadcrumbs = [];
    }

    for (var category in categories)
    {
        if (categories[category].id == currentCategory.id)
        {
            scopeUrl += "/" + categories[category].details[0].nameUrl;

            _categoryBreadcrumbs.push(categories[category]);

            return scopeUrl;
        }

        if (categories[category].children)
        {
            var tempScopeUrl = scopeUrl + "/" + categories[category].details[0].nameUrl;

            var urlScope = _getScopeUrl(currentCategory, tempScopeUrl, categories[category].children);

            if (urlScope.length > 0)
            {
                _categoryBreadcrumbs.push(categories[category]);

                return urlScope;
            }
        }
    }

    return "";
}

export default {getScopeUrl, renderItems};
