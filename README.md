# cyb3r-site-js

Front-end section scripts for cyb3rmedia.com, split out of `cyb3r-services-section`.

That repo is ~145 MB and jsDelivr refuses to serve files from a package over 50 MB
("Package size exceeded the configured limit of 50 MB"), which breaks files one at a
time as CDN caches expire. Scripts live here so they stay reliably servable.

`cyb3r-sections.js` powers the homepage Selected Works horizontal-scroll section and the
Design in Motion helix. It is loaded by `home-loader.js`; because that loader is a
registered Webflow script pinned to a commit and the Custom Code API is OAuth-only, the
site head rewrites the chained URL to point here.

`services-section.js` builds the Services page stacked-panel scroll section. It is loaded
directly as the registered Webflow script `cyb3rSvcSection` (Services page footer), so a
new commit needs a new registered version, not a head rewrite. It also handles deep links:
`/services#<slug>` (slugs in its `services` array) scrolls to that service's panel. The
homepage helix cards link there via the matching `SLUG` list in `cyb3r-sections.js` - keep
the two lists in the same order.
