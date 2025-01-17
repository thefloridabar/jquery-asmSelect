/*
 * Alternate Select Multiple (asmSelect) 1.0.6 - jQuery Plugin
 * http://www.ryancramer.com/projects/asmselect/
 *
 * Copyright (c) 2009 by Ryan Cramer - http://www.ryancramer.com
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 */

(function ($) {

    $.fn.asmSelect = function (customOptions) {

        const options = {

            listType: 'ol',						        // Ordered list 'ol', or unordered list 'ul'
            sortable: false, 					        // Should the list be sortable?
            highlight: false,					        // Use the highlight feature?
            animate: false,						        // Animate the adding/removing of items in the list?
            addItemTarget: 'bottom',				    // Where to place new selected items in list: top or bottom
            hideWhenAdded: false,					    // Hide the option when added to the list? works only in FF
            debugMode: false,					        // Debug mode keeps original select visible

            removeLabel: 'remove',					    // Text used in the "remove" link
            highlightAddedLabel: 'Added: ',				// Text that precedes highlight of added item
            highlightRemovedLabel: 'Removed: ',			// Text that precedes highlight of removed item

            containerClass: 'asmContainer',				// Class for container that wraps this widget
            selectClass: 'asmSelect',				    // Class for the newly created <select>
            optionDisabledClass: 'asmOptionDisabled',   // Class for items that are already selected / disabled
            listClass: 'asmList',					    // Class for the list ($ol)
            listSortableClass: 'asmListSortable',		// Another class given to the list when it is sortable
            listItemClass: 'asmListItem',				// Class for the <li> list items
            listItemLabelClass: 'asmListItemLabel',		// Class for the label text that appears in list items
            removeClass: 'asmListItemRemove',			// Class given to the "remove" link
            highlightClass: 'asmHighlight'				// Class given to the highlight <span>

        };

        $.extend(options, customOptions);

        return this.each(function (index) {

            const $original = $(this); 				    // the original select multiple
            let $container; 					        // a container that is wrapped around our widget
            let $select; 						        // the new select we have created
            let $ol; 						            // the list that we are manipulating
            let buildingSelect = false; 				// is the new select being constructed right now?
            let ieClick = false;					    // in IE, has a click event occurred? ignore if not
            let ignoreOriginalChangeEvent = false;		// originalChangeEvent bypassed when this is true
            const $selectRemoved = $("<select></select>");

            function init() {

                // initialize the alternate select multiple

                // this loop ensures uniqueness, in case of existing asmSelects placed by ajax (1.0.3)
                while ($("#" + options.containerClass + index).size() > 0) index++;

                $select = $("<select></select>")
                    .addClass(options.selectClass)
                    .attr('name', options.selectClass + index)
                    .attr('id', options.selectClass + index);

                $ol = $("<" + options.listType + "></" + options.listType + ">")
                    .addClass(options.listClass)
                    .attr('id', options.listClass + index);

                $container = $("<div></div>")
                    .addClass(options.containerClass)
                    .attr('id', options.containerClass + index);

                buildSelect();

                $select.change(selectChangeEvent)
                    .click(selectClickEvent);

                $original.change(originalChangeEvent)
                    .wrap($container).before($select).before($ol);

                if (options.sortable) makeSortable();

                if ($.browser.msie && $.browser.version < 8) $ol.css('display', 'inline-block'); // Thanks Matthew Hutton
            }

            function makeSortable() {

                // make any items in the selected list sortable
                // requires jQuery UI sortables, draggables, droppables

                $ol.sortable({
                    items: 'li.' + options.listItemClass,
                    handle: '.' + options.listItemLabelClass,
                    axis: 'y',
                    update: function (e, data) {

                        let updatedOptionId;

                        $(this).children("li").each(function (n) {

                            let $option = $('#' + $(this).attr('rel'));

                            if ($(this).is(".ui-sortable-helper")) {
                                updatedOptionId = $option.attr('id');
                                return;
                            }

                            $original.append($option);
                        });

                        if (updatedOptionId) triggerOriginalChange(updatedOptionId, 'sort');
                    }

                }).addClass(options.listSortableClass);
            }

            function selectChangeEvent(e) {

                // an item has been selected on the regular select we created
                // check to make sure it's not an IE screwup, and add it to the list

                if ($.browser.msie && $.browser.version < 7 && !ieClick) return;
                const id = $(this).children("option:selected").slice(0, 1).attr('rel');
                if (id) {
                    // thanks to petersumskas and eliel_goco@yahoo.com
                    addListItem(id);
                    ieClick = false;
                    triggerOriginalChange(id, 'add'); // for use by user-defined callbacks
                }
            }

            function selectClickEvent() {

                // IE6 lets you scroll around in a select without it being pulled down
                // making sure a click preceded the change() event reduces the chance
                // if unintended items being added. there may be a better solution?

                ieClick = true;
            }

            function originalChangeEvent(e) {

                // select or option change event manually triggered
                // on the original <select multiple>, so rebuild ours

                if (ignoreOriginalChangeEvent) {
                    ignoreOriginalChangeEvent = false;
                    return;
                }

                $select.empty();
                $ol.empty();
                buildSelect();

                // opera has an issue where it needs a force redraw, otherwise
                // the items won't appear until something else forces a redraw
                if ($.browser.opera) $ol.hide().fadeIn("fast");
            }

            function buildSelect() {

                // build or rebuild the new select that the user
                // will select items from

                buildingSelect = true;

                // add a first option to be the home option / default selectLabel
                if ($original.attr('title')) {
                    $select.prepend("<option value=''>" + $original.attr('title') + "</option>");
                }

                $original.children("option").each(function (n) {

                    const $t = $(this);
                    let id;
                    const isSelected = $t.is(":selected");
                    const isDisabled = $t.is(":disabled");

                    if (!$t.attr('id')) $t.attr('id', 'asm' + index + 'option' + n);
                    id = $t.attr('id');

                    if (isSelected && !isDisabled) {
                        addListItem(id);
                        addSelectOption(id, true);

                    } else if (!isSelected && isDisabled) {
                        addSelectOption(id, true);

                    } else {
                        addSelectOption(id);
                    }
                });

                if (!options.debugMode) $original.hide(); // IE6 requires this on every buildSelect()
                selectFirstItem();
                buildingSelect = false;
            }

            function addSelectOption(optionId, disabled) {

                // add an <option> to the <select>
                // used only by buildSelect()

                if (disabled == undefined) {
                    disabled = false;
                }

                const $O = $('#' + optionId);
                const $option = $("<option>" + $O.html() + "</option>")
                    .val($O.val())
                    .attr('rel', optionId);

                if (disabled) disableSelectOption($option);

                $select.append($option);
            }

            function selectFirstItem() {
                // select the first item from the regular select that we created
                $select.children(":eq(0)").attr("selected", true);
            }

            function disableSelectOption($option) {

                // make an option disabled, indicating that it's already been selected
                // because safari is the only browser that makes disabled items look 'disabled'
                // we apply a class that reproduces the disabled look in other browsers

                $option.addClass(options.optionDisabledClass)
                    .removeAttr("selected")
                    .attr("disabled", true);

                if (options.hideWhenAdded) $option.hide();
                if ($.browser.msie) $select.hide().show(); // this forces IE to update display
            }

            function enableSelectOption($option) {

                // given an already disabled select option, enable it

                $option.removeClass(options.optionDisabledClass)
                    .removeAttr("disabled");

                if (options.hideWhenAdded) $option.show();
                if ($.browser.msie) $select.hide().show(); // this forces IE to update display
            }

            function addListItem(optionId) {

                // add a new item to the html list

                const $O = $('#' + optionId);

                if (!$O) return; // this is the first item, selectLabel

                const $removeLink = $("<a></a>")
                    .attr("href", "#")
                    .addClass(options.removeClass)
                    .prepend(options.removeLabel)
                    .click(function () {
                        dropListItem($(this).parent('li').attr('rel'));
                        return false;
                    });

                const $itemLabel = $("<span></span>")
                    .addClass(options.listItemLabelClass)
                    .html($O.html());

                const $item = $("<li></li>")
                    .attr('rel', optionId)
                    .addClass(options.listItemClass)
                    .append($itemLabel)
                    .append($removeLink)
                    .hide();

                if (!buildingSelect) {
                    if ($O.is(":selected")) return; // already have it
                    $O.attr('selected', true);
                }

                if (options.addItemTarget === 'top' && !buildingSelect) {
                    $ol.prepend($item);
                    if (options.sortable) $original.prepend($O);
                } else {
                    $ol.append($item);
                    if (options.sortable) $original.append($O);
                }

                addListItemShow($item);

                disableSelectOption($("[rel=" + optionId + "]", $select));

                if (!buildingSelect) {
                    setHighlight($item, options.highlightAddedLabel);
                    selectFirstItem();
                    if (options.sortable) $ol.sortable("refresh");
                }
            }

            function addListItemShow($item) {

                // reveal the currently hidden item with optional animation
                // used only by addListItem()

                if (options.animate && !buildingSelect) {
                    $item.animate({
                        opacity: "show",
                        height: "show"
                    }, 100, "swing", function () {
                        $item.animate({
                            height: "+=2px"
                        }, 50, "swing", function () {
                            $item.animate({
                                height: "-=2px"
                            }, 25, "swing");
                        });
                    });
                } else {
                    $item.show();
                }
            }

            function dropListItem(optionId, highlightItem) {

                // remove an item from the html list

                if (highlightItem == undefined) {
                    highlightItem = true;
                }
                const $O = $('#' + optionId);

                $O.removeAttr('selected');
                let $item = $ol.children("li[rel=" + optionId + "]");

                dropListItemHide($item);
                enableSelectOption($("[rel=" + optionId + "]", options.removeWhenAdded ? $selectRemoved : $select));

                if (highlightItem) setHighlight($item, options.highlightRemovedLabel);

                triggerOriginalChange(optionId, 'drop');

            }

            function dropListItemHide($item) {

                // remove the currently visible item with optional animation
                // used only by dropListItem()

                if (options.animate && !buildingSelect) {

                    let $prevItem = $item.prev("li");

                    $item.animate({
                        opacity: "hide",
                        height: "hide"
                    }, 100, "linear", function () {
                        $prevItem.animate({
                            height: "-=2px"
                        }, 50, "swing", function () {
                            $prevItem.animate({
                                height: "+=2px"
                            }, 100, "swing");
                        });
                        $item.remove();
                    });

                } else {
                    $item.remove();
                }
            }

            function setHighlight($item, label) {

                // set the contents of the highlight area that appears
                // directly after the <select> single
                // fade it in quickly, then fade it out

                if (!options.highlight) return;

                $select.next("#" + options.highlightClass + index).remove();

                const $highlight = $("<span></span>")
                    .hide()
                    .addClass(options.highlightClass)
                    .attr('id', options.highlightClass + index)
                    .html(label + $item.children("." + options.listItemLabelClass).slice(0, 1).text());

                $select.after($highlight);

                $highlight.fadeIn("fast", function () {
                    setTimeout(function () {
                        $highlight.fadeOut("slow");
                    }, 50);
                });
            }

            function triggerOriginalChange(optionId, type) {

                // trigger a change event on the original select multiple
                // so that other scripts can pick them up

                ignoreOriginalChangeEvent = true;
                let $option = $("#" + optionId);

                const event = new CustomEvent('change', {
                    detail: {
                        'option': $option,
                        'value': $option.val(),
                        'id': optionId,
                        'item': $ol.children("[rel=" + optionId + "]"),
                        'type': type
                    }
                });
                $original.get(0).dispatchEvent(event);
            }

            init();
        });
    };

})(jQuery);
