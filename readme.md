# Kibana Hidden Title Fix

### Issue
In Kibana 7.10, a backwards compatibility bug was introduced to dashboards. Pre 7.10, the 'hidden' setting for dashboard titles was stored by setting the title to a blank string. In 7.10, this functionality was changed to be more explicit by using the hidePanelTitles key. Unfortunately in 7.10 and 7.11 any panel which was hidden on previous versions would be shown. In version 7.12.1, this BWC bug was fixed, but some clusters cannot update to that version.

### Workaround
This small node program is a workaround for that issue. It takes elasticsearch credentials, and sets the hidePanelTitles key to true for any panel on any dashboard where the title is set to a blank string. This should have the effect of hiding every title which was configured to be hidden before the 7.10 upgrade.

### Known Limitations
This will not work on any dashboards which have been saved since the 7.10 upgrade.
This currently works with kibana 7.11.2, but you can easily change that by installing a different version of the ES Client

### How to Run
`yarn install`
`node index.js`
