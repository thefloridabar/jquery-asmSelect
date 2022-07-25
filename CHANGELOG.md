# Changelog

## [1.0.5 beta] - 2010-07-10
### Fixed
- Fix to `selectChangeEvent`; thanks to petersumskas and eliel_goco@yahoo.com.
- Check for disabled options when building the select
### Changed
- Treat original options as HTML instead of text
- Use `.removeAttr(<attribute_name>)` instead of `.attr(<attribute_name>,false)`

## [1.0.4a beta] - 2009-06-03
- Minor update to correct IE8 issue.
  Thanks to Matthew Hutton for this fix.


## [1.0.4 beta] - 2008-12-01

### Fixed
- Fixed issue that interfered with multiple asmSelects
  on the same page. This also solves an issue with
  dynamically rendered (ajax) asmSelects on 1 page.

### Changed
- Changed options so that "animate" and "highlight"
  now default to "false". These are just a bit too
  slow on older computers, so I thought it would be
  better not to make them active defaults.

### Added
- Added code that triggers a `change()` event on the
  original `<select multiple>` whenever a change is
  made on the asmSelect. This means that other bits
  of javascript don't need to know about asmSelect
  if they happen to be monitoring the original
 `<select multiple>` for changes.

- Added some additional logic for dealing with IE and
  determining whether a click preceded an item being
  added to the list. This was necessary because IE
  triggers change events when you are scrolling around
  in a select. Thankfully not an issue with other browsers.

- Added "optionDisabledClass" in program options.
  This is a class assigned to <option> items that
  are disabled. This was necessary because only
  Safari allows the "disabled" attribute with
  option tags (as far as I can tell). This is
  mostly for internal use with asmSelect, so you can
  ignore this unless you want to come up with your own
  styles for disabled option items.

- Added logic to detect Opera and force a redraw of
  the html list when original select is modified.
  Previously, opera would not draw the new list items...
  They were in the DOM, just not on Opera's screen.

### Updated
- Updated documentation with note about the Firefox
  autocomplete issue, which can be a factor on some
  asmSelect implementations

## [1.0.3 beta]

- This version was released in the issues section
  of the Google code site, but never released as
  a full package. It fixed the issue with multiple
  asmSelects on a single page.


## [1.0.2 beta] - 2008-07-15

- Updated license to consistent with jQuery and
  jQuery UI: Dual MIT and GNU license.

- Fixed issue with IE6 where original select multiple
  would reappear when sorting was enabled.

- Put in a partial fix for when IE6 select is being
  scrolled without being focused. (ieClick)

- Updated for some other minor IE6 fixes, but still
  not 100% on IE6, see 'Known Issues' in docs.

- Changed 'animate' and 'highlight' to be false by
  default. These are too slow on old computers.

- Added new class to CSS 'optionDisabledClass' that
  is applied to disabled options. This was necessary
  because Firefox and IE don't fade disabled options
  like Safari does.

- Removed some extraneous code.


## [1.0.1 beta] - 2008-07-07

- Corrected an issue with IE where asmSelect didn't work if option values were blank.


## [1.0.0 beta] - 2008-07-05

Initial release
