(function () {
// reference to our currently focused element
var focusedEl;

function getFluidGridFunction(selector) {
    return function (focus) {
        reOrganize(selector, focus);
    };
}

function biggestBox(container, aspectRatio) {
    var aspectRatio = aspectRatio || (3 / 4),
        height = (container.width * aspectRatio),
        res = {};

    if (height > container.height) {
        return {
            height: container.height,
            width: container.height / aspectRatio
        };
    } else {
        return {
            width: container.width,
            height: container.width * aspectRatio
        };
    }
}

function reOrganize(selector, focus) {
    var floor = Math.floor,
        elements = $(selector),
        howMany = elements.length,
        howManyNonFocused = function () {
            var hasFocused = !!elements.find('.focused').length;
            if (hasFocused && howMany > 1) {
                return howMany - 1;
            } else if (hasFocused && howMany === 1) {
                return 1;
            } else {
                return howMany;
            }
        }(),

        totalAvailableWidth = window.innerWidth,
        totalAvailableHeight = window.innerHeight - 140,

        availableWidth = totalAvailableWidth,
        availableHeight = totalAvailableHeight,

        container = {
            width: availableWidth,
            height: availableHeight
        },
        columnPadding = 15,
        minimumWidth = 290,
        aspectRatio = 3 / 4,

        numberOfColumns,
        numberOfRows,

        numberOfPaddingColumns,
        numberOfPaddingRows,

        itemDimensions,
        totalWidth,

        videoWidth,
        leftMargin,

        videoHeight,
        usedHeight,
        topMargin,

        // do we have one selected?
        // this is because having a single
        // focused element is not treated
        // differently, but we don't want to
        // lose that reference.
        haveFocusedEl;


    // if we passed in a string here (could be "none")
    // then we want to either set or clear our current
    // focused element.
    if (focus) focusedEl = $(focus)[0];

    // make sure our cached focused element is still
    // attached.
    if (focusedEl && !$(focusedEl).parent().length) focusedEl = undefined;

    // figure out if we should consider us as having any
    // special focused elements
    haveFocusedEl = focusedEl && howManyNonFocused > 1;

    elements.height(availableHeight);

    // how we want the to stack at different numbers
    if (haveFocusedEl) {
        numberOfColumns = howManyNonFocused - 1;
        numberOfRows = 1;
        availableHeight = totalAvailableHeight * .2;
    } else if (howManyNonFocused === 0) {
        return;
    } else if (howManyNonFocused === 1) {
        numberOfColumns = 1;
        numberOfRows = 1;
    } else if (howManyNonFocused === 2) {
        if (availableWidth > availableHeight) {
            numberOfColumns = 2;
            numberOfRows = 1;
        } else {
            numberOfColumns = 1;
            numberOfRows = 2;
        }
    } else if (howManyNonFocused === 3) {
        if (availableWidth > availableHeight) {
            numberOfColumns = 3;
            numberOfRows = 1;
        } else {
            numberOfColumns = 1;
            numberOfRows = 3;
        }
    } else if (howManyNonFocused === 4) {
        numberOfColumns = 2;
        numberOfRows = 2;
    } else if (howManyNonFocused === 5) {
        numberOfColumns = 3;
        numberOfRows = 2;
    } else if (howManyNonFocused === 6) {
        if (availableWidth > availableHeight) {
            numberOfColumns = 3;
            numberOfRows = 2;
        } else {
            numberOfColumns = 2;
            numberOfRows = 3;
        }
    }

    itemDimensions = biggestBox({
        width: availableWidth / numberOfColumns,
        height: availableHeight / numberOfRows
    });

    numberOfPaddingColumns = numberOfColumns - 1;
    numberOfPaddingRows = numberOfRows - 1;

    totalWidth = itemDimensions.width * numberOfColumns;

    videoWidth = function () {
        var totalWidthLessPadding = totalWidth - (columnPadding * numberOfPaddingColumns);
        return totalWidthLessPadding / numberOfColumns;
    }();

    leftMargin = (availableWidth - totalWidth) / 2;

    videoHeight = itemDimensions.height - ((numberOfRows > 1) ? (columnPadding / numberOfRows) : 0);
    usedHeight = (numberOfRows * videoHeight);
    topMargin = (availableHeight - usedHeight) / 2;

    if (haveFocusedEl) {
        elements = elements.not('.focused');
    }

    elements.each(function (index) {
        var order = index,
            row = floor(order / numberOfColumns),
            column = order % numberOfColumns,
            intensity = 12,
            rotation = function () {
                if (numberOfColumns === 3) {
                    if (column === 0) {
                        return 1;
                    } else if (column === 1) {
                        return 0;
                    } else if (column === 2) {
                        return -1
                    }
                } else if (numberOfColumns === 2) {
                    intensity = 5;
                    return column == 1 ? -1 : 1
                } else if (numberOfColumns === 1) {
                    return 0;
                }
            }(),
            transformation = 'rotateY(' + (rotation * intensity) + 'deg)';

        if (rotation === 0) {
            transformation += ' scale(.98)';
        }

        var calculatedTop;
        if (haveFocusedEl) {
            calculatedTop = (totalAvailableHeight * .8) + topMargin + 'px';
        } else {
            calculatedTop = (row * itemDimensions.height) + topMargin + 'px';
        }

        $(this).css({
            //transform: transformation,
            top: calculatedTop,
            left: (column * itemDimensions.width) + leftMargin + 'px',
            width: videoWidth + 'px',
            height: videoHeight + 'px',
            position: 'absolute'
        });
    });

    if (haveFocusedEl) {
        var focusSize = biggestBox({
            height: (totalAvailableHeight * .8),
            width: totalAvailableWidth
        }, focusedEl.videoHeight / focusedEl.videoWidth);

        $(focusedEl).css({
            top: 0,
            height: focusSize.height - topMargin,
            width: focusSize.width,
            left: (totalAvailableWidth / 2) - (focusSize.width / 2)
        });
    }
}

if (typeof exports !== 'undefined') {
    module.exports = getFluidGridFunction;
} else {
    window.getFluidGridFunction = getFluidGridFunction;
}

})();
